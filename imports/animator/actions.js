import { AnimatorDB } from '../api/AnimatorDB';
import api from '../api/ApiService';
import Commands from '../api/Commands';
import { mongoUpsert } from '../api/MongoHelper';

import imageViewer from '../imageViewer/actions';
import colormap from '../colormap/actions';
// redux part
const ANIMATOR_CHANGE = 'ANIMATOR_CHANGE';
export const ActionType = {
  ANIMATOR_CHANGE,
};

const CHANGE_ANIMATOR_TYPE = 'CHANGE_ANIMATOR_TYPE';

function changeAnimatorType(type) {
  return (dispatch) => {
    mongoUpsert(AnimatorDB, { currentAnimatorType: type }, CHANGE_ANIMATOR_TYPE);
  };
}

export function setupAnimatorDB() {
  api.instance().setupMongoRedux(AnimatorDB, ANIMATOR_CHANGE);
}

function setupAnimator() {
  return (dispatch) => {
    const cmd = Commands.REGISTER_VIEWER;
    const arg = 'pluginId:Animator,index:0';

    // console.log('send register Animator');
    api.instance().sendCommand(cmd, arg, (resp) => {
      // console.log('get register animator result:', resp);
      mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
    });
  };
}

// for some cases, fake a image animatorType in animatorTypeList
function handleAnimatorError(animatorTypeList, stack) {
  if (stack && stack.layers) {
    const count = stack.layers.length;
    if (count > 0 && stack.layers[0].name) {
      if (count > 1) {
        // console.log('count>1 should already have image animatorType return !!');
        return;
      }

      // console.log('fake a image animatorType !!!!!');
      const animatorType = {
        type: 'Image',
        visible: true,
        selection: {
          frameStart: 0,
          frameStartUser: 0,
          frameEnd: 1,
          frameEndUser: 0,
          frame: 0,
          fileList: [
            stack.layers[0].name,
          ],
        },
      };

      animatorTypeList.push(animatorType);
    }
  }

  mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
}

function receiveAllSelectionData(animatorTypeList, results, stack) {
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    // console.log('get selectionData:', result.data);
    animatorTypeList[i].selection = result.data;
  }

  let imageAnimatorType = null;

  for (const animatorType of animatorTypeList) {
    if (animatorType.type === 'Image') {
      imageAnimatorType = animatorType;
      break;
    }
  }
  if (!imageAnimatorType) {
    // console.log('no image animatorType !!!');
    // ~ throw something,
    // ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
    return Promise.reject('oh, no image animatorType after get selection data!!');
  }

  // replace fileList with layer-name in Stack's layers
  imageAnimatorType.selection.fileList = [];
  for (const layer of stack.layers) {
    imageAnimatorType.selection.fileList.push(layer.name);
  }

  // if (animatorTypeList) {
  //   console.log('insert animatorTypeList:', animatorTypeList);
  // }
  // write to mongo
  // 1. animator query list
  // 2. selectionData
  mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
}

function requestAllSelectionData(animatorTypeList) {
  const promiseList = [];
  for (let i = 0; i < animatorTypeList.length; i += 1) {
    const animatorType = animatorTypeList[i];

    // console.log('get animatorTypeID:', animatorType.animatorTypeID);// value.data);

    // Change: no more use c++ flushState of selection object,
    // no need to get selection object's ID for each animatorType
    // use a new command to ask selection's owner, animatorType to feedback selection data
    const cmd = `${animatorType.animatorTypeID}:${Commands.GET_SELECTION_DATA}`;
    const arg = '';
    promiseList.push(api.instance().sendCommand(cmd, arg));
  }
  return Promise.all(promiseList);
}

function requestAnimatorTypeIDs(animatorTypeList, animatorID, stack) {
  // if 1st opend file is 2d file, resp.data will be a empty array
  // if it is a 3d file, it will only contain channel, no image type
  //  TODO [Done] if empty, simulate to get some data to list
  // , using Promise.reject -> handleAnimatorError

  const total = animatorTypeList.length;
  if (total > 0) {
    const promiseList = [];

    let removeIndex = -1;
    for (let i = 0; i < animatorTypeList.length; i++) {
      const animatorType = animatorTypeList[i];
      if (animatorType.type === 'Image' && stack.layers.length === 1) {
        // console.log("ignore to query image animatorType's selection for only 1 file");
        removeIndex = i;
        continue;
      }

      const cmd = `${animatorID}:${Commands.GET_ANIMATORTYPE_ID}`;
      const arg = `type:${animatorType.type}`;

      // console.log('query animatorType:', animatorType.type);
      promiseList.push(api.instance().sendCommand(cmd, arg));
    }

    if (removeIndex > -1) {
      animatorTypeList.splice(removeIndex, 1);
    }

    if (promiseList.length > 0) {
      return Promise.all(promiseList);
    }
  }

  // console.log('return requestAnimatorTypeIDs error');

  return Promise.reject('oh, no image animatorType!!');
}


