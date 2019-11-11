//  Random Point Logic -->
let distance = $('#distance');
let count = 20000;
let features = new Array(count);

let e = 4500000;
for( var i = 0; i < count; i++ ) {
  let coordinates = [ 2 * e * Math.random() - e, 2 * e * Math.random() - e ];
  features[i] = new ol.Feature( new ol.geom.Point( coordinates ));
  features[i].setProperties({
    'no' : i
  });
  // console.log(features[i].getProperties());
}

let source = new ol.source.Vector({
  features: features
});

let clusterSource = new ol.source.Cluster({
  distance: parseInt(distance.value, 10),
  source: source
});

let styleCache = {};
let clusters = new ol.layer.Vector({
  source: clusterSource,
  style: function( feature ) {
    let size = feature.get('features').length;
    let style = styleCache[size];
    if( !style ) {
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          stroke: new ol.style.Stroke({
            color: '#fff'
          }),
          fill: new ol.style.Fill({
            color: '#3399cc'
          })
        }),
        text: new ol.style.Text({
          text: (size.toString()),
          fill: new ol.style.Fill({
            color: '#fff'
          })
        })
      });
      styleCache[size] = style;
    }
    return style;
  }
});

let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    // url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
  })
});

let map = new ol.Map({
  layers: [ raster, clusters ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 0
  })
});

distance.on('change', function() {
  clusterSource.setDistance(parseInt(distance.val(), 10));
});

(function(){
  clusterSource.setDistance(parseInt(distance.val(), 10));
})();

// <-- Random Point Logic



//  global
let draw, snap;
//  Line을 그리면 사각형으로 변환한 geometry를 반환한다.
let lineFunction = function( coordinates, geometry ) {
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

let pointCollector = function() {
  //  소광구
  draw = new ol.interaction.Draw({
    source: source,
    type: 'LineString',
    geometryFunction: lineFunction,
    maxPoints: 2
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

    let targetLine = evt.feature;
    // evt.feature.setProperties({
    //   'category': 'Target Line'
    // });
    // console.log(`miningSmallArea : `);
    // console.log(miningSmallArea);
    
    //  --> 유효범위 Feature 생성
    // source.addFeature(createEffectiveRangeByBuffer(targetLine));
    //  <-- Feature 생성
    source.addFeature( targetLine );
    map.removeInteraction( draw );
    map.removeInteraction( snap );
    console.groupEnd('Draw End');
  }); //  drawend
  
}   //  pointCollector



/*
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
  effectiveRange[0].getGeometry().transform('EPSG:4326', 'EPSG:3857');

  effectiveRange[0].setStyle( new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 0, 0)'
    }),
    stroke: new ol.style.Stroke({
      color: 'red',
      lineDash: [4, 4],
      width: 1
    })
  }));

  mineLot.getGeometry().transform('EPSG:4326', 'EPSG:3857');

  effectiveRange[0].setProperties({
    'define' : 'Point Collector'
  });

  globalTemp = effectiveRange[0];
  console.log(globalTemp);
  console.groupEnd('createEffectiveRangeByBuffer()');
  return effectiveRange[0];
};  //  createEffectiveRangeByBuffer
*/



















/*
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
*/