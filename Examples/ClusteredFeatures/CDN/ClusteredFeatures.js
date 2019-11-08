let distance = $('#distance');

let count = 20000;
let features = new Array(count);

let e = 4500000;
for( var i = 0; i < count; i++ ) {
  let coordinates = [ 2 * e * Math.random() - e, 2 * e * Math.random() - e ];
  features[i] = new ol.Feature( new ol.geom.Point( coordinates ));
  features[i].setProperties({
    'no' : i
  });
  // console.log(features[i].getProperties());
}

let source = new ol.source.Vector({
  features: features
});

let clusterSource = new ol.source.Cluster({
  distance: parseInt(distance.value, 10),
  source: source
});

let styleCache = {};
let clusters = new ol.layer.Vector({
  source: clusterSource,
  style: function( feature ) {
    let size = feature.get('features').length;
    let style = styleCache[size];
    if( !style ) {
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          stroke: new ol.style.Stroke({
            color: '#fff'
          }),
          fill: new ol.style.Fill({
            color: '#3399cc'
          })
        }),
        text: new ol.style.Text({
          text: (size.toString()),
          fill: new ol.style.Fill({
            color: '#fff'
          })
        })
      });
      styleCache[size] = style;
    }
    return style;
  }
});

let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    // url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
  })
});

let map = new ol.Map({
  layers: [ raster, clusters ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 0
  })
});

distance.on('change', function() {
  clusterSource.setDistance(parseInt(distance.val(), 10));
});

(function(){
  clusterSource.setDistance(parseInt(distance.val(), 10));
})();