import { combineReducers } from 'redux';

import fileReducer from './file/reducer';
import imageReducer from './app/reducer';

const rootReducer = combineReducers({
  ...fileReducer,
  ...imageReducer,
});

export default rootReducer;
