import { ActionType } from './actions';

const sessionID = (state = 'def', action) => {
  switch (action.type) {
    case ActionType.GET_SESSIONID:
      return action.payload;
    default:
      return state;
  }
};

const sessionReducer = {
  sessionID,
};

export default sessionReducer;
