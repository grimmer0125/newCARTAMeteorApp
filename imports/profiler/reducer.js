import { ActionType } from './actions';

const defaultState = { data: {}, zoomPanData: {} };
const ProfilerDB = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.PROFILER_CHANGE: {
      // console.log('profiler action:', action);
      return action.payload.data;
    }
    case 'RESET_REDUX_STATE':
      return defaultState;
    default:
      return state;
  }
};

const profilerReducer = {
  ProfilerDB,
};

export default profilerReducer;
