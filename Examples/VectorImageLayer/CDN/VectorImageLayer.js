const Map = ol.Map;
const View = ol.View;
const GeoJSON = ol.format.GeoJSON;
const VectorImageLayer = ol.layer.VectorImage;
const VectorLayer = ol.layer.Vector;
const VectorSource = ol.source.Vector;
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;
const Text = ol.style.Text;


var style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text()
});

var map = new Map({
  layers: [
    new VectorImageLayer({
      imageRatio: 2,
      source: new VectorSource({
        url: 'countries.geojson',
        format: new GeoJSON()
      }),
      style: function( feature ) {
        style.getText().setText( feature.get('name') );
        return style;
      }
    })
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1
  })
});

var featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: '#f00',
      width: 1
    }),
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.1)'
    })
  })
});

var highlight;
var displayFeatureInfo = function( pixel ) {

  map.getLayers().item(0).getFeatures( pixel ).then( function( features ) {
    var feature = features.length > 0 ? features[0] : undefined;

    var info = document.getElementById('info');
    if (feature) {
      info.innerHTML = feature.getId() + ' : ' + feature.get('name');
    } else {
      info.innerHTML = '&nbsp;';
    }

    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
      }
      if (feature) {
        featureOverlay.getSource().addFeature(feature);
      }
      highlight = feature;
    }
  });
};

map.on('pointermove', function(evt) {
  if (!evt.dragging) {
    displayFeatureInfo(evt.pixel);
  }
});

map.on('click', function(evt) {
  displayFeatureInfo(evt.pixel);
});