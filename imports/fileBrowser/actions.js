// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';

// import '../api/methods';
import { FileBrowsers } from '../api/FileBrowsers';
import SessionManager from '../api/SessionManager';
import Commands from '../api/Commands';

import { setupMongoListeners, mongoUpsert } from '../api/MongoHelper';

const FILEBROWSER_CHANGE = 'FILEBROWSER_CHANGE';

// only for saving action history in mongo
const SELECT_FILE = 'SELECT_FILE';
const GET_FILELIST = 'GET_FILELIST';
const OPEN_FILEBROWSER = 'OPEN_FILEBROWSER';

export const Actions = {
  FILEBROWSER_CHANGE,
};

// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// NOTE:
// Normal Redux way: a action will affect 1 or more than 1 reducers. (compare previous and current diff/payload)logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator, **Action files.

export function parseFileList(data) {
  const fileList = { files: data.dir, rootDir: data.name };

  mongoUpsert(FileBrowsers, fileList, GET_FILELIST);
}

export function updateFileBrowserToMongo(Open) {
  console.log('updateFileBrowserToMongo');
  mongoUpsert(FileBrowsers, { fileBrowserOpened: Open }, OPEN_FILEBROWSER);
}

// NOTE: follow https://github.com/acdlite/flux-standard-action
function receiveUIChange(ui) {
  return {
    type: FILEBROWSER_CHANGE,
    payload: {
      ui,
    },
  };
}

function prepareFileBrowser() {
  return (dispatch) => {
    setupMongoListeners(FileBrowsers, dispatch, receiveUIChange);
  };
}

function queryServerFileList() {
  return (dispatch, getState) => {
    // 1. send to mongodb to sync UI
    updateFileBrowserToMongo(true);

    // QString command = "/CartaObjects/DataLoader:getData";
    // QString parameter = "path:";

    // const cmd = Commands.REQUEST_FILE_LIST;// '/CartaObjects/DataLoader:getData';
    const params = 'path:';// 'pluginId:ImageViewer,index:0';

    // 2. send command if it becomes true.
    // TODO need to send Seesion id ? Server knows client's session. Do we need to check this on server side? (Seesion change case)
    Meteor.call('sendCommand', Commands.REQUEST_FILE_LIST, params, (error, result) => {
      console.log('get open file browser result:', result);
    });
  };
}
function selectFile(index) {
  return (dispatch, getState) => {
    mongoUpsert(FileBrowsers, { selectedFile: index }, SELECT_FILE);
  };
}
function closeFileBrowser() {
  return (dispatch, getState) => {
    updateFileBrowserToMongo(false);
  };
}

function selectFileToOpen(path) {
  return (dispatch, getState) => {
    const state = getState();

    // get controllerID
    const controllerID = state.image.controllerID;
    const parameter = `id:${controllerID},data:${path}`;
    console.log('inject file parameter, become:', parameter);

    Meteor.call('sendCommand', Commands.SELECT_FILE_TO_OPEN, parameter, (error, result) => {
      console.log('get select file result:', result);
    });
  };
}

const actions = {
  prepareFileBrowser,
  closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
  selectFile,
};

export default actions;
