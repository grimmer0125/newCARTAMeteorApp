import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import '../imports/api/methods';

import { Responses } from '../imports/api/Responses';
import '../imports/api/FileBrowsers';
import '../imports/api/Images';


// const WebSocket = require('ws');
const client = require('../imports/api/ws-client');

const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// ref1: https://stackoverflow.com/questions/27769527/error-meteor-code-must-always-run-within-a-fiber
// Stripe.charges.create({
//   // ...
// }, Meteor.bindEnvironment(function (error, result) {
//   // ...
// }));
// ref2: https://forums.meteor.com/t/meteor-code-must-always-run-within-a-fiber-error/16872/2
let countResp = 0;
const insertResponse = Meteor.bindEnvironment((resp) => {
  countResp++;
  console.log('insert Response start:', countResp);
  // TODO can not only use insert, should delete first/update or even set by session id
  const responses = Responses.find().fetch();
  if (false) {
    const resID = responses[0]._id;
    console.log('insert Response by update it into db:', resID);
    Responses.update(resID, resp);
  } else {
    console.log('insert Response by insert it into db');

    const docId = Responses.insert(resp);
    console.log('insert is finished:', docId);
  }

  // createdAt: new Date(),
  // owner: Meteor.userId(),
  // username: Meteor.user().username,
});

// TODO the sequence is wired. (1st version is remove + insert). remove seems like generator
// 2nd wired things: Also FileBrowser's Tracker.autorun may receive two times call (count2+count1)
//  or just 1 time (3 count),
// which means it may merge multiple operatoins)
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

function handleNodeServerMessage(data) {
  console.log('get message from WebSocket Server:', data.length);

  let dataJSON;
  try {
    dataJSON = JSON.parse(data);
    console.log('the response from cpp -> js is json');
    insertResponse(dataJSON);
  } catch (e) {
    console.log('the response from cpp -> js is not a json, invalid:', data);
  }
}

Meteor.startup(() => {
  client.createSocket();
  client.registerReceiveHandler(handleNodeServerMessage);
});

Meteor.methods({

  queryFileList() {
    if (Meteor.isServer) {
      console.log('query in server');

      console.log('session:', this.connection.id);
      // send to cpp server
      client.sendData(REQUEST_FILE_LIST);

      return 'dummy';
    }
    console.log('query in client, session:', Meteor.connection._lastSessionId);
    return 'dummy';
  },

  selectFileToOpen(fileName) {
    if (Meteor.isServer) {
      client.sendData(`SELECT_FILE_TO_OPEN;${fileName};`);

      console.log('select a file to open:', fileName); // { name: 'aJ2.fits', type: 'fits' }
    }
  },

});
