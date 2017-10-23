import { Session } from 'meteor/session';

const get = () => {
  const session = Session.get('selfSessionID');
  console.log('SessionManager get:', session);
  return session;
};
const set = sessionID => Session.set('selfSessionID', sessionID);

const useOtherSession = (sessionID) => {
  console.log('useOtherSession:', sessionID);
  Session.set('otherSessionID', sessionID);
};

const getOtherSession = () => Session.get('otherSessionID');

const getSuitableSession = () => {
  const otherSession = Session.get('otherSessionID');
  if (otherSession) {
    return otherSession;
  }

  console.log('SessionManager getSuitableSession:', Session.get('selfSessionID'));

  return Session.get('selfSessionID');
};

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
  getSuitableSession,
};

export default SessionManager;
