//  Layers
const layers = [ new ol.layer.Tile({ source: new ol.source.OSM() }) ];

//  The Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 17,
    center: [269766, 6248649]
  }),
  controls: ol.control.defaults({ "attribution": false }),
  layers: layers
});

//  New Vector Layer
const vector = new ol.layer.Vector({
  name: 'Vecteur',
  source: new ol.source.Vector({ features: new ol.Collection() }),
});
map.addLayer( vector );

const drawi = new ol.interaction.Draw({
  source: vector.getSource(),
  type: 'Polygon'
});
map.addInteraction( drawi );

const modi = new ol.interaction.Modify({ source: vector.getSource() });
map.addInteraction( modi );

const snapi = new ol.interaction.SnapGuides();
snapi.setDrawInteraction( drawi );
snapi.setModifyInteraction( modi );
map.addInteraction( snapi );

//  New guide on meridian
const addMeridian = function( val ) {
  var p1 = ol.proj.transform( [ val || 0, 1], 'EPSG:4326', map.getView().getProjection());
  var p2 = ol.proj.transform( [ val || 0,-1], 'EPSG:4326', map.getView().getProjection());
  snapi.addGuide([ p1, p2 ]);
};

//  Switch initial condition
const setInitial = function( val ) {
  snapi.enableInitialGuides_ = val;
};