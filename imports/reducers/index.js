import { combineReducers } from 'redux';
import { Actions } from '../actions/fileAction';

// TODO use only big reducer or multiple reducer?

const fileBrowserOpened = (state = false, action) => {
  console.log('fileBrowser action:', action);
  switch (action.type) {
    case Actions.RECEIVE_UI_CHANGE:
      return action.payload.ui.fileBrowserOpened;
    default:
      return state;
  }
};

const testFileList = {
  rootDir: '/tmp',
  files: [{ name: 'apple.fits', type: 'fits' }],
};

const serverFileList = (state = testFileList, action) => {
  console.log('server file list', action);
  switch (action.type) {
    case Actions.RECEIVE_FILE_LIST:
      return { ...action.payload.filelist };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  fileBrowserOpened,
  serverFileList,
  // ...userRoot, // other files
});

export default rootReducer;
