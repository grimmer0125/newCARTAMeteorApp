// import * as firebase from 'firebase';
// import firebaseConfig from '../../firebaseConfig';
// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import '../api/methods.js';
import { Responses } from '../api/Responses.js';
import { FileBrowsers } from '../api/FileBrowsers.js';
import { Images } from '../api/Images.js';

// TODO move consts to a file
const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
const RECEIVE_FILE_LIST = 'RECEIVE_FILE_LIST';
const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

const RECEIVE_UI_CHANGE = 'RECEIVE_UI_CHANGE';
const RECEIVE_IMAGE_CHANGE = 'RECEIVE_IMAGE_CHANGE';

// const FILEBROWSER_CLOSE = `FILEBROWSER_CLOSE`;
// const FILEBROWSER_OPEN = `FILEBROWSER_OPEN`;
//
export const Actions = {
  RECEIVE_UI_CHANGE,
  RECEIVE_FILE_LIST,
  RECEIVE_IMAGE_CHANGE,
};

// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// Normal way: a action will affect 1 or more than 1 reducers. logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator

let selfSessionID = null;

function saveImageToMongo(data) {
  console.log('saveImageToMongo');
  const images = Images.find().fetch();
  if (images.length > 0) {
    Images.update(images[0]._id, { $set: data });
  } else {
    Images.insert({ ...data, session: selfSessionID });
  }
}

function updateUIToMongo(data) {
  console.log('updateUIToMongo');
  const uidata = FileBrowsers.find().fetch();
  if (uidata.length > 0) {
    console.log('update UI in db, count:', uidata.length);

    const ui = uidata[0];
    console.log('stored UI in db:', ui);

    const ui_id = uidata[0]._id;

    FileBrowsers.update(ui_id, { $set: data });
    // console.log('insert Response update:', res_id);
    // Responses.remove({});
    // Responses.update(res_id, resp);
  } else {
    console.log('insert UI in db');

    // 現在有個case是 mongo的 FileBrowsers 有8筆, 兩個原因
    // 1. 因為response一直都沒有刪掉, 所以reaload時會去處理
    // 2. 因為順序問題,  當 FileBrowsers還沒有收到mongo sync前, 先得到response->會去insert一筆新的FileBrowser (因為還沒有sync完/得到舊的)
    // p.s. 看起來meteor 是一筆一筆added 通知, default
    // TODO https://docs.meteor.com/api/pubsub.html 可能可用這裡的避掉多筆added ?

    const _id = FileBrowsers.insert({ ...data, session: selfSessionID });
    console.log('insert fileBrowser is finished:', _id);
  }
}

function updateFileListToMongo(fileList) {
  console.log('updateFileListToMongo');
  updateUIToMongo(fileList);
}

function updateFileBrowserToMongo(Open) {
  console.log('updateFileBrowserToMongo');

  updateUIToMongo({ fileBrowserOpened: Open });
}

// NOTE: follow https://github.com/acdlite/flux-standard-action
function receiveUIChange(ui) {
  return {
    type: RECEIVE_UI_CHANGE,
    payload: {
      ui,
    },
  };
}

function reflectMongoImageAddToStore(imageData) {
  return {
    type: RECEIVE_IMAGE_CHANGE,
    payload: {
      imageData,
    },
  };
}


// export function receiveFileList(filelist) {
//   return {
//     type: RECEIVE_FILE_LIST,
//     payload: {
//       filelist,
//     },
//   };
// }

function handleCommandResponse(resp) {
  // const res  = responses[0];

  console.log('get response:', resp);

  if (resp.cmd == REQUEST_FILE_LIST) {
    console.log('response is REQUEST_FILE_LIST:');
    console.log(resp);
    // TODO use https://github.com/arunoda/meteor-streams or https://github.com/YuukanOO/streamy or mongodb?
    // insert to responses

    // NOTE 如果有動到ui collection, 所以這裡又被call第二次? !!!!!!!!!!!!!!!!!!!!!!! 把tracker -> observeation 就ok了.
    // 用 tick ok. 另一方法是用observeation, not tracker.autorun
    // process.nextTick(() => {
    updateFileListToMongo({ files: resp.dir, rootDir: resp.name });
    // });

    // dispatch(receiveFileList({ files: res.dir, rootDir:  res.name }));

    // self.setState({ files: res.dir, rootDir:  res.name });
  } else if (resp.cmd == SELECT_FILE_TO_OPEN) {
    console.log('response is SELECT_FILE_TO_OPEN:');
    console.log(resp);
    const url = `data:image/jpeg;base64,${resp.image}`;

    // TODO add setState back
    // self.setState({ imageURL: url });
    saveImageToMongo({ imageURL: url });
  }
}

