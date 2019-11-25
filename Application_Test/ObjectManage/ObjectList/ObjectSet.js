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

/**
 * for문으로 template에 좌표 값들을 넣어서 html로 반환한다.
 * @param {*} _coordinates_ 좌표 배열
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

    // objLiEle = document.createElement('li');
    // objLiEle.innerHTML = 'feature ' + _objFeature.ol_uid;
    // objLiEle.dataset.uid = _objFeature.ol_uid;
    // objLiEle.id = _objFeature.ol_uid;
    // objLiEle.className = 'obj_mng_features';
    // objLiEle.onclick = function(){ removeObj( this.id )};
    // console.log( objLiEle )
    // document.getElementById('obj_list').appendChild(objLiEle);


    let templateSource = $('#obj_table_template').html();
    let template = Handlebars.compile(templateSource);
    let html = template(_objFeature);
    // console.log(_objFeature);
    // console.log( html )

    $('#obj_management_table').append(html);
  }
  console.groupEnd(' objSource.on change');
});


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
 * 화면을 로드하면 세션에서 Feature들을 가져옴.
 * 있으면 화면에 표출.
 * 없으면 아무 처리 안함.
 */
let objGeoJ;
(function () {
  console.group('on load');
  objGeoJ = sessionStorage.getItem('objGeoJ');
  // objGeoJ = objGeoJ ? objGeoJ : objSource.getFeatures();

  if (objGeoJ != null) {
    objGeoJ = rw.readFeatures(objGeoJ);
    objSource.addFeatures(objGeoJ);
  }

  console.groupEnd('on load');
})();

const objPanelTogle = function (uid) {
  tgt = $('#panel_' + uid);
  // console.log( tgt );
  if (tgt.hasClass('panel_hidden')) {

    let _objFeature = objSource.getFeatureByUid(uid);
    // console.log( _objFeature );

    let templateSource = $('#obj_ctrl_template').html();
    let template = Handlebars.compile(templateSource);
    Handlebars.registerPartial('obj_coord_part', $('#obj_coord_part'));
    let html = template(_objFeature);

    // console.log( html );
    tgt.append(html);

    tgt.removeClass('panel_hidden')
    tgt.css('display', 'table-row');
  } else {
    tgt.addClass('panel_hidden')
    tgt.css('display', 'none');
    tgt.empty();
  }
}

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
  console.log( serialObj );
  let targetObj = objSource.getFeatureByUid(uid);
  
  targetObj.setProperties({
    info:serialObj
  });
}

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

const editStyle = function( uid ) {
  let input = $('#obj_style_' + uid).serializeObject();
  console.log( input );
}

const rgb2rgba = function( rgb, opa ) {
  rgb = rgb.replace('#', '').trim();
  r = parseInt( rgb.substring( 0 , 2 ), 16);
  g = parseInt( rgb.substring( 2 , 4 ), 16);
  b = parseInt( rgb.substring( 4 , 6 ), 16);
  opa = opa / 10;
  if( opa > 1 ) opa = 1;
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opa + ')';
}

const rgba2rgb = function( rgba ) {
  rgba = rgba.replace('rgba(', '').replace(')', '').trim();
  // rgba.re('(');
  // rgba.remove(')');
  // rgba.remove(' ');
  rgba = rgba.split(',');
  console.log( rgba );
  for( i in rgba ) {
    console.log( rgba[i] );
  }
  r = (rgba[0]).toString(16);
  g = (rgba[1]).toString(16);
  b = (rgba[2]).toString(16);
  console.log( r + g + b)
  //return {rgb : rgb, a: a}
}

//"rgba(170, 187, 204, 1)"