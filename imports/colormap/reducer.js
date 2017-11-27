import { ActionType } from './actions';

const defaultState = {
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
