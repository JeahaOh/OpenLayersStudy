//  기본 맵 설정. -->
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    // url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
  })
});

let source = new ol.source.Vector({wrapX: false});
let vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffeeee',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});

let map = new ol.Map({
  layers: [
    raster,
    vector
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([128.4, 35.7]),
    zoom: 7
    
  })
});
//  <-- 기본 맵 설정.

//  Global var
let status = false;
let depthData;

const drawPoint = function(coord, depth) {
  console.group('Draw Point Func');
  console.log(coord)
  let point = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat(coord, 'EPSG:4326', 'EPSG:3857')
    )
  });
  point.setStyle( new ol.style.Style({
    image: new ol.style.Circle({
      radius: 3,
      fill: new ol.style.Fill({
        color: '#000000'
      })
    }),
    fill: new ol.style.Fill({
      color: '#000000'
    }),
    stroke: new ol.style.Stroke({
      color: '#000000',
      width: 2
    })
  }) );
  source.addFeature( point );
  console.groupEnd('Draw Point Func');
};  //  drawPoint

(function(){
  console.log('onload');
  $.ajax({
    url: '/Application_Test/DepthOfWaterData/CDN/2006.json',
    type: 'GET',
    dataType: 'text',
    success: function( data ) {
      console.log('success : ');
      depthData = data;
      status = true;
    }
  });
  console.log('ajax end');
})();

const showDepthData = function() {
  depthData = (new ol.format.GeoJSON()).readFeatures(depthData);
  // source.addFeatures(depthData);
  for( var i = 0; i <= depthData.length; i++ ) {
    if( depthData[i] ) {
      depthData[i].getGeometry().transform('EPSG:900913', 'EPSG:3857');
      console.log( depthData[i].getGeometry().getCoordinates() );
    }
  }

  // let vectorSource = new ol.source.Vector({
  //   features: depthData
  // });
  source.addFeature( new ol.Feature( new ol.geom.Circle([5e6, 7e6], 1e6)));


}