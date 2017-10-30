// import { combineReducers } from 'redux';
import { ActionType } from './actions';

// const defaultData = {
//   // rootDir: '/tmp',
//   // files: [{ name: 'apple.fits', type: 'fits' }],
// };

const HistogramDB = (state = { data: {} }, action) => {
  switch (action.type) {
    case ActionType.HISTOGRAM_CHANGE: {
      console.log('histogramDB action:', action);
      return action.payload.data;
    }
    default:
      return state;
  }
};

const histogramReducer = {
  HistogramDB,
};

export default histogramReducer;
