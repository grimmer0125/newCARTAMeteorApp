import update from 'immutability-helper';
import { Meteor } from 'meteor/meteor';
import { RegionDB } from '../api/RegionDB';
import SessionManager from '../api/SessionManager';
import { mongoUpsert } from '../api/MongoHelper';

const REGION_CHANGE = 'REGION_CHANGE';

export const Actions = {
  REGION_CHANGE,
};

const DRAW = 'DRAW';
const SET_MOUSE = 'SET_MOUSE';
const SET_SHAPE = 'SET_SHAPE';
const RESHAPE = 'RESHAPE';
const DELETE = 'DELETE';

function drawShape(coordX, coordY, width, height) {
  return (dispatch, getState) => {
    // this is action.payload.data
    mongoUpsert(RegionDB, { x: coordX, y: coordY, width, height }, DRAW);
  };
}

function setMouseIsDown(val) {
  return (dispatch, getState) => {
    mongoUpsert(RegionDB, { mouseIsDown: val }, SET_MOUSE);
  };
}

function setShape(coordX, coordY, width, height) {
  return (dispatch, getState) => {
    const stateTree = getState().RegionDB;
    if (!stateTree.regionArray) {
      mongoUpsert(RegionDB, { regionArray: [{
        x: coordX,
        y: coordY,
        w: width,
        h: height,
        key: Math.floor(Math.random() * 10000),
      }] }, SET_SHAPE);
    } else {
      const newArr = stateTree.regionArray.concat({
        x: coordX,
        y: coordY,
        w: width,
        h: height,
        key: Math.floor(Math.random() * 10000),
      });
      mongoUpsert(RegionDB, { regionArray: newArr }, SET_SHAPE);
    }
  };
}
function remove(target) {
  return (dispatch, getState) => {
    const array = getState().RegionDB.regionArray;
    mongoUpsert(RegionDB, { regionArray: array.filter(item => item.key !== target) }, DELETE);
  };
}

function reshape(newW, newH, newX, newY, index) {
  return (dispatch, getState) => {
    const array = getState().RegionDB.regionArray;
    const newArray = update(array[index],
      { x: { $set: newX }, y: { $set: newY }, w: { $set: newW }, h: { $set: newH },
      });
    const data = update(array, { $splice: [[index, 1, newArray]] });
    mongoUpsert(RegionDB, { regionArray: data }, RESHAPE);
  };
}

const actions = {
  drawShape,
  setMouseIsDown,
  setShape,
  reshape,
  remove,
};

export default actions;
