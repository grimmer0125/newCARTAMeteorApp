import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';

// import '../imports/api/methods';

import { Responses } from '../imports/api/Responses';
import '../imports/api/FileBrowsers';
import '../imports/api/Images';

import ChannelClient from '../imports/api/ChannelClient';
import Commands from '../imports/api/Commands';

// const WebSocket = require('ws');
// const client = require('../imports/api/ws-client');


// const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
// const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// ref1: https://stackoverflow.com/questions/27769527/error-meteor-code-must-always-run-within-a-fiber
// Stripe.charges.create({
//   // ...
// }, Meteor.bindEnvironment(function (error, result) {
//   // ...
// }));
// ref2: https://forums.meteor.com/t/meteor-code-must-always-run-within-a-fiber-error/16872/2
// let countResp = 0;
const insertResponse = Meteor.bindEnvironment((resp) => {
  // countResp++;
  // console.log('insert Response start:', countResp); //happen eslint error

  // TODO can not only use insert, should delete first/update or even set by session id
  // if (false) {
  //   const responses = Responses.find().fetch();
  //   const resID = responses[0]._id;
  //   console.log('insert Response by update it into db:', resID);
  //   Responses.update(resID, resp);
  // } else {
  console.log('insert Response by insert it into db');

  const docId = Responses.insert(resp);
  console.log('insert is finished:', docId);
  // }

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

let controllerID = null;

function handleCalculationServerImage(viewName, buffer) {
  console.log('get image from WebSocket Server, len:', buffer.length);
  insertResponse({ cmd: Commands.SELECT_FILE_TO_OPEN, buffer });
}

function handleCalculationServerMessage(cmd, result) {
  console.log('get message from WebSocket Server, len:', result.length);
  console.log('cmd resp:', cmd, ';result:', result);

  let data;
  try {
    data = JSON.parse(result);
    console.log('the response from cpp -> js is json');
    insertResponse({ cmd, data });
  } catch (e) {
    console.log('the response from cpp -> js is not a json');
    if (cmd == '/CartaObjects/ViewManager:registerView') {
      console.log('grimmer got it');
      controllerID = result;

      const viewName = `${controllerID}/view`;
      const width = 637; // TODO same as the experimental setting in ImageViewer, change later
      const height = 677;

      client.setupImageViewerSize(viewName, width, height);
      // Try setup view's size
      // if (false) QtConnector.jsUpdateViewSlot(this.m_viewName,
      //   this.m_container.offsetWidth, this.m_container.offsetHeight);

      // query file list x
      // select file, c14
      // get stack info, update view size, c14
      // get image1 (black, due to update size ), c14
      // reset zoom level, c14, -> TODO Not done
      // get image  (real), c14
    }
  }
}

let client = null;
Meteor.startup(() => {
  client = new ChannelClient();// require('../imports/api/ws-client');
  client.registerReceiveHandler(handleCalculationServerMessage);
  client.registerImageHandler(handleCalculationServerImage);

  client.createConnection();
});

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

  sendCommand(cmd, params) {
    if (Meteor.isServer) {
      console.log('forwared commands from clients:', cmd, ';params:', params);
      console.log('session:', this.connection.id);

      if (cmd == Commands.SELECT_FILE_TO_OPEN) {
        // QString parameter = "id:/CartaObjects/c14,data:" + fileName;
        const parameter = `id:${controllerID},data:${params}`;
        console.log('inject file parameter, become:', parameter);
        client.sendCommand(cmd, parameter);
        return '';
      }
      // return this.connection.id;
      client.sendCommand(cmd, params);
      return '';
    }

    console.log('sendCommand in client');
    return '';
  },
  // queryFileList() {
  //   if (Meteor.isServer) {
  //     console.log('query in server');
  //
  //     console.log('session:', this.connection.id);
  //     // send to cpp server
  //     // client.sendData(REQUEST_FILE_LIST);
  //
  //     return 'dummy';
  //   }
  //   console.log('query in client, session:', Meteor.connection._lastSessionId);
  //   return 'dummy';
  // },

  // selectFileToOpen(fileName) {
  //   if (Meteor.isServer) {
  //     // client.sendData(`SELECT_FILE_TO_OPEN;${fileName};`);
  //
  //     console.log('select a file to open:', fileName); // { name: 'aJ2.fits', type: 'fits' }
  //   }
  // },

});
