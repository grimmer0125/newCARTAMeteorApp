import { Meteor } from 'meteor/meteor';
// import '../imports/api/tasks.js';

const WebSocket = require('ws');
let ws;
// if (Meteor.isServer) {
//   console.log("meteor server, is server");
//   ws.on('open', function open() {
//     ws.send('something');
//   });
//
//   ws.on('message', function incoming(data) {
//     console.log("get message from server")
//     console.log(data);
//   });
// } else {
//   console.log("meteor server, is client");
// }

Meteor.startup(() => {
  // code to run on server at startup

  var address ="ws:" + "//localhost" + ":3003";
  ws = new WebSocket(address);

  console.log("meteor server, is server");
  ws.on('open', function open() {
    ws.send('connected to WebSocket Server');
  });

  ws.on('message', function incoming(data) {
    console.log("get message from WebSocket Server:")
    console.log(data);
  });
});


Meteor.methods({
  // 'tasks.insert'(text) {
  //   check(text, String);
  //
  //   // Make sure the user is logged in before inserting a task
  //   if (! Meteor.userId()) {
  //     throw new Meteor.Error('not-authorized');
  //   }
  //
  //   Tasks.insert({
  //     text,
  //     createdAt: new Date(),
  //     owner: Meteor.userId(),
  //     username: Meteor.user().username,
  //   });
  // },
  'queryFileList'() {
    // check(taskId, String);

    if (Meteor.isServer) {
      console.log("query in server");

      //send to cpp server
      ws.send('requestFileList');

    } else {
      console.log("query in client");
    }
  },
  // 'tasks.setChecked'(taskId, setChecked) {
  //   check(taskId, String);
  //   check(setChecked, Boolean);
  //
  //   Tasks.update(taskId, { $set: { checked: setChecked } });
  // },
});
