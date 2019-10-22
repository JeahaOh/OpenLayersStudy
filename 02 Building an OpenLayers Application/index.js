import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

var map = new Map({
  target: 'map',
  view: new View({
    projection: 'EPSG:3857', //HERE IS THE VIEW PROJECTION
    center: [15.41, 58.82],
    zoom: 2
  }),
  layers: [
    new TileLayer({
      source: new TileWMS({
        projection: 'EPSG:4326', //HERE IS THE DATA SOURCE PROJECTION
        url: 'https://ahocevar.com/geoserver/wms',
        params: {
          'LAYERS': 'ne:NE1_HR_LC_SR_W_DR'
        }
      })
    })
  ]
});