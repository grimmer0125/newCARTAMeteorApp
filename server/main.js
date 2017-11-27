import { Meteor } from 'meteor/meteor';
// import '../imports/api/methods';
import { Responses } from '../imports/api/Responses';
import '../imports/api/FileBrowserDB';
import '../imports/api/ImageViewerDB';
import '../imports/api/RegionDB';
import '../imports/api/ProfilerDB';
import '../imports/api/FeatureContainerDB';
import '../imports/api/HistogramDB';
import '../imports/api/AnimatorDB';
import '../imports/api/ColormapDB';

import ChannelClient from '../imports/api/ChannelClient';
// import Commands from '../imports/api/Commands';


// ref1: https://stackoverflow.com/questions/27769527/error-meteor-code-must-always-run-within-a-fiber
// ref2: https://forums.meteor.com/t/meteor-code-must-always-run-within-a-fiber-error/16872/2
const insertResponse = Meteor.bindEnvironment((resp) => {
  console.log('insert Response by insert it into db');

  const docId = Responses.insert(resp);
  console.log('insert is finished:', docId);
});
const gm = require('gm');
const fs = require('fs');
const { exec } = require('child_process');
// const gm = require('gm').subClass({ imageMagick: true });
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


function handleCalculationServerImage(sessionID, viewName, buffer) {
  console.log('get image from WebSocket Server, len:', buffer.length);
  if (buffer.length !== 844) {
    insertResponse({ sessionID, pushedImage: true, buffer });
  } else {
    console.log('ignore histogram/profiler jpegs');
  }
}

// CARTA Commands Order:
// query file list x
// select file, c14
// get stack info, update view size, c14
// get image1 (black, due to update size ), c14
// reset zoom level, c14, -> TODO Not done
// get image  (real), c14

// sessionID, cmd, data, parameter
function handleCalculationServerMessage(sessionID, senderSession, cmd, result, parameter) {
  console.log('get message from WebSocket Server, len:', result.length);
  console.log('sessionID:', sessionID, ';senderSession:', senderSession);

  let data = null;

  try {
    data = JSON.parse(result);
    console.log('the response from cpp -> js is json:', data);
  } catch (e) {
    data = result;
    console.log('the response from cpp -> js is string:', data);
  }
  insertResponse({ sessionID: senderSession, cmd, data, parameter });
}

let client = null;
Meteor.startup(() => {
  client = new ChannelClient();
  client.registerReceiveHandler(handleCalculationServerMessage);
  client.registerImageHandler(handleCalculationServerImage);

  client.createConnection();
  // setInterval(() => {
  //   client.sendKeepAlive();
  // }, 200);`;
});
Meteor.methods({

  setupViewSize(viewName, width, height) {
    if (Meteor.isServer) {
      console.log("forwared client's setupViewSize");
      console.log('client session:', this.connection.id);

      client.setupImageViewerSize(this.connection.id, viewName, width, height);
    }
  },

  getSessionId() {
    if (Meteor.isServer) {
      console.log('getSessionId server side, being called getSessionId:', this.connection.id);

      client.createNewSession(this.connection.id);

      return this.connection.id;
    }

    // On Client side, this.connectino.id will be empty
    return '';
  },

  sendCommand(cmd, parameter, sessionID) {
    if (Meteor.isServer) {
      console.log('forwared commands from clients:', cmd, ';parameter:', parameter);
      if (sessionID) {
        console.log('use specified sessionID to forward,', sessionID);
        client.sendCommand(sessionID, this.connection.id, cmd, parameter);
      } else {
        console.log('use server known sender session to forwared:', this.connection.id);
        client.sendCommand(this.connection.id, this.connection.id, cmd, parameter);
      }
      return '';
    }

    console.log('sendCommand in client');
    return '';
  },
  convertPNGFile(url, type) {
    if (Meteor.isServer) {
      console.log('convertPNGFile');
      return new Promise(((resolve, reject) => {
        const buf = Buffer.from(url.replace(/^data:image\/(png|jpg);base64,/, ''), 'base64');
        gm(buf).toBuffer(type, (err, buffer) => {
          if (!err) {
            console.log('done');
            resolve(buffer);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }));
    }
    return '';
  },
  convertSVGFile(url, type, userID) {
    if (Meteor.isServer) {
      const buf = Buffer.from(url);
      const filepath = `chart${userID}.svg`;
      fs.writeFileSync(filepath, buf, (err) => {
        if (err) throw err;
        console.log('The file was successfully saved!');
      });
      return new Promise(((resolve, reject) => {
        exec(`cairosvg chart${userID}.svg -o chart${userID}.${type}`,
          (error, stdout, stderr) => {
            if (error) {
              console.log(error);
              reject(error);
            } else {
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
              const bitmap = fs.readFileSync(`chart${userID}.${type}`);
              const bufString = Buffer.from(bitmap).toString('base64');
              resolve(bufString);
            }
          });
      }));
    }
    return '';
  },
  removeFile(type, userID) {
    if (Meteor.isServer) {
      fs.unlink(`chart${userID}.svg`, (err) => {
        if (err) {
          console.log(`failed to delete local image: ${err}`);
        } else {
          console.log('successfully deleted local image');
        }
      });
      fs.unlink(`chart${userID}.${type}`, (err) => {
        if (err) {
          console.log(`failed to delete local image: ${err}`);
        } else {
          console.log('successfully deleted local image');
        }
      });
    }
    return '';
  },
});
