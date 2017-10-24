// const originalLayouts = getFromLS('layouts') || {};

import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';

const _ = require('lodash');
const PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
// const WidthProvider = require('react-grid-layout').WidthProvider;
// const ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
const ReactGridLayout = require('react-grid-layout');
// ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);
import Histogram from '../histogram/Histogram';
import Profiler from '../profiler/Profiler';
// import FileBrowser from '../fileBrowser/FileBrowser';

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem('rgl-8')) || {};
    } catch (e) { /* Ignore */ }
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

class FeatureContainer extends Component {
  mixins: [PureRenderMixin]
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      newCounter: 0,
    };
    // layouts: JSON.parse(JSON.stringify(originalLayouts)),
  }
  getDefaultProps() {
    return {
      className: 'layout',
      // breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 2 },
      // cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      // rowHeight: 100,
      onLayoutChange() {},
    };
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
  onBreakpointChange = (breakpoint, cols) => {
    this.setState({
      breakpoint,
      cols,
    });
  }
  onRemoveItem(i) {
    console.log('removing', i);
    this.setState({ items: _.reject(this.state.items, { i }) });
  }
  onAddItem = (data) => {
    // NOTE: will need to loop through items[] to check if a grid already exists
    // console.log('INSIDE ADD');
    this.setState({
      // Add a new item. It must have a unique key!
      items: this.state.items.concat({
        i: `n${this.state.newCounter}`,
        // x: this.state.items.length * 2 % (this.state.cols || 12),
        x: 0,
        y: Infinity, // puts it at the bottom
        w: 4,
        h: 2,
        type: data,
        // type: data,
        isResizable: false,
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1,
    });
  }
  setSetting(type) {
    console.log('THE TYPE TO BE PASSED: ', type);
    this.props.setSetting(type);
  }
  addGraph = (type) => {
    // console.log(`TYPE: ${type}`);
    if (type === 'Histogram') {
      return <Histogram />;
    } else if (type === 'Profiler') {
      return <Profiler />;
    }
  }
  createElement = (el) => {
    console.log('in createElement, state:', this.state);
    const removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer',
    };
    // const i = el.add ? '+' : el.i;
    return (
      <div key={el.i} data-grid={el} style={{ backgroundColor: '#808080' }}>
        {/* {el.add ?
          <span className="add text" onClick={this.onAddItem}>Add +</span>
          : <span className="text">{i}</span>} */}
        <span className="text">{el.i}</span>
        {this.addGraph(el.type)}
        <button className="remove" style={removeStyle} onClick={() => this.onRemoveItem(el.i)}>x</button>
        <button style={{ position: 'absolute', right: '23px', top: 0 }} onClick={() => this.setSetting(el.type)}>Setting</button>
      </div>
    );
  }
  render() {
    // if (this.state) {
    //   console.log("in render, print state:", this.state);
    // } else {
    //   console.log("this.state does not exist in render");
    // }
    const width = this.props.width;
    return (
      <div style={{ minHeight: '100vh' }}>
        {/* <button onClick={this.onAddItem('none')}>Add Item</button> */}
        <ReactGridLayout
          ref="rrgl"
          {...this.props}
          autoSize
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          cols={1}
          width={width}
        >
          {/* {_.map(this.state.items, (s)=>this.createElement(s))} */}
          {this.state.items.map(this.createElement)}

        </ReactGridLayout>
      </div>
    );
  }
}

export default FeatureContainer;
