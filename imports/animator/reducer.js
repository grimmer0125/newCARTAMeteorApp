// import { combineReducers } from 'redux';
import { ActionType } from './actions';

// const defaultData = {
//   // rootDir: '/tmp',
//   // files: [{ name: 'apple.fits', type: 'fits' }],
// }; data: {}

const AnimatorDB = (state = { animatorTypeList: [] }, action) => {
  switch (action.type) {
    case ActionType.ANIMATOR_CHANGE: {
      // console.log('animatorDB action:', action);
      return action.payload.data;
    }
    default:
      return state;
  }
};

const animatorReducer = {
  AnimatorDB,
};

export default animatorReducer;
