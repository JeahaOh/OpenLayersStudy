import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {click, pointerMove, altKeyOnly} from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';

let raster = new TileLayer({
  source: new OSM()
});

let vector = new VectorLayer({
  source: new VectorSource({
    // url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
    url: 'countries.json',
    format: new GeoJSON()
  })
});

let map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

// ref to currentrly selected interaction
let select = null;

// select interaction working on 'singleclick'
let selectSingleClick = new Select();

// select interaction working on 'click'
let selectClick = new Select({
  condition: click
});

// select interaction working on 'pointer move'
let selectPointerMove = new Select({
  condition: pointerMove
});

let selectAltClick = new Select({
  condition: function( mapBrowserEvent ) {
    return click( mapBrowserEvent ) && altKeyOnly( mapBrowserEvent );
  }
});

let selectElement = document.getElementById( 'type' );

const changeInteraction = function() {
  if( select !== null ) {
    map.removeInteraction( select );
  }

  let value = selectElement.value;
  switch( value ) {
    case 'singleclick' :
      select = selectSingleClick;
      break;
    case 'click' :
      select = selectClick;
      break;
    case 'pointermove' :
      select = selectPointerMove;
      break;
    case 'altclick' :
      select = selectAltClick;
      break;
    default: 
      select = null;
  }

  if( select !== null ) {
    map.addInteraction( select );
    select.on('select', function( evt ) {
      document.getElementById('status').innerHTML = '&nbsp;' +
        evt.target.getFeatures().getLength() +
        ' Selected Features (last operation selected ' + evt.selected.length +
        ' and deseletected ' + evt.deselected.length + ' Features)';
    });
  }
};

//  onchange callback on the select element.
selectElement.onchange = changeInteraction;
changeInteraction();