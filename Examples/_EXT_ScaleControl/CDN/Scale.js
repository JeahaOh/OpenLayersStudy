//  Layers
const stamen = new ol.layer.Tile({
  source: new ol.source.Stamen({ layer: 'watercolor' })
});

//  Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 14,
    center: [ 270701, 6247637 ]
  }),
  //  layers: [ stamen ]
  layers : [ new ol.layer.Tile({ source: new ol.source.OSM() }) ]
});

//  Control
const ctrl = new ol.control.Scale({ });
map.addControl( ctrl );
map.addControl( new ol.control.ScaleLine() );

const setDiagonal = function( val ) {
  let res = Math.sqrt(
    window.screen.width * window.screen.width + window.screen.height * window.screen.height
  ) / val;
  res = Math.round( res );
  $('#ppi').val( res );
  ctrl.set( 'ppi', res );
  ctrl.setScale();
}