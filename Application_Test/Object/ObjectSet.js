/**
 * for문으로 template에 i 값을 넣어서 html로 반환한다.
 * @param {*} from 시작 값
 * @param {*} to   끝 값
 * @param {*} incr 증가 값
 * @param {*} block Handlebars 객체, 자동으로 넣어 줌.
 */
const loopForNo = function (from, to, incr, block) {
  cont = '';
  for (var i = from; i < to; i += incr) {
    cont += block.fn(i);
  }
  return cont;
};
Handlebars.registerHelper('loopForNo', loopForNo);
//  loopForNo

const loopForStrokeWidth = function (from, to, incr, selected) {
  cont = '';
  if( !selected ) selected = 2;
  for (var i = from; i < to; i += incr) {
    if( i != selected) {
      cont += '<option value="' + i + '">' + i + '</option>';
    } else {
      cont += '<option value="' + i + '" selected>' + i + '</option>';
    }
  }
  return cont;
};
Handlebars.registerHelper('loopForStrokeWidth', loopForStrokeWidth);
//  loopForStrokeWidth

/**
 * for문으로 template에 좌표 값들을 넣어서 html로 반환한다.
 * @param {*} ol_uid Feature의 uid
 * @param {*} block Handlebars 객체, 자동으로 넣어 줌.
 */
const loopForCoords = function (ol_uid, block) {
  console.group('Loop For Coords');
  let cont = '';
  let coords = objSource.getFeatureByUid( ol_uid ).values_.coords.coords4326;
  let type = objSource.getFeatureByUid( ol_uid ).values_.info.selectedType;

  if( type == 'Mark' || type == 'Text' ) {
    // console.log( type );
    // console.log( coords );
    cont += block.fn({
      ol_uid: ol_uid,
      idx: 1,
      lat: coords[0],
      lon: coords[1]
    });
  } else if( type != 'Mark' || type != 'Text' ) {
    // console.log( coords );
    let leng = coords.length;
    console.log( 'type : ' + type + '\nlength : ' + leng );
    
    //  Polygon 형태일 경우 마지막 좌표는 화면에 보여주지 않는다.
    if( coords[0][0] == coords[leng-1][0]
        && coords[0][1] == coords[leng-1][1]) {
      leng -=1;
    }

    for ( var i = 0; i < leng; i++) {
      //  fn의 인자로 객체를 넣어 주어야 템플릿에 지정된 값을 넣어줄 수 있다.
      // console.log( coords[i] );
      cont += block.fn({
        ol_uid: ol_uid,
        idx: i + 1,
        lat: coords[i][0],
        lon: coords[i][1]
      });
    }
  }
  console.groupEnd('Loop For Coords');
  return cont;
};
Handlebars.registerHelper('loopForCoords', loopForCoords);
//  loopForCoords

const colorize = function(rgba, uid, where, block) {
  cont = '';
  feature = objSource.getFeatureByUid(uid);
  let type = feature.values_.info.selectedType;
  // console.log( feature.values_.info.selectedType );
  if( type == 'Mark' || type == 'Text' ) return;
  // console.log( rgba );
  switch( where ) {
    case 'stroke' :
      defaultRGB = '#000000';
      defaultOpa = '10'
      break;
    case 'fill' :
      if( !areaType.includes(feature.values_.info.selectedType) ) return;
      defaultRGB = '#FFFFFF';
      defaultOpa = '1'
      break;
  }
  
  if( !rgba ) {
    cont += block.fn({rgb: defaultRGB, opa: defaultOpa, ol_uid: uid});
  } else {
    let rgb = rgba2rgb(rgba);
    console.log( rgb );
    cont += block.fn({ 
      ol_uid: uid
      , rgba: rgba
      , rgb: rgb.rgb
      , opa: (rgb.opa) == 0 ? 0 : (rgb.opa) * 10
    });
  }
  return cont;
}
Handlebars.registerHelper( 'colorize', colorize );
//  colorize

// Stroke LineDash를 정의한 객체들을 모아둔 배열.
// const dashArr = [
//   {val : [1, 0],  name: 'solid' },
//   {val : [5, 3],  name: 'solid dash' },
//   {val : [5, 5],  name: 'dash' },
//   {val : [5, 15], name: 'dash dot' },
//   {val : [1, 15], name: 'dot dash' },
// ];

