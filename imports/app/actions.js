import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Images } from '../api/Images';
import { Responses } from '../api/Responses';

// command response part:
import { updateFileListToMongo, updateFileBrowserToMongo } from '../file/actions';
// response name list part:
const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// redux part
const RECEIVE_IMAGE_CHANGE = 'RECEIVE_IMAGE_CHANGE';
export const Actions = {
  // RECEIVE_FILEBROWSER_CHANGE,
  // RECEIVE_FILE_LIST,
  RECEIVE_IMAGE_CHANGE,
};

function saveImageToMongo(data) {
  console.log('saveImageToMongo');
  const images = Images.find().fetch();
  if (images.length > 0) {
    console.log('save image by update');
    Images.update(images[0]._id, { $set: data });
  } else {
    console.log('save image by insert');
    Images.insert({ ...data, session: SessionManager.get() });
  }
}

function reflectMongoImageAddToStore(imageData) {
  console.log('reflect image:', imageData);
  return {
    type: RECEIVE_IMAGE_CHANGE,
    payload: {
      imageData,
    },
  };
}

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

function waitForCommandResponses() {
  return (dispatch) => {
    console.log('waitForCommandResponses');
    // const self = this;

    // TODO may feature out how to get the info in client.jsx
    // console.log("default session:", simpleStringify(Meteor.connection)); in client.jsx
    // http://www.danielsvane.dk/blog/getting-session-id-in-meteor-on-startup

    // console.log('default session2:', Meteor.connection._lastSessionId); empty

    Meteor.call('getSessionId', (err, session_id) => {
      console.log('getSessionId return:', session_id);

      SessionManager.set(session_id);
      // selfSessionID = session_id;

      // TODO check more, only get the data for this sub-parameter?
      // another approach is, subscribe name is just session value, e.g. "fdasfasf"
      // subscribe special Collection,
      Meteor.subscribe('commandResponse', session_id, () => {
        console.log('commandResponse subscribes OK !!!');
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
};

export default actions;
