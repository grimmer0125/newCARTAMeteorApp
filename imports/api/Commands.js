// global-like
const REGISTER_VIEWER = '/CartaObjects/ViewManager:registerView';
const REQUEST_FILE_LIST = '/CartaObjects/DataLoader:getData';
const SELECT_FILE_TO_OPEN = '/CartaObjects/ViewManager:dataLoaded';

// non-global, need object id
const GET_ANIMATORTYPE_ID = 'registerAnimator';
const SET_ZOOM_LEVEL = 'setZoomLevel';
const CLOSE_IMAGE = 'closeImage';
const SET_FRAME = 'setFrame';

// New commands for new CARTA:
// const GET_DEFAULT_HISTOGRAM_ID = '/CartaObjects/ViewManager:getDefaultHistogramID';
const QUERY_ANIMATOR_TYPES = 'queryAnimatorTypes';
const GET_SELECTION_DATA = 'getSelecitonData';
const NEW_ZOOM = 'newzoom';
const GET_STACK_DATA = 'getStackData';
const PAN_ZOOM = 'zoom';
const PAN_RESET = 'resetPan';
const INPUT_EVENT = 'inputEvent';

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
  // GET_DEFAULT_HISTOGRAM_ID,
};

export default Commands;
