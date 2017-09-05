import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
// import FlatButton from 'material-ui/FlatButton';

import { List, ListItem, makeSelectable } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';

import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentSend from 'material-ui/svg-icons/content/send';

// import folder from 'material-ui/svg-icons/file/folder';
// import attachment from 'material-ui/svg-icons/file/attachment';

// import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';
import { connect } from 'react-redux';

// import '../api/methods';
// import { Responses } from '../api/Responses';

// const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
// const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

import actions from './actions';

const browserStyle = {
  width: 800,
  margin: 20,
  // textAlign: 'center',
  // display: 'inline-block',
};

const buttonStyle = {
  margin: 12,
};


const SelectableList = makeSelectable(List);

class FileBrowser extends Component {
  constructor(props) {
    super(props);

    // TODO add selectedIndex to mongoDB
    this.state = {
      // ...this.state,
      // files: [],
      // rootDir: '',
      // browserOpened: false,
      // selectedFile: "",
      selectedIndex: -1,

      // imageURL: '',
    };

    this.props.dispatch(actions.prepareFileBrowser());
  }

  closeBrowser = () => {
    console.log('close file browser');
    // if (this.state.browserOpened) {
    //   this.setState({ browserOpened: false });
    //   // this.setState({selectedFile: ""});
    //   this.setState({ selectedIndex: -1 });
    // }

    this.props.dispatch(actions.closeFileBrowser());
  }
  openBrowser = () => {
    console.log('open file browser');

    if (!this.props.browserOpened) {
      this.props.dispatch(actions.queryServerFileList());
    }

    // if (!this.state.browserOpened) {
    //   Meteor.call('queryFileList', (error, result) => {
    //     console.log('get open file browser result:', result);
    //   });
    //   this.setState({ browserOpened: true });
    // }
  }
  selectImage = (e, index) => {
    // this.state.selectedIndex = index;
    // const file = this.state.files[index];
    // console.log("choolse file to open, index:", index, ";name:", file.name);
    //
    // // this.setState({selectedFile: file.name});
    this.setState({ selectedIndex: index });
    console.log('SELECTED INDEX: ', index);
    this.props.dispatch(actions.selectFile(index));
    // Meteor.call('selectFileToOpen', file.name, (error, result) => {
    //   console.log("get select file result:", result);
    // });
  }

  readImage = () => {
    if (this.state.selectedIndex >= 0) {
      const file = this.props.files[this.state.selectedIndex];
      console.log('choolse file to read, index:', this.state.selectedIndex, ';name:', file.name);

      // this.setState({selectedFile: file.name});
      // Meteor.call('selectFileToOpen', `${this.props.rootDir}/${file.name}`, (error, result) => {
      //   console.log('get select file result:', result);
      // });
      this.props.dispatch(actions.selectFileToOpen(`${this.props.rootDir}/${file.name}`));

      // this.setState({ browserOpened: false });
      this.props.dispatch(actions.closeFileBrowser());
    }
  }

  render() {
    const fitsURL = 'https://raw.githubusercontent.com/CARTAvis/carta/develop/carta/html5/common/skel/source/resource/skel/file_icons/fits.png';
    const casaURL = 'https://raw.githubusercontent.com/CARTAvis/carta/develop/carta/html5/common/skel/source/resource/skel/file_icons/casa.png';
    const { browserOpened, files, selectedFile } = this.props;
    const fileItems = files.map((file, index) => {
      if (file.type === 'fits') {
        return (
          // key is needed for ui array operation react, value is for selectableList of material-ui
          <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src={fitsURL} />} />
        );
      }
      return (
        <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src={casaURL} />} />
      );
    });
    if (this.props.openBrowser) {
      this.openBrowser();
      console.log('OPENBROWSER TRUE');
    }
    return (
      // <Paper style={browserStyle} zDepth={1} >
      <div>
        {/* <p>File Browser, open file browser, then choose a file to read</p> */}
        {/* <RaisedButton style={buttonStyle} onTouchTap={this.openBrowser} label="Open Server's File Browser" primary />
        <RaisedButton style={buttonStyle} onTouchTap={this.closeBrowser} label="Close File Browser" secondary /> */}
        { browserOpened && fileItems && fileItems.length > 0 &&
          <div>
            <SelectableList style={{ maxHeight: 300, overflow: 'auto' }} onChange={this.selectImage} value={selectedFile}>
              {fileItems}
            </SelectableList>
            <RaisedButton style={buttonStyle} onTouchTap={this.readImage} label="Read" secondary />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  // imageURL: state.image.imageURL,
  files: state.fileBrowserUI.files,
  rootDir: state.fileBrowserUI.rootDir,
  browserOpened: state.fileBrowserUI.fileBrowserOpened,
  selectedFile: state.fileBrowserUI.selectedFile,
});

// TODO
// export function mapDispatchToProps(dispatch) {
//   return bindActionCreators({
//     prepareFileBrowser: actions.prepareFileBrowser,
// }, dispatch);
// }

export default connect(mapStateToProps)(FileBrowser);
