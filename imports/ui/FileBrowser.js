import React, { Component, PropTypes } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import { List, ListItem, makeSelectable } from 'material-ui/List';
import Paper from 'material-ui/Paper';

import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentSend from 'material-ui/svg-icons/content/send';

// import folder from 'material-ui/svg-icons/file/folder';
// import attachment from 'material-ui/svg-icons/file/attachment';

import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import '../api/methods.js';
import { Responses } from '../api/responses.js';

const browserStyle = {
  width: 600,
  margin: 20,
  // textAlign: 'center',
  // display: 'inline-block',
};

const buttonStyle = {
  margin: 12,
};


let SelectableList = makeSelectable(List);

export default class FileBrowser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      files: [],
      browserOpened: false,
      // selectedFile: "",
      selectedIndex: -1,
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
      });
    });
  }

  openBrowser = () => {
    console.log("open file browser")
    if (!this.state.browserOpened) {
      Meteor.call('queryFileList', (error, result) => {
        console.log("get open file browser result:", result);
      });
      this.setState({browserOpened: true});
    }
  }

  closeBrowser = () => {
    console.log("close file browser")
    if (this.state.browserOpened) {
      this.setState({browserOpened: false});
      // this.setState({selectedFile: ""});
      this.setState({selectedIndex: -1});
    }
  }

  selectImage = (e, index) => {

    // this.state.selectedIndex = index;
    // const file = this.state.files[index];
    // console.log("choolse file to open, index:", index, ";name:", file.name);
    //
    // // this.setState({selectedFile: file.name});
    this.setState({selectedIndex: index});


    // Meteor.call('selectFileToOpen', file.name, (error, result) => {
    //   console.log("get select file result:", result);
    // });
  }

  readImage = () => {
    if (this.state.selectedIndex>=0) {
      const file = this.state.files[this.state.selectedIndex];
      console.log("choolse file to read, index:", this.state.selectedIndex, ";name:", file.name);

      // this.setState({selectedFile: file.name});
      Meteor.call('selectFileToOpen', file.name, (error, result) => {
        console.log("get select file result:", result);
      });

      this.setState({browserOpened: false});
    }
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
      <Paper style={browserStyle} zDepth={1} >
        <p>File Browser, open file browser, then choose a file to read</p>
        <RaisedButton style={buttonStyle} onTouchTap={this.openBrowser} label="Open Server's File Browser" primary />
        <RaisedButton style={buttonStyle} onTouchTap={this.closeBrowser} label="Close File Browser" secondary={true} />
        { this.state.browserOpened && fileItems && fileItems.length > 0 &&
          <div>
            <SelectableList style={{ maxHeight: 300, overflow: 'auto' }} onChange={this.selectImage} value={this.state.selectedIndex}>
              {fileItems}
            </SelectableList>
            <RaisedButton style={buttonStyle} onTouchTap={this.readImage} label="Read" secondary={true} />
          </div>
        }
      </Paper>
    );
  }
}
