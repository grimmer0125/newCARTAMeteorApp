// import * as firebase from 'firebase';
// import firebaseConfig from '../../firebaseConfig';
// const  moment = require('moment');

import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import '../api/methods.js';
import { Responses } from '../api/responses.js';
import { UIData } from '../api/uidata.js';

// TODO move consts to a file
const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

const RECEIVE_UI_CHANGE = 'RECEIVE_UI_CHANGE';
// const FILEBROWSER_CLOSE = `FILEBROWSER_CLOSE`;
// const FILEBROWSER_OPEN = `FILEBROWSER_OPEN`;
//
export const Actions = {
  RECEIVE_UI_CHANGE,
};

// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// Normal way: a action will affect 1 or more than 1 reducers. logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator

function updateFileBrowserToMongo(Open) {
  console.log('updateFileBrowserToMongo');
  const uidata = UIData.find().fetch();
  if (uidata.length > 0) {
    console.log('add UI');

    const ui_id = uidata[0]._id;
    UIData.update(ui_id, { $set: { fileBrowserOpened: Open } });
    // console.log('insert Response update:', res_id);
    // Responses.remove({});
    // Responses.update(res_id, resp);
  } else {
    console.log('insert UI');

    const _id = UIData.insert({ fileBrowserOpened: Open });
    console.log('insert fileBrowser is finished:', _id);
  }
}

// NOTE: follow https://github.com/acdlite/flux-standard-action
export function receiveUIChange(ui) {
  return {
    type: RECEIVE_UI_CHANGE,
    payload: {
      ui,
    },
  };
}

export function waitForCommandResponses() {
  return (dispatch, getState) => {
    // const self = this;

    // TODO may feature out how to get the info in client.jsx
    // console.log("default session:", simpleStringify(Meteor.connection)); in client.jsx
    // http://www.danielsvane.dk/blog/getting-session-id-in-meteor-on-startup
    Meteor.call('getSessionId', (err, session_id) => {
      console.log('getSessionId return:', session_id);

      // TODO check more, only get the data for this sub-parameter?
      // another approach is, subscribe name is just session value, e.g. "fdasfasf"
      // subscribe special Collection,
      Meteor.subscribe('commandResponse', session_id); // changed???
      Meteor.subscribe('filebrowserui', session_id); // changed???

      // ui part
      Tracker.autorun(() => {
        const uidata = UIData.find().fetch();

        console.log('get ui data change from db:', uidata);
        if (uidata.length > 0) {
          const ui = uidata[0];

          dispatch(receiveUIChange(ui));
        } else {
          // 1st time ok, 2nd insert fail, so becomes back to zero.
        }
      });

      // response part
      Tracker.autorun(() => {
        const responses = Responses.find().fetch();
        console.log('get responses count:', responses.length, ';content:', responses);

        if (responses.length > 0) {
          const res = responses[0];

          if (res.cmd == REQUEST_FILE_LIST) {
            console.log('response is REQUEST_FILE_LIST:');
            console.log(res);
            // TODO use https://github.com/arunoda/meteor-streams or https://github.com/YuukanOO/streamy or mongodb?
            // insert to responses

            // self.setState({ files: res.dir, rootDir:  res.name });
          } else if (res.cmd == SELECT_FILE_TO_OPEN) {
            console.log('response is SELECT_FILE_TO_OPEN:');
            console.log(res);
            const url = `data:image/jpeg;base64,${res.image}`;

            // TODO add setState back
            // self.setState({ imageURL: url });
          }
        }
      });
    });
  };
}

// mode: sleep or rest
export function queryServerFileList() {
  return (dispatch, getState) => {
    // 1. send to mongodb to sync UI
    updateFileBrowserToMongo(true);

    // 2. send command if it becomes true.

    // const catPath = "cats/" + catID;
    //
    // const time = moment().unix();
    // const newRecord = {};
    // newRecord[time] = {mode, breathRate};
    // // var now = moment().format();
    //
    // console.log("new record", newRecord);
    // firebase.database().ref(catPath).child("breathRecord").update(newRecord)
    // .then(()=>{
    //   console.log("set new breath ok");
    // });
  };
}

export function closeFileBrowser() {
  return (dispatch, getState) => {
    // send command to mongodb
    updateFileBrowserToMongo(false);
  };
}
