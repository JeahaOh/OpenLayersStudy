// Layers
const stamen = new ol.layer.Tile({
  source: new ol.source.Stamen({ layer: 'toner' })
});

// Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 5,
    center: [ 279791, 6247637 ]
  }),
  layers: [ stamen, ]
});

const vector = new ol.layer.Vector({
  source: new ol.source.Vector()
});
map.addLayer( vector );

const draw = new ol.interaction.Draw({
  type: 'Point',
  source: vector.getSource()
});
map.addInteraction( draw );

draw.on('drawend', function( e ) {
  let div = $('<div>').text('One Feature added to the map - ');
  $('<a>').text( 'cancel' )
  .click( function() {
    vector.getSource().removeFeature( e.feature );
    notification.hide();
  })
  .appendTo( div );
  notification.show( div.get(0) );
});

// Control
const notification = new ol.control.Notification({ });
map.addControl( notification );