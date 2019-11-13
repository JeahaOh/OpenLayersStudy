const Map = ol.Map;
const View = ol.View;
const Draw = ol.interaction.Draw;
const Modify = ol.interaction.Modify;
const Snap = ol.interaction.Snap;
const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;
const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;
const CircleStyle = ol.style.Circle;
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;

let raster = new TileLayer({
  source: new OSM()
});

let source = new VectorSource({wrapX: false});
let vector = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
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

//  global
let draw, snap;
let typeSelect = document.getElementById('type');

let addInteractions = function() {
  let value = typeSelect.value;
  if( value !== 'None' ) {
    draw = new Draw({
      source: source,
      type: typeSelect.value
    });
    map.addInteraction( draw );
    snap = new Snap({ source: source })
    map.addInteraction( snap );
  }
}

var modify = new Modify({source: source});
map.addInteraction(modify);

typeSelect.onchange = function() {
  map.removeInteraction( draw );
  map.removeInteraction( snap );
  addInteractions();
};

addInteractions();