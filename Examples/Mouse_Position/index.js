import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {defaults as defaultControls} from 'ol/control';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

var mousePositionCtrl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});

var map = new Map({
  controls: defaultControls().extend( [mousePositionCtrl] ),
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

//var projectionSelect = $('#projection');
var projectionSelect = document.getElementById('projection');
// projectionSelect.on('change', function( e ) {
projectionSelect.addEventListener('change', function( e ) {
  console.log( e.target.value );
  mousePositionCtrl.setProjection( e.target.value );
});

// var precisionInput = $('#precision');
var precisionInput = document.getElementById('precision');
// precisionInput.on('change', function( e ){
precisionInput.addEventListener('change', function( e ) {
  var format = createStringXY( e.target.valueAsNumber );
  console.log( e.target.valueAsNumber );
  mousePositionCtrl.setCoordinateFormat( format );
});