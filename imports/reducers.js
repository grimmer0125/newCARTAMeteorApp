import { combineReducers } from 'redux';

import fileReducer from './file/reducer.js';

const rootReducer = combineReducers({
  ...fileReducer,
});

export default rootReducer;
