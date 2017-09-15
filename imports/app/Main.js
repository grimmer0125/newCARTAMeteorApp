import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';
import React, { Component } from 'react';
import { Layer, Stage, Rect } from 'react-konva';

// import PanelGroup from 'react-panelgroup/lib/PanelGroup.js';
// import SplitterLayout from 'react-splitter-layout';
import LayoutWrapper from '../example-ui/LayoutWrapper';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import NumericInput from 'react-numeric-input';
import { Tabs, Tab } from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import SkipPrev from 'material-ui/svg-icons/av/skip-previous';
import SkipNext from 'material-ui/svg-icons/av/skip-next';
import Stop from 'material-ui/svg-icons/av/stop';
import PlayForward from 'material-ui/svg-icons/av/play-arrow';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItemMUI from 'material-ui/MenuItem';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from 'react-contextmenu';
import 'react-contextmenu/public/styles.5bb557.css';

import SplitterLayout from '../splitterLayout/components/SplitterLayout';

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
import Topbar from './Topbar';

let startX;
let endX;
let startY;
let endY;
let mouseIsDown = 0;
const count = 0;
// for storing and retrieving position and size coordinates
class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      expand: false,
      value: 3,
      setting: '',
      regionArray: [],
      arr: [],
    };
  }
  // define callback
  onUpdate = (array) => {
    console.log('pannelgroup change: ', array);
    const newWidth = array[1].size;
    console.log('pannelgroup change2: ', newWidth);

    // console.log('new width:', newWidth);
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
  onUpdate = (second) => {
    this.setState({ secondColumnWidth: second });
  }
  showSetting = (setting) => {
    console.log('INSIDE SHOWSETTING!!');
    // console.log('SETTING TO BE SHOWN: ', setting);
    if (setting) {
      if (setting === 'Profiler') return <ProfilerSettings />;
      else if (setting === 'Histogram') return <HistogramSettings />;
    }
  }
  drage2ndeHandler = (first, second, third) => {
    console.log('drage2nd handler:', first, ';second:', second, ';third:', third);
  }

  drage1stHandler = (first, second, third) => {
    console.log('drage1st handler:', first, ';second:', second, ';third:', third);
  }

  resizeHandler = (first, second, third) => {
    console.log('mount handler:', first, ';second:', second, ';third:', third);
  }

  resizeHandler = (first, second, third) => {
    console.log('resize handler:', first, ';second:', second, ';third:', third);
  }
  getMousePos = (canvas, event) => {
    console.log('INSIDE getMousePos');
    console.log('getMousePos CANVAS: ', canvas);
    console.log('getMousePos EVENT: ', event);
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  onMouseDown = (event) => {
    console.log('INSIDE mouseDown');
    console.log('EVENT: ', event);
    mouseIsDown = 1;
    const pos = this.getMousePos(document.getElementById('canvas'), event);
    console.log('MOUSE POSITION: ', pos);
    endX = pos.x;
    endY = pos.y;
    startX = endX;
    startY = endY;
    this.drawRect();
  }
  onMouseMove = (event) => {
    if (mouseIsDown === 1) {
      const pos = this.getMousePos(document.getElementById('canvas'), event);
      endX = pos.x;
      endY = pos.y;
      this.drawRect();
    }
  }
  onMouseUp = (event) => {
    if (mouseIsDown === 1) {
      mouseIsDown = 0;
      const pos = this.getMousePos(document.getElementById('canvas'), event);
      endX = pos.x;
      endY = pos.y;
      this.drawRect();
      document.getElementById('canvas').removeEventListener('mousedown', this.onMouseDown);
      document.getElementById('canvas').removeEventListener('mousemove', this.onMouseMove);
      document.getElementById('canvas').removeEventListener('mouseup', this.onMouseUp);
    }
  }
  // callback for drag coordinates; currently only works on the most recent rectangle
  onDragShape = () => {
    this.rect.on('dragstart', () => {
      console.log('x: ', this.rect.getAttrs().x, ' y: ', this.rect.getAttrs().y);
    });
    this.rect.on('dragmove', () => {
      console.log('x: ', this.rect.getAttrs().x, ' y: ', this.rect.getAttrs().y);
    });
    this.rect.on('dragend', () => {
      console.log('x: ', this.rect.getAttrs().x, ' y: ', this.rect.getAttrs().y);
    });
  }
  delete = (target) => {
    console.log('IN DELETE');
    if (this.state.regionArray.length === 1) {
      this.setState({ regionArray: [] });
    } else {
      const arr = this.state.regionArray.filter(item => item !== target);
      this.setState({ regionArray: arr });
    }
    console.log('AFTER ARR: ', this.state.regionArray);
  }
  drawRect = () => {
    console.log('INSIDE drawRect');
    const w = endX - startX;
    const h = endY - startY;
    const offsetX = (w < 0) ? w : 0;
    const offsetY = (h < 0) ? h : 0;
    const width = Math.abs(w);
    const height = Math.abs(h);
    const rect = (
      // <div>
      <Rect
        x={startX + offsetX}
        y={startY + offsetY}
        width={width}
        height={height}
        stroke="red"
        draggable
        listening
        ref={(node) => { this.rect = node; }}
      />
      // </div>
    );
    if (mouseIsDown === 1) {
      this.setState({ rect });
    } else if (mouseIsDown === 0) {
      this.setState({ regionArray: this.state.regionArray.concat(rect) });
      // count += 1;
      // console.log('COUNT: ', count);
      console.log('CURR ARR: ', this.state.regionArray);
      this.rect.on('click', () => {
        console.log('RECT: ', rect);
        console.log('THIS.RECT: ', this.rect);
        this.delete(rect);
      });
    }
  }
  init = () => {
    console.log('INSIDE init');
    document.getElementById('canvas').addEventListener('mousedown', this.onMouseDown);
    document.getElementById('canvas').addEventListener('mousemove', this.onMouseMove);
    document.getElementById('canvas').addEventListener('mouseup', this.onMouseUp);
  }
  render() {
    const string = 'Image';
    const label = <div>{string}<br /><sub>image 0</sub></div>;
    const contentStyle = {
      marginLeft: 65,
    };
    const toolbarStyle = {
      backgroundColor: '#EEEEEE',
      bottom: 0,
      width: '100%',
    };
    const expanded = this.state.expand;
    const setting = this.state.setting;
    const midPanel = (
      <div>
        <ContextMenuTrigger id="menu" holdToDisplay={1000}>
          <MyFirstGrid ref="grid" width={this.state.secondColumnWidth} setSetting={this.setSetting} />
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
    // if (expanded) {
    //   contentStyle.marginLeft = 180;
    //   toolbarStyle.width = 'calc(100% + 118px)';
    // }
    return (
      <div className="layout-row">
        {/* <div style={{ width: 200, backgroundColor: 'yellow' }}>
          test
        </div> */}
        <SideMenu
          expandToTrue={this.expandToTrue}
          handleExpand={this.handleExpand}
          expand={this.state.expand}
          handleLogout={this.props.handleLogout}
        />

        {/* <Topbar style={contentStyle} /> */}
        <div className="layout-fill">
          <Topbar style={toolbarStyle} />
          <LayoutWrapper
            firstPercentage={40}
            secondPercentage={40}
            mountHandler={this.mountHandler}
            resizeHandler={this.resizeHandler}
            drage1stHandler={this.drage1stHandler}
            drage2ndeHandler={this.drage2ndeHandler}
            onUpdate={this.onUpdate}
          >
            <div>
              <div id="canvas">
                <Stage id="stage" width={637} height={477}>
                  <Layer id="layer" ref={(node) => { this.layer = node; }}>
                    <ImageViewer />
                    {(mouseIsDown === 1) ? this.state.rect : false}
                    {/* {this.state.regionArray.map(item => item.rect)} */}
                    {this.state.regionArray}
                  </Layer>
                </Stage>
              </div>
              <RaisedButton label="rectangle" onClick={this.init} />
              <RaisedButton label="delete" onClick={this.delete} />
              {/* <RaisedButton label="drag" onClick={this.onDragShape} /> */}
              <br />
              <Paper style={{ width: 637, height: 200, backgroundColor: 'lightgrey' }} zDepth={2}>
                <Tabs>
                  <Tab label={label} />
                  <Tab label="Channel" />
                  <Tab label="Stokes" />
                </Tabs>
                <div style={{ display: 'flex', flexDirection: 'row', height: '20%' }}>
                  <DropDownMenu value={1} underlineStyle={{ color: 'black' }}>
                    <MenuItemMUI value={1} primaryText="Image 0" />
                  </DropDownMenu>
                  <p>&#8804; 3</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', height: '20%' }}>
                  <div style={{ marginTop: '15px' }}>
                    <NumericInput style={{ wrap: { height: '30px', width: '50px' }, input: { height: '30px', width: '50px' } }} min={0} max={3} value={0} />
                  </div>
                  <div>
                    <Slider sliderStyle={{ width: '500px', left: '10px', height: '2px' }} step={1} min={0} max={3} value={3} />
                  </div>
                  <div style={{ marginLeft: '30px', marginTop: '15px' }}>
                    <NumericInput style={{ wrap: { height: '30px', width: '50px' }, input: { height: '30px', width: '50px' } }} min={0} max={3} value={3} />
                  </div>
                </div>
                <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'row', height: '50%', margin: 'auto', width: '40%' }}>
                  <IconButton style={{ transform: 'rotate(180deg)' }}>
                    <PlayForward />
                  </IconButton>
                  <IconButton>
                    <SkipPrev />
                  </IconButton>
                  <IconButton>
                    <Stop />
                  </IconButton>
                  <IconButton>
                    <SkipNext />
                  </IconButton>
                  <IconButton>
                    <PlayForward />
                  </IconButton>
                </div>
              </Paper>
            </div>
            <div>
              {midPanel}
            </div>
            <div style={{ backgroundColor: 'blue', height: 200 }}>
              {this.showSetting(setting)}
            </div>
          </LayoutWrapper>
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
