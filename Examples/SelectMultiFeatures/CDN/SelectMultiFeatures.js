const Map = ol.Map;
const View = ol.View;
const GeoJSON = ol.format.GeoJSON;
const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;
const Style = ol.style.Style;
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;

let raster = new TileLayer({
  source: new OSM()
});

let vector = new VectorLayer({
  source: new VectorSource({
    url: 'countries.geojson',
    format: new GeoJSON()
  })
});

var highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.7)'
  }),
  stroke: new Stroke({
    color: '#3399CC',
    width: 3
  })
});

let map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    multiworld: true
  })
});

var selected = [];

map.on('singleclick', function( e ) {
  map.forEachFeatureAtPixel( e.pixel, function( f ) {
    var selIndex = selected.indexOf( f );
    if( selIndex < 0 ) {
      selected.push( f );
      f.setStyle( highlightStyle );
    } else {
      selected.splice( selIndex, 1 );
      f.setStyle( undefined );
    }
  });

  document.getElementById('status').innerHTML = ( '&ensp;' + selected.length + ' seelected features.');
});