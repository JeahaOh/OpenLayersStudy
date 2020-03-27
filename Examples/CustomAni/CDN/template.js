//import Feature from 'ol/Feature';
const Feature = ol.Feature;

//import Map from 'ol/Map';
const Map = ol.Map;

// import {unByKey} from 'ol/Observable';
const unByKey = ol.Observable.unByKey;

//import View from 'ol/View';
const View = ol.View;

// import {easeOut} from 'ol/easing';
const easeOut = ol.easing.easeOut;

// import Point from 'ol/geom/Point';
const Point = ol.geom.Point;

//import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;

// import {fromLonLat} from 'ol/proj';
const fromLonLat = ol.proj.fromLonLat;

//import {OSM, Vector as VectorSource} from 'ol/source';
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;

// import {Circle as CircleStyle, Stroke, Style} from 'ol/style';
const CircleStyle = ol.style.Circle;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;

// import {getVectorContext} from 'ol/render';
const getVectorContext = ol.render.getVectorContext;



var tileLayer = new TileLayer({
  source: new OSM({
    wrapX: false
  })
});

var map = new Map({
  layers: [tileLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
    multiWorld: false
  })
});

var source = new VectorSource({
  wrapX: false
});
var vector = new VectorLayer({
  source: source
});
map.addLayer(vector);

function addRandomFeature() {
  var x = Math.random() * 360 - 180;
  var y = Math.random() * 180 - 90;
  var geom = new Point(fromLonLat([x, y]));
  var feature = new Feature(geom);
  source.addFeature(feature);
}

var duration = 3000;
function flash(feature) {
  try {
    feature.getGeometry();
  } catch( e ) {
    feature = new ol.Feature( new ol.geom.Point(ol.proj.fromLonLat( map.getView().getCenter() )) );
  }

  var start = new Date().getTime();
  var listenerKey = tileLayer.on('postrender', animate);

  function animate(event) {
    var vectorContext = getVectorContext(event);
    var frameState = event.frameState;
    var flashGeom = feature.getGeometry();
    var elapsed = frameState.time - start;
    var elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    var radius = easeOut(elapsedRatio) * 25 + 5;
    var opacity = easeOut(1 - elapsedRatio);

    var style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity
        })
      })
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    if (elapsed > duration) {
      unByKey(listenerKey);
      return;
    }
    // tell OpenLayers to continue postrender animation
    map.render();
  }
}

source.on('addfeature', function(e) {
  flash(e.feature);
});

// window.setInterval(addRandomFeature, 1000);

// map.on('postcompose', function( evt ) {
//   console.log( evt );
// });