const lineDashFunc = function(type) {
  console.group( 'line dash func' );
  // console.log( 'type' );
  // console.log( type );
  
  cont = '';
  if(type != null) {
    /*
    for( var i = 0; i < dashArr.length; i++ ) {
      // console.log( dashArr[i] );
      // console.log( type );
      if( dashArr[i].val[0] != type[0] || dashArr[i].val[1] != type[1] ) {
        cont += '<option value="[' + dashArr[i].val + ']">' +  dashArr[i].name + '</option>';
      } else {
        cont += '<option value="[' + dashArr[i].val + ']" selected>' +  dashArr[i].name + '</option>';
      }
    }
    */
    $.each(strokeTypes, function( key, value) {
      // console.log( value + " : " + type )
      // console.log( value.toString() == type.toString() );
      if( value.toString() == type.toString() ) {
        cont += '<option value="[' + value + ']" selected>' + key + '</option>';
      } else {
        cont += '<option value="[' + value + ']">' + key + '</option>';
      }


    });

  } else {
    $.each(strokeTypes, function( key, value) {
      cont += '<option value="[' + value+ ']">' + key + '</option>';
      // console.log( key + " : " + value );
    });
  }

  // $.each(strokeTypes, function( key, value) {
  //   console.log( typeof(value) );
  // });


  console.groupEnd( 'line dash func' );
  return cont;
}
Handlebars.registerHelper( 'lineDashFunc', lineDashFunc );
//  lineDashFunc

const groupFunc = function( groupName ) {
  console.group( 'groupFunc' );

  console.log( groupName );

  cont = '';
  if( groupName != null ) {
    $.each(tbareaCategory, function( idx, name ) {
      // console.log( value + " : " + type )
      // console.log( value.toString() == type.toString() );
      if( groupName === name ) {
        cont += '<option value="' + name + '" selected>' + name + '</option>';
      } else {
        cont += '<option value="' + name + '">' + name + '</option>';
      }
    });
  } else {
    $.each(tbareaCategory, function( idx, name ) {
      cont += '<option value="' + name + '">' + name + '</option>';
    });
  }

  console.groupEnd( 'groupFunc' );
  return cont;
}
Handlebars.registerHelper( 'groupFunc', groupFunc );
//  groupFunc







//  표출 정보 수정을 위한 Handlebars Helper
//  Image, Text, Mark는 작동하지 않는다.
const styleInfoFunc = function( uid ) {
  console.group( 'styleInfoFunc' );
  let feature = objSource.getFeatureByUid( uid );
  let type = feature.values_.info.selectedType;
  let stroke, fill, text;
  switch( type ) {
    case 'Image':
    case 'Mark':
    case 'Arrow':
      return;

    case 'Square':
    case 'Polygon':
    case 'CircleP':
      fill = true;

    case 'Line':
    case 'MultiLine':
      stroke = true;
      break;

    case 'Text':
      text = true;
      break;

    default :
      alert('ERR!!!!');
      console.log( '!! ERR type ' + type );
  }
  let cont = '<div class="obj_ctrl_catg">';
  cont += '<span>표출 정보</span>';
  cont += '<hr>';
  cont += '<div class="obj_ctrl_content">';
  cont += '<form action="#" onsubmit="return false;" id="obj_style_'+ uid + '">';
  cont += '<ul>';

  if( stroke ) {
    cont += strokeStyler( feature, uid );
    cont += '<li>';
    cont += '  <label for="obj_stroke_line_dash">선 대시 종류</label>';
    cont += '  <select name="strokeLineDash" id="obj_stroke_line_dash">';
    cont += lineDashFunc( feature.style_.stroke_.lineDash_ );
    cont += '  </select>';
    cont += '</li>';
    cont += '<li>';
    cont += '  <label for="obj_stroke_width">선 두께</label>';
    cont += '  <select name="strokeWidth" id="obj_stroke_width" >';
    cont += loopForStrokeWidth( 1, 10, 1, feature.style_.stroke_.width_ );
    cont += '  </select>';
    cont += '</li>';
  }

  if( fill ) {
    cont += fillStyler( feature, uid );
  }

  if( text ) {
    cont += textStyler( feature, uid );
  }

  cont += '<hr>';
  cont += '<li>';
  cont += ' <button onclick="editStyle( ' + uid + ')">스타일 적용</button>';
  cont += '</li>';
  cont += '</ul>';
  cont += '</form>';
  cont += '</div>';
  cont += '</div>';
  console.groupEnd( 'styleInfoFunc' );
  return cont;
}
Handlebars.registerHelper( 'styleInfoFunc', styleInfoFunc );


