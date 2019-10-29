const Map = ol.Map;
const View = ol.View;

const click = ol.events.condition.click;
const pointerMove = ol.events.condition.pointerMove;
const altKeyOnly = ol.events.condition.altKeyOnly;

const GeoJSON = ol.format.GeoJSON;
const Select = ol.interaction.Select;

const TileLayer = ol.layer.Tile;
const VectorLayer = ol.layer.Vector;

const OSM = ol.source.OSM;
const VectorSource = ol.source.Vector;

let raster = new TileLayer({
  source: new OSM()
});

let vector = new VectorLayer({
  source: new VectorSource({
    url: 'countries.geojson',
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