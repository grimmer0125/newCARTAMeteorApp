import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Card from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import { Layer, Stage, Rect, Circle, Group } from 'react-konva';
import actions from './actions';
import imageActions from '../imageViewer/actions';

// import _ from 'lodash';
import ImageViewer from '../imageViewer/ImageViewer';


// import ImageViewer2 from '../imageViewer/ImageViewer2';

let startX;
let endX;
let startY;
let endY;
class Region extends Component {
  constructor(props) {
    super(props);
    this.regions = [];
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
  reshape = (newW, newH, newX, newY, index) => {
    // this.regionArray = this.props.regionArray;
    // const newArray = update(this.regionArray[index],
    //   { x: { $set: newX }, y: { $set: newY }, w: { $set: newW }, h: { $set: newH },
    //   });
    // const data = update(this.regionArray, { $splice: [[index, 1, newArray]] });
    process.nextTick(() => {
      // this.regionArray = data;
      this.props.dispatch(actions.reshape(newW, newH, newX, newY, index));
    });
  }
  addAnchor = (item) => {
    const anchors = (
      <Group>
        <Circle
          x={this.flipX ? item.x + item.w : item.x}
          y={this.flipY ? item.y + item.h : item.y}
          stroke="#666"
          fill="#ddd"
          // fill="#7CFC00"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('topLeft')) {
              this.regions[item.key].topLeft = node;
              this.regions[item.key].topLeft.on('dragmove', () => {
                const bottomLeftAttrs = this.regions[item.key].bottomLeft.getAttrs();
                // const bottomRightAttrs = this.regions[item.key].bottomRight.getAttrs();
                const topRightAttrs = this.regions[item.key].topRight.getAttrs();
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.props.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].topLeft.getAttrs().x;
                const y = this.regions[item.key].topLeft.getAttrs().y;
                let newW = Math.abs((itemX + itemW) - x);
                let newH = Math.abs((itemY + itemH) - y);
                // flip to bottom left
                if (bottomLeftAttrs.y <= y && topRightAttrs.x >= x) {
                  if (!this.flipY) this.flipY = true;
                  if (this.flipX) this.flipX = false;
                  // this.flipY = true;
                  // this.flipX = false;
                  // newH = Math.abs(itemH - ((itemY + itemH) - y));
                  newH = Math.abs(y - bottomLeftAttrs.y);
                  this.reshape(newW, newH, x, itemY, i);
                  // const v = bottomLeftAttrs.y;
                  // this.reshape(newW, newH, itemX, v, i);
                } else if (topRightAttrs.x <= x && bottomLeftAttrs.y >= y) {
                  // flip to top right
                  if (!this.flipX) this.flipX = true;
                  if (this.flipY) this.flipY = false;
                  // newW = Math.abs(itemW - ((itemX + itemW) - x));
                  newW = Math.abs(x - topRightAttrs.x);
                  this.reshape(newW, newH, itemX, y, i);
                  // this.reshape(newW, newH, itemX + itemW, itemY, i);
                }
                // should be bottomRight
                else if (bottomLeftAttrs.y <= y && topRightAttrs.x <= x) {
                  if (!this.flipX) this.flipX = true;
                  if (!this.flipY) this.flipY = true;
                  newH = Math.abs(y - itemY);
                  newW = Math.abs(itemW - ((itemX + itemW) - x));
                  this.reshape(newW, newH, itemX, itemY, i);
                } else {
                  if (this.flipY) this.flipY = false;
                  if (this.flipX) this.flipX = false;
                  this.reshape(newW, newH, x, y, i);
                }
              });
            }
          }}
        />
        <Circle
          x={this.flipX ? item.x : item.x + item.w}
          y={this.flipY ? item.y + item.h : item.y}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('topRight')) {
              this.regions[item.key].topRight = node;
              this.regions[item.key].topRight.on('dragmove', () => {
                const bottomRightAttrs = this.regions[item.key].bottomRight.getAttrs();
                const topLeftAttrs = this.regions[item.key].topLeft.getAttrs();
                // console.log('resize');
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.props.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].topRight.getAttrs().x;
                const y = this.regions[item.key].topRight.getAttrs().y;
                let newW = Math.abs(itemW - ((itemX + itemW) - x));
                let newH = Math.abs((itemY + itemH) - y);
                // flip to bottom right
                if (bottomRightAttrs.y <= y && topLeftAttrs.x <= x) {
                  if (!this.flipY) this.flipY = true;
                  if (this.flipX) this.flipX = false;
                  // newH = Math.abs(y - itemY);
                  newH = Math.abs(y - bottomRightAttrs.y);
                  this.reshape(newW, newH, itemX, itemY, i);
                } else if (topLeftAttrs.x >= x && bottomRightAttrs.y >= y) {
                  // flip to top left
                  if (!this.flipX) this.flipX = true;
                  if (this.flipY) this.flipY = false;
                  // newW = Math.abs(itemX - x);
                  newW = Math.abs((itemX + itemW) - x);
                  this.reshape(newW, newH, x, y, i);
                }
                // should be bottomLeft
                else if (bottomRightAttrs.y <= y && topLeftAttrs.x >= x) {
                  if (!this.flipX) this.flipX = true;
                  if (!this.flipY) this.flipY = true;
                  newW = Math.abs((itemX + itemW) - x);
                  newH = Math.abs(itemH - ((itemY + itemH) - y));
                  this.reshape(newW, newH, x, itemY, i);
                } else {
                  if (this.flipY) this.flipY = false;
                  if (this.flipX) this.flipX = false;
                  this.reshape(newW, newH, itemX, y, i);
                }
              });
            }
          }}
        />
        <Circle
          x={this.flipX ? item.x + item.w : item.x}
          y={this.flipY ? item.y : item.y + item.h}
          stroke="#666"
          // fill="#FFFF00"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('bottomLeft')) {
              this.regions[item.key].bottomLeft = node;
              this.regions[item.key].bottomLeft.on('dragmove', () => {
                const topLeftAttrs = this.regions[item.key].topLeft.getAttrs();
                const topRightAttrs = this.regions[item.key].topRight.getAttrs();
                const bottomRightAttrs = this.regions[item.key].bottomRight.getAttrs();
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.props.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].bottomLeft.getAttrs().x;
                const y = this.regions[item.key].bottomLeft.getAttrs().y;
                let newW = Math.abs((itemX + itemW) - x);
                let newH = Math.abs(itemH - ((itemY + itemH) - y));
                // flip to top left
                if (topLeftAttrs.y >= y && bottomRightAttrs.x >= x) {
                  if (!this.flipY) this.flipY = true;
                  if (this.flipX) this.flipX = false;
                  newH = Math.abs((itemY + itemH) - y);
                  // newH = Math.abs(itemY - y);
                  this.reshape(newW, newH, x, y, i);
                } else if (bottomRightAttrs.x <= x && topLeftAttrs.y <= y) {
                  // flip to bottom right
                  if (!this.flipX) this.flipX = true;
                  if (this.flipY) this.flipY = false;
                  newW = Math.abs(itemW - ((itemX + itemW) - x));
                  // newW = Math.abs(x - bottomRightAttrs.x);
                  // this.reshape(newW, newH, itemX, itemY, i);
                  this.reshape(newW, newH, topRightAttrs.x, topRightAttrs.y, i);
                }
                // should be topRight
                else if (topLeftAttrs.y >= y && bottomRightAttrs.x <= x) {
                  if (!this.flipX) this.flipX = true;
                  if (!this.flipY) this.flipY = true;
                  newW = Math.abs(itemW - ((itemX + itemW) - x));
                  // newW = Math.abs((itemX + itemW) - x);
                  newH = Math.abs((itemY + itemH) - y);
                  this.reshape(newW, newH, itemX, y, i);
                } else {
                  if (this.flipY) this.flipY = false;
                  if (this.flipX) this.flipX = false;
                  this.reshape(newW, newH, x, itemY, i);
                }
              });
            }
          }}
        />
        <Circle
          x={this.flipX ? item.x : item.x + item.w}
          y={this.flipY ? item.y : item.y + item.h}
          stroke="#666"
          fill="#ddd"
          // fill="#9400D3"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('bottomRight')) {
              this.regions[item.key].bottomRight = node;
              this.regions[item.key].bottomRight.on('dragmove', () => {
                const topRightAttrs = this.regions[item.key].topRight.getAttrs();
                const bottomLeftAttrs = this.regions[item.key].bottomLeft.getAttrs();
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.props.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].bottomRight.getAttrs().x;
                const y = this.regions[item.key].bottomRight.getAttrs().y;
                // const newH = Math.abs(itemH - ((itemY + itemH) - y));
                let newH = Math.abs(y - itemY);
                let newW = Math.abs(itemW - ((itemX + itemW) - x));
                // if (this.bottomRight) {
                // flip to top right
                if (topRightAttrs.y >= y && bottomLeftAttrs.x <= x) {
                  if (!this.flipY) this.flipY = true;
                  if (this.flipX) this.flipX = false;
                  // topRight height calc
                  newH = Math.abs((itemY + itemH) - y);
                  // newH = Math.abs(topRightAttrs.y - y);
                  this.reshape(newW, newH, itemX, y, i);
                } else if (bottomLeftAttrs.x >= x && topRightAttrs.y <= y) {
                  // flip to bottom left
                  if (!this.flipX) this.flipX = true;
                  if (this.flipY) this.flipY = false;
                  // bottomLeft width calc
                  newW = Math.abs((itemX + itemW) - x);
                  // newW = Math.abs(bottomLeftAttrs.x - x);
                  this.reshape(newW, newH, x, itemY, i);
                }
                // after two flips in both directions, should become topLeft
                else if (topRightAttrs.y >= y && bottomLeftAttrs.x >= x) {
                  if (!this.flipX) this.flipX = true;
                  if (!this.flipY) this.flipY = true;
                  newH = Math.abs((itemY + itemH) - y);
                  newW = Math.abs((itemX + itemW) - x);
                  this.reshape(newW, newH, x, y, i);
                } else {
                  if (this.flipY) this.flipY = false;
                  if (this.flipX) this.flipX = false;
                  this.reshape(newW, newH, itemX, itemY, i);
                }
              });
            }
          }}
        />
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
          ref={(node) => {
            if (node && !this.regions.hasOwnProperty(item.key)) {
              this.regions[item.key] = { shape: node };
              this.regions[item.key].shape.on('dragmove', () => {
                // console.log('dragmove');
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.props.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].shape.getAttrs().x;
                const y = this.regions[item.key].shape.getAttrs().y;
                this.reshape(itemW, itemH, x, y, i);
              });
              this.regions[item.key].shape.on('click', () => {
                this.setState({
                  toDelete: item.key,
                });
              });
            }
          }}
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
                this.layer = node;
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
              {this.props.regionArray ? this.props.regionArray.map(item => this.addAnchor(item)) : false}
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
          /><br />
          <FlatButton
            type="submit"
            label="Save"
            primary
            href={this.layer ? this.layer.getCanvas().toDataURL('image/jpeg', 1) : ''}
            // href={this.stage ? this.stage.node.toDataURL({ pixelRatio: 1, mimeType: 'image/jpeg', quality: 0.2 }) : false}
            download={this.state.saveAsInput}
            style={{ left: '65%' }}
            // onClick={this.test}
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