const strokeStyler = function( feature, uid ) {
  let cont = '';
  if( !feature.style_.stroke_.color_ ) {
    // cont += block.fn({rgb: defaultRGB, opa: defaultOpa, ol_uid: uid});
    cont += '<li>';
    cont += '   <label for="obj_stroke_RGB">선 색상</label>';
    cont += '   <input type="color" name="strokeRGB" id="obj_stroke_RGB" value="#000000" />';
    cont += '</li>';
    cont += '<li>';
    cont += '    <label for="obj_stroke_opacity">선 투명도</label>';
    cont += '    <input type="number" name="strokeOpacity" id="obj_stroke_opacity" value="10" min="0" max="10"/>';
    cont += '</li>';
    cont += '<input type="hidden" name="strokeRGBA" id="' + uid + '_strokeRGBA" />';
  } else {
    let rgb = rgba2rgb(feature.style_.stroke_.color_);
    // console.log( rgb );
    cont += '<li>';
    cont += '    <label for="obj_stroke_RGB">선 색상</label>';
    cont += '    <input type="color" name="strokeRGB" id="obj_stroke_RGB" value="' + rgb.rgb + '" />';
    cont += '</li>';
    cont += '<li>';
    cont += '<label for="obj_stroke_opacity">선 투명도</label>';
    cont += '<input type="number" name="strokeOpacity" id="obj_stroke_opacity" value="' + ((rgb.opa) == 0 ? 0 : (rgb.opa) * 10) + '" min="0" max="10"/>';
    cont += '</li>';
    cont += '<input type="hidden" name="strokeRGBA" id="' + uid + '_strokeRGBA" value="' + rgb.rgba + '" />';
  }
  return cont;
}

const fillStyler = function( feature, uid ) {
  let cont = '';
  if( !feature.style_.fill_.color_ ) {
    cont += '<li>';
    cont += '<label for="obj_fill_RGB">채우기 색상</label>';
    cont += '<input type="color" name="fillRGB" id="obj_fill_RGB" value="#FFFFFF"/>';
    cont += '</li>';
    cont += '<li>';
    cont += '<label for="obj_fill_opacity">채우기 투명도</label>';
    cont += '<input type="number" name="fillOpacity" id="obj_fill_opacity" value="1" min="0" max="10" />';
    cont += '</li>';
    cont += '<input type="hidden" name="fillRGBA" id="' + uid + '_fillRGBA" />';
  } else {
    let rgb = rgba2rgb(feature.style_.fill_.color_);
    // console.log( rgb );
    cont += '<li>';
    cont += '<label for="obj_fill_RGB">채우기 색상</label>';
    cont += '<input type="color" name="fillRGB" id="obj_fill_RGB" value="' + rgb.rgb + '"/>';
    cont += '</li>';
    cont += '<li>';
    cont += '<label for="obj_fill_opacity">채우기 투명도</label>';
    cont += '<input type="number" name="fillOpacity" id="obj_fill_opacity" value="' + ((rgb.opa) == 0 ? 0 : (rgb.opa) * 10) + '" min="0" max="10" />';
    cont += '</li>';
    cont += '<input type="hidden" name="fillRGBA" id="' + uid + '_fillRGBA" value="' + rgb.rgba + '">';
  }
  return cont;
}

const textStyler = function( feature, uid ) {
  // console.log( feature.style_.text_.font_ );
  let font = feature.style_.text_.font_;
  let size = feature.style_.text_.font_.split('px')[0].trim();
  font = font.split('px')[1].trim();
  // console.log( font )
  // console.log( size );
  let cont = '';
  cont += '<li>';
  cont += '<label for="obj_font_size">폰트 싸이즈</label>';
  cont += '<input type="number" name="fontSize" id="obj_font_size" value="' + size + '"/>';
  cont += '</li>';
  return cont;
}

/**
 * feature의 uid를 받아서 해당 feature를 삭제한다.
 * @param uid 
 */
const removeObj = function (uid) {
  console.group('remove obj');// console.log( uid );

  let target = objSource.getFeatureByUid(uid);
  objSource.removeFeature(target);

  console.groupEnd('remove obj');
}
const removeObjList = function() {
  let target = $('.select_obj_mng_li');
  // console.log( target );
  let length = target.length;
  if( length > 0 ) {
    for( var i = 0; i < target.length; i++ ) {
      if( target[i].checked ) {
        // console.log( target[i].dataset.ol_uid );
        removeObj( target[i].dataset.ol_uid );
      }
    }
  }
}

//  sessionStorage에 objSource의 피쳐들을 저장한다.
const syncObjGeoj = function () {
  try {
    objGeoJ = rw.writeFeatures(objSource.getFeatures());
    // objGeoJ = JSON.stringify( objSource.getFeatures() );
    sessionStorage.setItem('objGeoJ', objGeoJ);
    objGeoJ = JSON.parse(objGeoJ);
  } catch( e ) { console.log( e ) }
}

/**
 * objSource가 변하면,
 * feature를 sessionStoreage에 저장, HTML을 다시 만든다.
 */
