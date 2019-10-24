import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Draw, Modify, Snap} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';

var raster = new TileLayer({
  source: new OSM()
});

var source = new VectorSource();
var vector = new VectorLayer({
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

var map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4
  })
});

var modify = new Modify({source: source});
map.addInteraction(modify);

//  global
var draw, snap;
var typeSelect = document.getElementById('type');

function addInteractions() {
  var value = typeSelect.value;
  if (value !== 'None') {
    draw = new Draw({
      source: source,
      type: typeSelect.value
    });
    map.addInteraction(draw);
    snap = new Snap({ source: source });
    map.addInteraction( snap );
  }
  /*
  draw = new Draw({
    source: source,
    type: typeSelect.value
  });
  map.addInteraction(draw);
  snap = new Snap({ source: source });
  map.addInteraction( snap );
  */
}

//  Handle change event.
typeSelect.onchange = function() {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};

addInteractions();