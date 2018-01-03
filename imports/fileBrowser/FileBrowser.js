import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
import RaisedButton from 'material-ui/RaisedButton';
// import FlatButton from 'material-ui/FlatButton';

import { List, ListItem, makeSelectable } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';

// import folder from 'material-ui/svg-icons/file/folder';
// import attachment from 'material-ui/svg-icons/file/attachment';

import { connect } from 'react-redux';
import actions from './actions';

const buttonStyle = {
  margin: 10,
};


const SelectableList = makeSelectable(List);

class FileBrowser extends Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   selectedIndex: -1,
    // };
    // this.props.dispatch(actions.setupFileBrowser());

    if (this.props.openBrowser) {
      this.props.dispatch(actions.queryServerFileList(''));
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
    this.props.dispatch(actions.selectFile(index));
  }

  closeImage = () => {
    this.props.dispatch(actions.closeFile());
  }

  readImage = () => {
    if (this.props.selectedFile >= 0) {
      const file = this.props.files[this.props.selectedFile];
      // console.log('choolse file to read, index:', this.props.selectedFile, ';name:', file.name);
      this.props.dispatch(actions.selectFileToOpen(`${this.props.rootDir}/${file.name}`));
    }
  }

  // componentDidMount() {
  //   console.log('grimmer filebrowser did mount');
  // }

  clickParentFolder = () => {
    if (this.props.rootDir === '/') {
      // ??
    } else {
      const pathList = this.props.rootDir.split('/');
      const lastLen = pathList[pathList.length - 1].length; // 6
      const parentPath = this.props.rootDir.substring(0, this.props.rootDir.length - lastLen - 1);
      if (parentPath === '') {
        this.props.dispatch(actions.queryServerFileList('/'));
      } else {
        this.props.dispatch(actions.queryServerFileList(parentPath));
      }

      // /Users/grimmer/CARTA/Images
    }
    // this.props.rootDir 去掉
  }
  clickFolder(folder) {
    const fullPath = `${this.props.rootDir}/${folder}`;
    // grimmer send command:
    // /CartaObjects/DataLoader:getData ;para: path:/Users/grimmer/CARTA/Images/carta_region_file

    // default:   'path:'
    // path: + fullPath;
    // console.log('click:', e, ';index:', index, ';value:', value);

    // grimmer send command:
    // /CartaObjects/DataLoader:getData ;para: path:/Users/grimmer/CARTA/Images
    // grimmer send command: /CartaObjects/DataLoader:getData ;para: path:/Users/grimmer/CARTA

    this.props.dispatch(actions.queryServerFileList(fullPath));
  }

  render() {
    const { files, selectedFile, rootDir } = this.props;
    const fileItems = files.map((file, index) => {
      let iconSrc;
      if (file.dir) {
        return (<ListItem onClick={() => { this.clickFolder(file.name); }} style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar icon={<FileFolder />} />} />);
      }
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
          return '';
      }


      return (
        <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src={`images/${iconSrc}`} />} />
      );
    });

    return (
      // <Paper style={browserStyle} zDepth={1} >
      <div>
        {/* <p>File Browser, open file browser, then choose a file to read</p> */}
        <div style={{ fontSize: 10 }}>
          {rootDir}
        </div>
        <div>
          <ListItem
            onClick={this.clickParentFolder}
            primaryText=".."
            leftAvatar={<Avatar icon={<FileFolder />} />}
          />
        </div>
        { fileItems && fileItems.length > 0 &&
          <div>
            <SelectableList style={{ maxHeight: 300, overflow: 'auto' }} onChange={this.selectImage} value={selectedFile}>
              {fileItems}
            </SelectableList>
            <RaisedButton style={buttonStyle} onTouchTap={this.readImage} label="Read" secondary />
          </div>
        }
        <RaisedButton style={buttonStyle} onTouchTap={this.closeImage} label="close" secondary />
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
// const mapDispatchToProps = dispatch => ({
//   actions: bindActionCreators(actions, dispatch),
// });
// function mapDispatchToProps(dispatch) {
//   return { actions: bindActionCreators(actions, dispatch) };
// }

export default connect(mapStateToProps)(FileBrowser);
