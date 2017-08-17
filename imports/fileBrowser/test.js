import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Download from 'material-ui/svg-icons/file/file-download';
import NavNext from 'material-ui/svg-icons/image/navigate-next';
import NavBefore from 'material-ui/svg-icons/image/navigate-before';
import Avatar from 'material-ui/Avatar';
// import FlatButton from 'material-ui/FlatButton';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import Paper from 'material-ui/Paper';
// import ContentInbox from 'material-ui/svg-icons/content/inbox';
// import ContentSend from 'material-ui/svg-icons/content/send';
import PanelGroup from 'react-panelgroup/lib/PanelGroup.js';
import Content from 'react-panelgroup/lib/PanelGroup.js';

import bounds from 'react-bounds';
import ReactCSS from 'reactcss';

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
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 2},
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      rowHeight: 100,
      onLayoutChange: function() {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      items: [].map(function(i, key, list) {
        return {i: i.toString(), x: i*2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString()};
      }),
      newCounter: 0,
    };
    //layouts: JSON.parse(JSON.stringify(originalLayouts)),
  }
  createElement = (el) => {
    console.log("in createElement, state:", this.state);
    var removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer'
    };
    var i = el.add ? '+' : el.i;
    return (
      <div key={i} data-grid={el} style={{backgroundColor: '#808080'}}>
        {el.add ?
          <span className="add text" onClick={this.onAddItem}>Add +</span>
        : <span className="text">{i}</span>}
        <button className="remove" style={removeStyle} onClick={() => this.onRemoveItem(el.i)}>x</button>
        {/* <button className="remove" style={removeStyle} onClick={this.onRemoveItem}>x</button> */}

      </div>
    );
  }

  onAddItem = () => {
    console.log('INSIDE ADD');
    this.setState({
      // Add a new item. It must have a unique key!
      items: this.state.items.concat({
        i: 'n' + this.state.newCounter,
        x: this.state.items.length * 2 % (this.state.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 4,
        h: 2,
        isResizable: false,
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1,
    });
  }
  onRemoveItem(i) {
    console.log('removing', i);
    this.setState({items: _.reject(this.state.items, {i: i})});
  }

  onBreakpointChange = (breakpoint, cols) => {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
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
  test = () => {
    console.log("onWidthChange CALLED");
  }
  render() {
    // if (this.state) {
    //   console.log("in render, print state:", this.state);
    // } else {
    //   console.log("this.state does not exist in render");
    // }
    return (
      <div>
        <button onClick={this.onAddItem}>Add Item</button>
            <ResponsiveReactGridLayout
                ref="rrgl"
                {...this.props}
                onLayoutChange={this.onLayoutChange}
                onBreakpointChange={this.onBreakpointChange}
                onWidthChange={this.test}>
          {/* {_.map(this.state.items, (s)=>this.createElement(s))} */}
              {this.state.items.map(this.createElement)}

            </ResponsiveReactGridLayout>
      </div>
    );
  }
}

const browserStyle = {
  width: 500,
  margin: 20,
  marginLeft: 80,
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

  // define callback
  onUpdate = (array) => {
    console.log("state change: ", array);
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
  test = () => {
    console.log('SUCCESS');
  }

  render() {
    const expanded = this.state.expand;
    const { browserOpened, files } = this.props;
    const fileItems = files.map((file, index) => {
      if (file.type === 'fits') {
        return (
          // key is needed for ui array operation react, value is for selectableList of material-ui
          <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src='https://raw.githubusercontent.com/CARTAvis/carta/develop/carta/html5/common/skel/source/resource/skel/file_icons/fits.png'/>} />

        );
      }

      return (
        <ListItem style={{ fontSize: '14px', height: 40 }} value={index} key={file.name} primaryText={file.name} leftAvatar={<Avatar size={32} src="https://raw.githubusercontent.com/CARTAvis/carta/develop/carta/html5/common/skel/source/resource/skel/file_icons/casa.png"/>} />
      );
    });

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
        <div>
         <Drawer expand={this.state.expand} width={this.state.width}>
           <MenuItem style={{ overflowX: 'hidden' }} primaryText="test" leftIcon={<Download />} />
           {
             expanded ?
               <NavBefore onTouchTap={this.handleToggle} />
               : <NavNext onTouchTap={this.handleToggle} />
           }
         </Drawer>
       </div>
       <PanelGroup borderColor='grey' onUpdate={this.onUpdate}>
       {/* <div> */}
         <div style={{ flex: 1, overflowY: "scroll", backgroundColor: 'cornflowerblue' }}>
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
            </Paper>
          </div>
          <Paper style={{ flex: 1, overflowY: "scroll", backgroundColor: 'lightgrey'}}>
            <MyFirstGrid/>
          </Paper>
          <div style={{ flex: 1, overflowY: "scroll", backgroundColor: 'yellow'}}/>
        </PanelGroup>
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
