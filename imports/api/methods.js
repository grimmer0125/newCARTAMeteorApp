import { Meteor } from 'meteor/meteor';

Meteor.methods({

  getSessionId: function() {
    if (Meteor.isServer) {
      console.log("getSessionId server side, being called getSessionId:", this.connection.id);
      return this.connection.id;
    } else {
      //TODO becomes null !!, not same as query in client, session
      console.log("getSessionId in client:", Meteor.connection._lastSessionId);
      return Meteor.connection._lastSessionId;
    }
  },

  // 'queryFileList'() {
  //   // check(taskId, String);
  //
  //   if (Meteor.isServer) {
  //     console.log("query in server");
  //
  //     console.log("session:", this.connection.id);
  //     //send to cpp server
  //     ws.send(REQUEST_FILE_LIST);
  //
  //     return "dummy";
  //
  //   } else {
  //     console.log("query in client, session:", Meteor.connection._lastSessionId);
  //   }
  // },

});
