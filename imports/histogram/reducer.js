// import { combineReducers } from 'redux';
import { Actions } from './actions';

// const defaultData = {
//   // rootDir: '/tmp',
//   // files: [{ name: 'apple.fits', type: 'fits' }],
// };

const histogramDB = (state = { data: {} }, action) => {
  switch (action.type) {
    case Actions.FILEBROWSER_CHANGE: {
      // return action.payload.data;
      return state;
    }
    default:
      return state;
  }
};

const histogramReducer = {
  histogramDB,
};

export default histogramReducer;
