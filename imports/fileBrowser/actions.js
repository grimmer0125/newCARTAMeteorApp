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

    // get controllerID
    const controllerID = state.ImageController.controllerID;
    const parameter = `id:${controllerID},data:${path}`;
    console.log('inject file parameter, become:', parameter);

    const animatorID = state.AnimatorDB.animatorID;
    let animatorTypeList = null;
    api.instance().sendCommand(Commands.SELECT_FILE_TO_OPEN, parameter)
      .then((resp) => {
        console.log('response is SELECT_FILE_TO_OPEN:', resp);

        const cmd = `${animatorID}:${Commands.QUERY_ANIMATOR_TYPES}`;
        const params = '';

        return api.instance().sendCommand(cmd, params);
      })
      .then((resp) => {
        console.log('get animator query type result:', resp);

        //  if 1st opend file is 2d file , resp.data will be a empty array
        //  TODO [Done] if empty, simulate to get some data to list 1.current file. on UI

        const promiseList = [];

        // const animatorTypes = resp.data;
        animatorTypeList = resp.data;

        imageTypeExist = false;
        for (const animatorType of animatorTypeList) {
          if (animatorType.type == 'Image') {
            imageTypeExist = true;
            break;
          }
        }

        if (imageTypeExist) {
          for (const animatorType of animatorTypeList) {
            const cmd = `${animatorID}:${Commands.GET_ANIMATORTYPE_ID}`;
            const params = `type:${animatorType.type}`;

            promiseList.push(api.instance().sendCommand(cmd, params));
          }
          return Promise.all(promiseList);
        }
        console.log('no image animatorType !!!');
        // ~ throw something, ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
        return Promise.reject('oh, no image animatorType!!');
      })
      .then((values) => {
        console.log('get all animatorType ids');
        const promiseList = [];
        for (let i = 0; i < values.length; i += 1) {
          const value = values[i];
          console.log('get animatorTypeID:', value.data);
          animatorTypeList[i].animatorTypeID = value.data;
          // Change: no more use flushState of selection object,
          // no need to get selection object's ID for each animatorType
          const cmd = `${value.data}:${Commands.GET_SELECTION_DATA}`;
          const params = '';
          promiseList.push(api.instance().sendCommand(cmd, params));
        }
        return Promise.all(promiseList);
      })
      .then((values) => {
        for (let i = 0; i < values.length; i += 1) {
          const value = values[i];
          console.log('get selectionData:', value.data);
          animatorTypeList[i].selection = value.data;
        }

        if (animatorTypeList) {
          console.log('insert animatorTypeList:', animatorTypeList);
          // write to mongo
          // 1. animator query list
          // 2. selectionData
          mongoUpsert(AnimatorDB, { animatorTypeList }, 'GET_ANIMATOR_DATA');
        }
      })
      .catch((e) => {
        console.log('got promise error/reject');

        // fake a image animatorType in animatorTypeList
        const nameArray = path.split('/');
        const fileName = nameArray[nameArray.length - 1];

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
      });


    // Disadvantange:
    // 1. callback hell
    // 2. hard to wait for all response. so switch to use promise.
    // api.instance().sendCommand(Commands.SELECT_FILE_TO_OPEN, parameter, (resp) => {
    //   console.log('response is SELECT_FILE_TO_OPEN:', resp);
    //
    //   const animatorID = state.AnimatorDB.animatorID;
    //   const cmd = `${animatorID}:queryAnimatorTypes`;
    //   const params = '';
    //   api.instance().sendCommand(cmd, params, (resp) => {

    //     console.log('get animator equery type result:', resp);
    //     // data:"" <- result
    //

    //     const animatorTypes = resp.data;
    //     for (const animatorType of animatorTypes) {
    //       // type: Channel or Image or Stoke
    //       // visible
    //       const cmd = `${animatorID}:${Commands.GET_ANIMATORTYPE_ID}`;
    //       const params = `type:${animatorType.type}`;
    //
    //       api.instance().sendCommand(cmd, params, (resp) => {
    //         console.log('get animatorTypeID:', resp); // e.g. // /CartaObjects/c107
    //
    //         const cmd = `${resp.data}:${Commands.GET_SELECTION}`;
    //         const params = '';
    //         // send getSelection
    //         api.instance().sendCommand(cmd, params, (resp) => {
    //           console.log('get getSelectionD:', resp); // e.g. // /CartaObjects/c107
    //         });
    //       });
    //     }
    //   });
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
