let globalTemp;
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
      color: '#ffeeee',
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

//  line을 주면 line의 실제 거리를 계산해서 반환한다.
const formatLength = function ( line ) {
  var length = ol.Sphere.getLength(line);
  var output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
      ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
      ' ' + 'm';
  }
  return output;
};
//  line을 주면 line의 실제 거리를 계산해서 반환한다.

//  global
let draw, snap;
//  Line을 그리면 사각형으로 변환한 geometry를 반환한다.
let squareFunction = function( coordinates, geometry ) {
  if( !geometry ) {
    geometry = new ol.geom.Polygon(null);
  }
  let start = coordinates[0];
  let end = coordinates[1];

  geometry.setCoordinates([
    [start, [start[0], end[1]], end, [end[0], start[1]], start]
  ]);
  return geometry;
}

let doInteraction = function(dist, unit) {
  draw = new ol.interaction.Draw({
    source: source,
    // type: 'Polygon'
    type: 'LineString',
    geometryFunction: squareFunction,
    maxPoints: 2
  });
  map.addInteraction( draw );
  snap = new ol.interaction.Snap({ source: source });
  map.addInteraction( snap );

  draw.on('drawstart', function( evt ) {
    console.group('Draw Start');
    // let sketch = evt.feature;

    // console.log(sketch.getGeometry());
    // sketch.getGeometry().on('change', function( evt ){
    //   console.group('Sketch on change');
    //   let geom = evt.target;
    //   console.log('geom : ');
    //   console.log(geom);

    //   let coord = geom.getLastCoordinate();
    //   console.log('coord : ');
    //   console.log( coord );

    //   let output = formatLength( geom );
    //   console.log('output : ');
    //   console.log( output );

    //   overlayPopupElement.innerHTML = output;
    //   overlayPopup.setPosition( geom.getLastCoordinates() );
    //   console.groupEnd();
    // });

    console.groupEnd('Draw Start');
  }); //  drawstart

  draw.on('drawend', function( evt ) {
    console.group('Draw End');

    let currentFeature = evt.feature;
    evt.feature.setProperties({
      'category': 'Effective Range Test'
    });
    console.log(`currentFeature : `);
    console.log(currentFeature);
    
    
    
    
    var coordinates = currentFeature.getGeometry().getCoordinates();
    console.log(`coordinates : `);
    console.log(coordinates);

    //  Feature의 정 중앙 좌표를 가져오는 함수.
    console.log(`currentFeature.getGeometry().getInteriorPoint().A : `);
    console.log(currentFeature.getGeometry().getInteriorPoint().A);

    
    var centerPoint = [
      currentFeature.getGeometry().getInteriorPoint().A[0],
      currentFeature.getGeometry().getInteriorPoint().A[1]
    ];

    console.log( centerPoint );

    drawPoint(centerPoint);


    
    // currentFeature를 복제.
    // globalTemp = currentFeature.clone();
    // globalTemp.getGeometry().getInteriorPoint();
    // globalTemp.getGeometry().getInteriorPoint().A;
    // globalTemp.move(14353284.021767769, 4109346.378107986)



    
    // var coordinate = coordinates[0];
    // console.log(coordinate[0]);

    // var point1_X = coordinate[0][0];
    // var point1_Y = coordinate[0][1];

    // var point2_X = coordinate[1][0];
    // var point2_Y = coordinate[1][1];

    // var point3_X = coordinate[2][0];
    // var point3_Y = coordinate[2][1];

    // var point4_X = coordinate[3][0];
    // var point4_Y = coordinate[3][1];


    //  Draw End Finally End.
    map.removeInteraction( draw );
    map.removeInteraction( snap );
    console.groupEnd('Draw End');
  }); //  drawend
}   //  doInteraction

const createEffectiveRange = function(){
  // let unit = $('input[name=effective_range_unit]:checked').val();
  let unit = document.querySelector('input[name=effective_range_unit]:checked').value;
  // let dist = $('#effective_range_distance').val();
  let dist = document.getElementById('effective_range_distance').value;
  console.log( dist + unit );
  // if( confirm('유효범위의 광구와의 거리는 ' + dist + unit + '입니다.') ) {
  //   doInteraction(dist, unit);
  // }
  doInteraction(dist, unit);
} //  createEffectiveRange


// Miles 단위를 Kilometers 단위로 변환.
const mTk = function(miles) {
  return miles * 1.6;
}

// Kilometers 단위를 Miles 단위로 변환.
const kTm = function(km) {
  return km / 1.6;
}
//  [14365024.794099694, 4219904.888355112] ('EPSG:4326')형식으로 좌표가 들어오면,
//  그 지점에 Point Feature를 찍어주는 함수.
const drawPoint = function(coord) {
  console.group('Draw Point Func');
  console.log(coord)
  let point = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat(coord, 'EPSG:4326', 'EPSG:3857')
    )
  });
  point.setStyle( new ol.style.Style({
    image: new ol.style.Circle({
      radius: 3,
      fill: new ol.style.Fill({
        color: '#000000'
      })
    }),
    fill: new ol.style.Fill({
      color: '#000000'
    }),
    stroke: new ol.style.Stroke({
      color: '#000000',
      width: 2
    })
  }) );
  source.addFeature( point );
  console.groupEnd('Draw Point Func');
};  //  drawPoint