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

const loopForStrokeWidth = function (from, to, incr, selected, block) {
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

  // console.log( coords );
  
  let leng = coords.length;
  // console.log( leng );
  // console.log( _coordinates_ )
  if( coords[0][0] == coords[leng-1][0]
      && coords[0][1] == coords[leng-1][1]) {
    leng -=1;
  }

  for ( var i = 0; i < leng; i++) {
    //  fn의 인자로 객체를 넣어 주어야 템플릿에 지정된 값을 넣어줄 수 있다.
    cont += block.fn({
      ol_uid: ol_uid,
      idx: i + 1,
      lat: coords[i][0],
      lon: coords[i][1]
    });
  }
  console.groupEnd('Loop For Coords');
  return cont;
};
Handlebars.registerHelper('loopForCoords', loopForCoords);
//  loopForCoords
const areaType = ['Polygon', 'CircleP', 'Square'];
const colorize = function(rgba, uid, where, block) {
  cont = '';
  feature = objSource.getFeatureByUid(uid);
  // console.log( feature.values_.info.selectedType );
  // console.log( rgba );
  switch( where ) {
    case 'stroke' :
      defaultRGB = '#000000';
      defaultOpa = '10'
      break;
    case 'fill' :
      if( !areaType.includes(feature.values_.info.selectedType) ) return;
      defaultRGB = '#FFFFFF';
      defaultOpa = '0'
      break;
  }
  
  if( !rgba ) {
    cont += block.fn({rgb: defaultRGB, opa: defaultOpa, ol_uid: uid});
  } else {
    let rgb = rgba2rgb(rgba);
    // console.log( rgb );
    cont += block.fn({ 
      ol_uid: uid
      , rgba: rgba
      , rgb: rgb.rgb
      , opa: (rgb.opa) * 10
    });
  }
  return cont;
}
Handlebars.registerHelper( 'colorize', colorize );
//  colorize

// Stroke LineDash를 정의한 객체들을 모아둔 배열.
const dashArr = [
  {val : [1, 0], name: '직선' },
  {val : [5, 5], name: '점선' },
  {val : [5, 15], name: '헐렁한 점선'},
  {val : [1, 15], name: '흐릿한 점선'},
  {val : [3, 3], name: '촘촘한 점선'}
];
const lineDashFunc = function(type) {
  console.group( 'line dash func' );
  cont = '';
  if(type) {
    for( var i = 0; i < dashArr.length; i++ ) {
      // console.log( dashArr[i] );
      // console.log( type );
      if( dashArr[i].val[0] != type[0] || dashArr[i].val[1] != type[1] ) {
        cont += '<option value="[' + dashArr[i].val + ']">' +  dashArr[i].name + '</option>';
      } else {
        cont += '<option value="[' + dashArr[i].val + ']" selected>' +  dashArr[i].name + '</option>';
      }
    }
  } else {
    for( var i = 0; i < dashArr.length; i++ ) {
      // console.log( dashArr[i].val );
      cont += '<option value="[' + dashArr[i].val + ']">' +  dashArr[i].name + '</option>';
    }
  }
  console.groupEnd( 'line dash func' );
  return cont;
}
Handlebars.registerHelper( 'lineDashFunc', lineDashFunc );
//  lineDashFunc

/**
 * feature의 uid를 받아서 해당 feature를 삭제한다.
 * @param uid 
 */
const removeObj = function (uid) {
  console.group('remove obj');// console.log( uid );

  target = objSource.getFeatureByUid(uid);
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
  objGeoJ = rw.writeFeatures(objSource.getFeatures());
  sessionStorage.setItem('objGeoJ', objGeoJ);
  objGeoJ = JSON.parse(objGeoJ);
}

/**
 * objSource 가 변하면
 */
