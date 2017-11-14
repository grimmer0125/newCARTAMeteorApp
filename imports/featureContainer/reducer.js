import { ActionType } from './actions';

const defaultState = { items: [] };

const FeatureContainerDB = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.FEATURE_CHANGE: {
      // console.log('feature action:', action);
      return action.payload.data;
    }
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const featureReducer = {
  FeatureContainerDB,
};

export default featureReducer;
