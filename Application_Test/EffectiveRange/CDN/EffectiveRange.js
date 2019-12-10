let globalTemp, miningSmallArea, effectiveRange;

//  기본 맵 설정. -->
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    // url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
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
    center: ol.proj.fromLonLat([131.5, 37.4]),
    zoom: 10
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

let doInteraction = function( dist, unit ) {
  let criteria = source.getFeatureById(1111);
  console.log( criteria );
  //  소광구
  draw = new ol.interaction.Draw({
    source: null,
    type: 'Polygon'
  });
  map.addInteraction( draw );

  snap = new ol.interaction.Snap({ source: source });
  map.addInteraction( snap );

  draw.on('drawstart', function( evt ) {
    console.group('Draw Start');

    console.groupEnd('Draw Start');
  }); //  drawstart

  draw.on('drawend', function( evt ) {
    console.group('Draw End');

    miningSmallArea = evt.feature;

    if( !checkValidLocation(criteria, miningSmallArea) ) {
      alert( '소광구는 대광구 안에 속해 있어야 합니다' );
      return;
    }
    
    
    miningSmallArea.setProperties({
      'category': 'Mining Small Area'
    });
    console.log(`miningSmallArea : `);
    // console.log(miningSmallArea);
    
    //  --> 유효범위 Feature 생성
    // source.addFeature(createEffectiveRangeByTransformScale(miningSmallArea));
    let effectiveRange = createEffectiveRangeByBuffer(miningSmallArea, dist, unit);
    effectiveRange = trimPolygon( criteria, effectiveRange );
    //  <-- Feature 생성
    effectiveRange.setStyle( new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'red',
        lineDash: [3, 10],
        width: 2
      })
    }));
    
    source.addFeature( effectiveRange );
    source.addFeature( miningSmallArea );

    //  Draw End Finally End.
    map.removeInteraction( draw );
    map.removeInteraction( snap );
    console.groupEnd('Draw End');
  }); //  drawend
}   //  doInteraction

const createSmallMineLot = function(){
  // let unit = $('input[name=effective_range_unit]:checked').val();
  let unit = document.querySelector('input[name=effective_range_unit]:checked').value;
  // let dist = $('#effective_range_distance').val();
  let dist = document.getElementById('effective_range_distance').value;
  console.log( dist + unit );
  if( confirm('유효범위의 광구와의 거리는 ' + dist + ' ' + unit + '입니다.') ) {
    doInteraction(dist, unit);
  }
  // doInteraction(dist, unit);
} //  createSmallMineLot


// Miles 단위를 Kilometers 단위로 변환.
const mTk = function( miles ) {
  return miles * 1.6;
}

// Kilometers 단위를 Miles 단위로 변환.
const kTm = function( km ) {
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

//  인자로 받은 Feature를 감싸는 buffer()를 거친 Feature를 리턴.
const createEffectiveRangeByBuffer = function(mineLot, _dist, _unit) {
  console.group('createEffectiveRangeByBuffer()');

  mineLot.getGeometry().transform('EPSG:3857', 'EPSG:4326');
  let coordinates = mineLot.getGeometry().getCoordinates();
  let poly = turf.polygon(coordinates);
  let bufferedFeature = turf.buffer(poly, _dist, {units: _unit});

  let effectiveRange = new ol.format.GeoJSON().readFeatures(bufferedFeature);
  console.log(`effectiveRange : `);
  // console.log(effectiveRange[0]);
  effectiveRange = effectiveRange[0];
  effectiveRange.getGeometry().transform('EPSG:4326', 'EPSG:3857');

  mineLot.getGeometry().transform('EPSG:4326', 'EPSG:3857');

  effectiveRange.setProperties({
    'define' : 'Effective Range'
  });

  globalTemp = effectiveRange;
  console.log(globalTemp);
  console.groupEnd('createEffectiveRangeByBuffer()');
  return effectiveRange;
};  //  createEffectiveRangeByBuffer

(function(){
  coord = '';
  feature = new ol.Feature({
    geometry: new ol.geom.Polygon([[
         [14586230.111968415, 4551333.793843959]
        ,[14586230.111968415, 4478107.120746762]
        ,[14728250.11052227,  4478107.120746762]
        ,[14728250.11052227,  4551333.793843959]
        ,[14586230.111968415, 4551333.793843959]
      ]]),
  });
  feature.set('name', 'MineLot');
  feature.setId('1111');
  source.addFeature( feature );
  // console.log( feature );
  // console.log( source.getFeatures()[0] );

  // console.log( feature === source.getFeatures()[0] );
})();

/**
 * 두 폴리곤이 겹쳐있는지 확인하기 위한 함수...
 * @param {*} criteria 
 * @param {*} newArea 
 */
const checkValidLocation = function( criteria, newArea ) {
  console.group( 'checkValidLocation' );
  console.groupEnd( 'checkValidLocation' );
  // return turf.booleanContains(
  return !turf.booleanDisjoint(
    turf.polygon( criteria.getGeometry().getCoordinates() )
  , turf.polygon( newArea.getGeometry().getCoordinates() )
  );
}

const trimPolygon = function( criteria, target ) {
  console.group( 'trimPolygon' );

  // console.log( criteria );
  criteria = turf.polygon( criteria.getGeometry().getCoordinates() );
  // console.log( target );
  target = turf.polygon( target.getGeometry().getCoordinates() );

  target = turf.intersect( criteria, target );

  let rw = new ol.format.GeoJSON();
  console.groupEnd( 'trimPolygon' );
  return rw.readFeature( target );
}