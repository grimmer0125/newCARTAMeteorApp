import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { Responses } from '../api/Responses';

// NOTE please add here for any new component
import { setupFileBrowserDB } from '../fileBrowser/actions';
import { setupImageViewerDB } from '../imageViewer/actions';
import { setupHistogramDB } from '../histogram/actions';
import { setupFeatureContainerDB } from '../featureContainer/actions';
import { setupProfilerDB } from '../profiler/actions';
import { setupRegionDB } from '../region/actions';
import { setupAnimatorDB } from '../animator/actions';
import { setupColormapDB } from '../colormap/actions';

import { storeReduxDispatch } from '../api/MongoHelper';

import api from '../api/ApiService';

const GET_SESSIONID = 'GET_SESSIONID';

export const ActionType = {
  GET_SESSIONID,
};

function turnOnWatching(watchingSessionID) {
  return (dispatch) => {
    // console.log('RESET_REDUX_STATE !!!!!!!! start watching');
    dispatch({ type: 'RESET_REDUX_STATE' });

    // subscribe
    SessionManager.useOtherSession(watchingSessionID);
    // console.log('use other session:', SessionManager.getOtherSession());

    api.instance().subscribeOtherPeopleDB();
  };
}

function turnOffWatching() {
  return (dispatch) => {
    // console.log('RESET_REDUX_STATE !!!!!!!! stop watching');
    dispatch({ type: 'RESET_REDUX_STATE' });

    SessionManager.stopUsingOtherSession();

    api.instance().unscribeOtherPeopleDB();

    api.instance().resumeselfDB(); // may let redux change twice, 1st: reset_redux_state
  };
}

function handleCommandResponse(resp) {
  // console.log('get response:');

  api.instance().consumeResponse(resp);
}

// NOTE please add here for any new component
function setupComponentsDB() {
  setupFileBrowserDB();
  setupImageViewerDB();
  setupHistogramDB();
  setupFeatureContainerDB();
  setupProfilerDB();
  setupRegionDB();
  setupAnimatorDB();
  setupColormapDB();
}

function setupResponseChannnelAndAllDB() {
  return (dispatch) => {
    // console.log('setupResponseChannnelAndAllDB, reset session to null');
    SessionManager.set(null);
    storeReduxDispatch(dispatch);

    // setup other DB here
    setupComponentsDB();

    Meteor.call('getSessionId', (err, sessionID) => {
      // console.log('getSessionId return:', sessionID);

      SessionManager.set(sessionID);
      dispatch({
        type: GET_SESSIONID,
        payload: sessionID,
      });

      Meteor.subscribe('commandResponse', SessionManager.get(), () => {
        // console.log('commandResponse subscribes OK !!!');
      });

      api.instance().subscribeAllDB();

      // const respObservationHandle =
      Responses.find().observe({
        added(newDoc) {
          handleCommandResponse(newDoc);

          // delete responses
          process.nextTick(() => {
            Responses.remove(newDoc._id);
          });
        },

        changed(newDoc) {
          handleCommandResponse(newDoc);

          process.nextTick(() => {
            Responses.remove(newDoc._id);
          });
        },
      });
    });
  };
}

const actions = {
  setupResponseChannnelAndAllDB,
  turnOnWatching,
  turnOffWatching,
};

export default actions;
