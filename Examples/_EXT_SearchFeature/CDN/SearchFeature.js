// Layers
const layers = [
  new ol.layer.Tile({
    title: 'terrain-background',
    source: new ol.source.Stamen({ layer: 'terrain' })
  })
]

// The Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 5,
    center: [ 166326, 5992663 ]
  }),
  interaction: ol.interaction.defaults({ altShiftDragRotate: false, pinchRotate: false }),
  layers: layers
});

// GeoJSON Layer
const vectorSource = new ol.source.Vector({
  url: 'https://viglino.github.io/ol-ext/examples/data//fond_guerre.geojson',
  projection: 'EPSG:3857',
  format: new ol.format.GeoJSON(),
  attribution: [],
  logo: ''
});

map.addLayer( new ol.layer.Vector({
  name: 'Fonds de guerre 14-18',
  source: vectorSource,
  style: new ol.style.Style({ image: new ol.style.Icon({ src: './camera.png', scale: 0.8}) })
}));

// Control Select
const select = new ol.interaction.Select({});
map.addInteraction( select );

// Set the control grid reference
let search = new ol.control.SearchFeature({
  source: vectorSource,
  property: $('.options select').val()
});
map.addControl( search );

// Select Featur When Click On The Reference Index
search.on('select', function( e ) {
  console.log( 'e : ' + e );
  select.getFeatures().clear();
  select.getFeatures().push( e.search );
  var p = e.search.getGeometry().getFirstCoordinate();
  console.log( 'p : ' + p );
  map.getView().animate({ center: p });
});