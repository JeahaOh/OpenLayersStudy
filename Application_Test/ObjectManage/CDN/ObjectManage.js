//  기본 맵 설정. -->
let objSource = new ol.source.Vector({wrapX: false});
let rularSource = new ol.source.Vector({wrapX: false});
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    // url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
    // url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  })
});
let vector = new ol.layer.Vector({
  source: objSource,
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
let rularVector = new ol.layer.Vector({
  source: rularSource,
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
  }),
  controls: ol.control.defaults().extend([
    new ol.control.ZoomToExtent({
      extent: [
        14148305.929037487, 4495749.883884393,
        14149109.160882792, 4495402.038632968
      ]
    })
  ]),
});
//  <-- 기본 맵 설정.

//  Global
let testGlobal;
let objDraw, objSnap, objModify, measureTooltipElement, pointTooltip, pointTooltipElement, pointCoord, measureCircle, status, pointCNT;
let lineDistance = '';

//  Line을 그리면 사각형으로 변환한 geometry를 반환한다.
let squareFunction = function( coordinates, geometry ) {
  let start = coordinates[0];
  let end = coordinates[1];
  
  coordinates = [[start, [start[0], end[1]], end, [end[0], start[1]], start]];
  if( !geometry ) {
    geometry = new ol.geom.Polygon(coordinates);
  } else {
    geometry.setCoordinates(coordinates);
  }
  return geometry;
} //  squareFunction

/**
 * @param {*} flag : init 함수를 어디서 호출하는지 확인하기 위한 구분자.
 * true 라면 측정이 끝났을 때 호출,
 * false 라면 측정을 하지 않았을 때 호출.
 * 
 * true일 때 호출 한 경우
 * 리스트에 선택 된 항목을 선택 해제한다.
 * 
 * false일 때 호출 한 경우
 * 측정에 사용된 자원들을 초기화 함.
 * 
 * 공통적으로
 * map에 있는 Draw, Snap, Modify Interaction을 지운다.
 */
const objMngInit = function( flag ){
  if( flag ) {
    let className = 'selectedType';
    let menuList = $('#obj_mng_li li');
    $.each(menuList, function( idx ){
      if( menuList.eq( idx ).hasClass( className )) {
        menuList.eq( idx ).removeClass( className );
      }
    });
  } else {
    map.removeLayer( rularVector );
    rularSource.clear();
    $('div').remove('.rular-point');
    map.removeOverlay( pointTooltip );
  }
  //  측정을 하던 안하던 여기서 init 해야 함.
  map.un('click', rularClick );
  lineDistance = '';
  map.removeInteraction( objDraw );
  map.removeInteraction( objSnap );
  map.removeInteraction( objModify );
} // objMngInit

/**
 * Creates a new measure tooltip
 */
const createMeasureTooltip = function() {
  //  objMngInit을 하기 때문에 사용하지 않는다.
  // if (measureTooltipElement) {
  //   measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  // }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure rular-point';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
};  //  createMeasureTooltip

/**
 * 인자로 받은 좌표 지점에 측정 Overlay와 Point Feature를 찍어주는 함수.
 * @param {*} coord [14365024.794099694, 4219904.888355112] ('EPSG:4326')형식의 좌표
 */
const pointFunc = function(coord, feature) {
  console.group('Draw Point Func');
  
  let sectionDistance, degree;

  //  구간 거리를 측정하기
  if( pointCoord ) {
    sectionDistance = new ol.geom.LineString([ pointCoord, coord ]);
    sectionDistance = formatLength(sectionDistance)
  }
  pointCoord = coord;
  // console.log( sectionDistance );

  //  구간 측정 Overlay 준비
  pointTooltipElement = document.createElement('div');
  className = 'ol-tooltip ol-tooltip-static rular-point';
  pointTooltipElement.className = status != 'ESL' ? className : className + ' ESL' + pointCNT;
  if( pointCNT == 0 ) pointTooltipElement.id = 'target';
  pointTooltip = new ol.Overlay({
    element: pointTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });

  //  죄표를 3957로 변환
  // console.log( coord )
  let stringCoord = ol.proj.toLonLat(coord);
  // console.log( stringCoord );
  
  //  좌표를 DMS 로 변환
  let _lat = toDegreesMinutesAndSeconds( stringCoord[0] ) + 'N';
  // console.log( _lat );
  let _lon = toDegreesMinutesAndSeconds( stringCoord[1] ) + 'E';
  // console.log( _lon );
  stringCoord = _lat + '&ensp; &ensp;' + _lon;

  
  if( feature ) {
    // console.log( feature )
    feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
    coordinates = feature.getGeometry().getCoordinates();
    point0 = turf.point( coordinates[0] );
    point1 = turf.point( coordinates[1] );
    degree = turf.bearing( point0, point1 );
    degree = Math.round( degree * 100 ) / 100;
    degree += '°';
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
  }



  //  Overlay에 보여줄 측정 데이터 문자열 정리
  let display;
  switch( status ) {
    case 'Rular' :
      display =
        lineDistance == '' ? stringCoord : stringCoord + '<br>'
        + (sectionDistance === lineDistance 
          ? '총 거리 : ' + sectionDistance
          : '총 거리 : ' + lineDistance + '<br>' + '구간 거리 : ' + sectionDistance);
      break;
    case 'ESL' :
      display =  pointCNT == 0 ? stringCoord : stringCoord + '<br>' + sectionDistance;
      if( document.getElementById('target') ) {
        target = document.getElementById('target');
        origin = target.innerText;
        target.innerHTML = origin + '<br>' + degree ;
      
      }
  }

  // console.log( pointCNT );

  //  Overlay 띄우기
  pointTooltipElement.innerHTML = display;
  pointTooltip.setPosition(coord);
  map.addOverlay(pointTooltip);

  //  클릭 포인트를 잘보이게 하기 위해 Point Feature를 띄움.
  // console.log(coord);
  let point = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat(coord, 'EPSG:4326', 'EPSG:3857')
    )
  });
  point.setStyle( new ol.style.Style({
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0.2)'
      })
    })
  }) );
  rularSource.addFeature( point );
  pointCNT++;
  console.groupEnd('Draw Point Func');
};  //  pointFunc


