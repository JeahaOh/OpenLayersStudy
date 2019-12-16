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
    
    // --> feature를 3미터 띄운 feature'를 만든다
    console.group('Duplicate Line');
    feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
    
    let clone = turf.lineString(feature.getGeometry().getCoordinates());
    //  line 사이의 거리와 단위를 지정한다.
    clone = turf.lineOffset( clone, 3, { units: 'meters' } );
  
    clone = new ol.format.GeoJSON().readFeatures( clone )[0];
    // console.log( clone );
    
    clone.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    console.groupEnd('Duplicate Line');
    // <-- feature를 3미터 띄운 feature'를 만든다

    let range = [
      feature.getGeometry().getCoordinates()[0]
      ,clone.getGeometry().getCoordinates()[0]
      ,clone.getGeometry().getCoordinates()[1]
      ,feature.getGeometry().getCoordinates()[1]
      ,feature.getGeometry().getCoordinates()[0]
    ];
    // console.log(range);

    //  --> Polygon으로 바꾼다.
    console.group('Lines To Polygon');
    range = new ol.Feature({
      geometry: new ol.geom.Polygon( [range] ),
      name: 'Point Collector'
    });
    console.groupEnd('Lines To Polygon');
    //  <-- Polygon으로 바꾼다.



    let area = toWKT(range)
    console.log( area );
    source.addFeature(range);
    
    // range = range.getGeometry().getCoordinates();
    // console.log(range);

    range.setStyle( new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.2)',
        width: 1
      })
    }) );
    range.setProperties({
      'category': 'Point Collector'
    });


    //  Draw End Finally End.
    map.removeInteraction( draw );
    map.removeInteraction( snap );
    console.groupEnd('Draw End');
  }); //  drawend
}   //  lineToSquare

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
 * WKT 문자열로 서버에 데이터를 요청한다.
 * 
 */