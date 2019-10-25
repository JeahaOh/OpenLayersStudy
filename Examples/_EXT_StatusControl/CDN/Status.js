//  Layers
//  const layer = new ol.layer.Tile({ source: new ol.source.Stamen({ layer: 'watercolor' }) });
const layer = new ol.layer.Tile({ source: new ol.source.OSM() });

//  The Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View ({
    zoom: 13,
    center: [649083, 5408224]
  }),
  layers: [layer]
});

const ctrl = new ol.control.Status();
map.addControl( ctrl );

map.on('postrender', function( e ) {
  let mapCntrPosi = map.getView().getCenter();
  ctrl.status({
    center: [ Math.round( mapCntrPosi[0] ), Math.round( mapCntrPosi[1] ) ],
    lonlat: ol.coordinate.toStringHDMS( ol.proj.toLonLat( mapCntrPosi ) ),
    zoom: map.getView().getZoom(),
    resolution: map.getView().getResolution().toFixed( 4 ),
    angle: Math.round( map.getView().getRotation() * 180 / Math.PI + 100) / 100,
    size: map.getSize(),
    animate: e.frameState.animate
  });
});