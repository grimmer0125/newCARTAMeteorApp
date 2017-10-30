import { ProfilerDB } from '../api/ProfilerDB';
import { mongoUpsert } from '../api/MongoHelper';
import api from '../api/ApiService';

const PROFILER_CHANGE = 'PROFILER_CHANGE';

export const ActionType = {
  PROFILER_CHANGE,
};

const SET_HOVER = 'SET_HOVER';
const ZOOM_PAN = 'ZOOM_PAN';

function setupProfiler() {
  return (dispatch) => {
    api.instance().setupMongoRedux(dispatch, ProfilerDB, PROFILER_CHANGE);
  };
}
function onHover(data) {
  return (dispatch, getState) => {
    const val = { curveNumber: data.points[0].curveNumber, pointNumber: data.points[0].pointNumber };
    mongoUpsert(ProfilerDB, { data: val }, SET_HOVER);
  };
}
function onZoomPan(data) {
  return (dispatch, getState) => {
    // console.log('DATA: ', data);
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
    if (Object.keys(val).length > 0) mongoUpsert(ProfilerDB, { zoomPanData: val }, ZOOM_PAN);
  };
}
const actions = {
  setupProfiler,
  onHover,
  onZoomPan,
};

export default actions;
