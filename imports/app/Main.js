import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItemMUI from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import IconButton from 'material-ui/IconButton';

import NavNext from 'material-ui/svg-icons/image/navigate-next';
import NavBefore from 'material-ui/svg-icons/image/navigate-before';
import Backspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import PanelGroup from 'react-panelgroup/lib/PanelGroup.js';

import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from 'react-contextmenu';
import 'react-contextmenu/public/styles.5bb557.css';
import Folder from 'material-ui/svg-icons/file/folder';
// import attachment from 'material-ui/svg-icons/file/attachment';

// import Layout from './Layout';

// import Splitter from 'm-react-splitters';
// import 'm-react-splitters/lib/splitters.css';

// import { Meteor } from 'meteor/meteor';
// import { Tracker } from 'meteor/tracker';
// import { connect } from 'react-redux';

// import '../api/methods';
// import { Responses } from '../api/Responses';

// const REQUEST_FILE_LIST = 'REQUEST_FILE_LIST';
// const SELECT_FILE_TO_OPEN = 'SELECT_FILE_TO_OPEN';

// import actions from './actions';

import MyFirstGrid from './MyFirstGrid';
import ProfilerSettings from './ProfilerSettings';
import HistogramSettings from './HistogramSettings';
import SideMenu from './SideMenu';
import ImageViewer from '../imageViewer/ImageViewer';

// for storing and retrieving position and size coordinates
class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      secondColumnWidth: 400,
      expand: false,
      value: 3,
      setting: '',
    };
  }

  // define callback
  onUpdate = (array) => {
    console.log('pannelgroup change: ', array);
    const newWidth = array[1].size;
    console.log('new width:', newWidth);
    this.setState({ secondColumnWidth: newWidth });
    // use 2nd column's width
  }
  handleClick = (e, data) => {
    // console.log(`data is ${data.type}`);
    this.refs.grid.onAddItem(data.type);
  }
  handleChange = (event, index, value) => this.setState({ value });

  handleExpand = () => {
    this.setState({ expand: !this.state.expand });
  }
  expandToTrue = () => {
    this.setState({ expand: true });
  }
  setSetting = (type) => {
    console.log('THE RECEIVED TYPE: ', type);
    if (type === 'Profiler') {
      console.log('WILL LOAD PROFILER SETTING');
    } else {
      console.log('WILL LOAD HISTOGRAM SETTING');
    }
    this.setState({ setting: type });
  }
  showSetting = (setting) => {
    console.log('INSIDE SHOWSETTING!!');
    console.log('SETTING TO BE SHOWN: ', setting);
    if (setting) {
      if (setting === 'Profiler') return <ProfilerSettings />;
      else if (setting === 'Histogram') return <HistogramSettings />;
    }
  }

  render() {
    const contentStyle = { marginLeft: 65 };
    const expanded = this.state.expand;
    const setting = this.state.setting;
    const midPanel = (
      <div>
        <ContextMenuTrigger id="menu" holdToDisplay={1000}>
          <MyFirstGrid ref="grid" width={this.state.secondColumnWidth} setSetting={this.setSetting} />
          {/* <MyFirstGrid ref="grid" /> */}
        </ContextMenuTrigger>
        <ContextMenu id="menu">
          <SubMenu title="Layout">
            <MenuItem onClick={this.handleClick} data={{ type: 'Profiler' }}>Profiler</MenuItem>
            <MenuItem onClick={this.handleClick} data={{ type: 'Histogram' }}>Histogram</MenuItem>
            {/* <MenuItem onClick={this.handleClick} data={{ type: 'FileBrowser' }}>File Browser</MenuItem> */}
            {/* <MenuItem onClick={this.handleClick} data={{ type: 'Image Composite' }}>Image Composite Layout</MenuItem>
          <MenuItem onClick={this.handleClick} data={{ type: 'Custom' }}>Custom Layout</MenuItem> */}
          </SubMenu>
        </ContextMenu>
      </div>
    );
    if (expanded) {
      contentStyle.marginLeft = 200;
    }
    return (
      <div>
        <div style={{ overflowY: 'hidden', height: '100vh' }}>
          <Toolbar style={contentStyle}>
            <ToolbarGroup firstChild>
              <DropDownMenu value={this.state.value} onChange={this.handleChange}>
                <MenuItemMUI value={1} primaryText="All Broadcasts" />
                <MenuItemMUI value={2} primaryText="All Voice" />
                <MenuItemMUI value={3} primaryText="All Text" />
              </DropDownMenu>
            </ToolbarGroup>
          </Toolbar>
          <div style={contentStyle}>
            {/* Note: onUpdate affects resizing. w/o onupdate, resizing works with
            predfined panel widths; with onupdate, resizing doesn't work, b/c
            panel keeps renewing, stuck in an inf loop */}
            <PanelGroup
              borderColor="black"
              // panelWidths={[
              //   { size: 400, minSize: 200, resize: 'stretch' },
              //   { size: 400, minSize: 200, resize: 'stretch' },
              //   { size: 200, minSize: 100, resize: 'stretch' },
              // ]}
              onUpdate={this.onUpdate}
            >
              <div style={{ flex: 2, overflowY: 'scroll', height: '100vh' }}>
                <ImageViewer />
              </div>
              <div style={{ flex: 2, overflowY: 'scroll', height: '100vh' }}>
                {midPanel}
              </div>
              <div style={{ flex: 1, overflowY: 'scroll', height: '100vh' }}>
                {this.showSetting(setting)}
              </div>
            </PanelGroup>
            {/* <Layout /> */}
          </div>
          <SideMenu
            expandToTrue={this.expandToTrue}
            handleExpand={this.handleExpand}
            expand={this.state.expand}
          />
        </div>
      </div>
    );
  }
}

export default Main;

/* TODO: export function mapDispatchToProps(dispatch)
 return bindActionCreators({
prepareFileBrowser: actions.prepareFileBrowser,
}, dispatch);
}
export default connect(mapStateToPropsListPage)(FileBrowser); */
