//  Global
let imgSttDraw;
const imgDir = '/Application_Test/ObjectManage/imgSttObject/img/';

const drawImageStatic = function() {
  imgSttDraw = new ol.interaction.Draw({
    source: objSource,
    type: 'Circle',
    geometryFunction: function( coordinates, geometry ) {
      let start = coordinates[0];
      let end = coordinates[1];
    
      coordinates = [[start, [start[0], end[1]], end, [end[0], start[1]], start]];
      if( !geometry ) {
        geometry = new ol.geom.Polygon(coordinates);
      } else {
        geometry.setCoordinates(coordinates);
      }
      return geometry;
    }
  });

  map.addInteraction( imgSttDraw );

  imgSttDraw.on('drawend', ( evt ) => {
    map.removeInteraction( imgSttDraw );

    let coords = evt.feature.getGeometry().getCoordinates()[0];
    let latLi = [];
    let lonLi = [];

    for( c in coords ) {
      coords[c] = ol.proj.transform( coords[c], 'EPSG:3857', 'EPSG:4326' );
      latLi.push( coords[c][0] );
      lonLi.push( coords[c][1] );
    }
    // console.log( coords );
    latLi.sort();
    lonLi.sort();
    //   [left, bottom, right, top] 
    //  서 남 동 북
    //  위 lat 경 lon
    //  동경 서경
    //  북위 남위
    coords =
      [
        latLi[0],
        lonLi[0],
        latLi[ latLi.length - 1 ],
        lonLi[ lonLi.length - 1 ],
      ];
    console.log( coords );
  
    var imageLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/Application_Test/ObjectManage/imageStatic/img/test.png',
        crossOrigin: 'anonymous',
        projection: 'EPSG:4326',
        imageExtent: coords
      })
    });
    map.addLayer(imageLayer);

  });
}