function requestAnimatorTypes(animatorID) {
  const cmd = `${animatorID}:${Commands.QUERY_ANIMATOR_TYPES}`;
  const arg = '';

  return api.instance().sendCommand(cmd, arg);
}

function updateAnimator(stack) {
  return (dispatch, getState) => {
    const animatorID = getState().AnimatorDB.animatorID;

    let animatorTypeList = [];

    // CARTA C++ issues
    // issue1-animator: the filelist in image animatorType's info. is sometimes wrong
    // caseA: if people have not opend two images yet,
    // there will be no image animatorType in C++,
    // so we can not get image animatorType's file list shown in UI.
    // caseB: if the number of images is <2, even there is image animator Type,
    // its fileList inside will not be updated.
    // e.g. still show 2 files if there is only 1 image file, also image animatorType's visible becomes false
    // solution: use stack's info. as the file list
    // TODO: use stack for all cases. now we only have used stack for some cases
    // issue2-stack:
    // if people open A, B, C, then close C, the reamining stack-layers become all unselected
    // solution: use animator's info to get the current file(index)

    if (!stack || !stack.layers || stack.layers.length === 0) {
      // console.log('no valid stack or empty stack, so force setup animator list empty !!');
      mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');

      return;
    }

    requestAnimatorTypes(animatorID)
      .then((resp) => {
        // console.log('get animator query type result:', resp);
        animatorTypeList = resp.data;
        // only need stack's layer count
        return requestAnimatorTypeIDs(animatorTypeList, animatorID, stack);
      })
      .then((values) => {
        // console.log('get all animatorType ids:', values);
        const promiseList = [];
        for (let i = 0; i < values.length; i += 1) {
          const value = values[i];
          animatorTypeList[i].animatorTypeID = value.data;
        }

        return requestAllSelectionData(animatorTypeList);
      })
      .then(values =>
        receiveAllSelectionData(animatorTypeList, values, stack),
      )
      .catch((e) => {
        // console.log('update animator catch, usually no image animatorType');
        handleAnimatorError(animatorTypeList, stack);
      });
  };
}

function changeNonImageFrame(animatorType, newFrameIndex) {
  return (dispatch, getState) => {
    // console.log('changeNonImageFrame');

    const animatorTypeID = animatorType.animatorTypeID;
    const animatorTypeList = getState().AnimatorDB.animatorTypeList;
    const cmd = `${animatorTypeID}:${Commands.SET_FRAME}`;
    const arg = newFrameIndex;

    api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        if (resp.data && resp.data.indexOf('Animator index must be a valid integer')) {
          // console.log('get changeFrame fail');
        } else {
          // console.log('get changeFrame ok');
          animatorType.selection.frame = newFrameIndex;
          // mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
          mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
        }
      })
      .catch((e) => {
        throw e;
        // console.log('change Non-Image frame catch');
      });
  };
}

function changeImageFrame(animatorTypeID, newFrameIndex) {
  return (dispatch, getState) => {
    // console.log('changeImageFrame');

    const animatorTypeList = getState().AnimatorDB.animatorTypeList;
    const cmd = `${animatorTypeID}:${Commands.SET_FRAME}`;
    const arg = newFrameIndex;

    api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        console.log('get changeFrame result:', resp);
        dispatch(colormap.updateColormap());
        return dispatch(imageViewer.updateStack());
      })
      .then((stack) => {
        // NOTE Sometimes when open A(3d), then B(2d), will only get image animatorType,
        // so when switch back to A(3d), need to query animatorType list again.
        dispatch(updateAnimator(stack));
      });
  };
}

const actions = {
  setupAnimator,
  changeImageFrame,
  changeNonImageFrame,
  changeAnimatorType,
  updateAnimator,
};

export default actions;
