import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
// import RaisedButton from 'material-ui/RaisedButton';
import Download from 'material-ui/svg-icons/file/file-download';
import NavNext from 'material-ui/svg-icons/image/navigate-next';
import NavBefore from 'material-ui/svg-icons/image/navigate-before';
// import Avatar from 'material-ui/Avatar';
// import FlatButton from 'material-ui/FlatButton';
// import { List, ListItem, makeSelectable } from 'material-ui/List';
import Paper from 'material-ui/Paper';
// import ContentInbox from 'material-ui/svg-icons/content/inbox';
// import ContentSend from 'material-ui/svg-icons/content/send';
import PanelGroup from 'react-panelgroup/lib/PanelGroup.js';
import Content from 'react-panelgroup/lib/PanelGroup.js';
import { hideMenu } from 'react-contextmenu/modules/actions'

import bounds from 'react-bounds';
import ReactCSS from 'reactcss';

import { ContextMenu, MenuItem as MenuItem2, ContextMenuTrigger } from 'react-contextmenu';


// import folder from 'material-ui/svg-icons/file/folder';
// import attachment from 'material-ui/svg-icons/file/attachment';

// import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';
// import { connect } from 'react-redux';

// import '../api/methods';
// import { Responses } from '../api/Responses';

// const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
// const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// import actions from './actions';

import MyFirstGrid from './MyFirstGrid';
import FileBrowser from '../fileBrowser/FileBrowser';
import ImageViewer from '../imageViewer/ImageViewer';

const _ = require('lodash');
const PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
const WidthProvider = require('react-grid-layout').WidthProvider;
let ResponsiveReactGridLayout = require('react-grid-layout').Responsive;

ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);
// for storing and retrieving position and size coordinates


