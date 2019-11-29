//  Global
let notiDraw, notiSnap, objText;
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
 * map에 있는 Draw, Snap, Interaction을 지운다.
 */
const drawNotiInit = function( flag ) {
  let className = 'selectedType';
  let menuList = $('#draw_noti_type_li li');
  objText = '';
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  if( !flag ) console.clear();

  map.removeInteraction( notiDraw );
  map.removeInteraction( notiSnap );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  // if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  $(window).unbind('keypress', escape);
} // drawNotiInit


const drawNoti = function( evt ) {
  //  map의 interaction들을 초기화.
  drawNotiInit();
  console.log( evt );

  //  변수 선언
  // let sketch;
  let className = 'selectedType';
  let menuList = $('#noti_obj_type_li li');

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
  // console.log( selectedType );
  if( selectedType == 'Mark' ) $('#mark_img_container').toggle( 300 );
  
  //  type에 따라 switch
  let geometryFunction, maxPoints, icon;
  switch( type ) {
    case 'Text':
      objText = prompt('Text 내용을 입력하세요');
      console.log( objText );
      type = 'Point';
      break;
    case 'Mark':
      type = 'Point';
      icon = '/Application_Test/ObjectManage/NotiObject/icon/' + evt.dataset.ico_no + '.png';
      console.log( icon );
      break;
    case 'Image':
      type='Point';

      break;
  }

  //  draw 선언.
  notiDraw = new ol.interaction.Draw({
    source: objSource,
    type: type,
    geometryFunction: geometryFunction,
    maxPoints: maxPoints
  });
  // console.log( notiDraw.source_ );
  map.addInteraction( notiDraw );

  //  snap 넣어줌.
  notiSnap = new ol.interaction.Snap({ source: objSource, pixelTolerance: $('#snapSensitivity').val() });
  map.addInteraction( notiSnap );

  notiDraw.on('drawstart', function( evt ) {
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

  notiDraw.on('drawend', function( evt ) {
    console.group( 'draw end' );
    
    setCoordsAtProps( sketch );
    defaultStyler( sketch, icon );
    
    drawNotiInit( true );

    console.groupEnd( 'draw end' );
  });
  //  drawend
}
//  drawObj

const defaultStyler = function( feature, icon ) {
  let style;
  let type = feature.values_.info.selectedType;
  // console.log( type );

  switch( type ) {

    case 'Mark' :
      style = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 0.75],
          // crossOrigin: 'anonymous',
          src: icon
        })
      });
      break;

    case 'Arrow' :
      style = [
        // linestring
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "rgba(255, 204, 51, 1)",
            width: 4
          }),
          text: new ol.style.Text({
            text: 'Arrow',
            scale: 3
          })
        })
      ];
      
      feature.getGeometry().forEachSegment(function(start, end) {
        let dx = end[0] - start[0];
        let dy = end[1] - start[1];
        let rotation = Math.atan2(dy, dx);
        // arrows
        style.push(new ol.style.Style({
          geometry: new ol.geom.Point(end),
          image: new ol.style.Icon({
            src: 'arrow.png',
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation: -rotation
          })
        }));
      });
      break;

    default :
      style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 1)',
          width: 2
        }),
        // image: new ol.style.Circle({
        //   radius: 7,
        //   fill: new ol.style.Fill({
        //     color: '#ffcc33'
        //   })
        // }),
        text: new ol.style.Text({
          font: '12px Verdana',
          scale: 3,
          text: objText,
        })
      });
  }

  feature.setStyle( style );
  feature.setProperties( {style: style})
}

const setCoordsAtProps = function( feature ) {
  console.group('set coords at props');
  
  // console.log( 'BEFORE' );
  // console.log( feature.getProperties().coords );

  let coords3857 = feature.getGeometry().getCoordinates();


  // console.log(coords3857);
  if( coords3857.length && coords3857.length == 1) {
    coords3857 = coords3857[0];
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
      console.clear();
      return;
  }
};


const loopForMarkImgLi = function( block ) {
  cont = '';
  for( var i = 0; i <= 30; i++ ) {
    console.log( i );
    cont += block.fn(i);
  }
  console.clear();
  return cont;
};
Handlebars.registerHelper( 'loopForMarkImgLi', loopForMarkImgLi );

(function(){
  $('#mark_img_ul').append( Handlebars.compile( $('#mark_img_template').html() ) );
})();

