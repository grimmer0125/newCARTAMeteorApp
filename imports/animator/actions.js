
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

function handleAnimatorError(animatorTypeList, stack) { // fileName) {
  // Note: if the first opend file is 3d cube, it will only have channel AnimatorType, no image type
  // console.log('got promise error/reject:', stack);

  // 單一3d檔案 changeFrame 不會有 fileName="" 進來這邊,
  // 所以是新增唯一2d/3d檔案時, 以及
  // close 單一2d/3d file. fileName=""
  // 兩檔案變1檔案? fileName="" <- 怎辦?
  // special case: fake a image animatorType in animatorTypeList !!!
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

  let imageAnimatorType = null; // false;

  for (const animatorType of animatorTypeList) {
    if (animatorType.type === 'Image') {
      imageAnimatorType = animatorType;
      // imageTypeExist = true;
      break;
    }
  }
  if (!imageAnimatorType) {
    // 1st: 3d檔案, 沒有image的selection data

    // console.log('no image animatorType !!!');
    // ~ throw something, ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
    return Promise.reject('oh, no image animatorType after get selection data!!');
  }

  // replace fileList with layer-name inf Stack's layers
  imageAnimatorType.selection.fileList = [];
  for (const layer of stack.layers) {
    imageAnimatorType.selection.fileList.push(layer.name);
  }
  // imageAnimatorType.selection.fileList


  // if (animatorTypeList) {
  // console.log('insert animatorTypeList:', animatorTypeList);
  // write to mongo
  // 1. animator query list
  // 2. selectionData
  mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
  // }
}

function requestAllSelectionData(animatorTypeList) {
  // console.log('get all animatorType ids');
  const promiseList = [];
  for (let i = 0; i < animatorTypeList.length; i += 1) {
    const animatorType = animatorTypeList[i];

    // console.log('get animatorTypeID:', animatorType.animatorTypeID);// value.data);
    // animatorTypeList[i].animatorTypeID = animatorTypeID;//value.data;
    // Change: no more use flushState of selection object,
    // no need to get selection object's ID for each animatorType
    const cmd = `${animatorType.animatorTypeID}:${Commands.GET_SELECTION_DATA}`;
    const arg = '';
    promiseList.push(api.instance().sendCommand(cmd, arg));
  }
  return Promise.all(promiseList);
}

function requestAnimatorTypeIDs(animatorTypeList, animatorID, stack) {
  //  if 1st opend file is 2d file , resp.data will be a empty array
  // if is a 3d file, it will only contain channel, no image type
  //  TODO [Done] if empty, simulate to get some data to list 1.current file. on UI

  // let imageTypeExist = false;
  const total = animatorTypeList.length;
  if (total > 0) {
    const promiseList = [];


    // if (imageTypeExist) {
    // array.splice(index, 1);
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

      // if (animatorType.type == 'Image') {
      //   imageTypeExist = true;
      // }
    }

    if (removeIndex > -1) {
      animatorTypeList.splice(removeIndex, 1);
    }

    if (promiseList.length > 0) {
      return Promise.all(promiseList);
    }
  }
  // }

  // console.log('return requestAnimatorTypeIDs error');

  // ~ throw something, ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
  return Promise.reject('oh, no image animatorType!!');
}


function requestAnimatorTypes(animatorID) {
  const cmd = `${animatorID}:${Commands.QUERY_ANIMATOR_TYPES}`;
  const arg = '';

  return api.instance().sendCommand(cmd, arg);
}

// export function updateAnimator(animatorID, addedFileName) {
function updateAnimator(stack) {
  return (dispatch, getState) => {
    const animatorID = getState().AnimatorDB.animatorID;

    let animatorTypeList = [];

    // CARTA cpp issue1:
    // 開過2個以上的檔案後, image就會變生出, 當降回1個 or 0個時,
    // 它的image animator的上限會是只有1個但其中filelist是兩個, 且visible = false
    // 然後從0個->1個時(如果選擇第三個檔案), filelist, visible不會更新, 等到變回2個以上才都正常
    // 所以1個時的file name很多時候是不準的, 用stack來解決
    // issue2:
    // if people open A, B, C, then close C, the reamining stack-layers become unselected

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
    // const state = getState().AnimatorDB;
    const animatorTypeID = animatorType.animatorTypeID;
    const animatorTypeList = getState().AnimatorDB.animatorTypeList;
    const cmd = `${animatorTypeID}:${Commands.SET_FRAME}`;
    const arg = newFrameIndex;

    // console.log('changeNonImageFrame');

    api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        // console.log('get changeFrame result:', resp);
        // mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
        // return requestAllSelectionData(animatorTypeList);
        if (resp.data && resp.data.indexOf('Animator index must be a valid integer')) {
          // console.log('get changeFrame fail');
        } else {
          // console.log('get changeFrame ok');
          animatorType.selection.frame = newFrameIndex;
          mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
        }
      })
      // .then(values =>
      //   receiveAllSelectionData(animatorTypeList, values),
      // )
      .catch((e) => {
        throw e;
        // console.log('change Non-Image frame catch');

        // handleAnimatorError(animatorTypeList, fileName);
      });
  };
}

function changeImageFrame(animatorTypeID, newFrameIndex) {
  return (dispatch, getState) => {
    const animatorTypeList = getState().AnimatorDB.animatorTypeList;
    const cmd = `${animatorTypeID}:${Commands.SET_FRAME}`;
    const arg = newFrameIndex;

    // console.log('changeImageFrame');

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

    //   return requestAllSelectionData(animatorTypeList);
    // })
    // .then(values =>
    //   receiveAllSelectionData(animatorTypeList, values),
    // )
    // .catch((e) => {
    //   console.log('change Image frame catch');
    //
    //   // handleAnimatorError(animatorTypeList, fileName);
    // });
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
