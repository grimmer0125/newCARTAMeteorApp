import { Actions } from './actions';

const RegionDB = (state = { x: 0, y: 0, width: 0, height: 0, mouseIsDown: 0, regionArray: [] }, action) => {
  switch (action.type) {
    case Actions.REGION_CHANGE: {
      console.log('region action:', action);
      return action.payload.data;
    }
    default:
      return state;
  }
};

const regionReducer = {
  RegionDB,
};

export default regionReducer;
