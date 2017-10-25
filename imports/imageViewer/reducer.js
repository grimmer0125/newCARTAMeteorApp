import { Actions } from './actions';

const ImageController = (state = { imageURL: '' }, action) => {
  switch (action.type) {
    case Actions.IMAGEVIEWER_CHANGE:
      console.log('INSIDE imageController REDUCER');
      return action.payload.data;
    default:
      return state;
  }
};

const imageReducer = {
  ImageController,
};

export default imageReducer;
