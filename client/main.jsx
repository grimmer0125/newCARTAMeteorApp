import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { render } from 'react-dom';

import App from '../imports/app/App';

Meteor.startup(() => {
  render(<App />, document.getElementById('render-target'));
  // hardcode username and password for now
  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
      username: 'julie',
      password: '1234',
    });
  }
});
