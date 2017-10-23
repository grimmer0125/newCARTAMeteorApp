import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { ImageController } from '../api/ImageController';
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

    console.log('send register ImageViewer');
    Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
      console.log('get command dummy result:', result);
    });
  };
}

export function parseReigsterViewResp(result) {
  console.log('grimmer got register view command response');
  const controllerID = result;

  // step1: save controllerID to mongodb
  mongoUpsert(ImageController, { controllerID }, RESPONSE_REGISTER_IMAGEVIEWER);

  // step2
  const viewName = `${controllerID}/view`;
  const width = 482; // TODO same as the experimental setting in ImageViewer, change later
  const height = 477;

  Meteor.call('setupViewSize', viewName, width, height, (error, result) => {
    console.log('get setupViewSize dummy result:', result);
  });
}

export function parseImageToMongo(buffer) {
  if (buffer) {
    console.log('parseImageToMongo');

    // const url = `data:image/jpeg;base64,${buffer}`;
    console.log('image url string size:', buffer.length);

    mongoUpsert(ImageController, { imageURL: buffer }, GET_IMAGE);
  } else {
    console.log('get dummy image response');
  }
}
export function zoom(zoomCommand) {
  return (dispatch, getState) => {
    const controllerID = getState().imageController.controllerID;
    console.log('controllerID: ', controllerID);
    // console.log('STATE: ', getState());
    const cmd = `${controllerID}:newzoom`;
    const params = zoomCommand;
    Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
      console.log('get command dummy result:', result);
    });
  };
}
const actions = {
  setuptImageViewer,
};

export default actions;
