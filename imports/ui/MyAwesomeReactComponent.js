import React, { Component, PropTypes } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import { List, ListItem, makeSelectable } from 'material-ui/List';

import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ContentSend from 'material-ui/svg-icons/content/send';

import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import '../api/methods.js';
import { Responses } from '../api/responses.js';

// const style = {
//   height: 100,
//   width: 100,
//   margin: 20,
//   textAlign: 'center',
//   // display: 'inline-block',
// };

let SelectableList = makeSelectable(List);

export default class MyAwesomeReactComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      files: [],
      browserOpened: false,
    };

    const self = this;

    // TODO may feature out how to get the info in client.jsx
    // console.log("default session:", simpleStringify(Meteor.connection)); in client.jsx
    // http://www.danielsvane.dk/blog/getting-session-id-in-meteor-on-startup
    Meteor.call('getSessionId', (err, session_id) => {
      console.log('getSessionId return:', session_id);

      // TODO check more, only get the data for this sub-parameter?
      // another approach is, subscribe name is just session value, e.g. "fdasfasf"
      // subscribe special Collection,
      Meteor.subscribe('commandResponse', session_id); // changed???

      // function parseFile(res) {
      //   this.setState({ files: res.dir });
      // }

      Tracker.autorun(() => {
        const responses = Responses.find().fetch();
        console.log('get responses count:', responses.length, ';content:', responses);

        if (responses.length > 0) {
          const res = responses[0].resp;
          self.setState({ files: res.dir });
        }

        console.log(self.state.browserOpened);
      });
    });
  }

  onBrowserClick = () => {
    console.log("open/close file browser")

    Meteor.call('queryFileList', (error, result) => {
      console.log("get open file browser result:", result);
    });

    if (!this.state.browserOpened) {
      this.setState({browserOpened: true});
    } else {
      this.setState({browserOpened: false});
    }
  }

  chooseImage = (e, index) => {
    const file = this.state.files[index];
    console.log("choolse file to open, index:", index, ";name:", file.name);

    Meteor.call('selectFileToOpen', fileName, (error, result) => {
      console.log("get select file result:", result);
    });
  }

  render() {
    const fileItems = this.state.files.map((file, index) => {
      if (file.type === 'fits') {
        return (
          // key is needed for ui array operation react, value is for selectableList of material-ui
          <ListItem style={{ fontSize: '14px', height: 40 }} value={index}  key={index} primaryText={file.name} leftIcon={<ContentSend />} />

        );
      }

      return (
        <ListItem style={{ fontSize: '14px', height: 40 }}  value={index} key={index} primaryText={file.name} leftIcon={<ContentInbox />} />
      );
    });

    return (
      <div >
        <p>Test Font</p>
        <RaisedButton onTouchTap={this.onBrowserClick} label="Query File list" primary />
        <FlatButton onTouchTap={this.chooseImage} label="Test Secondary/accent color" secondary />
        { fileItems && fileItems.length > 0 &&
          <SelectableList onChange={this.chooseImage}>
            {fileItems}
          </SelectableList>
        }
      </div>
    );
  }
}
