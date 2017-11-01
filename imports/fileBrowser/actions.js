// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';

// import '../api/methods';
import { FileBrowserDB } from '../api/FileBrowserDB';
import { AnimatorDB } from '../api/AnimatorDB';

import SessionManager from '../api/SessionManager';
import Commands from '../api/Commands';
import api from '../api/ApiService';

import { mongoUpsert } from '../api/MongoHelper';
import { updateAnimatorAfterSelectFile } from '../animator/actions';

const FILEBROWSER_CHANGE = 'FILEBROWSER_CHANGE';

export const ActionType = {
  FILEBROWSER_CHANGE,
};

// only for saving action history in mongo
const SELECT_FILE = 'SELECT_FILE';
const OPEN_FILEBROWSER = 'OPEN_FILEBROWSER';


// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// NOTE:
// Normal Redux way: a action will affect 1 or more than 1 reducers. (compare previous and current diff/payload)logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator, **Action files.


// export function updateFileBrowserToMongo(Open) {
//   console.log('updateFileBrowserToMongo');
//   mongoUpsert(FileBrowserDB, { fileBrowserOpened: Open }, OPEN_FILEBROWSER);
// }

// NOTE: follow https://github.com/acdlite/flux-standard-action
// function receiveUIChange(data) {
//   return {
//     type: FILEBROWSER_CHANGE,
//     payload: {
//       data,
//     },
//   };
// }

function setupFileBrowser() {
  return (dispatch) => {
    api.instance().setupMongoRedux(dispatch, FileBrowserDB, FILEBROWSER_CHANGE);
    // setupMongoReduxListeners(FileBrowserDB, dispatch, FILEBROWSER_CHANGE);
    //    setupMongoReduxListeners(FileBrowserDB, dispatch, receiveUIChange);
  };
}

function parseFileList(resp) {
  const { cmd, data } = resp;
  const fileList = { files: data.dir, rootDir: data.name };

  mongoUpsert(FileBrowserDB, fileList, `Resp_${cmd}`);
}

function queryServerFileList() {
  return (dispatch, getState) => {
    // 1. send to mongodb to sync UI
    // updateFileBrowserToMongo(true);

    // QString command = "/CartaObjects/DataLoader:getData";
    // QString parameter = "path:";

    // const cmd = Commands.REQUEST_FILE_LIST;// '/CartaObjects/DataLoader:getData';
    const params = 'path:';// 'pluginId:ImageViewer,index:0';

    // 2. send command if it becomes true.
    // TODO need to send Seesion id ? Server knows client's session. Do we need to check this on server side? (Seesion change case)
    api.instance().sendCommand(Commands.REQUEST_FILE_LIST, params, (resp) => {
      parseFileList(resp);
    });
  };
}
function selectFile(index) {
  return (dispatch, getState) => {
    mongoUpsert(FileBrowserDB, { selectedFile: index }, SELECT_FILE);
  };
}
// function closeFileBrowser() {
//   return (dispatch, getState) => {
//     updateFileBrowserToMongo(false);
//   };
// }

function selectFileToOpen(path) {
  return (dispatch, getState) => {
    const state = getState();

    const nameArray = path.split('/');
    const fileName = nameArray[nameArray.length - 1];

    // get controllerID
    const controllerID = state.ImageController.controllerID;
    const parameter = `id:${controllerID},data:${path}`;
    console.log('inject file parameter, become:', parameter);

    const animatorID = state.AnimatorDB.animatorID;
    const animatorTypeList = [];
    api.instance().sendCommand(Commands.SELECT_FILE_TO_OPEN, parameter)
      .then((resp) => {
        console.log('response is SELECT_FILE_TO_OPEN:', resp);

        updateAnimatorAfterSelectFile(animatorID, fileName);
        // updateAnimatorAfterSelectFile
        // return requestAnimatorTypes(animatorID);
      });
    // .then((resp) => {
    //   console.log('get animator query type result:', resp);
    //   animatorTypeList = resp.data;
    //   return requestAnimatorTypeIDs(animatorTypeList, animatorID);
    // })
    // .then((values) => {
    //   console.log('get all animatorType ids');
    //   const promiseList = [];
    //   for (let i = 0; i < values.length; i += 1) {
    //     const value = values[i];
    //     animatorTypeList[i].animatorTypeID = value.data;
    //   }
    //   return requestAllSelectionData(animatorTypeList);
    // })
    // .then(values =>
    //   receiveAllSelectionData(animatorTypeList, values),
    // )
    // .catch((e) => {
    //   handleAnimatorError(animatorTypeList, fileName);
    // });
  };
}

export function queryAnimatorTypes() {


}


const actions = {
  setupFileBrowser,
  // closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
  selectFile,
};

export default actions;
