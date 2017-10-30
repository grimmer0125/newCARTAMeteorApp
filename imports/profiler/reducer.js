import { ActionType } from './actions';

const ProfilerDB = (state = { data: {}, zoomPanData: {} }, action) => {
  switch (action.type) {
    case ActionType.PROFILER_CHANGE: {
      console.log('profiler action:', action);
      return action.payload.data;
    }
    default:
      return state;
  }
};

const profilerReducer = {
  ProfilerDB,
};

export default profilerReducer;
