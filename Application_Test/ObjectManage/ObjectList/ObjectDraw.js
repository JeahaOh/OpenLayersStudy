//  Global
let objDraw, objSnap, objModify, pointTooltip, status, pointCNT;
let rw = new ol.format.GeoJSON();
let sketch;

/**
 * @param {*} flag : init 함수를 어디서 호출하는지 확인하기 위한 구분자.
 * true라면 draw가 끝났을 때 호출,
 * 리스트에 선택 된 항목을 선택 해제한다.
 * 
 * false라면 draw 하지 않았을 때 호출.
 * 이전 측정에 사용된 자원들을 초기화 함.
 * 
 * 공통적으로
 * map에 있는 Draw, Snap, Modify Interaction을 지운다.
 */
const drawObjInit = function( flag ) {
  let className = 'selectedType';
  let menuList = $('#draw_obj_type_li li');
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  map.removeInteraction( objDraw );
  map.removeInteraction( objSnap );
  map.removeInteraction( objModify );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  $(window).unbind('keypress', escape);
} // drawObjInit

const drawObj = function( evt ) {
  //  map의 interaction들을 초기화.
  drawObjInit();

  //  변수 선언
  // let sketch;
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
  
  //  drawObj 작동할 type
  let selectedType = type = evt.dataset.val;
  
  //  type에 따라 switch
  let geometryFunction, maxPoints;
  switch( type ) {
    case 'None':
      return;
    case 'Modify':
      objModify = new ol.interaction.Modify({ source: objSource });
      map.addInteraction( objModify );
      return;
    case 'Line':
      type = 'LineString';
      maxPoints = 2;
      break;
    case 'MultiLine' :
      type = 'LineString';
      break;
    case 'Square':
      type = 'Circle';
      // geometryFunction = squareFunction;
      geometryFunction = ol.interaction.Draw.createBox();
      // geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
      break;
    case 'CircleP':
      type = 'Circle'
      break;
  }

  //  draw 선언.
  objDraw = new ol.interaction.Draw({
    source: (selectedType != 'CircleP') ? objSource : null,
    // source: null,
    // source: objSource,
    type: type,
    geometryFunction: geometryFunction,
    maxPoints: maxPoints
  });
  console.log( objDraw.source_ );
  map.addInteraction( objDraw );

  //  snap 넣어줌.
  objSnap = new ol.interaction.Snap({ source: objSource, pixelTolerance: 25 });
  map.addInteraction( objSnap );

  objDraw.on('drawstart', function( evt ) {
    console.group( 'draw start' );
    // set sketch
    sketch = evt.feature;
    /**
     * !! sketch의 uid는 db랑 연결 해줘야 함 !!
     */
    sketch.setId( TimeStamp.getMiliTime() );
    sketch.setProperties({
      info: {
        'objName': selectedType + '_' + sketch.ol_uid,
        'objGroup': '기본',
        'selectedType': selectedType,
        'realType': type,
        'objCreateDate': TimeStamp.getDateTime(),
        'objLastEditor': 'USER'
      }
    });

    $(window).on('keypress', escape);

    console.groupEnd( 'draw start' );
  }); //  drawstart

  objDraw.on('drawend', function( evt ) {
    console.group( 'draw end' );
    // console.log( evt )
    console.log( evt.feature )
    console.log( evt.feature.getId() )
    // target = objSource.getFeatureById(evt.feature.getId());
    // objSource.removeFeature(target);
    console.log( evt.feature.ol_uid )
    // target = objSource.getFeatureByUid(evt.feature.ol_uid);
    // objSource.removeFeature(target);

    // vector.getSource().removeFeature(evt.feature);

    // try{
    //   objSource.removeFeature(evt.feature);
    // } catch (e) {
    //   console.log( e )
    // }

    // objSource.removeFeature(evt.target.feature);
    
    if( selectedType == 'CircleP' ) {
      // console.log( sketch );
      // console.log( sketch.getGeometry() );
      
      //  원의 중심
      let center = sketch.getGeometry().getCenter();
      console.log( center );
      center = ol.proj.transform( center, 'EPSG:3857', 'EPSG:4326');
      // console.log( center );
      
      //  원의 반지름 거리
      let radius = sketch.getGeometry().getRadius();
      radius = Math.round( radius * 0.815 );
      let options = {
        step: 1,
        units: 'meters'
      }
      console.log(radius);
      
      let circle = turf.circle( center, radius, options );
      console.log( circle );
      console.log( circle.geometry.coordinates )

      circle = rw.readFeature( circle );
      // console.log( circle );
      // objSource.addFeature( circle );

      // console.log( circle.getGeometry().getCoordinates() );
      circle.getGeometry().transform('EPSG:4326', 'EPSG:3857');

      // console.log( circle.getGeometry().getCoordinates() );
/*
      // setCoordsAtProps( circle );
      // circle.setId( sketch.getId() )
      // circle.setProperties( sketch.getProperties() );
*/
      circle.setId( TimeStamp.getMiliTime() );
      circle.setProperties({
        info: {
          'objName': selectedType + '_' + sketch.ol_uid,
          'objGroup': '기본',
          'selectedType': selectedType,
          'realType': type,
          'objCreateDate': TimeStamp.getDateTime(),
          'objLastEditor': 'USER'
        }
      });
      setCoordsAtProps( circle );
      
      objSource.addFeature( circle );
    } else {
      setCoordsAtProps( sketch );
    }

    // console.log( sketch.getProperties() );
    drawObjInit( true );

    console.groupEnd( 'draw end' );
  });
  //  drawend
}
//  drawObj

