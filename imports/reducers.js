import { combineReducers } from 'redux';

import fileReducer from './fileBrowser/reducer';
import imageReducer from './imageViewer/reducer';
import regionReducer from './region/reducer';
import sessionReducer from './app/reducer';

const rootReducer = combineReducers({
  ...sessionReducer,
  ...fileReducer,
  ...imageReducer,
  ...regionReducer,
});

export default rootReducer;
