// import { combineReducers } from 'redux';
import { Actions } from './actions';

const sessionID = (state = 'def', action) => {
  switch (action.type) {
    case Actions.GET_SESSIONID:
      return action.payload;
    default:
      return state;
  }
};

const sessionReducer = {
  sessionID,
};

export default sessionReducer;
