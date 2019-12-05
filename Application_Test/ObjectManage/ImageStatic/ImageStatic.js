/**
 * ImageStatic을 4각형 Polygon과 함께 그리는 Function.
 */
const drawImageStatic = function() {
  let imgSttDraw = new ol.interaction.Draw({
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

  /**
   * Polygon을 다 그린 후, Polygon의 좌표에서 동서남북의 좌표를 구한 뒤,
   * 동서남북의 좌표를 가지고 ImageStatic Layer를 그린다.
   */
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
    /**
     * [left, bottom, right, top] = [서, 남, 동, 북]
     * lat에서 제일 낮은 좌표가 최 서단
     * lon에서 제일 낮은 좌표가 최 남단
     */
    console.log( coords = [
        latLi[0],
        lonLi[0],
        latLi[ latLi.length - 1 ],
        lonLi[ lonLi.length - 1 ],
      ]
    );
  
    // var imageLayer = ;
    map.addLayer(new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '/Application_Test/ObjectManage/imageStatic/img/test.png',
        crossOrigin: 'anonymous',
        projection: 'EPSG:4326',
        imageExtent: coords
      })
    }));
  });
}