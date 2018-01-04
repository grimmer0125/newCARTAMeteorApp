// !!continue to use these previous commands which is used by old CARTA. !!
// global-like
const REGISTER_VIEWER = '/CartaObjects/ViewManager:registerView';
const REQUEST_FILE_LIST = '/CartaObjects/DataLoader:getData';
const SELECT_FILE_TO_OPEN = '/CartaObjects/ViewManager:dataLoaded';

// non-global
//need object id
const GET_ANIMATORTYPE_ID = 'registerAnimator';
const SET_ZOOM_LEVEL = 'setZoomLevel';
const CLOSE_IMAGE = 'closeImage';
const SET_FRAME = 'setFrame';
const PAN_ZOOM = 'zoom';
const PAN_RESET = 'resetPan';
const INPUT_EVENT = 'inputEvent';

// !!!! Add New commands for new CARTA, add previous commands above !!!
// const GET_DEFAULT_HISTOGRAM_ID = '/CartaObjects/ViewManager:getDefaultHistogramID';
const QUERY_ANIMATOR_TYPES = 'queryAnimatorTypes';
const GET_SELECTION_DATA = 'getSelecitonData';
const NEW_ZOOM = 'newzoom';
const GET_STACK_DATA = 'getStackData';
const GET_COLORMAP_All_DATA = 'get_colormap_all_data';
const SET_REGION_TYPE = 'setRegionType';
const REGISTER_REGION_CONTROLS = 'registerRegionControls';
const CLOSE_REGION = 'closeRegion';

// TODO some commands need parameters, wrap them as a function

const Commands = {
  REGISTER_VIEWER,
  REQUEST_FILE_LIST,
  SELECT_FILE_TO_OPEN,
  QUERY_ANIMATOR_TYPES,
  GET_ANIMATORTYPE_ID,
  GET_SELECTION_DATA,
  NEW_ZOOM,
  SET_ZOOM_LEVEL,
  SET_FRAME,
  GET_STACK_DATA,
  CLOSE_IMAGE,
  PAN_ZOOM,
  PAN_RESET,
  INPUT_EVENT,
  GET_COLORMAP_All_DATA,
  SET_REGION_TYPE,
  REGISTER_REGION_CONTROLS,
  CLOSE_REGION,
};

export default Commands;
