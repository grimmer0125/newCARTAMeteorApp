// import { Meteor } from 'meteor/meteor';
import { mongoUpsert } from '../api/MongoHelper';
// import SessionManager from '../api/SessionManager';
import { HistogramDB } from '../api/HistogramDB';
import Commands from '../api/Commands';
import api from '../api/ApiService';

// redux part
const HISTOGRAM_CHANGE = 'HISTOGRAM_CHANGE';
const SET_HISTOGRAM_DATA = 'SET_HISTOGRAM_DATA';
const SET_HOVER = 'SET_HOVER';
const ZOOM_PAN = 'ZOOM_PAN';

export const ActionType = {
  HISTOGRAM_CHANGE,
};


export function setupHistogramDB() {
  api.instance().setupMongoRedux(HistogramDB, HISTOGRAM_CHANGE);
}

function getHistogramData() {
  // console.log('INSIDE getHistogramData');
  return (dispatch, getState) => {
    const histogramID = getState().HistogramDB.histogramID;
    const cmd = `${histogramID}:getHistogramData`;
    const params = '';
    api.instance().sendCommand(cmd, params, (resp) => {
      // console.log('get response of profile:', resp);
      console.log('HISTOGRAM DATA: ', resp.data);
      mongoUpsert(HistogramDB, { histogramData: resp.data }, SET_HISTOGRAM_DATA);
    });
  };
}
export function parseReigsterHistogramResp(resp) {
  console.log('RESGISTERING HISTOGRAM');
  const { cmd, data } = resp;
  // console.log('grimmer got register histogram-view command response:', data);
  const histogramID = data;
  //  grimmer got register histogram-view command response: /CartaObjects/c145

  // save histogramID to mongodb
  mongoUpsert(HistogramDB, { histogramID }, `Resp_${cmd}`);
}

function setupHistogram() {
  return () => {
    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // 'pluginId:ImageViewer,index:0';

    const cmd = Commands.REGISTER_VIEWER; // '/CartaObjects/ViewManager:registerView';
    const arg = 'pluginId:Histogram,index:0';
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    api.instance().sendCommand(cmd, arg, (resp) => {
      // console.log('get register histogram result:', resp);

      parseReigsterHistogramResp(resp);
    });
  };
}
function onHover(data) {
  return () => {
    const val = { curveNumber: data.points[0].curveNumber,
      pointNumber: data.points[0].pointNumber };
    mongoUpsert(HistogramDB, { data: val }, SET_HOVER);
  };
}
function onZoomPan(data) {
  return () => {
    let val = null;
    val = {};
    if (data['xaxis.range[0]']) {
      // val['xaxis.range'] = [data['xaxis.range[0]'], data['xaxis.range[1]']];
      val.xRange = [data['xaxis.range[0]'], data['xaxis.range[1]']];
    }
    if (data['yaxis.range[0]']) {
      // val['yaxis.range'] = [data['yaxis.range[0]'], data['yaxis.range[1]']];
      val.yRange = [data['yaxis.range[0]'], data['yaxis.range[1]']];
    }
    if (data['xaxis.autorange'] && data['yaxis.autorange']) {
      // val['xaxis.autorange'] = true;
      // val['yaxis.autorange'] = true;
      val.xAutorange = true;
      val.yAutorange = true;
    }
    if (Object.keys(val).length > 0) mongoUpsert(HistogramDB, { zoomPanData: val }, ZOOM_PAN);
  };
}
const actions = {
  setupHistogram,
  getHistogramData,
  onHover,
  onZoomPan,
};

export default actions;
