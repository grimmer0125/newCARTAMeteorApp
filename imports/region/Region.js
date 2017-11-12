import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Card from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { Layer, Stage, Rect, Circle, Group } from 'react-konva';
import actions from './actions';
import imageActions from '../imageViewer/actions';

// import _ from 'lodash';
import ImageViewer from '../imageViewer/ImageViewer';

const Blob = require('blob');


// import ImageViewer2 from '../imageViewer/ImageViewer2';

let startX;
let endX;
let startY;
let endY;
class Region extends Component {
  constructor(props) {
    super(props);
    // this.regions = [];
    this.rect = null;
    this.flipY = false;
    this.flipX = false;
    this.state = {
      open: false,
      saveAsInput: '',
    };

    // this.props.dispatch(actions.setupRegion());
  }
  onMouseDown = (event) => {
    this.props.dispatch(actions.setMouseIsDown(1));
    // const pos = this.getMousePos(document.getElementById('canvas'), event);
    const pos = this.getMousePos(this.div, event);
    endX = pos.x;
    endY = pos.y;
    startX = endX;
    startY = endY;
    this.drawRect();
  }
  onMouseMove = (event) => {
    if (this.props.mouseIsDown === 1) {
      // const pos = this.getMousePos(document.getElementById('canvas'), event);
      const pos = this.getMousePos(this.div, event);
      endX = pos.x;
      endY = pos.y;
      this.drawRect();
    }
  }
  onMouseUp = (event) => {
    if (this.props.mouseIsDown === 1) {
      this.props.dispatch(actions.setMouseIsDown(0));
      // const pos = this.getMousePos(document.getElementById('canvas'), event);
      const pos = this.getMousePos(this.div, event);
      endX = pos.x;
      endY = pos.y;
      this.drawRect();
      this.div.removeEventListener('mousedown', this.onMouseDown);
      this.div.removeEventListener('mousemove', this.onMouseMove);
      this.div.removeEventListener('mouseup', this.onMouseUp);
      // document.getElementById('canvas').removeEventListener('mousedown', this.onMouseDown);
      // document.getElementById('canvas').removeEventListener('mousemove', this.onMouseMove);
      // document.getElementById('canvas').removeEventListener('mouseup', this.onMouseUp);
    }
  }
  getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  // setRegionArray = (coordX, coordY, width, height) => {
  //   if (this.props.regionArray) {
  //     this.regionArray = this.props.regionArray;
  //   }
  //   this.regionArray = this.regionArray.concat({
  //     x: coordX,
  //     y: coordY,
  //     w: width,
  //     h: height,
  //     key: Math.floor(Math.random() * 10000),
  //   });
  // }
  init = () => {
    this.div.addEventListener('mousedown', this.onMouseDown);
    this.div.addEventListener('mousemove', this.onMouseMove);
    this.div.addEventListener('mouseup', this.onMouseUp);
    // document.getElementById('canvas').addEventListener('mousedown', this.onMouseDown);
    // document.getElementById('canvas').addEventListener('mousemove', this.onMouseMove);
    // document.getElementById('canvas').addEventListener('mouseup', this.onMouseUp);
  }
  drawRect = () => {
    const w = endX - startX;
    const h = endY - startY;
    const offsetX = (w < 0) ? w : 0;
    const offsetY = (h < 0) ? h : 0;

    if (this.props.mouseIsDown === 0) {
      // this.setRegionArray(startX + offsetX, startY + offsetY, Math.abs(w), Math.abs(h));
      this.props.dispatch(
        // actions.setShape(this.regionArray),
        actions.setShape(startX + offsetX, startY + offsetY, Math.abs(w), Math.abs(h)),
      );
    } else {
      this.props.dispatch(
        actions.drawShape(startX + offsetX, startY + offsetY, Math.abs(w), Math.abs(h)),
      );
    }
  }
  delete = () => {
    const target = this.state.toDelete;
    this.props.dispatch(actions.remove(target));
  }

  resizeRect = (newX, newY, pos, index) => {
    process.nextTick(() => {
      this.props.dispatch(actions.resizeRect(newX, newY, pos, index));
    });
  }

  moveRect = (newX, newY, index) => {
    process.nextTick(() => {
      this.props.dispatch(actions.moveRect(newX, newY, index));
    });
  }

