import { Session } from 'meteor/session';

const get = () => Session.get('sessionID');
const set = sessionID => Session.set('sessionID', sessionID);

const SessionManager = {
  get,
  set,
};

export default SessionManager;
