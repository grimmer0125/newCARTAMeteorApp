import { ImageViewerDB } from '../api/ImageViewerDB';
import { RegionDB } from '../api/RegionDB';
import Commands from '../api/Commands';
import api from '../api/ApiService';
import { mongoUpsert } from '../api/MongoHelper';

// only for saving action history in mongo
// const RESPONSE_REGISTER_VIEWER = 'RESPONSE_REGISTER_VIEWER';
const GET_IMAGE = 'GET_IMAGE';
// redux part
const IMAGEVIEWER_CHANGE = 'IMAGEVIEWER_CHANGE';
export const ActionType = {
  IMAGEVIEWER_CHANGE,
};

export function setupImageViewerDB() {
  api.instance().setupMongoRedux(ImageViewerDB, IMAGEVIEWER_CHANGE);
}
function setRegionControlsId(response) {
  const { data } = response;
  mongoUpsert(RegionDB, { regionControlsID: data }, 'SET_REGION_CONTROLS_ID');
}
function parseReigsterViewResp(resp) {
  const { cmd, data } = resp;
  // console.log('get register response:', resp.cmd, 'data:', resp.data);

  // console.log('grimmer got register view command response');
  const controllerID = data;

  // step1: save controllerID to mongodb
  mongoUpsert(ImageViewerDB, { controllerID }, `Resp_${cmd}`);
  const command = `${controllerID}:${Commands.REGISTER_REGION_CONTROLS}`;
  api.instance().sendCommand(command, '')
    .then((response) => {
      setRegionControlsId(response);
    });
  // step2
  const viewName = `${controllerID}/view`;
  const width = 482; // TODO same as the experimental setting in ImageViewer, change later
  const height = 477;
  api.instance().setupViewSize(viewName, width, height);
}
function setupImageViewer() {
  return () => {
    // console.log('setupImageViewer');

    // ref: https://github.com/cartavis/carta/blob/develop/carta/html5/common/skel/source/class/skel/widgets/Window/DisplayWindow.js
    const cmd = Commands.REGISTER_VIEWER; // '/CartaObjects/ViewManager:registerView';
    // var pathDict = skel.widgets.Path.getInstance();
    // var regCmd = pathDict.getCommandRegisterView();
    // this.BASE_PATH = this.SEP + this.CARTA + this.SEP;
    // return `${this.BASE_PATH + this.VIEW_MANAGER + this.SEP_COMMAND}registerView`;

    const arg = 'pluginId:ImageViewer,index:0';
    // var paramMap = "pluginId:" + this.m_pluginId + ",index:"+index;

    api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        parseReigsterViewResp(resp);
      });
  };
}

export function parseImageToMongo(buffer) {
  if (buffer) {
    // const url = `data:image/jpeg;base64,${buffer}`;
    // console.log('image url string size:', buffer.length);

    mongoUpsert(ImageViewerDB, { imageURL: buffer }, GET_IMAGE);
  } else {
    console.log('get dummy image response');
  }
}
function setZoomLevel(zoomLevel, layerID) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    // console.log('controllerID: ', controllerID);
    // console.log('STATE: ', getState());
    const cmd = `${controllerID}:${Commands.SET_ZOOM_LEVEL}`;
    const arg = `${zoomLevel} ${layerID}`;

    api.instance().sendCommand(cmd, arg, (resp) => {
      console.log('get set zoom level result:', resp);
    });
  };
}

function zoom(zoomFactor) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    // console.log('controllerID: ', controllerID);
    const cmd = `${controllerID}:${Commands.NEW_ZOOM}`;
    const arg = zoomFactor;

    api.instance().sendCommand(cmd, arg, (resp) => {
      console.log('get set zoom result:', resp);
    });
  };
}
function panZoom(x, y, zoomFactor) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    // console.log('controllerID: ', controllerID);
    const cmd = `${controllerID}:${Commands.PAN_ZOOM}`;
    const arg = `${x} ${y} ${zoomFactor}`;

    api.instance().sendCommand(cmd, arg, (resp) => {
      console.log('get set zoom result:', resp);
    });
  };
}
function zoomReset() {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    const zoomLevel = getState().ImageViewerDB.zoomLevel;
    const layerID = getState().ImageViewerDB.layerID;
    const cmd = `${controllerID}:${Commands.SET_ZOOM_LEVEL}`;
    const arg = `${zoomLevel} ${layerID}`;

    api.instance().sendCommand(cmd, arg, (resp) => {
      console.log('get set zoom level result:', resp);
    });
  };
}
function panReset() {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    const cmd = `${controllerID}:${Commands.PAN_RESET}`;
    const arg = '';
    api.instance().sendCommand(cmd, arg, (resp) => {
      console.log('get set zoom result:', resp);
    });
  };
}
function setCursor(x, y) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    const cmd = `${controllerID}:${Commands.INPUT_EVENT}`;
    const arg = `{"type":"hover","x":${x},"y":${y}}`;
    return api.instance().sendCommand(cmd, arg).then(resp =>
      // resp,
      mongoUpsert(ImageViewerDB, { cursorInfo: resp.data.formattedCursorCoordinates }, 'CURSOR_INFO'),
    );
  };
}
function updateStack() {
  return (dispatch, getState) => {
    mongoUpsert(ImageViewerDB, { requestingFile: false }, 'REQUESTING_FILE');
    const state = getState();
    const controllerID = state.ImageViewerDB.controllerID;
    // const controllerID = resp.data;
    const cmd = `${controllerID}:${Commands.GET_STACK_DATA}`;
    const arg = '';
    return api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        // console.log('stack resp:', resp);
        mongoUpsert(ImageViewerDB, { stack: resp.data }, 'GET_STACK');
        return resp.data;
      });
  };
}
function setRegionType(type) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    const cmd = `${controllerID}:${Commands.SET_REGION_TYPE}`;
    const arg = `type:${type}`;
    api.instance().sendCommand(cmd, arg, (resp) => {
      // console.log('get register Profiler result:', resp);
      console.log(resp);
    });
  };
}
function regionCommand(phase, x, y) {
  return (dispatch, getState) => {
    const controllerID = getState().ImageViewerDB.controllerID;
    const cmd = `${controllerID}:${Commands.INPUT_EVENT}`;
    const arg = `{"type":"drag2","phase":"${phase}","x":${x},"y":${y}}`;
    api.instance().sendCommand(cmd, arg, (resp) => {
      // console.log('get register Profiler result:', resp);
      console.log(resp);
    });
  };
}
const actions = {
  setupImageViewer,
  updateStack,
  zoom,
  setZoomLevel,
  panZoom,
  zoomReset,
  panReset,
  setCursor,
  setRegionType,
  regionCommand,
};

export default actions;
