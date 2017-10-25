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

import { connect } from 'react-redux';
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

    // this.state = {
    //   selectedIndex: -1,
    // };

    // this.props.dispatch(actions.prepareFileBrowser());
    console.log('grimmer filebrowser constructor');

    if (this.props.openBrowser) {
      this.props.dispatch(actions.queryServerFileList());
      console.log('OPENBROWSER, query file list ');
    }
  }

  // closeBrowser = () => {
  //   console.log('close file browser');
  //
  //   this.props.dispatch(actions.closeFileBrowser());
  // }
  // openBrowser = () => {
  //   console.log('open file browser');
  //
  //   if (!this.props.browserOpened) {
  //     this.props.dispatch(actions.queryServerFileList());
  //   }
  // }
  selectImage = (e, index) => {
    // this.setState({ selectedIndex: index });
    console.log('SELECTED INDEX: ', index);
    this.props.dispatch(actions.selectFile(index));
  }

  readImage = () => {
    if (this.props.selectedFile >= 0) {
      const file = this.props.files[this.props.selectedFile];
      console.log('choolse file to read, index:', this.props.selectedFile, ';name:', file.name);

      this.props.dispatch(actions.selectFileToOpen(`${this.props.rootDir}/${file.name}`));

      // this.props.dispatch(actions.closeFileBrowser());
    }
  }

  componentDidMount() {
    console.log('grimmer filebrowser did mount');
  }


  render() {
    const { browserOpened, files, selectedFile } = this.props;
    const fileItems = files.map((file, index) => {
      let iconSrc;
      switch (file.type) {
        case 'fits':
          iconSrc = 'fits.png';
          break;
        case 'image':
          iconSrc = 'casa.png';
          break;
        case 'miriad':
          iconSrc = 'miriad.png';
          break;
        case 'reg':
          iconSrc = 'region_ds9.png';
          break;
        case 'crtf':
          iconSrc = 'region_casa.png';
          break;
        default:
          return null;
      }

      return (
        <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src={`images/${iconSrc}`} />} />
      );
    });

    return (
      // <Paper style={browserStyle} zDepth={1} >
      <div>
        {/* <p>File Browser, open file browser, then choose a file to read</p> */}
        {/* <RaisedButton style={buttonStyle} onTouchTap={this.openBrowser} label="Open Server's File Browser" primary />
        <RaisedButton style={buttonStyle} onTouchTap={this.closeBrowser} label="Close File Browser" secondary /> */}
        { fileItems && fileItems.length > 0 &&
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
  files: state.FileBrowserDB.files,
  rootDir: state.FileBrowserDB.rootDir,
  // browserOpened: state.FileBrowserDB.fileBrowserOpened,
  selectedFile: state.FileBrowserDB.selectedFile,
});

// TODO use the below way to use simplified methods
// export function mapDispatchToProps(dispatch) {
//   return bindActionCreators({
//     prepareFileBrowser: actions.prepareFileBrowser,
// }, dispatch);
// }

export default connect(mapStateToProps)(FileBrowser);
