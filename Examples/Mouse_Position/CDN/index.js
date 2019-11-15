/**
 * ES6의 import 문을 다음과 같이 바꿀 수 있다.
  // import Map from 'ol/Map';
  const Map = ol.Map;
  // import View from 'ol/View';
  const View = ol.View;
  // import {defaults as defaultControls} from 'ol/control';
  const defaultControls = ol.control.defaults;
 */


var mousePositionCtrl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});

var map = new ol.Map({
  controls: ol.control.defaults().extend( [mousePositionCtrl] ),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  })
});



/**
 * ES6 문법을 떼고 CDN방식으로 OpenLayers를 사용하면 jQuery도 사용 가능하다.
 */
/*
var projectionSelect = $('#projection');
//  var projectionSelect = document.getElementById('projection');
projectionSelect.on('change', function( e ) {
//  projectionSelect.addEventListener('change', function( e ) {
  console.log( e.target.value );
  mousePositionCtrl.setProjection( e.target.value );
});

var precisionInput = $('#precision');
//  var precisionInput = document.getElementById('precision');
precisionInput.on('change', function( e ){
//  precisionInput.addEventListener('change', function( e ) {
  var format = ol.coordinate.createStringXY( e.target.valueAsNumber );
  console.log( e.target.valueAsNumber );
  mousePositionCtrl.setCoordinateFormat( format );
});
*/