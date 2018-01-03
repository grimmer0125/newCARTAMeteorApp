import api from '../api/ApiService';
import Commands from '../api/Commands';

import { ColormapDB } from '../api/ColormapDB';
import { mongoUpsert } from '../api/MongoHelper';

const COLORMAP_CHANGE = 'COLORMAP_CHANGE';

export const ActionType = {
  COLORMAP_CHANGE,
};

export function setupColormapDB() {
  api.instance().setupMongoRedux(ColormapDB, COLORMAP_CHANGE);
}

function updateColormap() {
  return (dispatch, getState) => {
    const state = getState();
    const colormapID = state.ColormapDB.colormapID;

    const cmd = `${colormapID}:${Commands.GET_COLORMAP_All_DATA}`;
    const arg = '';

    api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        console.log('colormap:resp:', resp.data);
        const { stops, colorMapName, intensity_data } = resp.data;
        const stopList = stops.split(",");    
        const min = intensity_data.intensityMin; 
        const max = intensity_data.intensityMax;     
        mongoUpsert(ColormapDB, { stops:stopList, colorMapName, min, max }, `Resp_${cmd}`);
      });
  };
}

function setupColormap() {
  return () => {
    const cmd = Commands.REGISTER_VIEWER;
    const arg = 'pluginId:Colormap,index:0';

    api.instance().sendCommand(cmd, arg)
      .then((resp) => {
        parseReigsterColormap(resp);
      });
  };
}

function parseReigsterColormap(resp) {
  const { cmd, data } = resp;
  const colormapID = data;

  mongoUpsert(ColormapDB, { colormapID }, `Resp_${cmd}`);
}

const actions = {
  updateColormap,
  setupColormap,
};

export default actions;
