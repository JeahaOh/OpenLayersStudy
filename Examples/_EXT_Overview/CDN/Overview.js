//  Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 15,
    center: [ 270148, 6247782 ]
  }),
  layers: [ new ol.layer.Tile({ source: new ol.source.Stamen({ layer: 'watercolor' }) }) ]
});

//  Layer for Overview
const ovLayer = [
  new ol.layer.Tile({ source: new ol.source.OSM() }),
  new ol.layer.Tile({
    source: new ol.source.Stamen({
      layer: 'toner'
    })
  })
];

//  New Control on the Map
const ov = new ol.control.Overview({
  layers: ovLayer,
  minZoom: $('#minzoom').val(),
  maxZoom: $('#maxzoom').val(),
  rotation: $('#rotate').prop('checked'),
  align: $('#align').val(),
  panAnimation: 'elastic'
});
map.addControl( ov );

//  New Control outsite the Map (styled)
const outerOv = new ol.control.Overview({
  target: $('.overview').get(0),
  layers: ovLayer,
  minZoom: $('#minzoom').val(),
  maxZoom: $('#maxzoom').val(),
  rotation: $('#rotate').prop('checked'),
  style: [
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba( 0, 255, 102, 1)'
        }),
        stroke: new ol.style.Stroke( {
          width: 7,
          color: 'rgba( 0, 255, 102, 0.8)'
        }),
        radius: 5
      }),
      stroke: new ol.style.Stroke({
        width: 3,
        color: 'rgba( 0, 255, 102, 1)',
        lineDash: [ 5, 5 ]
      })
    })
  ]
});

map.addControl( outerOv );

//  Option Changes
const setOVLayer = function( e ) {
  // console.log( e )
  // console.log( e.value )
  ov.getOverviewMap().getLayers().getArray()[ $(e).val()].setVisible( true );
  ov.getOverviewMap().getLayers().getArray()[ 1 - $(e).val()].setVisible( false );
}

$('#rotate').on('change', function() {
  ov.rotation = outerOv.rotation = $('#rotate').prop('checked');
  ov.setView();
  outerOv.setView();
});

$('#minzoom').on('change', function() {
  ov.minZoom = outerOv.minZoom = Number( $('#minzoom').val() );
  ov.setView();
  outerOv.setView();
});

$('#maxzoom').on('change', function() {
  ov.maxZoom = outerOv.maxZoom = Number( $('#maxzoom').val() );
  ov.setView();
  outerOv.setView();
});