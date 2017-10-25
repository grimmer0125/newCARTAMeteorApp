// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';

// import '../api/methods';
import { FileBrowserDB } from '../api/FileBrowserDB';
import SessionManager from '../api/SessionManager';
import Commands from '../api/Commands';

import { mongoUpsert } from '../api/MongoHelper';

const FILEBROWSER_CHANGE = 'FILEBROWSER_CHANGE';

export const Actions = {
  FILEBROWSER_CHANGE,
};

// only for saving action history in mongo
const SELECT_FILE = 'SELECT_FILE';
const OPEN_FILEBROWSER = 'OPEN_FILEBROWSER';


// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// NOTE:
// Normal Redux way: a action will affect 1 or more than 1 reducers. (compare previous and current diff/payload)logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator, **Action files.

export function parseFileList(cmd, data) {
  const fileList = { files: data.dir, rootDir: data.name };

  mongoUpsert(FileBrowserDB, fileList, `Resp_${cmd}`);
}

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

// function prepareFileBrowser() {
//   return (dispatch) => {
//     // setupMongoReduxListeners(FileBrowserDB, dispatch, FILEBROWSER_CHANGE);
//     //    setupMongoReduxListeners(FileBrowserDB, dispatch, receiveUIChange);
//   };
// }

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
    Meteor.call('sendCommand', Commands.REQUEST_FILE_LIST, params, SessionManager.getSuitableSession(), (error, result) => {
      console.log('get open file browser result:', result);
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

    // get controllerID
    const controllerID = state.ImageController.controllerID;
    const parameter = `id:${controllerID},data:${path}`;
    console.log('inject file parameter, become:', parameter);

    Meteor.call('sendCommand', Commands.SELECT_FILE_TO_OPEN, parameter, SessionManager.getSuitableSession(), (error, result) => {
      console.log('get select file result:', result);
    });
  };
}

const actions = {
  // prepareFileBrowser,
  // closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
  selectFile,
};

export default actions;
