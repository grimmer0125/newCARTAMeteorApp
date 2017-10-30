
import { AnimatorDB } from '../api/AnimatorDB';
import api from '../api/ApiService';
import Commands from '../api/Commands';
import { mongoUpsert } from '../api/MongoHelper';

// redux part
const ANIMATOR_CHANGE = 'ANIMATOR_CHANGE';
export const ActionType = {
  ANIMATOR_CHANGE,
};

function setupAnimator() {
  return (dispatch) => {
    api.instance().setupMongoRedux(dispatch, AnimatorDB, ANIMATOR_CHANGE);

    const cmd = Commands.REGISTER_VIEWER;
    const params = 'pluginId:Animator,index:0';

    console.log('send register Animator');

    api.instance().sendCommand(cmd, params, (resp) => {
      console.log('get register animator result:', resp);
      mongoUpsert(AnimatorDB, { animatorID: resp.data }, `Resp_${cmd}`);
    });
  };
}

export function queryAnimatorTypes() {


}


const actions = {
  setupAnimator,
};

export default actions;
