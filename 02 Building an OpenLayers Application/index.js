import 'ol/ol.css';
import {Map, View} from 'ol';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [15.41, 58.82],
    zoom: 4
  }),
  target: 'map'
});