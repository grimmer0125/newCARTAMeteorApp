import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';

function simpleStringify(object) {
  const simpleObject = {};
  for (const prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof (object[prop]) === 'object') {
      continue;
    }
    if (typeof (object[prop]) === 'function') {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject); // returns cleaned up JSON
}

Meteor.startup(() => {
  console.log('default session:', Meteor.connection);
  console.log('default session:', Meteor.connection._lastSessionId);

  // console.log("default session:", simpleStringify(Meteor.connection));
  render(<App />, document.getElementById('render-target'));
});
