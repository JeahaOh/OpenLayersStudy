import 'ol/ol.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import {toStringHDMS} from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import {fromLonLat, toLonLat} from 'ol/proj';
import OSM from 'ol/source/OSM';

let layer = new TileLayer({
  source: new OSM()
});

let map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

let pos = fromLonLat( [13.3725, 48.208889] );

// Vienna marker
let marker = new Overlay({
  position: pos,
  positioning: 'center-center',
  element: document.getElementById('marker'),
  stopEvent: false
});
map.addOverlay( marker );

// Vienna label
let vienna = new Overlay({
  position: pos,
  element: document.getElementById('vienna')
});
map.addOverlay( vienna );

// Popup Showing the Position the user clicked
let popup = new Overlay({
  element: document.getElementById('popup')
});
map.addOverlay( popup );

map.on('click', function( evt ) {
  let element = popup.getElement();
  let coordinate = evt.coordinate;
  let hdms = toStringHDMS( toLonLat(coordinate) );

  $(element).popover('destroy');
  popup.setPosition( coordinate );
  $(element).popover({
    placement: 'top',
    animation: false,
    html: true,
    content: '<p>The Location You Cliked was : </p><code>' + hdms + '</code>'
  });
  $(element).popover('show');
});
