import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Images } from '../api/Images';
import Commands from '../api/Commands';
// redux part
const RECEIVE_IMAGE_CHANGE = 'RECEIVE_IMAGE_CHANGE';
export const Actions = {
  RECEIVE_IMAGE_CHANGE,
};

import { setupMongoListeners, mongoUpsert } from '../api/MongoHelper';

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

    Meteor.call('sendCommand', cmd, params, (error, result) => {
      console.log('get command dummy result:', result);
    });
  };
}

export function parseReigsterViewResp(result) {
  console.log('grimmer got register view command response');
  const controllerID = result;

  // step1: save controllerID to mongodb
  mongoUpsert(Images, { controllerID });

  // step2
  const viewName = `${controllerID}/view`;
  const width = 637; // TODO same as the experimental setting in ImageViewer, change later
  const height = 677;

  Meteor.call('setupViewSize', viewName, width, height, (error, result) => {
    console.log('get setupViewSize dummy result:', result);
  });
}

export function parseImageToMongo(buffer) {
  const url = `data:image/jpeg;base64,${buffer}`;
  console.log('image url string size:', url.length);

  console.log('parseImageToMongo');
  mongoUpsert(Images, { imageURL: url });
}

const actions = {
  prepareImageViewer,
};

export default actions;
