
import { AnimatorDB } from '../api/AnimatorDB';
import api from '../api/ApiService';
import Commands from '../api/Commands';
import { mongoUpsert } from '../api/MongoHelper';

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
    const params = 'pluginId:Animator,index:0';

    console.log('send register Animator');

    api.instance().sendCommand(cmd, params, (resp) => {
      console.log('get register animator result:', resp);
      mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
    });
  };
}

function handleAnimatorError(animatorTypeList, fileName) {
  // Note: if the first opend file is 3d cube, it will only have channel AnimatorType, no image type
  console.log('got promise error/reject');

  // fake a image animatorType in animatorTypeList

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
        fileName,
      ],
    },
  };

  animatorTypeList.push(animatorType);
  mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
}

function receiveAllSelectionData(animatorTypeList, results) {
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    console.log('get selectionData:', result.data);
    animatorTypeList[i].selection = result.data;
  }

  imageTypeExist = false;
  for (const animatorType of animatorTypeList) {
    if (animatorType.type == 'Image') {
      imageTypeExist = true;
      break;
    }
  }
  if (!imageTypeExist) {
    console.log('no image animatorType !!!');
    // ~ throw something, ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
    return Promise.reject('oh, no image animatorType!!');
  }

  // if (animatorTypeList) {
  console.log('insert animatorTypeList:', animatorTypeList);
  // write to mongo
  // 1. animator query list
  // 2. selectionData
  mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
  // }
}

function requestAllSelectionData(animatorTypeList) {
  console.log('get all animatorType ids');
  const promiseList = [];
  for (let i = 0; i < animatorTypeList.length; i += 1) {
    const animatorType = animatorTypeList[i];
    console.log('get animatorTypeID:', animatorType.animatorTypeID);// value.data);
    // animatorTypeList[i].animatorTypeID = animatorTypeID;//value.data;
    // Change: no more use flushState of selection object,
    // no need to get selection object's ID for each animatorType
    const cmd = `${animatorType.animatorTypeID}:${Commands.GET_SELECTION_DATA}`;
    const params = '';
    promiseList.push(api.instance().sendCommand(cmd, params));
  }
  return Promise.all(promiseList);
}

function requestAnimatorTypeIDs(animatorTypeList, animatorID) {
  //  if 1st opend file is 2d file , resp.data will be a empty array
  //  TODO [Done] if empty, simulate to get some data to list 1.current file. on UI

  const total = animatorTypeList.length;
  if (total > 0) {
    const promiseList = [];

    // if (imageTypeExist) {
    for (const animatorType of animatorTypeList) {
      const cmd = `${animatorID}:${Commands.GET_ANIMATORTYPE_ID}`;
      const params = `type:${animatorType.type}`;

      promiseList.push(api.instance().sendCommand(cmd, params));
    }

    return Promise.all(promiseList);
  }
  // }

  console.log('return requestAnimatorTypeIDs error');

  // ~ throw something, ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
  return Promise.reject('oh, no image animatorType!!');
}


function requestAnimatorTypes(animatorID) {
  const cmd = `${animatorID}:${Commands.QUERY_ANIMATOR_TYPES}`;
  const params = '';

  return api.instance().sendCommand(cmd, params);
}

export function updateAnimatorAfterSelectFile(animatorID, fileName) {
  let animatorTypeList = [];

  requestAnimatorTypes(animatorID)
    .then((resp) => {
      console.log('get animator query type result:', resp);
      animatorTypeList = resp.data;
      return requestAnimatorTypeIDs(animatorTypeList, animatorID);
    })
    .then((values) => {
      console.log('get all animatorType ids');
      const promiseList = [];
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        animatorTypeList[i].animatorTypeID = value.data;
      }
      return requestAllSelectionData(animatorTypeList);
    })
    .then(values =>
      receiveAllSelectionData(animatorTypeList, values),
    )
    .catch((e) => {
      console.log('change frame catch');
      handleAnimatorError(animatorTypeList, fileName);
    });
}

function changeNonImageFrame(animatorType, newFrameIndex) {
  return (dispatch, getState) => {
    // const state = getState().AnimatorDB;
    const animatorTypeID = animatorType.animatorTypeID;
    const animatorTypeList = getState().AnimatorDB.animatorTypeList;
    const cmd = `${animatorTypeID}:${Commands.SET_FRAME}`;
    const params = newFrameIndex;

    console.log('changeNonImageFrame');

    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        console.log('get changeFrame result:', resp);
        // mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
        // return requestAllSelectionData(animatorTypeList);
        if (resp.data && resp.data.indexOf('Animator index must be a valid integer')) {
          console.log('get changeFrame fail');
        } else {
          console.log('get changeFrame ok');
          animatorType.selection.frame = newFrameIndex;
          mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
        }
      })
      // .then(values =>
      //   receiveAllSelectionData(animatorTypeList, values),
      // )
      .catch((e) => {
        console.log('change Non-Image frame catch');

        // handleAnimatorError(animatorTypeList, fileName);
      });
  };
}

function changeImageFrame(animatorTypeID, newFrameIndex) {
  return (dispatch, getState) => {
    // const state = getState().AnimatorDB;
    const animatorTypeList = getState().AnimatorDB.animatorTypeList;
    const cmd = `${animatorTypeID}:${Commands.SET_FRAME}`;
    const params = newFrameIndex;

    console.log('changeImageFrame');

    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        console.log('get changeFrame result:', resp);
        // mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
        return requestAllSelectionData(animatorTypeList);
      })
      .then(values =>
        receiveAllSelectionData(animatorTypeList, values),
      )
      .catch((e) => {
        console.log('change Image frame catch');

        // handleAnimatorError(animatorTypeList, fileName);
      });
  };
}

const actions = {
  setupAnimator,
  changeImageFrame,
  changeNonImageFrame,
  changeAnimatorType,
};

export default actions;
