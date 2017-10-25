import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { HistogramDB } from '../api/HistogramDB';
import Commands from '../api/Commands';

// redux part
const HISTOGRAM_CHANGE = 'HISTOGRAM_CHANGE';
export const Actions = {
  HISTOGRAM_CHANGE,
};

import { mongoUpsert } from '../api/MongoHelper';

function setupHistogram() {
  return (dispatch) => {
    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // 'pluginId:ImageViewer,index:0';

    const cmd = Commands.GET_DEFAULT_HISTOGRAM_ID; // '/CartaObjects/ViewManager:registerView';
    const params = 'pluginId:Histogram,index:0';
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    console.log('send register Histogram');
    Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
      console.log('get command dummy result:', result);
    });
  };
}

export function parseReigsterHistogramResp(cmd, result) {
  console.log('grimmer got register histogram-view command response:', result);
  const histogramID = result;
  //  grimmer got register histogram-view command response: /CartaObjects/c145

  // step1: save controllerID to mongodb
  mongoUpsert(HistogramDB, { histogramID }, `Resp_${cmd}`);

  // step2
  // const viewName = `${controllerID}/view`;
  // const width = 482; // TODO same as the experimental setting in ImageViewer, change later
  // const height = 477;
  //
  // Meteor.call('setupViewSize', viewName, width, height, (error, result) => {
  //   console.log('get setupViewSize dummy result:', result);
  // });
}
//
// export function parseImageToMongo(buffer) {
//   if (buffer) {
//     console.log('parseImageToMongo');
//
//     // const url = `data:image/jpeg;base64,${buffer}`;
//     console.log('image url string size:', buffer.length);
//
//     mongoUpsert(ImageController, { imageURL: buffer }, GET_IMAGE);
//   } else {
//     console.log('get dummy image response');
//   }
// }
// export function zoom(zoomCommand) {
//   return (dispatch, getState) => {
//     const controllerID = getState().imageController.controllerID;
//     console.log('controllerID: ', controllerID);
//     // console.log('STATE: ', getState());
//     const cmd = `${controllerID}:newzoom`;
//     const params = zoomCommand;
//     Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
//       console.log('get command dummy result:', result);
//     });
//   };
// }

const actions = {
  setupHistogram,
};

export default actions;
