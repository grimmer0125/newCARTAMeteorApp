import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { HistogramDB } from '../api/HistogramDB';
import Commands from '../api/Commands';
import api from '../api/ApiService';

// redux part
const HISTOGRAM_CHANGE = 'HISTOGRAM_CHANGE';
export const ActionType = {
  HISTOGRAM_CHANGE,
};

import { mongoUpsert } from '../api/MongoHelper';

function setupHistogram() {
  return (dispatch) => {

    api.instance().setupMongoRedux(dispatch, HistogramDB, HISTOGRAM_CHANGE);

    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // 'pluginId:ImageViewer,index:0';

    const cmd = Commands.REGISTER_VIEWER; // '/CartaObjects/ViewManager:registerView';
    const params = 'pluginId:Histogram,index:0';
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    console.log('send register Histogram');

    api.instance().sendCommand(cmd, params, (resp) => {
      console.log('get register histogram result:', resp);

      parseReigsterHistogramResp(resp);
    });
  };
}

export function parseReigsterHistogramResp(resp) {
  const { cmd, data } = resp;
  console.log('grimmer got register histogram-view command response:', data);
  const histogramID = data;
  //  grimmer got register histogram-view command response: /CartaObjects/c145

  // save histogramID to mongodb
  mongoUpsert(HistogramDB, { histogramID }, `Resp_${cmd}`);
}

const actions = {
  setupHistogram,
};

export default actions;
