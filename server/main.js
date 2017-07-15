import { Meteor } from 'meteor/meteor';
// import '../imports/api/tasks.js';
import '../imports/api/methods.js';

import { Responses } from '../imports/api/responses.js';
import { Mongo } from 'meteor/mongo';

const WebSocket = require('ws');
let ws;

const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';

// https://stackoverflow.com/questions/27769527/error-meteor-code-must-always-run-within-a-fiber
// Stripe.charges.create({
//   // ...
// }, Meteor.bindEnvironment(function (error, result) {
//   // ...
// }));

// https://forums.meteor.com/t/meteor-code-must-always-run-within-a-fiber-error/16872/2
const testInsert = Meteor.bindEnvironment(function (resp) {
  Responses.insert({
    resp,
    // createdAt: new Date(),
    // owner: Meteor.userId(),
    // username: Meteor.user().username,
  });
});

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

    let dataJSON;
    try {
      dataJSON = JSON.parse(data);
      console.log("the response from cpp -> js is json")
    } catch (e) {
      console.log("message is not a json, invalid")
      return;
    }

    if (dataJSON.cmd == REQUEST_FILE_LIST) {
      console.log("response is REQUEST_FILE_LIST:");
      console.log(dataJSON);
      //TODO use https://github.com/arunoda/meteor-streams or https://github.com/YuukanOO/streamy or mongodb?
      //insert to responses

      // Meteor.call('insertResponse', dataJSON, (error, result) => {
      //   console.log("get insert response result:", result);
      // });
      // Responses.insert({
      //   resp: dataJSON,
      //   // createdAt: new Date(),
      //   // owner: Meteor.userId(),
      //   // username: Meteor.user().username,
      // });
      testInsert(dataJSON);
    }



    // {
    //   cmd:// XXX:
    //   payload:{
    //
    //   }
    // }
  });
});


Meteor.methods({
  'insertResponse'(resp){
    if (Meteor.isServer) {
      Responses.insert({
        resp,
        // createdAt: new Date(),
        // owner: Meteor.userId(),
        // username: Meteor.user().username,
      });
    }
  },

  'queryFileList'() {
    // check(taskId, String);

    if (Meteor.isServer) {
      console.log("query in server");

      console.log("session:", this.connection.id);
      //send to cpp server
      ws.send(REQUEST_FILE_LIST);

      return "dummy";

    } else {
      console.log("query in client, session:", Meteor.connection._lastSessionId);
    }
  },
});
