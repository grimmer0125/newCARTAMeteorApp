import { ActionType } from './actions';

const defaultState = {
  min: 0.1,
  stops: ['#FF0000', '#e5ff00'],
  max: 1,
  colorMapName: '',
};
const ColormapDB = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.COLORMAP_CHANGE: {
      return action.payload.data;
    }
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const colormapReducer = {
  ColormapDB,
};

export default colormapReducer;
