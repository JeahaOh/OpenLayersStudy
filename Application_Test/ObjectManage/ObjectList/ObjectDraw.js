//  Global
let objDraw, objSnap, objModify, pointTooltip, status, pointCNT;
let rw = new ol.format.GeoJSON();
const areaType = ['Polygon', 'CircleP', 'Square'];
const iconDir = '/Application_Test/ObjectManage/NotiObject/icon/';
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
  objText = '';
  let className = 'selectedType';
  let menuList = $('#draw_obj_type_li li');
  
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  // if( !flag ) console.clear();

  map.removeInteraction( objDraw );
  map.removeInteraction( objSnap );
  map.removeInteraction( objModify );
  map.removeInteraction( select );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  if( !flag ) console.clear();
  $(window).unbind('keypress', escape);
} // drawObjInit

//  Line을 그리면 사각형으로 변환한 geometry를 반환한다.
const squareFunction = function( coordinates, geometry ) {
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

const select = new ol.interaction.Select({ wrapx: false });
// map.addInteraction( select );

const drawObj = function( evt ) {
  //  변수 선언
  // let sketch;
  let className = 'selectedType';
  let menuList = $('#obj_mng_li li');

  //  이미 같은 type으로 함수를 한번 호출 했었다면 OFF 시키고 리턴.
  if( evt.classList.contains( className) ) {
    $('.' + className ).removeClass( className);
    return false;
  }
  //  map의 interaction들을 초기화.
  drawObjInit();

/*
  //  다른 type으로 함수를 한번 호출했다면 이전 type의 css 를 되돌림.
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });
*/
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
      console.clear();
      /*
      map.addInteraction( select );
      select.on('select', function( evt ) {
        // console.log( evt.selected[0] );
        
        // console.log( evt.selected[0].values_.info.selectedType );
        let targetType;
        let prventType = ['Arrow'];
        if( !evt.selected[0].values_ ) targetType = evt.selected[0].values_.info.selectedType;
        if( !targetType || prventType.includes(targetType) ) {
          return;
        } 

        objModify = new ol.interaction.Modify({
          features: select.getFeatures()
        });
        map.addInteraction( objModify );
      });
      */
      return;
    case 'Line':
      type = 'LineString';
      maxPoints = 2;
      break;
    case 'Arrow':
    case 'MultiLine' :
      type = 'LineString';
      break;
    case 'Square':
      type = 'Circle';
      selectedType = 'Square';
      geometryFunction = squareFunction;
      // geometryFunction = ol.interaction.Draw.createBox();
      // geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
      break;
    case 'CircleP':
      type = 'Circle'
      break;
    case 'Text':
      objText = prompt('Text 내용을 입력하세요');
      if( objText.length > 0 ) objText = objText.trim();
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
      return;
  }

  //  draw 선언.
  objDraw = new ol.interaction.Draw({
    source: (selectedType != 'CircleP') ? objSource : null,
    type: type,
    geometryFunction: geometryFunction,
    maxPoints: maxPoints
  });
  // console.log( objDraw.source_ );
  map.addInteraction( objDraw );

  //  snap 넣어줌.
  objSnap = new ol.interaction.Snap({ source: objSource, pixelTolerance: $('#snapSensitivity').val() });
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
    
    
    switch( selectedType ) {
      case 'CircleP' :
        // console.log( sketch );
        // console.log( sketch.getGeometry() );
        
        //  원의 중심
        let center = sketch.getGeometry().getCenter();
        // console.log( center );
        center = ol.proj.transform( center, 'EPSG:3857', 'EPSG:4326');
        // console.log( center );
        
        let options = {
          //  steps가 높을수록 정교하고, 리소스를 많이 먹음.
          steps: 64,
          units: 'meters',
          properties: {
            info: {
              'objName': selectedType + '_' + sketch.ol_uid,
              'objGroup': '기본',
              'selectedType': selectedType,
              'realType': 'Polygon',
              'objCreateDate': TimeStamp.getDateTime(),
              'objLastEditor': 'USER'
            },
            // id: TimeStamp.getMiliTime()
            id: TimeStamp.getDateTime()
          }
        }
        //  원의 반지름 거리
        //  options의 step에 맞춰 비율을 조정해야 할 듯 함.
        let radius = sketch.getGeometry().getRadius();
        radius = Math.round( radius * 0.815 );
        // console.log(radius);
        
        let circle = turf.circle( center, radius, options );
        // console.log( circle );
        // console.log( circle.geometry.coordinates )
        circle = rw.readFeature( circle );
        circle.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        circle.setId( TimeStamp.getDateTime() );
        /**
         * !! sketch의 uid는 db랑 연결 해줘야 함 !!
         */
        // sketch.setId( TimeStamp.getMiliTime() );
        // sketch.setProperties({
        //   info: {
        //     'objName': selectedType + '_' + sketch.ol_uid,
        //     'objGroup': '기본',
        //     'selectedType': selectedType,
        //     'realType': type,
        //     'objCreateDate': TimeStamp.getDateTime(),
        //     'objLastEditor': 'USER'
        //   }
        // });

        setCoordsAtProps( circle );
        defaultStyler( circle );

        objSource.addFeature( circle );
        // console.log( circle )
    break;
    case 'Mark': 
      setCoordsAtProps( sketch );
      defaultStyler( sketch, icon );
      break;
    case 'Image' :
      // defaultStyler( sketch, imgDir );
      break;
    default:
      setCoordsAtProps( sketch );
      defaultStyler( sketch );
    }

    drawObjInit( true );
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

    case 'Image' : 
      style = new ol.style.Style({
        fill: notiPattern
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
    // console.log( i );
    cont += block.fn(i);
  }
  // console.clear();
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

const hndlObjDraw = function( target ) {

}