let _objFeature, objList;
objSource.on('change', function () {
  console.group(' objSource.on change');
  syncObjGeoj();

  list = objSource.getFeatures();
  // objList = list;
  // console.log( list );
  $('#obj_management_table').empty();
  for (let obj in list) {
    _objFeature = list[obj];

    // console.log( _objFeature );
    // console.log( _objFeature.ol_uid );

    let templateSource = $('#obj_table_template').html();
    let template = Handlebars.compile(templateSource);
    let html = template(_objFeature);
    // console.log(_objFeature);
    // console.log( html )

    $('#obj_management_table').append(html);
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
 * onLoad
 * 화면을 로드하면 세션에서 Feature들을 가져옴.
 * 있으면 화면에 표출.
 * 없으면 아무 처리 안함.
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
  objSource.addFeatures(objGeoJ);

  //  Feature가 style을 갖고 있다면 적용 해 준다.
  //  style의 갯수만큼 objSource는 change 된다.
  let length = objGeoJ.features.length;
  if ( length > 0 ) {
    console.log( 'features.length : ' + length );
    for( var i = 0; i < length; i++ ) {
      let feature = objGeoJ.features[i];
      // console.log( feature )
      // console.log( feature.id )
      if ( feature.properties !== null &&feature.properties.style ) {
        // console.log( 'style' );
        let style = feature.properties.style;
        console.log( style );
        // console.log( style.length );
        try {
          if( !style.length ) {
            // console.log( style.stroke_.lineDash_ );
            // console.log( typeof style.stroke_.lineDash_ );
            style = new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: style.stroke_.color_,
                lineDash: style.stroke_.lineDash_,
                width: style.stroke_.width_
              }),
              fill: new ol.style.Fill({
                color: style.fill_.color_,
              }),
              text: new ol.style.Text({
                color: style.text_.color_,
                font: '12px Verdana',
                scale: 3,
                text: style.text_.text_
              })
            });
            
            objSource.getFeatureById(feature.id).setStyle(style);
          } else {
            // console.log( style );
            arrowFunction( objSource.getFeatureById( feature.id ) );
          }
        } catch( e ) {
          console.log( e );
        }
      }
    }
  }
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
$('#select_all_obj_mng_li').click(function () {
  $('.select_obj_mng_li').prop('checked', this.checked);
});

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
  
  let inputs = $('#obj_' + uid + '_coord').serializeArray();
  let newCoords = [];
  // console.log( inputs );
  
  for( var i = 0; i < inputs.length; i +=2 ) {
    // console.log( inputs[i].inputs );
    // console.log( inputs[i + 1].inputs );
    coord = [ parseFloat( inputs[i].value ), parseFloat( inputs[i + 1].value ) ];
    newCoords.push( ol.proj.transform( coord, 'EPSG:4326', 'EPSG:3857') );
  }
  
  // console.log( newCoords );
  
  let tgtFeature = objSource.getFeatureByUid( uid );
  type = tgtFeature.values_.info.selectedType;
  
  ctrlObjProp(uid);
  let geo;
  switch( type ) {
    case 'Line':
    case 'MultiLine':
      geo = new ol.geom.LineString( newCoords );
      tgtFeature.setGeometry( geo );
      break;
    case 'Square' :
    case 'Polygon':
      newCoords.push( newCoords[0] );
      newCoords = newCoords;
      // console.log( newCoords );
      tgtFeature.getGeometry().setCoordinates( [newCoords] );
      break;
  }
  setCoordsAtProps( tgtFeature );
  console.groupEnd( 'edit point');
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


const editStyle = function( uid ) {
  let input = $('#obj_style_' + uid).serializeObject();
  let target = objSource.getFeatureByUid( uid );
  // console.log( input.strokeLineDash );

  input.strokeRGBA = rgb2rgba( input.strokeRGB, input.strokeOpacity );
  input.fillRGBA = rgb2rgba( input.fillRGB, input.fillOpacity );
  input.strokeLineDash = input.strokeLineDash;
  // input.textRGBA = rgb2rgba( input.textRGB, input.textOpacity );
  // console.log( input );

  let style = map2style( input );
  // console.log( style );
  // console.log( style.strokeLineDash )
  //  객체에 따로 style을 저장 하려면 주석을 풀어야 함.
  target.setProperties( {style: style} );
  target.setStyle( style );
}
//  editStyle

const map2style = function( map ) {
  // console.log( map.strokeLineDash );
  style = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: map.strokeRGBA,
      lineDash: JSON.parse(map.strokeLineDash),
      width: map.strokeWidth
    }),
    fill: new ol.style.Fill({
      color: map.fillRGBA,
    }),
    text: new ol.style.Text({
      color: map.textRGBA
    })
  });

  // console.log( style );
  return style;
}
//  map2style
