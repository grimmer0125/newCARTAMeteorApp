import { combineReducers } from 'redux';

import fileReducer from './fileBrowser/reducer';
import imageReducer from './imageViewer/reducer';
import sessionReducer from './app/reducer';

const rootReducer = combineReducers({
  ...sessionReducer,
  ...fileReducer,
  ...imageReducer,
});

export default rootReducer;
