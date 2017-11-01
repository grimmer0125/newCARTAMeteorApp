import { Actions } from '../featureContainer/actions';

const ProfilerDB = (state = { data: {}, zoomPanData: {} }, action) => {
  switch (action.type) {
    case Actions.PROFILER_CHANGE: {
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
