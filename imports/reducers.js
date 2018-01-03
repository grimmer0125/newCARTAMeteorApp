import { combineReducers } from 'redux';

import fileReducer from './fileBrowser/reducer';
import imageReducer from './imageViewer/reducer';
import regionReducer from './region/reducer';
import sessionReducer from './app/reducer';
import profilerReducer from './profiler/reducer';
import histogramReducer from './histogram/reducer';
import featureReducer from './featureContainer/reducer';
import animatorReducer from './animator/reducer';
import colormapReducer from './colormap/reducer';

const rootReducer = combineReducers({
  ...sessionReducer,
  ...fileReducer,
  ...imageReducer,
  ...regionReducer,
  ...histogramReducer,
  ...profilerReducer,
  ...featureReducer,
  ...animatorReducer,
  ...colormapReducer,
});

export default rootReducer;
