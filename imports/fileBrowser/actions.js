// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';

// import '../api/methods';
import { FileBrowsers } from '../api/FileBrowsers';
import SessionManager from '../api/SessionManager';


// TODO move consts to a file
const RECEIVE_FILEBROWSER_CHANGE = 'RECEIVE_FILEBROWSER_CHANGE';

export const Actions = {
  RECEIVE_FILEBROWSER_CHANGE,
  // RECEIVE_FILE_LIST,
  // RECEIVE_IMAGE_CHANGE,
};

// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// Normal way: a action will affect 1 or more than 1 reducers. logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator, **Action files.

// const selfSessionID = null;

function updateUIToMongo(data) {
  console.log('updateUIToMongo');
  const uidata = FileBrowsers.find().fetch();
  if (uidata.length > 0) {
    console.log('update UI in db, count:', uidata.length);

    const ui = uidata[0];
    console.log('stored UI in db:', ui);

    const docID = uidata[0]._id;

    FileBrowsers.update(docID, { $set: data });
    // console.log('insert Response update:', res_id);
    // Responses.remove({});
    // Responses.update(res_id, resp);
  } else {
    console.log('insert UI in db');

    // 現在有個case是 mongo的 FileBrowsers 有8筆, 兩個原因
    // 1. 因為response一直都沒有刪掉, 所以reaload時會去處理
    // 2. 因為順序問題,  當 FileBrowsers還沒有收到mongo sync前,
    // 先得到response->會去insert一筆新的FileBrowser (因為還沒有sync完/得到舊的)
    // p.s. 看起來meteor 是一筆一筆added 通知, default
    //  https://docs.meteor.com/api/pubsub.html 可能可用這裡的避掉多筆added ? No. 只好每次用完都刪掉response

    const docID = FileBrowsers.insert({ ...data, session: SessionManager.get() });
    console.log('insert fileBrowser is finished:', docID);
  }
}

export function updateFileListToMongo(fileList) {
  console.log('updateFileListToMongo');
  updateUIToMongo(fileList);
}

export function updateFileBrowserToMongo(Open) {
  console.log('updateFileBrowserToMongo');

  updateUIToMongo({ fileBrowserOpened: Open });
}

// NOTE: follow https://github.com/acdlite/flux-standard-action
function receiveUIChange(ui) {
  return {
    type: RECEIVE_FILEBROWSER_CHANGE,
    payload: {
      ui,
    },
  };
}

function prepareFileBrowser() {
  return (dispatch) => {
    console.log('prepareFileBrowser');

    Meteor.subscribe('filebrowserui', SessionManager.get(), () => {
      console.log('filebrowserui subscribes OK !!!');
    });

    // TODO use returned handle to turn off observe when client unsubscribes, may not need, think more
    // e.g. https://gist.github.com/aaronthorp/06b67c171fde6d1ef317
    // subscription.onStop(function () {
    //   userHandle.stop();
    // });

    const filebrowserObservationHandle = FileBrowsers.find().observe({
      added(newDoc) {
        console.log('get Mongo fileBrowser added');
        dispatch(receiveUIChange(newDoc));
      },
      changed(newDoc, oldDoc) {
        console.log('get Mongo fileBrowser changed');
        dispatch(receiveUIChange(newDoc));
      },
    });

      // ui part
      // Tracker.autorun(() => {
      //   // 1st time ok, 2nd insert fail, so becomes back to zero.
      //   // local write still get this callback.
      //   const uidata = FileBrowsers.find().fetch();
      //
      //   console.log('get ui data change from db:', uidata.length);
      //   // if (uidata.length > 0) {
      //   //   const ui = uidata[0];
      //   //
      //   //   dispatch(receiveUIChange(ui));
      //   // } else {
      //   // }
      // });
    // });
  };
}

function queryServerFileList() {
  return (dispatch, getState) => {
    // 1. send to mongodb to sync UI
    updateFileBrowserToMongo(true);

    // 2. send command if it becomes true.
    Meteor.call('queryFileList', (error, result) => {
      console.log('get open file browser result:', result);
    });
  };
}

function closeFileBrowser() {
  return (dispatch, getState) => {
    // send command to mongodb
    updateFileBrowserToMongo(false);
  };
}

function selectFileToOpen(path) {
  return (dispatch, getState) => {
    Meteor.call('selectFileToOpen', path, (error, result) => {
      console.log('get select file result:', result);
    });
  };
}

const actions = {
  prepareFileBrowser,
  closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
};

export default actions;
