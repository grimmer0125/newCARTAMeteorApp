<<<<<<< HEAD
import { Actions } from '../featureContainer/actions';
=======
import { ActionType } from './actions';
>>>>>>> 24bde4064226ceb53ebb2502e53527133384fad4

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
