// import { combineReducers } from 'redux';
import { ActionType } from './actions';

const defaultState = {
  fileBrowserOpened: false,
  rootDir: '/tmp',
  files: [{ name: 'apple.fits', type: 'fits' }],
};
const FileBrowserDB = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.FILEBROWSER_CHANGE: {
      // console.log('fileBrowser action:', action);
      return action.payload.data;
    }
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const fileReducer = {
  FileBrowserDB,
};

export default fileReducer;
