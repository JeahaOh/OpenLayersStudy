//  기본 맵 설정. -->
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    // url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
    // url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  })
});

let source = new ol.source.Vector({wrapX: false});
let vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#000000',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});

let map = new ol.Map({
  layers: [
    raster,
    vector
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([128.4, 35.7]),
    zoom: 7
  })
});
//  <-- 기본 맵 설정.





let lineToSquare = function() {
  draw = new ol.interaction.Draw({
    source: null,
    type: 'LineString',
    maxPoints: 2
  });
  map.addInteraction( draw );
  
  snap = new ol.interaction.Snap({ source: source });
  map.addInteraction( snap );

  draw.on('drawend', function( evt ) {
    console.group('Draw End');

    let feature = evt.feature;
    // console.log(`feature : `);
    // console.log(feature);
    
    let clone = duplicateLine( feature );

    let originCoords = feature.getGeometry().getCoordinates();
    // console.log(originCoords);
    let cloneCoords = clone.getGeometry().getCoordinates();
    // console.log(cloneCoords);
    let range = [];
    
    range.push(originCoords[0]);
    range.push(cloneCoords[0]);
    range.push(cloneCoords[1]);
    range.push(originCoords[1]);
    range.push(originCoords[0]);

    // console.log(range);

    range = createPoly(range);

    let area = toWKT(range)
    console.log( area );
    source.addFeature(range);
    
    // range = range.getGeometry().getCoordinates();
    // console.log(range);


    //  Draw End Finally End.
    map.removeInteraction( draw );
    map.removeInteraction( snap );
    console.groupEnd('Draw End');
  }); //  drawend
}   //  lineToSquare

const duplicateLine = function( originLineString ){
  console.group('Duplicate Line');
  originLineString.getGeometry().transform('EPSG:3857', 'EPSG:4326');
  
  let clone = turf.lineString(originLineString.getGeometry().getCoordinates());
  //  line 사이의 거리와 단위를 지정한다.
  clone = turf.lineOffset( clone, 3, { units: 'meters' } );

  // clone = turf.lineOffset( clone, 100 );
  // console.log( clone );
  clone = new ol.format.GeoJSON().readFeatures(clone);
 
  clone[0].getGeometry().transform('EPSG:4326', 'EPSG:3857');
  originLineString.getGeometry().transform('EPSG:4326', 'EPSG:3857');
  console.groupEnd('Duplicate Line');
  return clone[0];
}

const createPoly = function( coords ) {
  console.group('Lines To Polygon');
  let feature = new ol.Feature({
    geometry: new ol.geom.Polygon( [coords] ),
    name: 'Point Collector'
  });

  // console.log(feature);
  // console.log(feature.getGeometry().getCoordinates());
  
  feature.setStyle( new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 0, 0.2)',
      width: 1
    })
  }) );
  feature.setProperties({
    'category': 'Point Collector'
  });
  
  console.groupEnd('Lines To Polygon');
  return feature;
}


/**
 * feature를 WKT로 변환함.
 */
let toWKT = function (feature) {
  return (new ol.format.WKT()).writeFeature(feature);
}

/**
 * 로직
 * LineString을 그린다.
 * LineString을 복제한다.
 * 두 라인을 Polygon으로 바꾼다
 * WKT 문자열로 리턴한다.
 */