let _objFeature;
objSource.on('change', function ( evt ) {
  console.group(' objSource.on change');
  //  sessionStorage에 저장.
  syncObjGeoj();

  //  objSource의
  //  feature 하나씩, HTML에 다시 뿌린다.
  list = objSource.getFeatures();
  $('#obj_management_table').empty();
  for (idx in list) {
    _objFeature = list[idx];

    //  Handelbars를 이용해서 화면에 보여질 HTML Template을 준비
    let template = Handlebars.compile( $('#obj_table_template').html() );
    //  객체를 담아서 렌더링, document에 render.
    $('#obj_management_table').append( template(_objFeature) );
  }
  console.groupEnd(' objSource.on change');
});
//  objSource onChange


//  좌표값을 wkt 형식으로 바꿔서
//  spring -> postgre
//  ol에 wkt로 면환하는 함수 있음.
//  feature를 읽어서 wkt로 변환,

/*
var format = new ol.format.WKT();
var src = 'EPSG:3857';
var dest = 'EPSG:4326';
var wkt = format.writeGeometry(testingFeature.getGeometry().transform(src, dest));
console.log(wkt);
$.ajax({
    type: 'POST',
    url: '/WebVMS_Test/insertEnvironment.do',
    data: {"type": "Polygon", "geom": String(wkt)},
    dataType: 'text',
    success: function(data) {
        console.log(data);
    },
    error: function(req, status, err) {
        console.log(req);
        console.log(status);
        console.log(err);
    },
    fail: function(data) {
        console.log(data);
    }
});
*/

/**
 * 인자로 받은 객체에 담겨있는 스타일을 가져와서 화면에 스타일을 적용해 준다.
 * @param {*} feature 
 */
const propStyleToStyle = function( feature ) {
  console.group( 'propStyleToStyle' );
  let style;
  let propStyle = feature.values_.style;
  // console.log( propStyle );
  
  // 3항 연산자를 이용해서, 객체에 해당 스타일 데이터가 있다면 넣어주고 없다면 null 처리.
  try {
    style = new ol.style.Style({
      stroke: propStyle.stroke_ ?
          new ol.style.Stroke({
            color: propStyle.stroke_.color_ ? propStyle.stroke_.color_ : null ,
            lineDash: propStyle.stroke_.lineDash_ ? propStyle.stroke_.lineDash_ : null,
            width: propStyle.stroke_.width_ ? propStyle.stroke_.width_ : null
          })
          : null,
      fill: propStyle.fill_ ?
          new ol.style.Fill({
            color: propStyle.fill_.color_ ? propStyle.fill_.color_ : null,
          })
          : null,
      text: propStyle.text_ ?
          new ol.style.Text({
            color: propStyle.text_.color_ ? propStyle.text_.color_ : null,
            font: propStyle.text_.font_ ? propStyle.text_.font_ : null,
            scale: propStyle.text_.scale_ ? propStyle.text_.scale : null,
            text: propStyle.text_.text_ ? propStyle.text_.text_ : null
          })
          : null
    });
    // feature.setStyle( style );
  } catch( e ) {
    // console.log( feature );
    console.log( e );
    style = new ol.style.Style();
  }
    
  // console.log( style );
  console.groupEnd( 'propStyleToStyle' );
  return style;
}

/**
 * onLoad
 * 화면을 로드하면 세션에서 Feature들을 가져옴.
 * 없으면 아무 처리 안함.
 * -> 있다면,
 *    각 피쳐의 타입을 확인한다.
 *    피쳐의 타입에 따라
 *    하나하나 스타일 등을 적용한다.
 *    리소스를 위해 모든 객체에 스타일을 적용한 뒤, objSource에 담아준다.
 */
let objGeoJ;
(function () {
  // console.clear();
  console.group('on load');
  objGeoJ = sessionStorage.getItem('objGeoJ');
  // objGeoJ = objGeoJ ? objGeoJ : objSource.getFeatures();

  if (objGeoJ == null) return;
  
  //  sessionStorage에 Feature가 있다면 objSource에 넣어준다.
  objGeoJ = rw.readFeatures(objGeoJ);
  // console.log( objGeoJ );
  console.log( objGeoJ.length + ' Features Have Loaded From Session Storage.' );

  for( var i = 0; i < objGeoJ.length; i++ ){
    let feature = objGeoJ[i];
    let type = feature.values_.info.selectedType;
    console.log( i + ' : ' + type );
    // console.log( feature );

    //  특정 타입의 객체라면 기본 스타일을 적용한다.
    if( type == 'Mark' || type == 'Text' || type == 'Arrow' ) {
      defaultStyler( feature );
      continue;
    }
   
    //  이미지 타입이라면 이미지 레이어를 띄워주는 함수를 실행한다.
    if( type == 'Image' ) imgLayerFunc( feature );
    
    //  객체 안에 담겨있는 스타일을 적용한다.
    if( feature.values_.style ) feature.setStyle( propStyleToStyle( feature ) );
  }
  
  objSource.addFeatures(objGeoJ);
  console.groupEnd('on load');
  // console.clear();
})();
//  onload


