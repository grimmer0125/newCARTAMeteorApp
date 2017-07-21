import { combineReducers } from 'redux';
import { Actions } from '../actions/fileAction';

// TODO use only big reducer or multiple reducer?

// fileBrowserUIOpened

const testFileList = {
  rootDir: '/tmp',
  files: [{ name: 'apple.fits', type: 'fits' }],
};

// const fileBrowserOpened = false;

const fileBrowserUI = (state = { fileBrowserOpened: false, ...testFileList }, action) => {
  console.log('fileBrowser action:', action);
  switch (action.type) {
    case Actions.RECEIVE_UI_CHANGE:
      const combine = { ...state, ...action.payload.ui };
      // console.log('combine:', combine);
      return combine;
    default:
      return state;
  }
};

const image = (state = { imageURL: '' }, action) => {
  console.log('image action:', action);
  switch (action.type) {
    case Actions.RECEIVE_IMAGE_CHANGE:
      // console.log('combine:', combine);
      return action.payload.imageData;
    default:
      return state;
  }
};


// action.payload.ui.files;
// action.payload.ui.rootDir;

// const serverFileList = (state = testFileList, action) => {
//   console.log('server file list', action);
//   switch (action.type) {
//     case Actions.RECEIVE_UI_CHANGE:
//       return { ...action.payload.ui };
//     default:
//       return state;
//   }
// };

const rootReducer = combineReducers({
  fileBrowserUI,
  image,
  // fileBrowserOpened,
  // serverFileList,
  // ...userRoot, // other files
});

export default rootReducer;
