var source = new ol.source.Vector();
var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    new ol.layer.Vector({
      source: source
    })
  ],
  target: document.getElementById('map'),
  view: new ol.View({
    center: ol.proj.fromLonLat([126.980366, 37.526540]),
    zoom: 15
  })
});



fetch('roads-seoul.geojson').then(function(response) {
  return response.json();
}).then(function(json) {
  var format = new ol.format.GeoJSON();
  var features = format.readFeatures(json);
  var street = features[0];
  console.log(`street : `);
  console.log(street);

  // convert to a turf.js feature
  var turfLine = format.writeFeatureObject(street);
  console.log(`turfLine : `);
  console.log(turfLine);

  // show a marker every 200 meters
  var distance = 0.2;

  // get the line length in kilometers
  var length = turf.lineDistance(turfLine, 'kilometers');
  console.log(`length : `);
  console.log(length);

  console.group( 'loop');
  var cnt = 0;
  for (var i = 1; i <= length / distance; i++) {
    var turfPoint = turf.along(turfLine, i * distance, 'kilometers');

    // convert the generated point to a OpenLayers feature
    var marker = format.readFeature(turfPoint);
    console.log('marker');
    console.log(marker);

    marker.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    source.addFeature(marker);
    cnt++;
  }
  console.log('loop count : ' + cnt);
  console.groupEnd();

  street.getGeometry().transform('EPSG:4326', 'EPSG:3857');
  source.addFeature(street);
});