const objPanelTogle = function (uid) {
  tgt = $('#panel_' + uid);
  // console.log( tgt );
  if (tgt.hasClass('panel_hidden')) {
    //  열려있는 다른 panel 들을 닫는다.
    $('.panel_show').addClass('panel_hidden').css('display', 'none').empty().removeClass('panel_show');

    let _objFeature = objSource.getFeatureByUid(uid);
    // console.log( _objFeature );

    let template = Handlebars.compile( $('#obj_ctrl_template').html() );
    Handlebars.registerPartial('obj_coord_part', $('#obj_coord_part'));
    tgt.append(template(_objFeature));

    tgt.removeClass('panel_hidden');
    tgt.addClass('panel_show');
    tgt.css('display', 'table-row');
  } else {
    tgt.removeClass('panel_show');
    tgt.addClass('panel_hidden');
    tgt.css('display', 'none');
    tgt.empty();
  }
}
//  objPanelTogle

//  Object Management 챠트의 최상이 체크박스 선택시 하위 obj의 선택 여부 변환.
// $('#select_all_obj_mng_li').click(function () {
//   $('.select_obj_mng_li').prop('checked', this.checked);
// });

//전체선택
function fn_selectAllObj() {
  // console.log("전체 선택")
  if(!$('#select_all_obj_mng_li').prop("checked")) {
    $('#select_all_obj_mng_li').prop("checked", true);
    $('input[name=objchk]').prop("checked", true);
  } else {
    //console.log("전체 선택 해제")
    $('#select_all_obj_mng_li').prop("checked", false);
    $('input[name=objchk]').prop("checked", false);
  }
}

// form 데이터를 객체로 만들어 반환한다.
jQuery.fn.serializeObject = function () {
  console.group('serializeObject');
  var obj = null;
  try {
    if (this[0].tagName && this[0].tagName.toUpperCase() == "FORM") {
      var arr = this.serializeArray();
      if (arr) {
        obj = {};
        jQuery.each(arr, function () {
          obj[this.name] = this.value;
        });
      }
    }
  } catch (e) {
    alert(e.message);
  } finally {
    console.log( obj );
  }
  console.groupEnd('serializeObject');
  return obj;
}
//  serializeObject

/**
 * 대상 객체의 기본정보(properties) 값을 바꿔준다.
 * !! DB에 바로 적용 하는가? !!
 * @param {*} uid 대상 feature의 uid
 */
const ctrlObjProp = function (uid) {
  $('#obj_' + uid + '_last_editor').val('UPDATER');
  // serialObj.objLastEditor = 'UPDATER';
  // serialObj.objUpdateDate = TimeStamp.getDateTime();
  $('#obj_' + uid + '_update_date').val( TimeStamp.getDateTime() );

  let serialObj = $('#obj_prop_' + uid).serializeObject()
  // console.log( serialObj );
  let targetObj = objSource.getFeatureByUid(uid);
  
  targetObj.setProperties({
    info:serialObj
  });
}
//  ctrlObjProp

/**
 * uid를 받아서 form안의 좌표값들을 받음.
 * uid로 대상 객체를 지정, form의 좌표값들을 적용시켜줌.
 * 객체의 type에 따라 좌표 형식이 조금 달라짐.
 * @param {*} uid 
 */
const editPoint = function(uid) {
  console.group( 'edit point ' + uid);
  let style = false;
  
  let inputs = $('#obj_' + uid + '_coord').serializeArray();
  let newCoords = [];
  console.log( inputs );
  
  for( var i = 0; i < inputs.length; i +=2 ) {
    // console.log( inputs[i].inputs );
    // console.log( inputs[i + 1].inputs );
    coord = [ parseFloat( inputs[i].value ), parseFloat( inputs[i + 1].value ) ];
    newCoords.push( ol.proj.transform( coord, 'EPSG:4326', 'EPSG:3857') );
    console.log( i );
  }
  
  // console.log( newCoords );
  
  let tgtFeature = objSource.getFeatureByUid( uid );
  type = tgtFeature.values_.info.selectedType;
  console.log( tgtFeature );
  ctrlObjProp(uid);
  let geo;
  switch( type ) {
    case 'Arrow':
      style = true;
    case 'Line':
    case 'MultiLine':
      geo = new ol.geom.LineString( newCoords );
      tgtFeature.setGeometry( geo );
      break;
    case 'Square' :
    case 'CircleP':
    case 'Polygon':
      newCoords.push( newCoords[0] );
      newCoords = newCoords;
      // console.log( newCoords );
      tgtFeature.getGeometry().setCoordinates( [newCoords] );
      break;
    case 'Mark':
    case 'Text':
      tgtFeature.getGeometry().setCoordinates( newCoords[0] );
      break;
    case 'Image':
      newCoords.push( newCoords[0] );
      newCoords = newCoords;
      tgtFeature.getGeometry().setCoordinates( [newCoords] );
      imgLayerFunc( tgtFeature );
  }
  setCoordsAtProps( tgtFeature );
  if( style ) defaultStyler( tgtFeature );
  console.groupEnd( 'edit point ' + uid);
}
//  editPoint

