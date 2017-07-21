import { Meteor } from 'meteor/meteor';
// import '../imports/api/tasks.js';
import '../imports/api/methods.js';

import { Responses } from '../imports/api/Responses.js';
import '../imports/api/FileBrowsers.js';
import '../imports/api/Images.js';

import { Mongo } from 'meteor/mongo';

// const WebSocket = require('ws');
const client = require('../imports/api/ws-client.js');

let ws;

const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';
// https://stackoverflow.com/questions/27769527/error-meteor-code-must-always-run-within-a-fiber
// Stripe.charges.create({
//   // ...
// }, Meteor.bindEnvironment(function (error, result) {
//   // ...
// }));

// https://forums.meteor.com/t/meteor-code-must-always-run-within-a-fiber-error/16872/2
const insertResponse = Meteor.bindEnvironment((resp) => {
  console.log('insert Response start');
  // TODO can not only use insert, should delete first/update or even set by session id
  const responses = Responses.find().fetch();
  if (responses.length > 0) {
    const res_id = responses[0]._id;
    console.log('insert Response update:', res_id);
    // Responses.remove({});
    Responses.update(res_id, resp);
  } else {
    console.log('insert Response insert');

    const _id = Responses.insert(resp);
    console.log('insert is finished:', _id);
  }


  // createdAt: new Date(),
  // owner: Meteor.userId(),
  // username: Meteor.user().username,
});

// TODO the sequence is wired.
// 2nd wired things: Also FileBrowser's Tracker.autorun may receive two times call (count2+count1) or just 1 time (3 count). .remove seems like generator
// I20170719-10:30:18.531(8)? get data !!!!
// I20170719-10:30:18.534(8)? get message from WebSocket Server:
// I20170719-10:30:18.536(8)? the response from cpp -> js is json
//
// I20170719-10:30:18.536(8)? get data !!!!
// I20170719-10:30:18.537(8)? get message from WebSocket Server:
// I20170719-10:30:18.537(8)? the response from cpp -> js is json
//
// I20170719-10:30:18.538(8)? insert Response remove
// I20170719-10:30:18.539(8)? insert Response remove
// I20170719-10:30:18.539(8)? insert Response insert
// I20170719-10:30:18.541(8)? insert Response insert


const handleNodeServerMessage = function (data) {
  console.log('get message from WebSocket Server:');
  // console.log(data);

  let dataJSON;
  try {
    dataJSON = JSON.parse(data);
    console.log('the response from cpp -> js is json');
    insertResponse(dataJSON);
  } catch (e) {
    console.log('the response from cpp -> js is not a json, invalid:', data);
  }

  // {
  //   cmd:// XXX:
  //   payload:{
  //
  //   }
  // }
};


Meteor.startup(() => {
  client.createSocket();
  client.registerReceiveHandler(handleNodeServerMessage);

  // code to run on server at startup
  // const address = 'ws:' + '//localhost' + ':3003';
  // try {
  //   ws = new WebSocket(address);
  //
  //   console.log('meteor server, is server');
  //   ws.on('open', () => {
  //     ws.send('connected to WebSocket Server');
  //   });
  //
  //   ws.on('error', () => {
  //     console.log('npm ws error');
  //   });

  // ws.on('message', (data) => {
  //
  //
  // });
  // } catch (e) {
  //
  // } finally {
  //
  // }
});


Meteor.methods({
  // insertResponse(resp) {
  //   if (Meteor.isServer) {
  //     Responses.insert({
  //       resp,
  //       // createdAt: new Date(),
  //       // owner: Meteor.userId(),
  //       // username: Meteor.user().username,
  //     });
  //   }
  // },

  queryFileList() {
    // check(taskId, String);

    if (Meteor.isServer) {
      console.log('query in server');

      console.log('session:', this.connection.id);
      // send to cpp server
      client.sendData(REQUEST_FILE_LIST);

      return 'dummy';
    }
    console.log('query in client, session:', Meteor.connection._lastSessionId);
  },

  selectFileToOpen(fileName) {
    if (Meteor.isServer) {
      // TODO unicode file name case? 3 means opcode field = 3
      client.sendData(`SELECT_FILE_TO_OPEN;${fileName};`);

      // uWS::OpCode opCode, uWS::OpCode::TEXT
      console.log('select a file to open:', fileName); // { name: 'aJ2.fits', type: 'fits' }
    }
  },

});
