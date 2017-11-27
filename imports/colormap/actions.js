import api from '../api/ApiService';
import { ColormapDB } from '../api/ColormapDB';

const COLORMAP_CHANGE = 'COLORMAP_CHANGE';

export const ActionType = {
  COLORMAP_CHANGE,
};

export function setupColormapDB() {
  api.instance().setupMongoRedux(ColormapDB, COLORMAP_CHANGE);
}
