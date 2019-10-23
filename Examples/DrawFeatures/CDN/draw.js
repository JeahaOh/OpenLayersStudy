const Map = ol.Map;
const View = ol.View;
const Draw = ol.interaction.Draw;
const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;

let raster = new TileLayer({
  source: new OSM()
});

let source = new VectorSource({wrapX: false});
let vector = new VectorLayer({
  source: source
});

let map = new Map({
  layers: [
    raster,
    vector
  ],
  target: 'map',
  view: new View({
    center: [-110000000, 4600000],
    zoom: 4
  })
});

// let typeSelect = $('#type');
let typeSelect = document.getElementById('type');

let draw;
let addInteraction = function() {
  let value = typeSelect.value;
  if( value !== 'None' ) {
    draw = new Draw({
      source: source,
      type: typeSelect.value
    });
    map.addInteraction( draw );
  }
}

// typeSelect.on('change', function() {
typeSelect.onchange = function() {
  map.removeInteraction( draw );
  addInteraction();
};

addInteraction();