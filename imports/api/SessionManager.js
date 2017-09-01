import { Session } from 'meteor/session';

const get = () => Session.get('selfSessionID');
const set = sessionID => Session.set('selfSessionID', sessionID);

const useOtherSession = (sessionID) => {
  console.log('useOtherSession:', sessionID);
  Session.set('otherSessionID', sessionID);
};

const getOtherSession = () => Session.get('otherSessionID');

const stopUsingOtherSession = () => {
  console.log('stop usingg session');
  Session.set('otherSessionID', null);
};

const SessionManager = {
  get,
  set,
  getOtherSession,
  useOtherSession,
  stopUsingOtherSession,
};

export default SessionManager;
