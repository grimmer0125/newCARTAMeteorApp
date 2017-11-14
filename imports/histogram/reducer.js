// import { combineReducers } from 'redux';
import { ActionType } from './actions';

// const defaultData = {
//   // rootDir: '/tmp',
//   // files: [{ name: 'apple.fits', type: 'fits' }],
// };
const defaultState = { data: {} };

const HistogramDB = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.HISTOGRAM_CHANGE: {
      // console.log('histogramDB action:', action);
      return action.payload.data;
    }
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const histogramReducer = {
  HistogramDB,
};

export default histogramReducer;
