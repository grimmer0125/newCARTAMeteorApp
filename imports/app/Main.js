import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItemMUI from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';

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
// import { hideMenu } from 'react-contextmenu/modules/actions';

import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from 'react-contextmenu';
import 'react-contextmenu/public/styles.5bb557.css';
// import ContextMenuTrigger from 'react-contextmenu/src/ContextMenuTrigger';
// import ContextMenu from 'react-contextmenu/src/ContextMenu';
// import MenuItem from 'react-contextmenu/src/MenuItem';
// import SubMenu from 'react-contextmenu/src/SubMenu';
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


// for storing and retrieving position and size coordinates

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

  handleClick = (e, data) => {
    // console.log(`data is ${data.type}`);
    this.refs.grid.onAddItem(data.type);
  }

  render() {
    const expanded = this.state.expand;
    const midPanel = (
      <div>
        <ContextMenuTrigger id="menu" holdToDisplay={1000}>
          <MyFirstGrid ref="grid" width={this.state.secondColumnWidth} />
        </ContextMenuTrigger>
        <ContextMenu id="menu">
          <SubMenu title="Layout">
            {/* <MenuItem onClick={this.handleClick} data={{ type: 'Default' }}>Default Layout</MenuItem> */}
            <MenuItem onClick={this.handleClick} data={{ type: 'Profiler' }}>Profiler</MenuItem>
            <MenuItem onClick={this.handleClick} data={{ type: 'Histogram' }}>Histogram</MenuItem>
            {/* <MenuItem onClick={this.handleClick} data={{ type: 'Image Composite' }}>Image Composite Layout</MenuItem>
          <MenuItem onClick={this.handleClick} data={{ type: 'Custom' }}>Custom Layout</MenuItem> */}
          </SubMenu>
          {/* <MenuItem onClick={this.handleClick} data={{ item: 'item 2' }}>Menu Item 2</MenuItem>
          <MenuItem divider />
          <MenuItem onClick={this.handleClick} data={{ item: 'item 3' }}>Menu Item 3</MenuItem> */}
        </ContextMenu>
      </div>
    );
    const contentStyle = { marginLeft: 72 };
    if (expanded) {
      contentStyle.marginLeft = 200;
    }
    return (
      <div style={{ height: '100vh' }}>
        <Toolbar style={contentStyle}>
          <ToolbarGroup firstChild>
            <DropDownMenu value={this.state.value} onChange={this.handleChange}>
              {/* <MenuItem value={1} primaryText="All Broadcasts" />
              <MenuItem value={2} primaryText="All Voice" />
              <MenuItem value={3} primaryText="All Text" /> */}
            </DropDownMenu>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarTitle text="Options" />
            <ToolbarSeparator />
          </ToolbarGroup>
        </Toolbar>
        <div style={contentStyle}>
          <PanelGroup onUpdate={this.onUpdate}>
            <div style={{ flex: 1, overflowY: 'scroll', height: '100vh', backgroundColor: 'blue' }}>
              {/* <ImageViewer /> */}
            </div>
            <div style={{ flex: 1, overflowY: 'scroll', maxHeight: '100vh' }}>
              {midPanel}
            </div>
            <div style={{ flex: 1, overflowY: 'scroll', height: '100vh', backgroundColor: 'yellow' }}>
              <FileBrowser />
              <ImageViewer />
            </div>
          </PanelGroup>
        </div>
        <Drawer expand={this.state.expand} width={this.state.width} style={{ opacity: 0.8 }}>
          <MenuItemMUI style={{ overflowX: 'hidden' }} primaryText="test" leftIcon={<Download />} />
          {
            expanded ?
              <NavBefore onTouchTap={this.handleToggle} />
              : <NavNext onTouchTap={this.handleToggle} />
          }
        </Drawer>
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
