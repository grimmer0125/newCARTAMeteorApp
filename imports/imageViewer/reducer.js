import { ActionType } from './actions';

const defaultState = { imageURL: '' };
const ImageController = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.IMAGEVIEWER_CHANGE:
      console.log('INSIDE imageController REDUCER');
      return action.payload.data;
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const imageReducer = {
  ImageController,
};

export default imageReducer;
