// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';

// import '../api/methods';
import { Responses } from '../api/Responses';
import { FileBrowsers } from '../api/FileBrowsers';
import { Images } from '../api/Images';

// TODO move consts to a file
const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
const RECEIVE_FILE_LIST = 'RECEIVE_FILE_LIST';
const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

const RECEIVE_FILEBROWSER_CHANGE = 'RECEIVE_FILEBROWSER_CHANGE';
const RECEIVE_IMAGE_CHANGE = 'RECEIVE_IMAGE_CHANGE';

// const FILEBROWSER_CLOSE = `FILEBROWSER_CLOSE`;
// const FILEBROWSER_OPEN = `FILEBROWSER_OPEN`;
//
export const Actions = {
  RECEIVE_FILEBROWSER_CHANGE,
  RECEIVE_FILE_LIST,
  RECEIVE_IMAGE_CHANGE,
};

// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// Normal way: a action will affect 1 or more than 1 reducers. logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator, **Action files.

let selfSessionID = null;

function saveImageToMongo(data) {
  console.log('saveImageToMongo');
  const images = Images.find().fetch();
  if (images.length > 0) {
    console.log('save image by update');
    Images.update(images[0]._id, { $set: data });
  } else {
    console.log('save image by insert');
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

    const docID = FileBrowsers.insert({ ...data, session: selfSessionID });
    console.log('insert fileBrowser is finished:', docID);
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
    type: RECEIVE_FILEBROWSER_CHANGE,
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
  console.log('get response:');

  if (resp.cmd === REQUEST_FILE_LIST) {
    console.log('response is REQUEST_FILE_LIST:');
    console.log(resp);
    // XTODO use https://github.com/arunoda/meteor-streams or https://github.com/YuukanOO/streamy or mongodb to get response from servers(<- Current way)?

    // NOTE 如果有動到ui collection, 所以這裡又被call第二次? !!!!!!!!!!!!!!!!!!!!!!!
    // 用 tick ok. 另一方法是用observeation (current way, ok), not tracker.autorun.
    // process.nextTick(() => {
    updateFileListToMongo({ files: resp.dir, rootDir: resp.name });
    // });
  } else if (resp.cmd === SELECT_FILE_TO_OPEN) {
    console.log('response is SELECT_FILE_TO_OPEN(get image):');
    console.log(resp);
    const url = `data:image/jpeg;base64,${resp.image}`;
    console.log('image url string size:', url.length);
    // TODO add setState back
    // self.setState({ imageURL: url });
    saveImageToMongo({ imageURL: url });
  }
}

export function waitForCommandResponses() {
  return (dispatch) => {
    console.log('waitForCommandResponses');
    // const self = this;

    // TODO may feature out how to get the info in client.jsx
    // console.log("default session:", simpleStringify(Meteor.connection)); in client.jsx
    // http://www.danielsvane.dk/blog/getting-session-id-in-meteor-on-startup

    // console.log('default session2:', Meteor.connection._lastSessionId); empty

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

      // TODO use returned handle to turn off observe when client unsubscribes, may not need, think more
      // e.g. https://gist.github.com/aaronthorp/06b67c171fde6d1ef317
      // subscription.onStop(function () {
      //   userHandle.stop();
      // });

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

      const respObservationHandle = Responses.find().observe({
        added(newDoc) {
          console.log('get Mongo added response');

          handleCommandResponse(newDoc);

          // delete responses
          process.nextTick(() => {
            console.log('delete response');
            Responses.remove(newDoc._id);
          });
        },

        changed(newDoc, oldDoc) {
          console.log('get Mongo changed response');

          handleCommandResponse(newDoc);

          process.nextTick(() => {
            console.log('delete response');
            Responses.remove(newDoc._id);
          // NOTE:
          // Responses.remove({}); // Not permitted. Untrusted code may only remove documents by ID.
          // 現在是用observeation則是先exception(tracker不會), 改成用tick後還是有not permitted, 要加上用id刪
          });
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

const actions = {
  waitForCommandResponses,
  closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
};

export default actions;