/**
 * rgb2rgba('#AABBCC', 10) 형식으로 문자열 데이터가 들어오면
 * 'rgba(255, 255, 255, 0.5') 형식으로 반환.
 * @param {*} rgb 
 * @param {*} opa 
 */
const rgb2rgba = function( rgb, opa ) {
  // console.log( rgb );
  if( !rgb ) return null;
  if( !opa ) opa = 1;
  rgb = rgb.replace('#', '').trim();
  r = parseInt( rgb.substring( 0 , 2 ), 16);
  g = parseInt( rgb.substring( 2 , 4 ), 16);
  b = parseInt( rgb.substring( 4 , 6 ), 16);
  opa = opa / 10;
  if( !opa || opa > 1 ) opa = 1;
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opa + ')';
}
//  rgb2rgba

/**
 * 'rgba(255, 255, 255, 0.5') 형식으로 문자열 데이터가 들어오면
 * {rgb: "#FFFFFF", opa: "0.5"} 형식의 객체 반환
 * @param {*} rgba 
 */
const rgba2rgb = function( rgba ) {
  rgba = rgba.replace('rgba(', '').replace(')', '').trim().split(',');

  r = parseInt(rgba[0].trim()).toString( 16 );
  g = parseInt(rgba[1].trim()).toString( 16 );
  b = parseInt(rgba[2].trim()).toString( 16 );

  return {
    rgb : '#'+ ( r + g + b ).toUpperCase()
    , opa: rgba[3].trim()};
}
//  rgba2rgb

/**
 * control panel에서 스타일 수정 버튼 클릭시 실행.
 * feature의 type에 따라 작동함.
 * @param {}} uid 
 */
const editStyle = function( uid ) {
  console.group( 'editStyle' );
  let input = $('#obj_style_' + uid).serializeObject();
  let target = objSource.getFeatureByUid( uid );
  let type = target.values_.info.selectedType;
  console.log( type );
  // console.log( input.strokeLineDash );
  let style;
  // console.log( font );

  switch( type ) {
    case 'Image':
    case 'Mark':
    case 'Arrow':
      return;

    case 'Square':
    case 'Polygon':
    case 'CircleP':

      if( input.strokeRGBA ) input.strokeRGBA = rgb2rgba( input.strokeRGB, input.strokeOpacity );
      if( input.fillRGBA ) input.fillRGBA = rgb2rgba( input.fillRGB, input.fillOpacity );
      style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: input.strokeRGBA,
          lineDash: input.strokeLineDash ? JSON.parse(input.strokeLineDash) : null,
          width: input.strokeWidth
        }),
        fill: new ol.style.Fill({
          color: input.fillRGBA
        })
      });
      break;
    case 'Line':
    case 'MultiLine':

    if( input.strokeRGBA ) input.strokeRGBA = rgb2rgba( input.strokeRGB, input.strokeOpacity );
      style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: input.strokeRGBA,
          lineDash: input.strokeLineDash ? JSON.parse(input.strokeLineDash) : null,
          width: input.strokeWidth
        })
      });

      break;
    case 'Text':
      let font = target.style_.text_.font_;
      if( input.fontSize ) input.fontSize = font.replace(/\d{1,2}/i, input.fontSize);
      style = new ol.style.Style({
        text: new ol.style.Text({
          color: target.style_.text_.color_ ? target.style_.text_.color_ : null,
          font: input.fontSize,
          scale: target.style_.text_.scale_ ? target.style_.text_.scale_ : null,
          text: target.style_.text_.text_
        })
      });
      break;

    default :
      alert('ERR!!!!');
      console.log( '!! ERR type ' + type );
  }
  
  target.setProperties( {style: style} );
  target.setStyle( style );
  console.groupEnd( 'editStyle' );
}
//  editStyle


//  ---------------------------------------------------------------------------->



let sendCnt = {
  total : 0,
  send : 0,
  success : 0,
  fail : 0,
  failMsg : '',
}
const initSendCnt = function(length) {
  if( !length ) length = 0;
  sendCnt.total = length;
  sendCnt.send = 0;
  sendCnt.success = 0;
  sendCnt.fail = 0;
  sendCnt.failMsg = '';

  pendingIdList = [];
}

