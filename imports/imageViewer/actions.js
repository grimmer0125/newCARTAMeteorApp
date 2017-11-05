import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { ImageViewerDB } from '../api/ImageViewerDB';
import Commands from '../api/Commands';
import api from '../api/ApiService';

// only for saving action history in mongo
// const RESPONSE_REGISTER_VIEWER = 'RESPONSE_REGISTER_VIEWER';
const GET_IMAGE = 'GET_IMAGE';

// redux part
const IMAGEVIEWER_CHANGE = 'IMAGEVIEWER_CHANGE';
export const ActionType = {
  IMAGEVIEWER_CHANGE,
};

import { mongoUpsert } from '../api/MongoHelper';

export function setupImageViewerDB() {
  api.instance().setupMongoRedux(ImageViewerDB, IMAGEVIEWER_CHANGE);
}

function setupImageViewer() {
  return (dispatch) => {
    console.log('grimmer setupImageViewer');

    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // 'pluginId:ImageViewer,index:0';

    const cmd = Commands.REGISTER_VIEWER; // '/CartaObjects/ViewManager:registerView';
    const params = 'pluginId:ImageViewer,index:0';
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    console.log('send register ImageViewer');

    // api.instance().sendCommand(cmd, params, (resp) => {
    //   parseReigsterViewResp(resp);
    // });
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        parseReigsterViewResp(resp);
      });
  };
}

function parseReigsterViewResp(resp) {
  const { cmd, data } = resp;
  console.log('get register response:', resp.cmd, 'data:', resp.data);

  console.log('grimmer got register view command response');
  const controllerID = data;

  // step1: save controllerID to mongodb
  mongoUpsert(ImageViewerDB, { controllerID }, `Resp_${cmd}`);

  // step2
  const viewName = `${controllerID}/view`;
  const width = 482; // TODO same as the experimental setting in ImageViewer, change later
  const height = 477;

  api.instance().setupViewSize(viewName, width, height);
}

export function parseImageToMongo(buffer) {
  if (buffer) {
    console.log('parseImageToMongo');

    // const url = `data:image/jpeg;base64,${buffer}`;
    console.log('image url string size:', buffer.length);

    mongoUpsert(ImageViewerDB, { imageURL: buffer }, GET_IMAGE);
  } else {
    console.log('get dummy image response');
  }
}
function zoom(zoomCommand) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    console.log('controllerID: ', controllerID);
    // console.log('STATE: ', getState());
    const cmd = `${controllerID}:${Commands.NEW_ZOOM}`;
    const params = zoomCommand;

    api.instance().sendCommand(cmd, params, (resp) => {
      console.log('get set zoom result:', resp);
    });
  };
}

function updateStack() {
  return (dispatch, getState) => {
    console.log('query new stack info');
    const state = getState();
    const controllerID = state.ImageViewerDB.controllerID;

    // const controllerID = resp.data;
    const cmd = `${controllerID}:${Commands.GET_STACK_DATA}`;
    const params = '';
    return api.instance().sendCommand(cmd, params)
      .then((resp) => {
        console.log('stack resp:', resp);
        mongoUpsert(ImageViewerDB, { stack: resp.data }, 'GET_STACK');
        return resp.data;
      });
  };
}

const actions = {
  setupImageViewer,
  updateStack,
  zoom,
};

export default actions;
