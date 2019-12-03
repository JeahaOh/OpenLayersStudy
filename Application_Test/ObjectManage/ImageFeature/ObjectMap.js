//  기본 맵 설정. -->
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
  })
});

let objSource = new ol.source.Vector({wrapX: false});
let vector = new ol.layer.Vector({
  source: objSource,
});

let measureSource = new ol.source.Vector({wrapX: false});
let measureVector = new ol.layer.Vector({
  source: measureSource,
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
  }),
  controls: ol.control.defaults().extend([
    new ol.control.ZoomToExtent({
      extent: [
        14148305.929037487, 4495749.883884393,
        14149109.160882792, 4495402.038632968
      ]
    })
  ]),
});
//  <-- 기본 맵 설정.