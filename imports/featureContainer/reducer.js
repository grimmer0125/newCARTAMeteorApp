import { Actions } from './actions';

const FeatureContainerDB = (state = { items: [] }, action) => {
  switch (action.type) {
    case Actions.FEATURE_CHANGE: {
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
