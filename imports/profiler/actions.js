import { ProfilerDB } from '../api/ProfilerDB';
import { mongoUpsert } from '../api/MongoHelper';
import Commands from '../api/Commands';
import api from '../api/ApiService';

const PROFILER_CHANGE = 'PROFILER_CHANGE';

export const ActionType = {
  PROFILER_CHANGE,
};

const SET_HOVER = 'SET_HOVER';
const ZOOM_PAN = 'ZOOM_PAN';
const SET_PROFILEDATA = 'SET_PROFILEDATA';

export function parseRegisterProfilerResp(resp) {
  const { cmd, data } = resp;
  // console.log('grimmer got register profiler-view command response:', data);
  const profilerID = data;

  // save profilerID to mongodb
  mongoUpsert(ProfilerDB, { profilerID }, `Resp_${cmd}`);
}

function setupProfiler() {
  return () => {
    // api.instance().setupMongoRedux(dispatch, ProfilerDB, PROFILER_CHANGE);

    const cmd = Commands.REGISTER_VIEWER;
    const params = 'pluginId:Profiler,index:0';

    // console.log('send register Profiler');

    api.instance().sendCommand(cmd, params, (resp) => {
      // console.log('get register Profiler result:', resp);

      parseRegisterProfilerResp(resp);
    });
  };
}
function clearProfile() {
  return (dispatch) => {
    const data = { x: [], y: [] };
    mongoUpsert(ProfilerDB, { profileData: data }, SET_PROFILEDATA);
  };
}
function getProfile() {
  return (dispatch, getState) => {
    const profilerID = getState().ProfilerDB.profilerID;
    // console.log('profilerID for getting profile: ', profilerID);

    const cmd = `${profilerID}:getProfileData`;
    const params = '';

    api.instance().sendCommand(cmd, params, (resp) => {
      // console.log('get response of profile:', resp);
      console.log('PROFILE DATA: ', resp.data);
      mongoUpsert(ProfilerDB, { profileData: resp.data }, SET_PROFILEDATA);
    });
  };
}

export function setupProfilerDB() {
  api.instance().setupMongoRedux(ProfilerDB, PROFILER_CHANGE);
}

function onHover(data) {
  return () => {
    const val = { curveNumber: data.points[0].curveNumber,
      pointNumber: data.points[0].pointNumber };
    mongoUpsert(ProfilerDB, { data: val }, SET_HOVER);
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
    if (Object.keys(val).length > 0) mongoUpsert(ProfilerDB, { zoomPanData: val }, ZOOM_PAN);
  };
}
const actions = {
  setupProfiler,
  onHover,
  onZoomPan,
  getProfile,
  clearProfile,
};

export default actions;
