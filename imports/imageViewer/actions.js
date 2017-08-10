import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Images } from '../api/Images';
// import { Responses } from '../api/Responses';

// command response part:
// import { updateFileListToMongo } from '../fileBrowser/actions';
// // response name list part:
// const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
// const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// redux part
const RECEIVE_IMAGE_CHANGE = 'RECEIVE_IMAGE_CHANGE';
export const Actions = {
  // RECEIVE_FILEBROWSER_CHANGE,
  // RECEIVE_FILE_LIST,
  RECEIVE_IMAGE_CHANGE,
};

function reflectMongoImageAddToStore(imageData) {
  console.log('reflect image:', imageData);
  return {
    type: RECEIVE_IMAGE_CHANGE,
    payload: {
      imageData,
    },
  };
}

function prepareImageViewer() {
  return (dispatch) => {
    Meteor.subscribe('images', SessionManager.get(), () => {
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
  };
}

export function saveImageToMongo(data) {
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

const actions = {
  prepareImageViewer,
};

export default actions;
