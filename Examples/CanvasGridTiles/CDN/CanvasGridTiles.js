const Map = new ol.Map();
//const View = new ol.View();
// const TileLayer = new ol.layer.Tile();
// const OSM = new ol.source.OSM()
// const TileDebug = new ol.source.TileDebug();

const map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    new ol.layer.Tile({
      source: new ol.source.TileDebug()
    })
  ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 1
  })
});