import { Actions } from './actions';

const imageController = (state = { imageURL: '' }, action) => {
  switch (action.type) {
    case Actions.IMAGEVIEWER_CHANGE:
      console.log('INSIDE imageController REDUCER');
      return { ...state, ...action.payload.imageData };
    default:
      return state;
  }
};

const imageReducer = {
  imageController,
};

export default imageReducer;
