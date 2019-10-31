const Map = ol.Map;
const View = ol.View;
const Draw = ol.interaction.Draw;
const Modify = ol.interaction.Modify;
const Select = ol.interaction.Select;
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

let vector = new VectorLayer({
  source: new VectorSource(),
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
  layers: [ raster, vector ],
  target: 'map',
  view: new View({
    center: [ -11000000, 4600000 ],
    zoom: 4
  })
});

let ExampleModify = {
  init: function() {
    this.select = new Select();
    map.addInteraction( this.select );

    this.modify = new Modify({
      features: this.select.getFeatures()
    });
    map.addInteraction( this.modify );

    this.setEvents();
  },
  setEvents: function() {
    let selectedFeatures = this.select.getFeatures();

    this.select.on( 'change:active', function() {
      selectedFeatures.forEach( function( each ) {
        selectedFeatures.remove( each );
      });
    });
  },
  setActive: function( active ) {
    this.select.setActive( active );
    this.modify.setActive( active );
  }
};
ExampleModify.init();

let optionsForm = document.getElementById( 'options-form' );

let ExampleDraw = {
  init: function() {
    map.addInteraction( this.Point );
    this.Point.setActive( false );
    map.addInteraction( this.LineString );
    this.LineString.setActive( false );
    map.addInteraction( this.Polygon );
    this.Polygon.setActive( false );
    map.addInteraction( this.Circle );
    this.Circle.setActive( false );
  },
  Point: new Draw({
    source: vector.getSource(),
    type: 'Point'
  }),
  LineString: new Draw({
    source: vector.getSource(),
    type: 'LineString'
  }),
  Polygon: new Draw({
    source: vector.getSource(),
    type: 'Polygon'
  }),
  Circle: new Draw({
    source: vector.getSource(),
    type: 'Circle'
  }),
  getActive: function() {
    return this.activeType ? this[this.activeType].getActive() : false;
  },
  setActive: function( active ) {
    let type = optionsForm.elements[ 'draw-type' ].value;
    if ( active ) {
      this.activeType && this[ this.activeType ].setActive( false );
      this[ type ].setActive( true );
      this.activeType = type;
    } else {
      this.activeType && this[ this.activeType ].setActive( false );
      this.activeType = null;
    }
  }
};
ExampleDraw.init();


/**
 * Let user change the geometry type.
 * @param {Event} e Change event.
 */
optionsForm.onchange = function( e ) {
  let type = e.target.getAttribute( 'name' );
  let value = e.target.value;
  if (type == 'draw-type') {
    ExampleDraw.getActive() && ExampleDraw.setActive( true );
  } else if (type == 'interaction') {
    if (value == 'modify') {
      ExampleDraw.setActive( false );
      ExampleModify.setActive( true );
    } else if (value == 'draw') {
      ExampleDraw.setActive( true );
      ExampleModify.setActive( false );
    }
  }
};

ExampleDraw.setActive( true );
ExampleModify.setActive( false );

// The snap interaction must be added after the Modify and Draw interactions
// in order for its map browser event handlers to be fired first.
// Its handlers are responsible of doing the snapping.
let snap = new Snap({
  source: vector.getSource()
});
map.addInteraction( snap );