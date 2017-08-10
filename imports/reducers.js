import { combineReducers } from 'redux';

import fileReducer from './fileBrowser/reducer';
import imageReducer from './imageViewer/reducer';

const rootReducer = combineReducers({
  ...fileReducer,
  ...imageReducer,
});

export default rootReducer;
