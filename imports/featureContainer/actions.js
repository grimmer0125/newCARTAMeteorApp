import { FeatureContainerDB } from '../api/FeatureContainerDB';
import { mongoUpsert } from '../api/MongoHelper';
import api from '../api/ApiService';

const FEATURE_CHANGE = 'FEAUTRE_CHANGE';

export const ActionType = {
  FEATURE_CHANGE,
};

const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const SET_DRAG = 'SET_DRAG';
const _ = require('lodash');

export function setupFeatureContainerDB() {
  api.instance().setupMongoRedux(FeatureContainerDB, FEATURE_CHANGE);
}
function onAddItemDB(data) {
  return (dispatch, getState) => {
    const stateTree = getState().FeatureContainerDB;
    if (!stateTree.items) {
      mongoUpsert(FeatureContainerDB, { items: [{
        i: `${Math.floor(Math.random() * 10000)}`,
        x: 0,
        y: Infinity, // puts it at the bottom
        w: 1,
        h: 2,
        type: data,
        isResizable: false,
      }],
      }, ADD_ITEM);
    } else {
      stateTree.items.push({
        i: `${Math.floor(Math.random() * 10000)}`,
        x: 0,
        y: Infinity, // puts it at the bottom
        w: 1,
        h: 2,
        type: data,
        isResizable: false,
      });
      mongoUpsert(FeatureContainerDB, { items: stateTree.items }, ADD_ITEM);
    }
  };
}
function onRemoveItemDB(key) {
  return (dispatch, getState) => {
    const stateTree = getState().FeatureContainerDB;
    mongoUpsert(FeatureContainerDB, { items: _.reject(stateTree.items, { i: key }) }, REMOVE_ITEM);
  };
}
function onDragStopDB(event) {
  return (dispatch, getState) => {
    const stateTree = getState().FeatureContainerDB;
    for (let i = 0; i < event.length; i += 1) {
      stateTree.items[i].y = event[i].y;
    }
    mongoUpsert(FeatureContainerDB, { items: stateTree.items }, SET_DRAG);
  };
}
const actions = {
  onAddItemDB,
  onRemoveItemDB,
  onDragStopDB,
};

export default actions;
