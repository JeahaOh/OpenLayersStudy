//  Global
let objDraw, objSnap, objModify, pointTooltip, status, pointCNT;
let objText = '';
const selectedObjClassName = 'selectedType';
let rw = new ol.format.GeoJSON();
const areaType = ['Polygon', 'CircleP', 'Square'];
const iconDir = '/Application_Test/ObjectManage/ObjectList/icon/';
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

  if( flag ) {
    let selectedList = $('.' + selectedObjClassName );
    //  다른 type으로 함수를 한번 호출했다면 이전 type의 css 를 되돌림.
    $.each( selectedList, function( idx ){
      if( selectedList.eq( idx ).hasClass( selectedObjClassName )) {
        selectedList.eq( idx ).removeClass( selectedObjClassName );
      }
    });

    if( $('#upload_img_container').css('display', 'block') ) {
      $('#upload_img_container').toggle( 300 );  
    }
    if( $('#mark_img_container').css('display', 'block') ) {
      $('#mark_img_container').toggle( 300 );  
    }
  }
  // if( !flag ) console.clear();

  map.removeInteraction( objDraw );
  map.removeInteraction( objSnap );
  map.removeInteraction( objModify );
  // map.removeInteraction( select );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  // if( !flag ) console.clear();
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

const drawObj = function( type, imgDir ) {
  console.group( 'drawObj' );
  // console.log( type );

  //  map의 interaction들을 초기화.
  drawObjInit();

  //  drawObj 작동할 type
  let selectedType = type;
  
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
      // console.log( objText );
      if( !objText  ) {
        drawNotiInit();
        return;
      }
      type = 'Point';
      break;
    case 'Mark':
      type = 'Point';
      console.log( imgDir );
      
      break;
    case 'Image':
      type = 'Circle';
      geometryFunction = squareFunction;
      // console.log( selectedType );
      break;
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

        setCoordsAtProps( circle );
        defaultStyler( circle );

        objSource.addFeature( circle );
        // console.log( circle )
    break;
    
    case 'Mark': 
      setCoordsAtProps( sketch );
      defaultStyler( sketch, imgDir );
      break;
      
    case 'Image' :
      setCoordsAtProps( sketch );
      imgLayerFunc( sketch, imgDir );   
      break;
      
    default:
      setCoordsAtProps( sketch );
      defaultStyler( sketch );
    }

    drawObjInit( true );
    console.groupEnd( 'draw end' );
  });
  //  drawend
  console.groupEnd( 'drawObj' );
}
//  drawObj


const defaultStyler = function( feature, icon ) {
  console.group( 'defaultStyler' );
  let style;
  // let type = feature.values_.info.selectedType;
  let type = feature.values_ ? feature.values_.info.selectedType : feature.properties.info.selectedType;
  // console.log( type );

  switch( type ) {
    case 'Text' :
      // if( !objText ) objText = feature.values_.style.text_.text_
      // console.log( feature.values_.style.text_ );
      if( objText ) {
        style = new ol.style.Style({
          text: new ol.style.Text({
            font: "12px Verdana",
            scale: 3,
            text: objText,
          })
        });
      } else {
        style = new ol.style.Style({
          text: new ol.style.Text({
            font: feature.values_.style.text_ ? feature.values_.style.text_.font_ : "12px Verdana",
            scale: feature.values_.style.text_ ? feature.values_.style.text_.scale_ : 3,
            text: feature.values_.style.text_.text_
          })
        });
      }
      break;
      
    case 'Mark' :
      if( !icon ) icon = feature.values_.style.image_.iconImage_.src_;
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
      });
  }
  // console.log( style );
  feature.setStyle( style );
  feature.setProperties( {style: style})
  console.groupEnd( 'defaultStyler' );
}


/**
 * Feature의 좌표를 3857, 4326, wkt 형식으로 Feature coords라는 속성에 다시 저장해 준다.
 * DMS 형식을 쓸 필요가 있다면 주석을 해제 해 주어야 한다.
 * @param {*} feature 
 */
