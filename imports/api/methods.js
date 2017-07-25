import { Meteor } from 'meteor/meteor';

Meteor.methods({

  getSessionId() {
    if (Meteor.isServer) {
      console.log('getSessionId server side, being called getSessionId:', this.connection.id);
      return this.connection.id;
    }
    // TODO id becomes null !!, not same as query in client, session
    console.log('getSessionId in client:', Meteor.connection._lastSessionId); // empty
    return Meteor.connection._lastSessionId;
  },
});
