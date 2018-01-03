import { FileBrowserDB } from '../api/FileBrowserDB';
import { ImageViewerDB } from '../api/ImageViewerDB';
import Commands from '../api/Commands';
import api from '../api/ApiService';

import { mongoUpsert } from '../api/MongoHelper';
import animator from '../animator/actions';

import imageViewer from '../imageViewer/actions';

import profiler from '../profiler/actions';

import colormap from '../colormap/actions';

const FILEBROWSER_CHANGE = 'FILEBROWSER_CHANGE';

export const ActionType = {
  FILEBROWSER_CHANGE,
};

// only for saving action history in mongo
const SELECT_FILE = 'SELECT_FILE';
// const OPEN_FILEBROWSER = 'OPEN_FILEBROWSER';


// export const fileBrowserCloseAction = createAction(FILEBROWSER_CLOSE);

// NOTE:
// Normal Redux way: a action will affect 1 or more than 1 reducers.
// (compare previous and current diff/payload)logic are there.
// Current way: logic are how to change mongodb, in AsyncActionCreator, **Action files.


// export function updateFileBrowserToMongo(Open) {
//   console.log('updateFileBrowserToMongo');
//   mongoUpsert(FileBrowserDB, { fileBrowserOpened: Open }, OPEN_FILEBROWSER);
// }

// NOTE: follow https://github.com/acdlite/flux-standard-action
// function receiveUIChange(data) {
//   return {
//     type: FILEBROWSER_CHANGE,
//     payload: {
//       data,
//     },
//   };
// }

export function setupFileBrowserDB() {
  // console.log('setup FileBrowserDB');
  // return (dispatch) => {
  api.instance().setupMongoRedux(FileBrowserDB, FILEBROWSER_CHANGE);
  // };
}

function parseFileList(resp) {
  const { cmd, data } = resp;
  const fileList = { files: data.dir, rootDir: data.name };

  mongoUpsert(FileBrowserDB, fileList, `Resp_${cmd}`);
}

function queryServerFileList(path) {
  return () => {
    // 1. send to mongodb to sync UI
    // updateFileBrowserToMongo(true);

    // QString command = "/CartaObjects/DataLoader:getData";
    // QString parameter = "path:";

    // const cmd = Commands.REQUEST_FILE_LIST;// '/CartaObjects/DataLoader:getData';
    const arg = `path:${path}`; // 'pluginId:ImageViewer,index:0';

    // 2. send command if it becomes true.
    // TODO need to send Seesion id ? Server knows client's session.
    // Do we need to check this on server side? (Seesion change case)
    api.instance().sendCommand(Commands.REQUEST_FILE_LIST, arg, (resp) => {
      parseFileList(resp);
    });
  };
}
function selectFile(index) {
  return () => {
    mongoUpsert(FileBrowserDB, { selectedFile: index }, SELECT_FILE);
  };
}
// function closeFileBrowser() {
//   return (dispatch, getState) => {
//     updateFileBrowserToMongo(false);
//   };
// }


function closeFile() {
  return (dispatch, getState) => {
    // console.log('closeFile action');
    const state = getState();
    const controllerID = state.ImageViewerDB.controllerID;
    const stack = state.ImageViewerDB.stack;
    if (stack && stack.layers) {
      const count = stack.layers.length;
      let currentLayer = null;
      // TODO 可能還要分3d, 2d的case
      // 只有2d, close, 不fake, 看resp沒異狀. 或是再用stack檢查
      // 只有3d, close
      // 2d, 3d, close 2d, 關2d
      // 2d, 3d, close 3d, 關3d
      // 2d, 3d. 關2d, 3d. 最後剩image type應該是invisible, 有空的channel. 怎辦?

      // if (count > 1) {
      for (const layer of stack.layers) {
        if (layer.selected) {
          // console.log('close this file:', layer.name);
          currentLayer = layer;
          break;
        }
      }

      // if people open A, B, C, then close C, the reamining layers become unselected
      if (!currentLayer && count > 0) {
        currentLayer = stack.layers[count - 1];
        // console.log('close this file:', currentLayer.name);
      }
      if (currentLayer) {
        // console.log('start to close file');
        const cmd = `${controllerID}:${Commands.CLOSE_IMAGE}`;
        const arg = `image:${currentLayer.id}`;

        api.instance().sendCommand(cmd, arg)
          .then((resp) => {
            console.log('close ok:', resp);
            // updateAnimator(animatorID, '');
            // empty profiler if closing first image
            return dispatch(imageViewer.updateStack());
          })
          .then((resp) => {
            console.log('animator.updateAnimator !!!:', resp);
            // update animatorType-Selections.
            // may not need to update animatorType lists
            dispatch(colormap.updateColormap());
            dispatch(animator.updateAnimator(resp));
          });
      } else {
        console.log('no stack layer to close');
      }
    }
  };
}

function _calculateFitZoomLevel(viewWidth, viewHeight, layer) {
  const zoomX = viewWidth / layer.pixelX;
  const zoomY = viewHeight / layer.pixelY;
  let zoom = 1;

  if (zoomX < 1 || zoomY < 1) {
    if (zoomX > zoomY) {
      zoom = zoomY; // aj.fits, 512x1024, slim
    } else {
      zoom = zoomX; // 502nmos.fits, 1600x1600, fat
    }
  } else { // equual or smaller than window size
    if (zoomX > zoomY) {
      zoom = zoomY; // M100_alma.fits,52x62 slim
    } else {
      zoom = zoomX; // cube_x220_z100_17MB,220x220 fat
    }
  }

  return zoom;
}

function selectFileToOpen(path) {
  mongoUpsert(ImageViewerDB, { requestingFile: true }, 'REQUESTING_FILE');
  return (dispatch, getState) => {
    const state = getState();

    const nameArray = path.split('/');
    const fileName = nameArray[nameArray.length - 1];

    // get controllerID
    const controllerID = state.ImageViewerDB.controllerID;
    const arg = `id:${controllerID},data:${path}`;
    // console.log('inject file parameter, become:', arg);

    // const animatorID = state.AnimatorDB.animatorID;
    // const animatorTypeList = [];
    api.instance().sendCommand(Commands.SELECT_FILE_TO_OPEN, arg)
      .then((resp) => {
        console.log('response is SELECT_FILE_TO_OPEN:', resp);

        // updateAnimator(animatorID, fileName);
        dispatch(profiler.getProfile());

        dispatch(colormap.updateColormap());

        return dispatch(imageViewer.updateStack());
      })
      .then((stack) => {
        // NOTE Sometimes when open A(3d), then B(2d), will only get image animatorType,
        // so when switch back to A(3d), need to query animatorType list again.
        dispatch(animator.updateAnimator(stack));

        if (stack.layers) {
          const len = stack.layers.length;
          if (len > 0) {
            const lastLayer = stack.layers[len - 1];
            if (lastLayer.name === fileName) {
              // const zoomLevel = 3;
              const viewWidth = 482;
              const viewHeight = 477;
              const zoomLevel = _calculateFitZoomLevel(viewWidth, viewHeight, lastLayer);
              // console.log('setup zoomLevel to fit panel size:', zoomLevel);
              mongoUpsert(ImageViewerDB, { zoomLevel, layerID: lastLayer.id }, 'ZOOM_RESET_PROPS');
              dispatch(imageViewer.setZoomLevel(zoomLevel, lastLayer.id));
            } else {
              console.log('something wrong');
            }
          }
        }
      });
  };
}

const actions = {
  // closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
  selectFile,
  closeFile,
};

export default actions;
