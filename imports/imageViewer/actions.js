import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Images } from '../api/Images';
import Commands from '../api/Commands';
// redux part
const IMAGEVIEWER_CHANGE = 'IMAGEVIEWER_CHANGE';

// only for saving action history in mongo
const RESPONSE_REGISTER_IMAGEVIEWER = 'RESPONSE_REGISTER_IMAGEVIEWER';
const GET_IMAGE = 'GET_IMAGE';

export const Actions = {
  IMAGEVIEWER_CHANGE,
};

import { setupMongoListeners, mongoUpsert } from '../api/MongoHelper';

function reflectMongoImageAddToStore(imageData) {
  console.log('reflect image:', imageData);
  return {
    type: IMAGEVIEWER_CHANGE,
    payload: {
      imageData,
    },
  };
}

function prepareImageViewer() {
  return (dispatch) => {
    setupMongoListeners(Images, dispatch, reflectMongoImageAddToStore);

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
  mongoUpsert(Images, { controllerID }, RESPONSE_REGISTER_IMAGEVIEWER);

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
    const url = `data:image/jpeg;base64,${buffer}`;
    console.log('image url string size:', url.length);

    console.log('parseImageToMongo');
    mongoUpsert(Images, { imageURL: url }, GET_IMAGE);
  } else {
    console.log('get dummy image response');
  }
}

const actions = {
  prepareImageViewer,
};

export default actions;
