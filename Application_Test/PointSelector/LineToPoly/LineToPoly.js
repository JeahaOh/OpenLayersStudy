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





const drawSurvArea = function() {
  console.group('draw ');
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



/**
 * 사용자가 업로드한 객체를 읽기위한 함수
 */
const loadFile = function() {
  var file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  // input = document.getElementById('fileinput');
  console.log(input)
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  } else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  } else if (!input.files[0]) {
    alert("파일이 없습니다.");
  } else if( input.files[0].type != 'application/json' ) {
    alert('올바른 형식의 파일이 아닙니다.');
    return false;
  } else {
    file = input.files[0];
    console.log( file );
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }
};

/**
 * 업로드 된 파일을 읽어서 스타일을 적용한 뒤,
 * 객체들을 objSource에 addFeature 한다.
 * @param {} e 
 */
let input;
const receivedText = function(e) {
  let lines = JSON.parse(e.target.result);
  console.log( lines );
  $.ajax({
    type : "POST",
    url : "/postEnvData.do",
    dataType : "application/json",
    data : lines,
    traditional : true,    // or false, your choice
    async : true,    // or true, your choice
    beforeSend : function(xhr, opts) {
        // when validation is false
        if (false) {
            xhr.abort();
        }
    },
    success : function( res ) {
        console.log( res )
    },
    error : function( err ) {
        console.error( err );
    }
  });
}
//  JSON을 file로 받아서 서버에 전송하기 위한 테스트 코드
const createLoader = function() {
  input = document.createElement('input');
  input.type = "file";
  input.id = "fileinput"
  input.click();
}