const postCreateArea = function(target) {
  
  // let target = { wkt : linestring }
  // let result = 
  return new Promise( function(resolve, reject) {
    $.ajax({
      url: '/createObj.do',
      type: 'POST',
      dataType: 'json',
      data: target,
      async: true,
      beforeSend: function() {
        // console.log( target );
        console.log( 'before send : ' + TimeStamp.getDateTime() );
      },
      success: function( res ) {
        return resolve( res );
      },
      error: function( res ) {
        return reject( res );
      }
    }).always( function() {
      // $('#loader_success').text(sendCnt.success);
      // $('#loader_fail').text(sendCnt.fail);
      console.log( 'end ajax : ' + TimeStamp.getDateTime() );
    });
  });
}

const postCreateAreaRejOrErr = function( result ) {
  console.group('postCreateArea On Reject Or Err');

  // console.log( result );
  sendCnt.fail += 1;
  $('#loader_fail').text(sendCnt.fail);
  sendCnt.failMsg += '실패 대상 : name : ' + result.name + '  id: ' + result.id + '\n';
  sendCnt.failMsg += '실패   값 : ' + result.where + '\n';
  sendCnt.failMsg += '실패 사유 : ' + result.result + '\n\n';

  removeArrElement(pendingIdList, result.id);
  console.log( 'ERR : ' + TimeStamp.getDateTime() );
  
  console.groupEnd('postCreateArea On Reject Or Err');
}

const obj2area = function( obj ) {
  console.group( 'obj2area' );
  let area = {};
  /*
  const area = {
    //  기본 영역
    tbareaName                : ""  //  이름
    , tbareaCategory          : ""  //  그룹
    , tbareaGeom              : ""  //  wkt
    //  영역 스타일
    , tbareaPropStrokeType    : ""  //  linedash
    
    , tbareaPropStrokeColor   : ""  //  color_
    , tbareaPropStrokeOpacity : ""  //  color_
    
    , tbareaPropFillColor     : ""  //  fill_.color_
    , tbareaPropFillOpacity   : ""  //  fill_.color_
  }
  */
  area.id = obj.ol_uid;
  
  
  try {
    area.tbareaGeom = obj.values_.coords.wkt;
  } catch( err ) {
    console.log( err.message );
    area.tbareaGeom = toWKT(obj);
  }
  area.tbareaName               = obj.values_.info.objName;
  area.tbareaCategory           = obj.values_.info.objGroup;
  
  // area.style = removeObjKeyEmpty(obj.values_.style);
  console.log( '\nstyle : ' )
  console.log( obj.values_.style );

  if( obj.values_.style.stroke_.lineDash_ == null ) obj.values_.style.stroke_.lineDash_ = [1, 0];

  $.each(strokeTypes, function( key, value) {
    // console.log( value + " : " + type )
    // console.log( value.toString() == type.toString() );
    if( value.toString() == "[" + (obj.values_.style.stroke_.lineDash_.toString()) + "]" ) {
      area.tbareaPropStrokeType     = key;
    } else {
      area.tbareaPropStrokeType     = "SOLID";
    }


  });

  
  area.tbareaPropStrokeWidth    = Number(obj.values_.style.stroke_.width_);

  let color = rgba2rgb(obj.values_.style.stroke_.color_)
  console.log( color );

  area.tbareaPropStrokeColor    = color.rgb;
  area.tbareaPropStrokeOpacity  = color.opa;

  color = rgba2rgb(obj.values_.style.fill_.color_);
  console.log( color );

  area.tbareaPropFillColor      = color.rgb;
  area.tbareaPropFillOpacity    = color.opa;
  area.tbareaType = 'POLYGON';

  obj = area;
  console.log( 'return' );
  console.log( area );
  console.groupEnd( 'obj2area' );
  return obj;
}

let pendingIdList = [];
/**
 * 영역 등록 버튼 클릭시 작동,
 */
