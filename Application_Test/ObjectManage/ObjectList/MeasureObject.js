//  Global
let measureDraw, measureSnap, measureTooltipElement, measurePointTooltip, measurePointTooltipElement, measurePrevCoord, measureStatus, measurePointCNT;
let measureLineDistance = '';


/**
 * @param {*} flag : init 함수를 어디서 호출하는지 확인하기 위한 구분자.
 * false라면 draw 하는 도중, 하기 전에 호출.
 * 이전 측정에 사용된 자원들을 초기화 함.
 * 
 * true라면 draw가 끝났을 때 호출,
 * 리스트에 선택 된 항목을 선택 해제한다.
 * 
 * 공통적으로
 * map에 있는 Interaction들과 자원들을 지운다.
 */
const measureInit = function( flag ){
  let className = 'selectedType';
  let menuList = $('#measure_obj_type_li li');
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });
  
  if( !flag ) {
    map.removeLayer( measureVector );
    measureSource.clear();
    $('div').remove('.measure-point');
    map.removeOverlay( measurePointTooltip );
    console.clear();
  }
  
  map.un('click', measureClick );
  measureLineDistance = '';
  measureStatus = undefined;
  measurePointCNT = 0;
  map.removeInteraction( measureDraw );
  map.removeInteraction( measureSnap );
  
  if( flag !== 'drawObjInit' ) drawObjInit( 'measureInit' );
} // measureInit


/**
 * 인자로 받은 좌표 지점에 측정 Overlay와 Point Feature를 찍어주고,
 * 거리를 재도록 해준다.
 * @param {*} coord [14365024.794099694, 4219904.888355112] ('EPSG:4326')형식의 좌표
 */
