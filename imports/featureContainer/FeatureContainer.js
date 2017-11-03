// const originalLayouts = getFromLS('layouts') || {};

import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from './actions';
import Histogram from '../histogram/Histogram';
import Profiler from '../profiler/Profiler';

// const _ = require('lodash');
const PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
// const WidthProvider = require('react-grid-layout').WidthProvider;
// const ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
const ReactGridLayout = require('react-grid-layout');

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
    // this.props.dispatch(actions.setupFeatureContainer());
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
    // console.log('layout: ', layout);
    saveToLS('layout', layout);
    console.log('after saving layouts: ', getFromLS('layout'));
  }
  onBreakpointChange = (breakpoint, cols) => {
    this.setState({
      breakpoint,
      cols,
    });
  }
  onRemoveItem(i) {
    // this.setState({ items: _.reject(this.state.items, { i }) });
    this.props.dispatch(actions.onRemoveItemDB(i));
    this.setSetting('');
  }
  onAddItem = (data) => {
    this.props.dispatch(actions.onAddItemDB(data));
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
      return <Profiler width={this.props.width} />;
    }
  }
  createElement = (el) => {
    const removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer',
    };
    // const i = el.add ? '+' : el.i;
    return (
      <div key={el.i} data-grid={el} style={{ backgroundColor: 'white' }}>
        {/* {el.add ?
          <span className="add text" onClick={this.onAddItem}>Add +</span>
          : <span className="text">{i}</span>} */}
        {/* <span className="text">{el.i}</span> */}
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
    console.log('RECEIVE PROPS');
    const width = this.props.width;
    return (
      <div style={{ minHeight: '100vh' }}>
        {/* <button onClick={this.onAddItem('none')}>Add Item</button> */}
        <ReactGridLayout
          ref="rrgl"
          {...this.props}
          autoSize
          // onLayoutChange={(e) => { console.log('onLayoutChange: ', e); }}
          onBreakpointChange={this.onBreakpointChange}
          cols={1}
          width={width}
          rowHeight={200}
          layout={this.props.items}
          onDragStop={(e) => {
            console.log();
            this.props.dispatch(actions.onDragStopDB(e));
          }}
        >
          {/* {_.map(this.state.items, (s)=>this.createElement(s))} */}
          {/* {this.state.items.map(this.createElement)} */}
          {this.props.items ? this.props.items.map(item => this.createElement(item)) : false}

        </ReactGridLayout>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  items: state.FeatureContainerDB.items,
});
export default connect(mapStateToProps, null, null, { withRef: true })(FeatureContainer);
// export default FeatureContainer;