// const browserStyle = {
//   width: 500,
//   margin: 20,
//   marginLeft: 80,
//   // textAlign: 'center',
//   // display: 'inline-block',
// };
//
// const buttonStyle = {
//   margin: 12,
// };
// const SelectableList = makeSelectable(List);
class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      // files: [],
      // rootDir: '',
      // browserOpened: false,
      // // selectedFile: "",
      // selectedIndex: -1,
      // imageURL: '',
      secondColumnWidth: 200,
      expand: false,
      width: 72,
      openWidth: 200,
      closeWidth: 72,
    };

    // this.props.dispatch(actions.prepareFileBrowser());
  }

  // openBrowser = () => {
  //   console.log('open file browser');
  //
  //   if (!this.props.browserOpened) {
  //     this.props.dispatch(actions.queryServerFileList());
  //   }
  //
  //   // if (!this.state.browserOpened) {
  //   //   Meteor.call('queryFileList', (error, result) => {
  //   //     console.log('get open file browser result:', result);
  //   //   });
  //   //   this.setState({ browserOpened: true });
  //   // }
  // }
  //
  // closeBrowser = () => {
  //   console.log('close file browser');
  //   // if (this.state.browserOpened) {
  //   //   this.setState({ browserOpened: false });
  //   //   // this.setState({selectedFile: ""});
  //   //   this.setState({ selectedIndex: -1 });
  //   // }
  //
  //   this.props.dispatch(actions.closeFileBrowser());
  // }
  //
  // selectImage = (e, index) => {
  //   // this.state.selectedIndex = index;
  //   // const file = this.state.files[index];
  //   // console.log("choolse file to open, index:", index, ";name:", file.name);
  //   //
  //   // // this.setState({selectedFile: file.name});
  //   this.setState({ selectedIndex: index });
  //
  //
  //   // Meteor.call('selectFileToOpen', file.name, (error, result) => {
  //   //   console.log("get select file result:", result);
  //   // });
  // }
  //
  // readImage = () => {
  //   if (this.state.selectedIndex >= 0) {
  //     const file = this.props.files[this.state.selectedIndex];
  //     console.log('choolse file to read, index:', this.state.selectedIndex, ';name:', file.name);
  //
  //     // this.setState({selectedFile: file.name});
  //     // Meteor.call('selectFileToOpen', `${this.props.rootDir}/${file.name}`, (error, result) => {
  //     //   console.log('get select file result:', result);
  //     // });
  //
  //     this.props.dispatch(actions.selectFileToOpen(`${this.props.rootDir}/${file.name}`));
  //
  //     // this.setState({ browserOpened: false });
  //     this.props.dispatch(actions.closeFileBrowser());
  //   }
  // }

  // define callback
  onUpdate = (array) => {
    console.log('pannelgroup change: ', array);
    const newWidth = array[1].size;
    console.log('new width:', newWidth);

    this.setState({ secondColumnWidth: newWidth });
    // use 2nd column's width
  }

  handleToggle = () => {
    const expandState = !this.state.expand;
    this.setState({ expand: expandState });
    if (expandState) {
      this.setState({ width: this.state.openWidth });
    } else {
      this.setState({ width: this.state.closeWidth });
    }
  }
  // test = () => {
  //   console.log('SUCCESS');
  // }

  handleClick = () => {
    this.refs.grid.onAddItem();
    hideMenu();
  }

  render() {
    const expanded = this.state.expand;
    // const { browserOpened, files } = this.props;
    // const fileItems = files.map((file, index) => {
    //   if (file.type === 'fits') {
    //     return (
    //       // key is needed for ui array operation react, value is for selectableList of material-ui
    //       <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src="https://raw.githubusercontent.com/CARTAvis/carta/develop/carta/html5/common/skel/source/resource/skel/file_icons/fits.png" />} />
    //
    //     );
    //   }
    //
    //   return (
    //     <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src="https://raw.githubusercontent.com/CARTAvis/carta/develop/carta/html5/common/skel/source/resource/skel/file_icons/casa.png" />} />
    //   );
    // });
    const midPanel = (
      <div>
        <ContextMenuTrigger id='menu' holdToDisplay={1000}>
                {/* <Paper style={{ flex: 1, overflowY: 'scroll', backgroundColor: 'lightgrey' }}> */}
            <MyFirstGrid ref="grid" width={this.state.secondColumnWidth} />
                {/* </Paper> */}
        </ContextMenuTrigger>
        <ContextMenu id='menu'>
          <MenuItem onClick={this.handleClick}>Add</MenuItem>
          {/* <MenuItem onClick={this.handleClick} data={{ item: 'item 2' }}>Menu Item 2</MenuItem>
          <MenuItem divider />
          <MenuItem onClick={this.handleClick} data={{ item: 'item 3' }}>Menu Item 3</MenuItem> */}
        </ContextMenu>
      </div>
    );
    return (
      <div style={{ height: '100vh', backgroundColor: 'red' }}>
        {/* <div> */}
        <PanelGroup onUpdate={this.onUpdate}>
          <div style={{ height: 200, backgroundColor: 'cornflowerblue' }}>1111111111111</div>
          <div style={{ flex: 1, overflowY: 'scroll', backgroundColor: 'green' }}>
            {midPanel}
          </div>
          <div style={{ flex: 1, backgroundColor: 'yellow' }}>
            <FileBrowser />
            <ImageViewer />
          </div>
        </PanelGroup>
        <Drawer expand={this.state.expand} width={this.state.width} style={{ opacity: 0.8 }}>
          <MenuItem style={{ overflowX: 'hidden' }} primaryText="test" leftIcon={<Download />} />
          {
            expanded ?
              <NavBefore onTouchTap={this.handleToggle} />
              : <NavNext onTouchTap={this.handleToggle} />
          }
        </Drawer>
        {/* </div> */}

        {/* <PanelGroup borderColor="grey" onUpdate={this.onUpdate}>
          1111
        </PanelGroup> */}
      </div>
    );
  }
}

export default Main;

// const mapStateToPropsListPage = state => ({
//   imageURL: state.image.imageURL,
//   files: state.fileBrowserUI.files,
//   rootDir: state.fileBrowserUI.rootDir,
//   browserOpened: state.fileBrowserUI.fileBrowserOpened,
// });

// TODO
// export function mapDispatchToProps(dispatch) {
//   return bindActionCreators({
//     prepareFileBrowser: actions.prepareFileBrowser,
// }, dispatch);
// }
// export default connect(mapStateToPropsListPage)(FileBrowser);