const sendAsArea = function() {
  console.clear();
  console.group( 'Send As Area ');
  let targetList = getSelectedObjList();
  
  targetList = targetList.filter(function(e) {
    // console.log( e.values_.info.selectedType );
    return areaType.includes( e.values_.info.selectedType );
  });
  // console.log( targetList );
  
  if( targetList.length == 0 ) {
    alert('영역 객체로 지정할 객체를 선택하세요.\n영역 등록 가능한 객체 타입은 ' + areaType + ' 입니다.');
    return false;
  }

  initSendCnt(targetList.length);
  loaderTileOn('영역 데이터 전송중', sendCnt.total);
  // console.log( targetList );
  if( !confirm(
      '영역 등록 가능한 객체 타입은 '
       + areaType + ' 입니다.\n해당하는 '
       +  targetList.length + '개의 객체를 영역으로 등록 하시겠습니까?' )
    ) {
    loaderTileOff();
    return;
  }

  targetList.forEach( function(e) {
    pendingIdList.push(e.ol_uid);
  });

  // console.log( targetList );
  // console.log( pendingIdList );

  $('.select_obj_mng_li').each( function(idx, item) {
    if( !pendingIdList.includes(item.dataset.ol_uid)) {
      item.checked = false;
    }
  });
    
  // console.log( sendCnt );
  
  $.each(targetList, function(idx, item) {
    targetList[idx] = obj2area(item);
  });
  // console.log( 'targetList' );
  // console.log( targetList );
  
  
  
  setTimeout( function() {

    $.each(targetList, function(idx, item) {
      console.group( 'areas each' );
      // console.log( 'idx : ', idx);
      delay(250);
      
      sendCnt.send += 1;
      // console.log( sendCnt );
      $('#loader_process').text(sendCnt.send);
      // console.log( 'before send : ' + TimeStamp.getDateTime() );

      postCreateArea( item ).then(function( returnData ) {
        console.group('THEN');
        var result = JSON.parse(returnData);
        
        switch( result.result ) {
          case true : 
            sendCnt.success += 1;
            $('#loader_success').text(sendCnt.success);
            // console.log( 'success : ' + TimeStamp.getDateTime() );
            /**
             * target을 영역 source에 넣어 줘야 함.
             */
//            setTImeout( removeObjList(), 2000);

            let target = objSource.getFeatureByUid(result.id);
            objSource.removeFeature( target )
            delay(250);
          break;
          default :
            postCreateAreaRejOrErr( result );
            delay(250);
        }
        delay(250);
        console.groupEnd('THEN');
      }).catch( function(result) {
        console.group('THEN ERR');
        
        postCreateAreaRejOrErr( result );
        delay(250);
        console.groupEnd('THEN ERR');
      }).then(function(){
        console.group( 'sendAsArea Finally' );
        
        if( sendCnt.total === (sendCnt.success + sendCnt.fail) ) {

          setTimeout(function(){
            let result = '';
            result += '총 ' + sendCnt.total + '개의 객체 중,\n';
            result += sendCnt.send + '개의 객체를 전송.\n';
            result += '성공 : ' + sendCnt.success + '\n';
            result += '실패 : ' + sendCnt.fail + '\n';
            result += '하였습니다.\n';
            alert( result );
            if( sendCnt.failMsg.trim().length > 0 )alert( sendCnt.failMsg );
            loaderTileOff();
          }, 1000);

        }

        console.groupEnd( 'sendAsArea Finally' );
      });
      console.groupEnd( 'areas each' );
    });
  }, 1000);
    /**
     * 리스트 분할
     * 선택된 애들중 영역이 아니라면 체크 해제한다.
     * 영역을 server에 보낸다.
     * 성공한 리스트의 객체는 소스에서 삭제한다.
     * 실패한 객체는 원인과 함께 남겨둔다.
     */
  console.groupEnd( 'Send As Area' );
}

/**
 * js 객체의 value 값이 비어있는 key를 비워준다.
 * ajax나 session 저장 하기 전 js 객체의 사이즈를 줄이기 위해 사용한다.
 * @param {} obj 
 */
const removeObjKeyEmpty = function(obj) {
  console.group( 'Remove Empty At Object' );

  Object.keys(obj).forEach(function(key) {
    (obj[key] && typeof obj[key] === 'object') && removeObjKeyEmpty(obj[key]) ||
    (obj[key] === undefined || obj[key] === null) && delete obj[key]
  });

  console.groupEnd( 'Remove Empty At Object' );
  return obj;
};

/**
 * 대상이 되는 배열에서 해당 요소를 찾아 삭제한다.
 * @param {*} array 
 * @param {*} element 
 */
const removeArrElement = function( array, element ) {
  const idx = array.indexOf(element);
  if( idx !== -1 ) {
    array.splice(idx, 1);
  }
}

/* 
 * millisecond 값을 인자로 받아서 다음 코드 실행 시간을 늦춘다.
 * AJAX 요청시 서버 부하를 막기 위해 사용한다.
 */
function delay( gap ){ /* gap is in millisecs */ 
  var then, now; 
  then = new Date().getTime(); 
  now = then; 
  while( (now - then ) < gap ) { 
    now = new Date().getTime();  // 현재시간을 읽어 함수를 불러들인 시간과의 차를 이용하여 처리 
  }
  console.log( now - then );
} 