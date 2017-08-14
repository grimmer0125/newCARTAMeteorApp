import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Download from 'material-ui/svg-icons/file/file-download';
import NavNext from 'material-ui/svg-icons/image/navigate-next';
import NavBefore from 'material-ui/svg-icons/image/navigate-before';
// import FlatButton from 'material-ui/FlatButton';

import { List, ListItem, makeSelectable } from 'material-ui/List';
import Paper from 'material-ui/Paper';

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

var _ = require('lodash');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var WidthProvider = require('react-grid-layout').WidthProvider;
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);
// for storing and retrieving position and size coordinates
function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-8')) || {};
    } catch(e) {/*Ignore*/}
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem('rgl-8', JSON.stringify({
      [key]: value
    }));
  }
}
//const originalLayouts = getFromLS('layouts') || {};
class MyFirstGrid extends Component {
  mixins: [PureRenderMixin]
  getDefaultProps() {
    return {
      className: "layout",
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      rowHeight: 30,
      onLayoutChange: function() {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {}
    //layouts: JSON.parse(JSON.stringify(originalLayouts)),
  }
  // callback function for handling
  onLayoutChange = (layout) => {
    //let layouts = this.state.layouts;
    // console.log("layouts: ", layouts);
    // console.log("layout: ", layout);
    saveToLS('layout', layout);
    console.log('after saving layouts: ', getFromLS('layout'));
    //this.setState({layout});
    //this.props.onLayoutChange(layout);
  }
  render() {
    if (this.state) {
      console.log("in render, print state:", this.state);
    } else {
      console.log("this.state does not exist in render");
    }
    return (
      <div>
        <ResponsiveReactGridLayout
            ref="rrgl"
            {...this.props}
            onLayoutChange={this.onLayoutChange}>
          <div key="1" data-grid={{w: 2, h: 3, x: 0, y: 0}}><span className="text">1</span></div>
          <div key="2" data-grid={{w: 2, h: 3, x: 2, y: 0}}><span className="text">2</span></div>
          <div key="3" data-grid={{w: 2, h: 3, x: 4, y: 0}}><span className="text">3</span></div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

const browserStyle = {
  width: 600,
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

    this.state = {
      ...this.state,
      files: [],
      rootDir: '',
      browserOpened: false,
      // selectedFile: "",
      selectedIndex: -1,
      imageURL: '',
      expand: false,
      width: 72,
      openWidth: 200,
      closeWidth: 72,
    };

    this.props.dispatch(actions.prepareFileBrowser());
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

  closeBrowser = () => {
    console.log('close file browser');
    // if (this.state.browserOpened) {
    //   this.setState({ browserOpened: false });
    //   // this.setState({selectedFile: ""});
    //   this.setState({ selectedIndex: -1 });
    // }

    this.props.dispatch(actions.closeFileBrowser());
  }

  selectImage = (e, index) => {
    // this.state.selectedIndex = index;
    // const file = this.state.files[index];
    // console.log("choolse file to open, index:", index, ";name:", file.name);
    //
    // // this.setState({selectedFile: file.name});
    this.setState({ selectedIndex: index });


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

  handleToggle = () => {
    const expandState = !this.state.expand;
    this.setState({ expand: expandState });
    if (expandState) {
      this.setState({ width: this.state.openWidth });
    } else {
      this.setState({ width: this.state.closeWidth });
    }
  }


  render() {
    const expanded = this.state.expand;
    const { browserOpened, files } = this.props;
    const fileItems = files.map((file, index) => {
      if (file.type === 'fits') {
        return (
          // key is needed for ui array operation react, value is for selectableList of material-ui
          <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftIcon={<ContentSend />} />

        );
      }

      return (
        <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftIcon={<ContentInbox />} />
      );
    });
    // const nextIcon = (props) => (
    //   <SvgIcon {...props}>
    //     <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    //   </SvgIcon>
    // );
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 0.25 }}>
          <Drawer expand={this.state.expand} width={this.state.width}>
            <MenuItem primaryText="test" leftIcon={<Download />} />
            {
              expanded ?
                <NavBefore onTouchTap={this.handleToggle} />
                : <NavNext onTouchTap={this.handleToggle} />
            }

          </Drawer>
        </div>
        <div style={{ flex: 0.30 }}>
          <Paper style={browserStyle} zDepth={1} >
            <p>File Browser, open file browser, then choose a file to read</p>
            <RaisedButton style={buttonStyle} onTouchTap={this.openBrowser} label="Open Server's File Browser" primary />
            <RaisedButton style={buttonStyle} onTouchTap={this.closeBrowser} label="Close File Browser" secondary />

            { browserOpened && fileItems && fileItems.length > 0 &&
            <div>
              <SelectableList style={{ maxHeight: 300, overflow: 'auto' }} onChange={this.selectImage} value={this.state.selectedIndex}>
                {fileItems}
              </SelectableList>
              <RaisedButton style={buttonStyle} onTouchTap={this.readImage} label="Read" secondary />
            </div>
            }
            {/* <img src={this.props.imageURL} alt="" /> */}

          </Paper>
        </div>
        <div style={{ flex: 0.45 }}>
          <MyFirstGrid/>
        </div>
      </div>

    );
  }
}

const mapStateToPropsListPage = state => ({
  imageURL: state.image.imageURL,
  files: state.fileBrowserUI.files,
  rootDir: state.fileBrowserUI.rootDir,
  browserOpened: state.fileBrowserUI.fileBrowserOpened,
});

// TODO
// export function mapDispatchToProps(dispatch) {
//   return bindActionCreators({
//     prepareFileBrowser: actions.prepareFileBrowser,
// }, dispatch);
// }

export default connect(mapStateToPropsListPage)(FileBrowser);