export function waitForCommandResponses() {
  return (dispatch, getState) => {
    console.log('waitForCommandResponses');
    // const self = this;

    // TODO may feature out how to get the info in client.jsx
    // console.log("default session:", simpleStringify(Meteor.connection)); in client.jsx
    // http://www.danielsvane.dk/blog/getting-session-id-in-meteor-on-startup

    console.log('default session2:', Meteor.connection._lastSessionId);

    Meteor.call('getSessionId', (err, session_id) => {
      console.log('getSessionId return:', session_id);

      selfSessionID = session_id;

      // TODO check more, only get the data for this sub-parameter?
      // another approach is, subscribe name is just session value, e.g. "fdasfasf"
      // subscribe special Collection,
      Meteor.subscribe('commandResponse', session_id, () => {
        console.log('commandResponse subscribes OK !!!');
      });

      Meteor.subscribe('filebrowserui', session_id, () => {
        console.log('filebrowserui subscribes OK !!!');
      });

      Meteor.subscribe('images', session_id, () => {
        console.log('images subscribes OK !!!');
      });

      const imageObservationHandle = Images.find().observe({
        added(newDoc) {
          console.log('get image Mongo added');
          dispatch(reflectMongoImageAddToStore(newDoc));
        },
        changed(newDoc, oldDoc) {
          console.log('get image Mongo changed');
          dispatch(reflectMongoImageAddToStore(newDoc));
        },
      });

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

      // TODO turn off observe when client unsubscribes, may not need, think more
      // e.g. https://gist.github.com/aaronthorp/06b67c171fde6d1ef317
      // subscription.onStop(function () {
      //   userHandle.stop();
      // });

      const respObservationHandle = Responses.find().observe({
        added(newDoc) {
          console.log('get Mongo added response');
          // const resps = Responses.find().fetch();
          // console.log('current response collection:', resps); // yes, already exist in the collection
          // const docId = newDoc.profile.imageFile;
          //
          // const doc = UserImages.findOne({ _id: docId });
          // subscription.added(collectionName, docId, doc);
          handleCommandResponse(newDoc);

          // delete responses
          process.nextTick(() => {
            console.log('delete response');
            Responses.remove(newDoc._id);
          });
        },
        // removed(oldDoc) {

        // },
        changed(newDoc, oldDoc) {
          console.log('get Mongo changed response');

          handleCommandResponse(newDoc);

          process.nextTick(() => {
            console.log('delete response');
            Responses.remove(newDoc._id);
          // Responses.remove({}); // 有tracker就是 Not permitted. Untrusted code may only remove documents by ID. 現在是用observeation則是先exception, 改成用tick後還是有not permitted
          });
        },
      });

      // response part
      // Tracker.autorun(() => {
      //   const responses = Responses.find().fetch();
      //   console.log('get responses count:', responses.length, ';content:', responses);
      //
      //   if (responses.length > 0) {
      //
      //
      //     // Responses.remove({});
      //     // delete responses
      //   }
      // });
    });
  };
}

export function queryServerFileList() {
  return (dispatch, getState) => {
    // 1. send to mongodb to sync UI
    updateFileBrowserToMongo(true);

    // 2. send command if it becomes true.
    Meteor.call('queryFileList', (error, result) => {
      console.log('get open file browser result:', result);
    });
  };
}

export function closeFileBrowser() {
  return (dispatch, getState) => {
    // send command to mongodb
    updateFileBrowserToMongo(false);
  };
}

export function selectFileToOpen(path) {
  return (dispatch, getState) => {
    Meteor.call('selectFileToOpen', path, (error, result) => {
      console.log('get select file result:', result);
    });
  };
}
