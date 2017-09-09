import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { ImageViewers } from '../api/ImageViewers';
import Commands from '../api/Commands';

// only for saving action history in mongo
const RESPONSE_REGISTER_IMAGEVIEWER = 'RESPONSE_REGISTER_IMAGEVIEWER';
const GET_IMAGE = 'GET_IMAGE';

// redux part
const IMAGEVIEWER_CHANGE = 'IMAGEVIEWER_CHANGE';
export const Actions = {
  IMAGEVIEWER_CHANGE,
};

import { mongoUpsert } from '../api/MongoHelper';

// function reflectMongoImageAddToStore(data) {
//   console.log('reflect image:', data);
//   return {
//     type: IMAGEVIEWER_CHANGE,
//     payload: {
//       data,
//     },
//   };
// }

function setuptImageViewer() {
  return (dispatch) => {
    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // 'pluginId:ImageViewer,index:0';

    const cmd = Commands.REGISTER_IMAGEVIEWER; // '/CartaObjects/ViewManager:registerView';
    const params = 'pluginId:ImageViewer,index:0';
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
      console.log('get command dummy result:', result);
    });
  };
}

export function parseReigsterViewResp(result) {
  console.log('grimmer got register view command response');
  const controllerID = result;

  // step1: save controllerID to mongodb
  mongoUpsert(ImageViewers, { controllerID }, RESPONSE_REGISTER_IMAGEVIEWER);

  // step2
  const viewName = `${controllerID}/view`;
  const width = 637; // TODO same as the experimental setting in ImageViewer, change later
  const height = 677;

  Meteor.call('setupViewSize', viewName, width, height, (error, result) => {
    console.log('get setupViewSize dummy result:', result);
  });
}

export function parseImageToMongo(buffer) {
  if (buffer) {
    console.log('parseImageToMongo');

    const url = `data:image/jpeg;base64,${buffer}`;
    console.log('image url string size:', url.length);

    mongoUpsert(ImageViewers, { imageURL: url }, GET_IMAGE);
  } else {
    console.log('get dummy image response');
  }
}

const actions = {
  setuptImageViewer,
};

export default actions;
