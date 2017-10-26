import { Meteor } from 'meteor/meteor';
import SessionManager from '../api/SessionManager';

let instance = null;

import { parseImageToMongo } from '../imageViewer/actions';


export default class ApiService {
  constructor() {
    this.time = new Date();
    this.callbacks = [];

    const p1 = new Promise(

      (resolve, reject) => {
        console.log('try to resolve'); // will show first , then aaa
        resolve(100);
      }
    );

    console.log('in ApiService');
    // We define what to do when the promise is resolved/fulfilled with the then() call,
    // and the catch() method defines what to do if the promise is rejected.
    p1.then((s) => {
      console.log('p1 then result:', s);
    });

    console.log('bbb');

    return instance;
  }

  static instance() {
    if (!instance) {
      console.log("new ApiService");
      instance = new ApiService();
    }

    return instance;
  }

  setupViewSize(viewName, width, height) {
    Meteor.call('setupViewSize', viewName, width, height, (error, result) => {
      console.log('get setupViewSize dummy result:', result);
    });
  }

  sendCommand(cmd, params, handler = null) {


    const id = cmd + params;

    // return a promise
    const self = this;
    // resolver,
    const p1 = new Promise(
      ((resolve, reject) => {
      // this.sendTestRequest(resolve);
        // self.callback = resolve;

        if (handler) {
          console.log('send command with handler');
          self.callbacks.push({ id, callback: handler, resolve });
        } else {
          console.log('send command without handler');
          self.callbacks.push({ id, callback: null, resolve });
        }

        // save this resolve, then call it when we get the command's response.
        // do something, e.g. self.socket.emit broadcast messages
      }));

    Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
      if (error) {
        console.log('get meteor command response err:', error);
      }

      console.log('send a command to meteor server ok:', result);
    });

    return p1;
  }

  consumeResponse(resp) {
    if (resp.pushedImage) {
      console.log('get server pushed image):');
      console.log(resp);
      parseImageToMongo(resp.buffer);

      return;
    }

    const target = resp.cmd + resp.parameter;
    let match = null;
    console.log('target:', target);

    const len = this.callbacks.length;
    for (let i = 0; i < len; i++) {
      const obj = this.callbacks[i];
      if (obj.id === target) {
        console.log('bingo');
        match = obj;
        // this.callbacks.shift();
        this.callbacks.splice(i, 1);

        break;
      }
    }

    console.log('callback count:', this.callbacks.length);

    if (match) {
      console.log('callback:', match.id);
      if(match.callback) {
        match.callback(resp);
      }

      if(match.resolve) {
        match.resolve(resp);
      }
    }
  }

  // get type() {
  //   return this._type;
  // }
  //
  // set type(value) {
  //   this._type = value;
  // }
}
