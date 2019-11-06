//  기본 맵 설정. -->
let source = new ol.source.Vector();
let vectorLayer = new ol.layer.Vector({
  source: source
});

let rasterLayer = new ol.layer.Tile({
  source: new ol.source.OSM({
    // url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
    // url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  })
});

let map = new ol.Map({
  layers: [rasterLayer, vectorLayer],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([126.979293, 37.528787]),
    zoom: 14
  })
});
//  <-- 기본 맵 설정.
//  global
let Point = ol.geom.Point;
let LineString = ol.geom.LineString;
let LinearRing = ol.geom.LinearRing;
let Polygon = ol.geom.Polygon;
let MultiPoint = ol.geom.MultiPoint;
let MultiLineString = ol.geom.MultiLineString;
let MultiPolygon = ol.geom.MultiPolygon;
//  global

//https://openlayers.org/en/master/examples/data/geojson/roads-seoul.geojson
fetch('roads-seoul.geojson').then(function( res ) {
  return res.json();
}).then(function( json ){
  format = new ol.format.GeoJSON();
  let features = format.readFeatures( json, {featureProjection: 'EPSG:3857'});

  let parser = new jsts.io.OL3Parser().inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);
  
  for (var i = 0; i < features.length; i++) {
    var feature = features[i];
    
    // convert the OpenLayers geometry to a JSTS geometry
    var jstsGeom = parser.read(feature.getGeometry());

    // create a buffer of 40 meters around each line
    var buffered = jstsGeom.buffer(40);

    // convert back from JSTS and replace the geometry on the feature
    feature.setGeometry(parser.write(buffered));
  }

  source.addFeatures(features);
});