/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
let formatLength = function(line) {
  let length = ol.sphere.getLength(line);
  // console.log( length );
  let output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
      ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
      ' ' + 'm';
  }
  return output;
};  //  formatLength


const rularClick = function( evt ) { 
  // console.log( evt );
  // console.log( evt.coordinate );
  pointFunc(evt.coordinate);
}

const objMng = function( evt ) {
  //  map의 interaction들을 초기화.
  objMngInit();

  //  변수 선언
  let sketch, listener, maxPoints;
  let className = 'selectedType';
  let menuList = $('#obj_mng_li li');

  //  이미 같은 type으로 함수를 한번 호출 했었다면 OFF 시키고 리턴.
  if( evt.classList.contains( className) ) {
    $('.' + className ).removeClass( className);
    return false;
  }

  //  다른 type으로 함수를 한번 호출했다면 이전 type의 css 를 되돌림.
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  //  선택한 type에 class를 넣어서 css 컨트롤
  evt.classList.add( className );
  
  //  objMng 작동할 type
  let type = evt.dataset.val;
  
  //  type에 따라 switch
  let geometryFunction;
  switch( type ) {
    case 'None':
      return;
    case 'Modify':
      objModify = new ol.interaction.Modify({ source: objSource });
      map.addInteraction( objModify );
      return;
    case 'Square':
      type = 'Circle';
      geometryFunction = squareFunction;
      break;
    case 'ESL':
      status = type;
      type = 'Circle';
      maxPoints = 3;
      pointCNT = 0;
      break;
    case 'Rular':
      //  거리를 잴 경우 LineString으로 Feature를 그리고, 분기처리를 위해 변수 선언.
      status = type;
      type = 'LineString';
      pointCNT = 0;
      break;
  }

  //  draw 선언.
  objDraw = new ol.interaction.Draw({
    source: !status ? objSource: rularSource,
    type: type,
    geometryFunction: geometryFunction,
    maxPoints: maxPoints
  });
  map.addInteraction( objDraw );
  
  //  type이 rular 라면 거리를 보여줄 tooltip을 띄움.
  //  rularFeature를 보여줄 layer를 띄움.
  if( status ) {
    createMeasureTooltip();
    map.addLayer(rularVector);
  }
  //  snap 넣어줌.
  objSnap = new ol.interaction.Snap({ source: objSource });
  map.addInteraction( objSnap );

  objDraw.on('drawstart', function( evt ) {
    console.group( 'draw start' );

    //  type이 rular일 경우.
    if( status ) {
      //  측정 시 클릭마다 측정하기 위한 함수.
      if( type == 'LineString') map.on('click', rularClick );
      if( type == 'Circle') pointFunc( evt.feature.getGeometry().getCenter() );
      
      // set sketch
      sketch = evt.feature;
      /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
      let tooltipCoord = evt.coordinate;
      listener = sketch.getGeometry().on('change', function (evt) {
        let geom = evt.target;
        let output;
        if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          lineDistance = output;
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
        // console.log( geom.getCoordinates() );

        //  원 측정시 maxPoints로 제한하면 마지막 점에 오버레이를 추가해 주지 않으므로 계산을 따로 함.
        // if( maxPoints && pointCNT >= 2 ) {
        //   objDraw.finishDrawing();
        // }
      });
      
    }
    console.groupEnd( 'draw start' );
  }); //  drawstart

  objDraw.on('drawend', function( evt ) {
    console.group( 'draw end' );

    //  type이 rular일 경우
    if( status ) {
      if( type == 'Circle' ) {
        let radiusLine = new ol.Feature({
          geometry: new ol.geom.LineString(evt.target.sketchCoords_)
        })
        // radi
        rularSource.addFeature(radiusLine);
        // console.log( radiusLine )
        // console.log( radiusLine.getGeometry() )
        // console.log( radiusLine.getGeometry().getLastCoordinate() )
        try {
        console.log( formatLength(radiusLine.getGeometry()) );
        } catch ( err ) { console.log(err); }
        pointFunc(radiusLine.getGeometry().getLastCoordinate() , radiusLine);
      }

      sketch.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          width: 2,
          lineDash: [3, 7]
        })
      }));
      map.removeOverlay( measureTooltip );
      
      // console.log( sketch );
      // console.log( sketch.getGeometry() )

        
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
      
      
      status = undefined;
      lineDistance = '';
    }
    objMngInit( true );
    console.groupEnd( 'draw end' );
  }); //  drawend
} //  objMng

/**
 * 3857 좌표를 DMS 좌표로 변환하기 위해서 사용.
 * lat, lon 따로 계산 해야 함.
 * @param {*} coordinate lat이나 lon
 */
function toDegreesMinutesAndSeconds(coordinate) {
  var absolute = Math.abs(coordinate);
  var degrees = Math.floor(absolute);
  var minutesNotTruncated = (absolute - degrees) * 60;
  var minutes = Math.floor(minutesNotTruncated);
  var seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  
  return degrees + "° " + minutes + "." + seconds + "'";
}
/**
 * Issue
 * Snap을 사용하기 때문에, 측정을 할 때 snap이 작동하면, 
 * 클릭 좌표가 다를 수 있음...
 */