const setCoordsAtProps = function( feature ) {
  console.group('set coords at props');
  let type = feature.values_.info.selectedType;
  // console.log( type );
  
  // console.log( 'BEFORE' );
  // // console.log( feature.getProperties().coords );
  // console.log( feature.getGeometry().getCoordinates() );

  let coords3857 = feature.getGeometry().getCoordinates();
  // console.log(coords3857);
  if( type != 'Mark' || type != 'Text' ) {
    if( coords3857.length && coords3857.length == 1) {
      coords3857 = coords3857[0];
    }
  }

  let coords4326 = [];
  // let coordsDms = [];
  if( type == 'Mark' || type == 'Text' ) {
    coords4326 = (ol.proj.transform( coords3857, 'EPSG:3857', 'EPSG:4326' ));
  } else {
    for( var i = 0; i < coords3857.length; i++){
      coords4326.push(ol.proj.transform( coords3857[i], 'EPSG:3857', 'EPSG:4326' ));
    }
    // coordsDms.push( [toDmsAsMap( coords4326[i][0], toDmsAsMap(coords3857[i][1]) )] );
  }
  // console.log( 'coords3857' )
  // console.log( coords3857 )
  // console.log( 'coords4326' )
  // console.log( coords4326 )
  
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
  // console.log( feature.getGeometry().getCoordinates() );

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

/**
 * Mark 이미지를 렌더링 하기 위한 반복문.
 * JSP를 쓴다면 대체 가능하다.
 * @param {*} block 
 */
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
 * 작동 해야 할 로직
 *    서버에서 파일을 새 이름으로 저장한다.
 *    저장 성공시 -> 새 이름을 돌려준다.
 *    새 이름을 가지고 draw를 호출한다.
 *    input에서 파일을 지워준다.
 * 
 *    저장 실패시 -> 실패 이유를 알려준다.
 *    input에서 파일을 지워준다.
 * 
 * 현제 상태는 이미지 임력만 받고 지정된 이미지 린크를 리턴함.
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

/**
 * Draw 하기 전에 Mark나 Image 분기처리를 위해 만든 함수.
 * draw type을 선책하면 Switch 역할도 한다.
 * 
 * imgDir이 없다면 이미지 선택하는 function을 실행하고, imgDir이 있다면 Draw를 호출한다.
 * 이미지가 아닌경우 draw를 바로 호출한다.
 * @param {*} target 
 * @param {*} imgDir 
 */
const hndlObjDraw = function( target, imgDir ) {
  // console.log( target );
  // console.log( target.className );
  // console.log( target.classList );
  // console.log( imgDir );
  let val = target.dataset.val;

  //  분기 처리하기전에 변수에 담아보자
  if( !target.dataset.ico_no || imgDir == undefined ) {
    //  이미 같은 type으로 함수를 한번 호출 했었다면 OFF 시키고 리턴.
    if( target.classList.contains( selectedObjClassName ) ) {
      $('.' + selectedObjClassName ).removeClass( selectedObjClassName );
      drawObjInit();
      return false;
    }
    
    let selectedList = $('.' + selectedObjClassName );
    //  다른 type으로 함수를 한번 호출했다면 이전 type의 css 를 되돌림.
    $.each( selectedList, function( idx ){
      if( selectedList.eq( idx ).hasClass( selectedObjClassName )) {
        selectedList.eq( idx ).removeClass( selectedObjClassName );
      }
    });
    // //  선택한 type에 class를 넣어서 css 컨트롤
    target.classList.add( selectedObjClassName );
  }

  if( val == 'Mark' && !target.dataset.ico_no ) {
    $('#mark_img_container').toggle( 300 );

  } else if ( val == 'Mark' && target.dataset.ico_no ) {
    $('#mark_img_container').toggle( 300 );
    // console.log( icon = iconDir + evt.dataset.ico_no + '.png' );
    // console.log( target.dataset.ico_no );
    drawObj( val, iconDir + target.dataset.ico_no + '.png' );

  } else if ( val == 'Image' && !imgDir ) {
    $('#upload_img_container').toggle( 300 );

  } else if ( val == 'Image' && imgDir ) {
    /**
     * 임시 호출 방식 input file에서 onchnage시 다른 펑션을 부른 뒤,
     * hndlObjDraw( document.getElementById('obj_img'), '이미지 이름 혹은 경로');
     * 로 호출 해 줘야 함.
     */
    $('#upload_img_container').toggle( 300 );
    // console.log( imgDir );
    drawObj( val, '/Application_Test/ObjectManage/ObjectList/img/test.png' );
  
  } else {
    drawObj( val );
  }
}

/**
 * 인자로 받은 feature의 좌표로 imageLayer를 띄우기 위한 함수.
 * @param {*} feature 
 * @param {*} imgDir 
 */
const imgLayerFunc = function( feature, imgDir ){
  console.group( 'imgLayerFunc ');
  // console.log( feature );
  // console.log( feature.getGeometry().getCoordinates()[0] );

  // feature 생성시라면 imgDir을 인자로 주고,
  // page load때 호출한다면 feature에서 imgDir을 꺼낸다.
  if( !imgDir ) {
    imgDir = feature.values_.imgDir
  } else {
    feature.setProperties({
      imgDir: imgDir
    });
  }
  // console.log( feature );
  // let coords = (feature.values_ ? feature.values_.coords.coords3857 : feature.geometry.coordinates[0]);
  let coords = feature.getGeometry().getCoordinates()[0];
  // console.log( coords );
  let latLi = [];
  let lonLi = [];

  for( c in coords ) {
    coords[c] = ol.proj.transform( coords[c], 'EPSG:3857', 'EPSG:4326' );
    latLi.push( coords[c][0] );
    lonLi.push( coords[c][1] );
  }
  // console.log( coords );
  latLi.sort();
  lonLi.sort();
  /**
   * [left, bottom, right, top] = [서, 남, 동, 북]
   * lat에서 제일 낮은 좌표가 최 서단
   * lon에서 제일 낮은 좌표가 최 남단
   */
  console.log( coords = [
      latLi[0],
      lonLi[0],
      latLi[ latLi.length - 1 ],
      lonLi[ lonLi.length - 1 ],
    ]
  );

  let imageLayer = new ol.layer.Image({
    source: new ol.source.ImageStatic({
      url: imgDir,
      crossOrigin: 'anonymous',
      projection: 'EPSG:4326',
      imageExtent: coords
    })
  });

  map.addLayer( imageLayer );
  console.groupEnd( 'imgLayerFunc ');
}