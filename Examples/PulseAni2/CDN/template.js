var layer = new ol.layer.Tile({
  source: new ol.source.OSM({
    wrapX: false
  })
});

var map = new ol.Map({
  layers: [layer],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 1,
  })
});

var source = new ol.source.Vector({
  wrapX: false
});
var vector = new ol.layer.Vector({
  source: source
});
map.addLayer(vector);

function addRandomFeature() {
  var x = Math.random() * 360 - 180;
  var y = Math.random() * 180 - 90;
  var geom = new ol.geom.Point(ol.proj.fromLonLat([x, y]));
  var feature = new ol.Feature(geom);
  source.addFeature(feature);
  source.removeFeature(feature);
}

function flash(feature) {
  var duration = 3000;
  try {
    let coord = feature.getGeometry().getCoordinates();
    console.log( coord );
    // p( coord );
  } catch( e ) {
    console.log( e.message  + '\n');
    feature = new ol.Feature( new ol.geom.Point(ol.proj.fromLonLat( map.getView().getCenter() )) );
    console.log( feature.getGeometry() );
    console.log( feature.getGeometry().getCoordinates() );
  }

  // console.log( feature );
  var start = new Date().getTime();
  var listenerKey = layer.on('postrender', animate);

  function animate(event) {
    //console.log( event );
    var vectorContext = ol.render.getVectorContext(event);
    var frameState = event.frameState;
    var flashGeom = feature.getGeometry();
    var elapsed = frameState.time - start;
    var elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    var radius = ol.easing.easeIn(elapsedRatio) * 25 + 5;
    var opacity = ol.easing.easeIn(1 - elapsedRatio);

    var style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: radius,
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity
        })
      })
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    if (elapsed > duration) {
      ol.Observable.unByKey(listenerKey);
      return;
    }
    // tell OpenLayers to continue postrender animation
    map.render();
  }
}

source.on('addfeature', function(e) {
  flash(e.feature);
});

window.setInterval(addRandomFeature, 1000);


const pf = function(c) {
  const f = new ol.Feature(new ol.geom.Point(c));
  console.log( f.getGeometry() );
  f.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 40,
      points: 10,
      stroke: new ol.style.Stroke({
        color: 'red',
        width: 10
      })
    })
  }));
  map.animateFeature(f, new ol.featureAnimation.Zoom({
    fade: ol.easing.easeIn,
    duration: 4000,
  }));
}

const p = function(ll) {
  console.log( ll );
  for (let i = 0; i < 5; i++) {
    setTimeout(function () {
      pf(ll);
    }, i * 250);
  };
}