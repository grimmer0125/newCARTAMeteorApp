// const originalLayouts = getFromLS('layouts') || {};

import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
// import Drawer from 'material-ui/Drawer';
// import MenuItem from 'material-ui/MenuItem';
// import RaisedButton from 'material-ui/RaisedButton';
// import Download from 'material-ui/svg-icons/file/file-download';
// import NavNext from 'material-ui/svg-icons/image/navigate-next';
// import NavBefore from 'material-ui/svg-icons/image/navigate-before';
// import Avatar from 'material-ui/Avatar';
// // import FlatButton from 'material-ui/FlatButton';
// import { List, ListItem, makeSelectable } from 'material-ui/List';
// import Paper from 'material-ui/Paper';
// // import ContentInbox from 'material-ui/svg-icons/content/inbox';
// // import ContentSend from 'material-ui/svg-icons/content/send';
// import PanelGroup from 'react-panelgroup/lib/PanelGroup.js';
// import Content from 'react-panelgroup/lib/PanelGroup.js';
//
// import bounds from 'react-bounds';
// import ReactCSS from 'reactcss';

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

const _ = require('lodash');
const PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
const WidthProvider = require('react-grid-layout').WidthProvider;
const ReactGridLayout = require('react-grid-layout');

const Responsive = require('react-grid-layout').Responsive;

// ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);


function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-8')) || {};
    } catch (e) { /* Ignore*/ }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem('rgl-8', JSON.stringify({
      [key]: value,
    }));
  }
}

class MyFirstGrid extends Component {
  mixins: [PureRenderMixin]
  getDefaultProps() {
    return {
      className: 'layout',
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 2 },
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      rowHeight: 100,
      onLayoutChange() {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // items: [].map((i, key, list) => ({ i: i.toString(), x: i * 2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString() })),
      items: [0, 1, 2, 3],
      newCounter: 0,
    };
    // layouts: JSON.parse(JSON.stringify(originalLayouts)),
  }
  createElement = i =>
    // console.log('in createElement, state:', this.state);
    // const removeStyle = {
    //   position: 'absolute',
    //   right: '2px',
    //   top: 0,
    //   cursor: 'pointer',
    // };
    // const i = el.add ? '+' : el.i;
    (
    <div key={i} style={{ backgroundColor: '#808080' }} data-grid={{ x: 0, y: i, w: 1, h: 2 }}>i</div>

      // <div key={i} data-grid={el} style={{ backgroundColor: '#808080' }}>
      //   {el.add ?
      //     <span className="add text" onClick={this.onAddItem}>Add +</span>
      //     : <span className="text">{i}</span>}
      //   <button className="remove" style={removeStyle} onClick={() => this.onRemoveItem(el.i)}>x</button>
      //   {/* <button className="remove" style={removeStyle} onClick={this.onRemoveItem}>x</button> */}
      //
      // </div>
    )


  onAddItem = () => {
    const newItems = this.state.items.slice(0);
    newItems.push(newItems.length);
    // console.log('INSIDE ADD');
    this.setState({
      // Add a new item. It must have a unique key!
      items: newItems,

      // Increment the counter to ensure key is always unique.
      // newCounter: this.state.newCounter + 1,
    });
  }
  onRemoveItem(i) {
    console.log('removing', i);
    this.setState({ items: _.reject(this.state.items, { i }) });
  }

  onBreakpointChange = (breakpoint, cols) => {
    this.setState({
      breakpoint,
      cols,
    });
  }
  // callback function for handling
  onLayoutChange = (layout) => {
    // let layouts = this.state.layouts;
    // console.log("layouts: ", layouts);
    // console.log("layout: ", layout);
    saveToLS('layout', layout);
    console.log('after saving layouts: ', getFromLS('layout'));
    // this.setState({layout});
    // this.props.onLayoutChange(layout);
  }
  onWidthChange = (containerWidth) => {
    console.log('MyFirstGrid onWidthChange CALLED:', containerWidth);
  }
  render() {
    // if (this.state) {
    //   console.log("in render, print state:", this.state);
    // } else {
    //   console.log("this.state does not exist in render");
    // }
    const width = this.props.width ? this.props.width : 200;
    return (
      <div style={{ backgroundColor: 'purple' }}>
        <button onClick={this.onAddItem}>Add Item</button>
        <ReactGridLayout
          ref="rrgl"
          {...this.props}
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          onWidthChange={this.onWidthChange}
          rowHeight={30}
          cols={1}
          // style={{ width: '100%' }}
          width={width}
        >
          {/* {_.map(this.state.items, (s)=>this.createElement(s))} */}
          {this.state.items.map(this.createElement)}

          {/* <div style={{ backgroundColor: '#808080' }} key="a" data-grid={{ x: 0, y: 0, w: 1, h: 2 }}>a</div>
          <div style={{ backgroundColor: '#808080' }} key="b" data-grid={{ x: 0, y: 1, w: 1, h: 2 }}>b</div>
          <div style={{ backgroundColor: '#808080' }} key="c" data-grid={{ x: 0, y: 2, w: 1, h: 2 }}>c</div> */}
        </ReactGridLayout>
      </div>
    );
  }
}

export default MyFirstGrid;