const measureFunc = function(coord, feature) {
  console.group('Measure Func');
  
  let sectionDistance, degree;

  //  이전 좌표가 있다면, 구간 거리를 측정하기
  if( measurePrevCoord ) {
    sectionDistance = new ol.geom.LineString([ measurePrevCoord, coord ]);
    sectionDistance = formatLength(sectionDistance)
  }
  measurePrevCoord = coord;
  // console.log( sectionDistance );

  //  마지막 좌표의 정보를 보여줄 Overlay 준비
  measurePointTooltipElement = document.createElement('div');
  className = 'ol-tooltip ol-tooltip-static measure-point';
  //  rular와 ESL을 구분한다, ESL의 첫번째 좌표에는 각도를 넣어줘야 하기 때문에 index 값을 넣어준다.
  measurePointTooltipElement.className = measureStatus != 'ESL' ? className : className + ' ESL' + measurePointCNT;
  if( measurePointCNT == 0 ) measurePointTooltipElement.id = 'centerPoint';
  measurePointTooltip = new ol.Overlay({
    element: measurePointTooltipElement,
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
  stringCoord = _lat + '&ensp; ' + _lon;

  //  원 측정을 할 경우, LineString feature를 받아 그 시작점과 끝점의 각을 잰다.
  //  각도의 단위는 남-북극점을 기준으로 동쪽은 +, 서쪽은 -, 0 ~ +-180도이다.
  if( feature ) {
    // console.log( feature )
    feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
    coordinates = feature.getGeometry().getCoordinates();
    point0 = turf.point( coordinates[0] );
    point1 = turf.point( coordinates[1] );
    degree = turf.bearing( point0, point1 );
    degree = Math.round( degree * 100 ) / 100;
    //  각도 단위를 360 단위로 바꾸고 싶다면 아래 식을 추가한다.
    // degree = degree < 0 ? (180 + degree) + 180  : degree;
    degree += '°';
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
  }

  //  Overlay에 보여줄 측정 데이터 문자열 정리
  let display;
  switch( measureStatus ) {
    case 'Rular' :
      display =
        measureLineDistance == '' ? stringCoord : stringCoord + '<br>'
        + (sectionDistance === measureLineDistance 
          ? '총 거리 : ' + sectionDistance
          : '총 거리 : ' + measureLineDistance + '<br>' + '구간 거리 : ' + sectionDistance);
      break;
    case 'ESL' :
      display =  measurePointCNT == 0 ? stringCoord : stringCoord + '<br>' + sectionDistance;
      if( document.getElementById('centerPoint') ) {
        target = document.getElementById('centerPoint');
        origin = target.innerText;
        target.innerHTML = origin + '<br>' + degree ;
      }
      break;
    default: 
      alert("Something has Crashed!!\nRefresh Page!!");
  }

  // console.log( measurePointCNT );

  //  Overlay 띄우기
  measurePointTooltipElement.innerHTML = display;
  measurePointTooltip.setPosition(coord);
  map.addOverlay(measurePointTooltip);

  //  측정용 feature의 클릭점이 잘보이게 하기 위해 Point Feature를 띄움.
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
  measureSource.addFeature( point );
  measurePointCNT++;
  console.groupEnd('Measure Func');
};  //  measureFunc


//  측정 툴팁을 새로 만든다.
const createMeasureTooltip = function() {
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure measure-point';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
};  //  createMeasureTooltip


/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
let formatLength = function(line, rough) {
  let length = ol.sphere.getLength(line);
  // console.log( length );
  if( rough ) return length;

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

const measureClick = function() { 
  //  Snap을 쓰고 있기 때문에 evt.coordinate는 내가 원하는 좌표 값이 아닐 수 있음.
  //  measureDraw.finishCoordinate_는 현재 그리고 있는 feature의 마지막 클릭 좌표 값임.
  //  따라서 snap의 사용 여부를 떠나 원하는 좌표 값은 이놈이 갖고 있음.
  measureFunc( measureDraw.finishCoordinate_ );
}

/**
 * 측정용 Feature를 그리는 함수.
 * @param {*} evt 
 */
const measureObj = function( evt ) {
  //  map의 interaction들을 초기화.
  measureInit();

  //  변수 선언
  let sketch, listener;
  let className = 'selectedType';
  let menuList = $('#obj_mng_li li');
  let type = evt.dataset.val;

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
   
  //  type에 따라 switch
  switch( type ) {
    case 'None':
      return;
    case 'ESL':
      measureStatus = type;
      type = 'Circle';
      break;
    case 'Rular':
      //  거리를 잴 경우 LineString으로 Feature를 그리고, 분기처리를 위해 변수 선언.
      measureStatus = type;
      type = 'LineString';
      break;
  }

  //  draw 선언.
  measureDraw = new ol.interaction.Draw({
    source: !measureStatus ? objSource : measureSource,
    type: type,
  });
  map.addInteraction( measureDraw );
  
  //  측정을 한다면 거리를 보여줄 tooltip을 띄움.
  //  measureFeature를 보여줄 layer를 띄움.
  createMeasureTooltip();
  map.addLayer(measureVector);

  //  snap 넣어줌.
  measureSnap = new ol.interaction.Snap({
    source: objSource,
    pixelTolerance: $('#snapSensitivity').val()
  });
  map.addInteraction( measureSnap );

  measureDraw.on('drawstart', function( evt ) {
    console.group( 'draw start' );
    // set sketch
    sketch = evt.feature;
    
    //  type이 measure일 경우.
    if( measureStatus ) {
      //  선이라면 측정 시 클릭마다 측정하기 위한 함수.
      if( type == 'LineString') map.on( 'click', measureClick );
      //  원이라면 중앙점을 찍음.
      if( type == 'Circle') measureFunc( evt.feature.getGeometry().getCenter() );
      
      /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
      listener = sketch.getGeometry().on( 'change', function( evt ) {
        let tooltipCoord;
        let geom = evt.target;
        let output;
        if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          measureLineDistance = output;
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);

        //  사용하지 않는 함수. but tip으로 남겨둠.
        //  measureDraw.finishDrawing();
      });
    }
    console.groupEnd( 'draw start' );
  }); //  drawstart

  measureDraw.on('drawend', function( evt ) {
    console.group( 'draw end' );
  
    //  원이라면
    if( type == 'Circle' ) {
      //  원 그리기가 끝나면, 반지름 선분을 만들어 보여준다.
      let radiusLine = new ol.Feature({
        geometry: new ol.geom.LineString(evt.target.sketchCoords_)
      });
      measureSource.addFeature( radiusLine );
      //  반지름의 거리와 선분의 두 포인트간의 각을 구하기 위해 반지름 객체를 넘긴다.
      measureFunc( radiusLine.getGeometry().getLastCoordinate() , radiusLine );
    }

    sketch.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 0, 0.5)',
        width: 2,
        lineDash: [3, 7]
      })
    }));
    map.removeOverlay( measureTooltip );
    
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);

    measureInit( true );
    console.groupEnd( 'draw end' );
    console.clear();
  });
  //  drawend
}
//  drawObj


/**
 * 3857 좌표를 DMS 좌표로 변환하기 위해서 사용.
 * lat, lon 따로 계산 해야 함.
 * @param {*} coordinate lat이나 lon
 */
function toDegreesMinutesAndSeconds( coordinate ) {
  var absolute = Math.abs(coordinate);
  var degrees = Math.floor(absolute);
  var minutesNotTruncated = (absolute - degrees) * 60;
  var minutes = Math.floor(minutesNotTruncated);
  var seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  
  return degrees + "° " + minutes + "." + seconds + "'";
};