// import { combineReducers } from 'redux';
import { Actions } from './actions';

const testFileList = {
  rootDir: '/tmp',
  files: [{ name: 'apple.fits', type: 'fits' }],
};

const fileBrowserUI = (state = { fileBrowserOpened: false, ...testFileList }, action) => {
  console.log('INSIDE REDUCER');

  switch (action.type) {
    case Actions.FILEBROWSER_CHANGE: {
      console.log('fileBrowser action:', action);
      const combine = { ...state, ...action.payload.ui };
      return combine;
    }
    default:
      return state;
  }
};

const fileReducer = {
  fileBrowserUI,
};

export default fileReducer;
