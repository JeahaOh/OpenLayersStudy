let map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
      })
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([128.4, 35.7]),
    zoom: 7
  })
});