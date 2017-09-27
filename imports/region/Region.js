import React, { Component } from 'react';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import RaisedButton from 'material-ui/RaisedButton';
import { Layer, Stage, Rect, Circle, Group } from 'react-konva';
import actions from './actions';
// import _ from 'lodash';
import ImageViewer from '../imageViewer/ImageViewer';

let startX;
let endX;
let startY;
let endY;
class Region extends Component {
  constructor(props) {
    super(props);
    this.regions = [];
    this.rect = null;
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
          x={item.x}
          y={item.y}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('topLeft')) {
              this.regions[item.key].topLeft = node;
              this.regions[item.key].topLeft.on('dragmove', () => {
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
                const newW = Math.abs((itemX + itemW) - x);
                const newH = Math.abs((itemY + itemH) - y);
                this.reshape(newW, newH, x, y, i);
              });
            }
          }}
        />
        <Circle
          x={item.x + item.w}
          y={item.y}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('topRight')) {
              this.regions[item.key].topRight = node;
              this.regions[item.key].topRight.on('dragmove', () => {
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
                const newW = Math.abs(itemW - ((itemX + itemW) - x));
                const newH = Math.abs((itemY + itemH) - y);
                this.reshape(newW, newH, itemX, y, i);
              });
            }
          }}
        />
        <Circle
          x={item.x}
          y={item.y + item.h}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('bottomLeft')) {
              this.regions[item.key].bottomLeft = node;
              this.regions[item.key].bottomLeft.on('dragmove', () => {
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
                const newW = Math.abs((itemX + itemW) - x);
                const newH = Math.abs(itemH - ((itemY + itemH) - y));
                this.reshape(newW, newH, x, itemY, i);
              });
            }
          }}
        />
        <Circle
          x={item.x + item.w}
          y={item.y + item.h}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('bottomRight')) {
              this.regions[item.key].bottomRight = node;
              this.regions[item.key].bottomRight.on('dragmove', () => {
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
                const newW = Math.abs(itemW - ((itemX + itemW) - x));
                const newH = Math.abs(itemH - ((itemY + itemH) - y));
                this.reshape(newW, newH, itemX, itemY, i);
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
        <div ref={(node) => { this.div = node; }}>
          <Stage
            id="stage"
            width={637}
            height={477}
          >
            <Layer
              id="layer"
            >
              {/* <ImageViewer /> */}
              {(this.props.mouseIsDown === 1) ? this.rect : false}
              {/* {this.state.regionArray.map(item => this.addAnchor(item))} */}
              {this.props.regionArray ? this.props.regionArray.map(item => this.addAnchor(item)) : false}
            </Layer>
          </Stage>
          <RaisedButton label="rectangle" onClick={this.init} />
          <RaisedButton label="delete" onClick={this.delete} />
        </div>
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
