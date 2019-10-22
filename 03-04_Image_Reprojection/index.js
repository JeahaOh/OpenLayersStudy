import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {getCenter} from 'ol/extent';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import {transform} from 'ol/proj';
import Static from 'ol/source/ImageStatic';
import OSM from 'ol/source/OSM';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs');
register(proj4);

var imageExtent = [0, 0, 700000, 1300000];

var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new ImageLayer({
      source: new Static({
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/' +
               'British_National_Grid.svg/2000px-British_National_Grid.svg.png',
        crossOrigin: '',
        projection: 'EPSG:27700',
        imageExtent: imageExtent
      })
    })
  ],
  target: 'map',
  view: new View({
    center: transform( getCenter(imageExtent), 'EPSG:27700', 'EPSG:3857'),
    zoom: 4
  })
});