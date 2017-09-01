import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Images } from '../api/Images';
import { Responses } from '../api/Responses';

// command response part:
import { receiveFileList } from '../fileBrowser/actions';
import { receiveImageToMongo, receiveReigsterViewResp } from '../imageViewer/actions';
// response name list part:
// const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
import Commands from '../api/Commands';

// const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// TODO move consts to a file
const GET_SESSIONID = 'GET_SESSIONID';

export const Actions = {
  GET_SESSIONID,
};

function turnOnWatching(watchingSessionID) {
  return (dispatch) => {
    // subscribe
    SessionManager.useOtherSession(watchingSessionID);

    console.log('use other session:', SessionManager.getOtherSession());
    Meteor.subscribe('filebrowserui', SessionManager.getOtherSession(), () => {
      console.log('filebrowserui subscribes OK: !!!', SessionManager.get());
    });

    Meteor.subscribe('images', SessionManager.getOtherSession(), () => {
      console.log('images subscribes OK !!!');
    });
  };
}

function turnOffWatching() {
  return (dispatch) => {

  };
  // unsubscribe

  // Meteor.subscribe('filebrowserui', SessionManager.getOtherSession(), () => {
  //   console.log('filebrowserui subscribes OK: !!!', SessionManager.get());
  // });
  //
  // Meteor.subscribe('images', SessionManager.getOtherSession(), () => {
  //   console.log('images subscribes OK !!!');
  // });
}

function subscribeNonCommandCollections() {
  // if it stays in filebrower's actions's prepareFileBrowser, its sessionid is usually empty
  Meteor.subscribe('filebrowserui', SessionManager.get(), () => {
    console.log('filebrowserui subscribes OK: !!!', SessionManager.get());
  });

  Meteor.subscribe('images', SessionManager.get(), () => {
    console.log('images subscribes OK !!!');
  });
}

function handleCommandResponse(resp) {
  console.log('get response:');

  if (resp.cmd === Commands.REQUEST_FILE_LIST) {
    console.log('response is REQUEST_FILE_LIST:');
    console.log(resp);
    // XTODO use https://github.com/arunoda/meteor-streams or https://github.com/YuukanOO/streamy or mongodb to get response from servers(<- Current way)?

    // NOTE 如果有動到ui collection, 所以這裡又被call第二次? !!!!!!!!!!!!!!!!!!!!!!!
    // 用 tick ok. 另一方法是用observeation (current way, ok), not tracker.autorun.
    // process.nextTick(() => {
    receiveFileList(resp.data);
    // });
  } else if (resp.cmd === Commands.SELECT_FILE_TO_OPEN) {
    console.log('response is SELECT_FILE_TO_OPEN(get image):');
    console.log(resp);
    receiveImageToMongo(resp.buffer);
  } else if (resp.cmd === Commands.REGISTER_IMAGEVIEWER) {
    receiveReigsterViewResp(resp.data);
  }
}

function waitForCommandResponses() {
  return (dispatch) => {
    console.log('waitForCommandResponses');

    Meteor.call('getSessionId', (err, sessionID) => {
      console.log('getSessionId return:', sessionID);

      // use mongo or singleton
      SessionManager.set(sessionID);
      dispatch({
        type: GET_SESSIONID,
        payload: sessionID,
      });

      // TODO check more, only get the data for this sub-parameter?
      // another approach is, subscribe name is just session value, e.g. "fdasfasf"
      // subscribe special Collection,
      Meteor.subscribe('commandResponse', SessionManager.get(), () => {
        console.log('commandResponse subscribes OK !!!');
      });

      // if it stays in filebrower's actions's prepareFileBrowser, its sessionid is usually empty
      // Meteor.subscribe('filebrowserui', SessionManager.get(), () => {
      //   console.log('filebrowserui subscribes OK: !!!', SessionManager.get());
      // });
      //
      // Meteor.subscribe('images', SessionManager.get(), () => {
      //   console.log('images subscribes OK !!!');
      // });
      subscribeNonCommandCollections();

      // TODO use returned handle to turn off observe when client unsubscribes, may not need, think more
      // e.g. https://gist.github.com/aaronthorp/06b67c171fde6d1ef317
      // subscription.onStop(function () {
      //   userHandle.stop();
      // });

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

const actions = {
  waitForCommandResponses,
  turnOnWatching,
  turnOffWatching,
};

export default actions;
