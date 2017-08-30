// import { combineReducers } from 'redux';
import { Actions } from './actions';

const image = (state = { imageURL: '' }, action) => {
  console.log('image action:', action);
  switch (action.type) {
    case Actions.RECEIVE_IMAGE_CHANGE:
      // console.log('combine:', combine);
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const imageReducer = {
  // fileBrowserUI,
  image,
};

export default imageReducer;