  reshape = (newW, newH, newX, newY, index) => {
    // this.regionArray = this.props.regionArray;
    // const newArray = update(this.regionArray[index],
    //   { x: { $set: newX }, y: { $set: newY }, w: { $set: newW }, h: { $set: newH },
    //   });
    // const data = update(this.regionArray, { $splice: [[index, 1, newArray]] });
    process.nextTick(() => {
      // this.regionArray = data;
      this.props.dispatch(actions.reshape(newW, newH, newX, newY, index, circles));
    });
  }
  addAnchor = (item, index) => {
    // if (!this.regions.hasOwnProperty(item.key)) {
    //   this.regions[item.key] = {};
    // }

    const circlesLen = item.circles.length;
    const circles = [];
    for (let i = 0; i < circlesLen; i++) {
      const element = item.circles[i];
      const circle = (
        <Circle
          x={element.x}
          y={element.y}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          key={element.pos}
          onDragMove={(e) => {
            const x = e.target._lastPos.x;
            const y = e.target._lastPos.y;
            console.log('drag circle:', x, ';', y);
            this.resizeRect(x, y, element.pos, index);
          }}
          // ref={(node) => {
          //   if (node && !this.regions[item.key].hasOwnProperty(element.pos)) {
          //     console.log('regiser circle:', element.pos);
          //     this.regions[item.key][element.pos] = node;
          //     this.regions[item.key][element.pos].on('dragmove', () => {
          //       const x = this.regions[item.key][element.pos].getAttrs().x;
          //       const y = this.regions[item.key][element.pos].getAttrs().y;
          //       console.log('drag0:', x, ';', y);
          //       this.resizeRect(x, y, element.pos, index);
          //     });
          //   }
          // }}
        />
      );
      circles.push(circle);
    }

    const anchors = (
      <Group>
        {circles}
      </Group>
    );
    const result = (
      <Group
        key={item.key}
      >
        <Rect
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
          stroke="red"
          draggable
          listening
          onDragMove={(e) => {
            const x = e.target._lastPos.x;
            const y = e.target._lastPos.y;
            console.log('drag rect:', x, ';', y);
            this.moveRect(x, y, index);
          }}
          // ref={(node) => {
          //   if (node && !this.regions[item.key].hasOwnProperty('shape')) {
          //     this.regions[item.key].shape = node;
          //     this.regions[item.key].shape.on('dragmove', () => {
          //       // console.log('dragmove');
          //       // const itemW = item.w;
          //       // const itemH = item.h;
          //       // const i = index;
          //       // this.props.regionArray.forEach((obj, index) => {
          //       //   if (obj.key === item.key) {
          //       //     itemW = obj.w;
          //       //     itemH = obj.h;
          //       //     i = index;
          //       //   }
          //       // });
          //       const x = this.regions[item.key].shape.getAttrs().x;
          //       const y = this.regions[item.key].shape.getAttrs().y;
          //       this.moveRect(x, y, index);
          //       // this.reshape(itemW, itemH, x, y, i);
          //     });
          //     this.regions[item.key].shape.on('click', () => {
          //       this.setState({
          //         toDelete: item.key,
          //       });
          //     });
          //   }
          // }}
        />
        {anchors}
      </Group>
    );
    return result;
  }
  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };
  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };
  saveAs = (event) => {
    this.setState({
      saveAsInput: event.target.value,
    });
  }
  zoomIn = () => {
    console.log('ZOOM BUTTON CLICKED');
    this.props.dispatch(imageActions.zoom(-2));
  }
  zoomOut = () => {
    console.log('ZOOM BUTTON CLICKED');
    this.props.dispatch(imageActions.zoom(2));
  }
  convertToImage = () => {
    console.log('convertToImage');
    if (this.layer) {
      // const resizedCanvas = document.createElement('canvas');
      // const resizedContext = resizedCanvas.getContext('2d');
      // resizedCanvas.height = '477';
      // resizedCanvas.width = '482';
      // const canvas = this.layer.getCanvas();
      // resizedContext.drawImage(canvas._canvas, 0, 0, 477, 482);
      // const url = resizedCanvas.toDataURL('image/png', 1);
      const canvas = this.layer.getCanvas();
      const url = canvas.toDataURL('image/png', 1);
      Meteor.call('convertFile', url, this.state.value, (error, result) => {
        // console.log('RESULT: ', result);
        const blob = new Blob([result], { type: 'text/eps' });
        const b64encoded = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', b64encoded);
        a.setAttribute('download', `${this.state.saveAsInput}.${this.state.value}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // window.URL.revokeObjectURL(b64encoded);
      });
    }
  }
  handleChange = (event, index, value) => {
    this.setState({ value });
    // this.convertToImage();
  }
  render() {
    const { x, y, width, height } = this.props;
    this.rect = (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="red"
        listening
        key={x + y}
      />
    );
    return (
      <div>
        <div ref={(node) => { this.div = node; }} style={{ position: 'relative' }}>
          <Stage
            id="stage"
            width={482}
            height={477}
            ref={(node) => {
              this.stage = node;
              // if (this.stage) {
              //   const canvas = this.stage.node.toCanvas();
              //   canvas.width = 1274;
              //   canvas.height = 954;
              //   canvas.style.width = '482px';
              //   canvas.style.height = '477px';
              //   canvas.getContext('2d').scale(2, 2);
              // }
            }}
          >
            <Layer
              id="layer"
              ref={(node) => {
                if (node) this.layer = node;
                // if (this.layer) {
                // this.layer.getCanvas().context._context.imageSmoothingQuality = 'high';
                // console.log(this.layer.getContext().scale(1, 1));
                // this.layer.getCanvas().setWidth(482);
                // this.layer.getCanvas().setHeight(477);
                // this.layer.getCanvas().getContext('2d').scale(2, 2);
                // }
                // console.log(this.layer.getCanvas());
                // canvas.setWidth(1000);
                // canvas.setHeight(500);
                // canvas.setSize(482, 477);
              }}
            >
              <ImageViewer />
              {/* <ImageViewer2 /> */}
              {(this.props.mouseIsDown === 1) ? this.rect : false}
              {this.props.regionArray ? this.props.regionArray.map((item, index) => this.addAnchor(item, index)) : false}
            </Layer>
          </Stage>
          <Card style={{ width: '24px', position: 'absolute', top: 0 }} >
            <button className="zoom" style={{ width: '24px' }}>
              <img style={{ width: '12px', height: '12px' }} src="/images/pan.png" alt="" />
            </button>
            <Divider style={{ marginLeft: '5px', marginRight: '5px' }} />
            <button onClick={this.zoomIn} className="zoom" style={{ width: '24px' }}>+</button>
            <Divider style={{ marginLeft: '5px', marginRight: '5px' }} />
            <button onClick={this.zoomOut} className="zoom" style={{ width: '24px' }}>-</button>
          </Card>
          <br />
        </div>
        <RaisedButton label="rectangle" onClick={this.init} />
        <RaisedButton label="delete" onClick={this.delete} />
        <RaisedButton label="save" onClick={this.handleTouchTap} />
        {/* <RaisedButton
          label="file"
          onClick={this.convertToImage}
        /> */}
        {/* <img src={`data:image/png;base64,${this.state.src}`} alt="" /> */}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <TextField
            floatingLabelText="Save as..."
            onChange={this.saveAs}
            style={{ margin: '10px', verticalAlign: 'middle' }}
          />
          <SelectField
            floatingLabelText="File Type"
            value={this.state.value}
            onChange={this.handleChange}
            autoWidth
            style={{ width: '150px', margin: '10px', verticalAlign: 'middle' }}
          >
            <MenuItem value="pdf" primaryText="pdf" />
            <MenuItem value="eps" primaryText="eps" />
            <MenuItem value="ps" primaryText="ps" />
          </SelectField>
          <br />
          <FlatButton
            type="submit"
            label="Save"
            primary
            // href={`data:text/eps;base64,${this.state.src}`}
            style={{ marginRight: 0 }}
            onClick={this.convertToImage}
          />
        </Popover>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  x: state.RegionDB.x,
  y: state.RegionDB.y,
  width: state.RegionDB.width,
  height: state.RegionDB.height,
  mouseIsDown: state.RegionDB.mouseIsDown,
  regionArray: state.RegionDB.regionArray,
});
export default connect(mapStateToProps)(Region);
