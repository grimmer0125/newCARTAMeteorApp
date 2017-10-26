import { Meteor } from 'meteor/meteor';
import SessionManager from '../api/SessionManager';

let instance = null;

import { parseImageToMongo } from '../imageViewer/actions';


export default class ApiService {
  constructor() {
    this.time = new Date();
    this.callbacks = [];

    return instance;
  }

  static instance() {
    if (!instance) {
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
    Meteor.call('sendCommand', cmd, params, SessionManager.getSuitableSession(), (error, result) => {
      if (error) {
        console.log('get meteor command response err:', error);
      }

      console.log('send a command to meteor server ok:', result);
    });

    const id = cmd + params;

    if (handler) {
      console.log('send command with handler');
      this.callbacks.push({ id, callback: handler });
    } else {
      console.log('send command without handler');
      this.callbacks.push({ id, callback: null });
    }
  }

  consumeResponse(resp) {
    if (resp.pushedImage) {
      console.log('get server pushed image):');
      console.log(resp);
      parseImageToMongo(resp.buffer);

      return;
    }

    const target = resp.cmd + resp.parameter;
    let callback = null;
    console.log('target:', target);

    const len = this.callbacks.length;
    for (let i = 0; i < len; i++) {
      const obj = this.callbacks[i];
      if (obj.id === target) {
        console.log('bingo');
        callback = obj.callback;
        // this.callbacks.shift();
        this.callbacks.splice(i, 1);

        break;
      }
    }

    console.log('callback count:', this.callbacks.length);

    if (callback) {
      console.log('callback:', target);
      callback(resp);
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
