// port from https://github.com/CARTAvis/carta/blob/useQtWebEngine/carta/html5/desktop/desktopConnector.js
const QWebChannel = require('./qwebchannel').QWebChannel;

// const client = require('../imports/api/ws-client');

const WebSocket = require('ws');

const wsUri = 'ws://localhost:4317';

export default class ChannelClient {
  constructor() {
    this.socket = null;
    this.QConnector = null;
  }

  registerReceiveHandler(handler) {
    this.receiveHandler = handler;
  }

  registerImageHandler(handler) {
    this.imageHandler = handler;
  }

  createConnection() {
    this.socket = new WebSocket(wsUri);

    this.socket.onclose = () => {
      console.error('web channel closed');
    };
    this.socket.onerror = (error) => {
      console.error(`web channel error: ${error}`);
    };

    this.socket.onopen = () => {
      console.log('websocket onopen');
      const xx = new QWebChannel(this.socket, (channel) => {
        this.QConnector = channel.objects.QConnector;


        // start to setup the connection to cpp side.
        // connector.connect();
        // QtConnector.stateChangedSignal.connect
        // // listen for changes to the state
        this.QConnector.stateChangedSignal.connect((key, val) => {
          try {
            // TODO we will not use this channle for new CARTA. hard to maintain.
            // console.log('grimmer state changed:', key, ';val:', val);
            // const st = getOrCreateState(key);
            // // save the value
            // st.value = val;
            // // now go through all callbacks and call them
            // st.callbacks.callEveryone(st.value);
          } catch (error) {
            console.error('Caught error in state callback ', error);
            console.trace();
          }
        });

        // listen for command results callbacks and always invoke the top callback
        // in the list
        // the command results always arrive in the same order they were sent
        this.QConnector.jsCommandResultsSignal.connect((cmd, result) => {
          try {
            if (this.receiveHandler) {
              this.receiveHandler(cmd, result);
            }
            // if (m_commandCallbacks.length < 1) {
            //   console.warn('Received command results but no callbacks for this!!!');
            //   console.warn('The result: ', result);
            //   return;
            // }
            // const cb = m_commandCallbacks.shift();
            // if (cb == null) {
            //   return;
            // }
            // if (typeof cb !== 'function') {
            //   console.warn('Registered callback for command is not a function!');
            //   return;
            // }
            // cb(result);
          } catch (error) {
            console.error('Caught error in command callback ', error);
            console.trace();
          }
        });

        // listen for jsViewUpdatedSignal to render the image
        this.QConnector.jsViewUpdatedSignal.connect((viewName, buffer, refreshId) => {
          try {
            if (this.imageHandler) {
              this.imageHandler(viewName, buffer);
            }
            // const view = m_views[viewName];
            // if (view == null) {
            //   console.warn(`Ignoring update for unconnected view '${viewName}'`);
            //   return;
            // }
            // if (buffer != null) {
            //   // buffer.assignToHTMLImageElement(view.m_imgTag);
            //   const dataURL = `data:image/jpeg;base64,${buffer}`;
            //   view.m_imgTag.setAttribute('src', dataURL);
            //   QtConnector.jsViewRefreshedSlot(view.getName(), refreshId);
            //   view._callViewCallbacks();
            // }
          } catch (error) {
            console.error(`Caught error in view updated callback ${viewName}`, error);
            console.trace();
          }
        });

        this.createNewSession('0');
      });

      console.log('websocket onopen done');
    };
  }

  createNewSession(session) {
    // TODO use session later
    this.QConnector.jsConnectorReadySlot();
  }

  sendCommand(cmd, params) {
    this.QConnector.jsSendCommandSlot(cmd, params);
    // QtConnector.jsUpdateViewSlot(this.m_viewName, th
  }

  setupImageViewerSize(viewName, width, height) {
    this.QConnector.jsUpdateViewSlot(viewName, width, height);
  }
}

// const socket = new WebSocket(wsUri);
// let QConnector = null;


// QtConnector.jsSendCommandSlot(cmd, params);
// QtConnector.jsUpdateViewSlot(this.m_viewName, this.m_container.offsetWidth, this.m_container.offsetHeight);