const setCoordsAtProps = function( feature ) {
  console.group('set coords at props');
  
  // console.log( 'BEFORE' );
  // console.log( feature.getProperties().coords );

  let coords3857 = feature.getGeometry().getCoordinates();


  // console.log(coords3857);
  if( coords3857.length && coords3857.length == 1) {
    coords3857 = coords3857[0];
    // console.log(_coordinates_);
  }
  let coords4326 = [];
  // let coordsDms = [];
  for( var i = 0; i < coords3857.length; i++){
    coords4326.push(ol.proj.transform( coords3857[i], 'EPSG:3857', 'EPSG:4326' ));
    // coordsDms.push( [toDmsAsMap( coords4326[i][0], toDmsAsMap(coords3857[i][1]) )] );
  }
  
  // console.log( sketch );
  feature.setProperties({
    coords : {
      'wkt': toWKT(feature),
      'coords3857': coords3857,
      'coords4326': coords4326,
      // 'coordsDms': coordsDms
    }
  });

  // console.log( 'AFTER' );
  // console.log( feature.getProperties().coords );

  console.groupEnd('set coords at props');
}

/**
 * feature를 WKT로 변환함.
 */
let toWKT = function (feature) {
  return (new ol.format.WKT()).writeFeature(feature);
}

/**
 * 3857 좌표를 DMS 좌표계 형식의 객체로 변환하기 위해서 사용.
 * lat, lon 따로 계산 해야 함.
 * @param {*} coordinate lat이나 lon
 */
const toDmsAsMap = function(coordinate) {
  var absolute = Math.abs(coordinate);
  var degrees = Math.floor(absolute);
  var minutesNotTruncated = (absolute - degrees) * 60;
  var minutes = Math.floor(minutesNotTruncated);
  var seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  
  return {
    origin: coordinate,
    d: degrees,
    m: minutes,
    s: seconds };
};

/**
 * DMS 좌표계 형식의 객체를 3857 좌표계로 변환하기 위해서 사용.
 * lat lon 한번에 계산 함.
 * @param {*} coordMap 
 */
const dmsMapTo3857 = function( coordMap ) {
  let lat = coordMap.lat;
  console.log( lat );
  let lon = coordMap.lon;
  console.log( lon );
  
  lat = lat.d + ' ' +  lat.m + ' ' + lat.s;
  lon = lon.d + ' ' +  lon.m + ' ' + lon.s;

  coord = [ lat, lon ];
  console.log( coord );
  coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
  console.log( coord );
  return coordMap;
}
// mapdirective에서

// 그리기 도중 취소하기.
const escape = function( evt ) {
  let charCode = (evt.keyCode) ? evt.keyCode : evt.which;
  console.log( charCode );

  //  X = 120
  //  z = 122
  switch( charCode ) {
    case 120 :
        drawObjInit();
        return;
  }
}