import { ActionType } from './actions';

const FeatureContainerDB = (state = { items: [] }, action) => {
  switch (action.type) {
    case ActionType.FEATURE_CHANGE: {
      console.log('feature action:', action);
      return action.payload.data;
    }
    default:
      return state;
  }
};

const featureReducer = {
  FeatureContainerDB,
};

export default featureReducer;
