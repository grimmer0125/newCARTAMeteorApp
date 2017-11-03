import { ActionType } from './actions';

const defaultState = { x: 0, y: 0, width: 0, height: 0, mouseIsDown: 0, regionArray: [] };
const RegionDB = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.REGION_CHANGE: {
      console.log('region action:', action);
      return action.payload.data;
    }
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const regionReducer = {
  RegionDB,
};

export default regionReducer;
