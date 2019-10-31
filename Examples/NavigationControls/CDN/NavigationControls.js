const Map = ol.Map;
const View = ol.View;
const defaultControls = ol.control.defaults;
const ZoomToExtent = ol.control.ZoomToExtent;
const TileLayer = ol.layer.Tile;
const OSM = ol.source.OSM;

const map = new Map({
  controls: defaultControls().extend([
    new ZoomToExtent({
      extent: [
        813079.7791264898, 5929220.284081122,
        848966.9639063801, 5936863.986909639
      ]
    })
  ]),
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});