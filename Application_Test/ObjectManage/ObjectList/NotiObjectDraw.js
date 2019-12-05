//  Global
let notiDraw, notiSnap, objText, notiCnv, notiCtx, notiImg, notiPattern;
const iconDir = '/Application_Test/ObjectManage/NotiObject/icon/';
const imgDir = '/Application_Test/ObjectManage/NotiObject/img/';

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
  objText = '';
  $('.selectedType').removeClass( 'selectedType' );

  if( !flag ) console.clear();

  map.removeInteraction( notiDraw );
  map.removeInteraction( notiSnap );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  // if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  $(window).unbind('keypress', escape);
} // drawNotiInit


const drawNoti = function( evt, imgDir ) {
  console.log( evt );
  //  map의 interaction들을 초기화.
  drawNotiInit();
  
  //  변수 선언
  // let sketch;
  let className = 'selectedType';
  /*
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
  */
 evt.classList.add( className );

  
  //  drawObj 작동할 type
  let selectedType = type = evt.dataset.val;
  
  //  type에 따라 switch
  let geometryFunction, maxPoints, icon;
  switch( type ) {
    case 'Text':
      objText = prompt('Text 내용을 입력하세요').trim();
      console.log( objText );
      if( !objText  ) {
        drawNotiInit();
        return;
      }
      type = 'Point';
      break;
    case 'Mark':
      type = 'Point';
      console.log( icon = iconDir + evt.dataset.ico_no + '.png' );
      break;
    case 'Image':
      type = 'Polygon';
      // notiCnv, notiCtx, notiImg
      notiCnv = document.createElement('canvas');
      notiCtx = notiCnv.getContext('2d');
      notiImg = new Image();
      notiImg.src = 'https://www.w3schools.com/w3css/img_lights.jpg';
      notiImg.onload = function () {
        notiPattern = notiCtx.createPattern(notiImg, 'no-repeat');
      };
      // console.log( 'imgDir' );
      // console.log( imgDir );
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

    switch( selectedType ) {
      case 'Mark': 
        defaultStyler( sketch, icon );
        break;
      case 'Image' :
        defaultStyler( sketch, imgDir );
      default :
        defaultStyler( sketch );
    }
    
    drawNotiInit( true );

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

/**
 * #obj_img에 파일이 변하면 호출.
 * 서버에서 파일을 새 이름으로 저장한다.
 * 저장 성공시 -> 새 이름을 돌려준다.
 * 새 이름을 가지고 draw를 호출한다.
 * input에서 파일을 지워준다.
 * 
 * 저장 실패시 -> 실패 이유를 알려준다.
 * input에서 파일을 지워준다.
 * 
 */
const objImg = function() {
  imgName = uploadImgAndGetName();
  // console.log( imgName );
  drawNoti( document.getElementById('notiImg'), imgName );
}

const uploadImgAndGetName = function(){
  var input, img, fr;

  if( typeof window.FileReader !== 'function' ) {
    alert( '브라우져에서 파일 API를 지원하지 않습니다.' );
    return;
  }

  input = document.getElementById('obj_img');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  } else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  } else if (!input.files[0]) {
    alert("파일이 없습니다.");
  } else if( input.files[0].type.indexOf('image') < 0 || input.files[0].size < 1 ) {
    alert('올바른 형식의 파일이 아닙니다.');
    return false;
  } else {
    // console.log( input.files[0].type );
    // console.log( input.files[0].type.indexOf('image') );
    img = input.files[0];
    console.log( img );
    drawNoti( document.getElementById('notiImg'), img );

    /*
    let form = new FormData( $('#img_obj_uploader')[0] );
    form.append('imgObj', img );
    console.log( form );
    $.ajax({
      url: '/',
      processData: false,
      contentType: false,
      data: form,
      type: 'POST',
      success: function(result){
        console.log( result )
        return result;
      }
    })
    */
   return imgDir + 'test.png';
  }
}

const imgSelect = function() {
  $('#upload_img_container').toggle( 300 );
  if( $('#notiImg').hasClass('selectedType') ) {
    $('#notiImg').removeClass('selectedType');
    return false;
  } else {
    $('#notiImg').addClass('selectedType');
  }
  if( $('#mark_img_container').css('display', 'block') ) {
    $('#mark_img_container').toggle( 300 );  
  }
}



const markSelect = function() {
  $('#mark_img_container').toggle( 300 );
  if( $('#notiMark').hasClass('selectedType') ) {
    $('#notiMark').removeClass('selectedType');
    return false;
  } else {
    $('#notiMark').addClass('selectedType');
  }
  if( $('#upload_img_container').css('display', 'block') ) {
    $('#upload_img_container').toggle( 300 );  
  }
}