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
const loopForCoords = function (_coordinates_, ol_uid, block) {
  console.group('Loop For Coords');
  let cont = '';
  // console.log(_coordinates_);
  //  좌표의 껍데기를 벗김.
  if( _coordinates_.length == 1) {
    _coordinates_ = _coordinates_[0];
    // console.log(_coordinates_);
  }
  let leng = _coordinates_.length;
  // console.log( leng );
  // console.log( _coordinates_ )
  if( _coordinates_[0][0] == _coordinates_[leng-1][0]
      && _coordinates_[0][1] == _coordinates_[leng-1][1]) {
    leng -=1;
  }

  for ( var i = 0; i < leng; i++) {
    //  좌표계 변환
    coord = ol.proj.transform(_coordinates_[i], 'EPSG:3857', 'EPSG:4326');

    //  좌표의 lat, lon 값을 분할하여, DMS 형식으로 변환
    let lat = toDmsAsMap(coord[0]);
    let lon = toDmsAsMap(coord[1]);
    
    //  fn의 인자로 객체를 넣어 주어야 템플릿에 지정된 값을 넣어줄 수 있다.
    cont += block.fn({
      ol_uid: ol_uid,
      idx: i + 1,
      lat: lat,
      lon: lon
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
    console.log(_objFeature);
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
  // console.log(uid);
  // let serial = $('#obj_prop_' + uid).serialize() 
  // console.log( serial );
  let serialObj = $('#obj_prop_' + uid).serializeObject()
  serialObj.objLastEditor = 'UPDATER';
  serialObj.objUpdateDate = TimeStamp.getDateTime();
  // console.log( serialObj );
  let targetObj = objSource.getFeatureByUid(uid);
  
  targetObj.setProperties({
    info:serialObj
  });
}

/** addObjCoords
 * ObjectManagement에서 한 객체에 대한 좌표 추가 버튼을 누를 경우 작동함.
 * 대상 객체의 uid를 가져옴.
 * 
 * 객체 타입에 따라 좌표를 추가 할 수 있는지 없는지 지정 한다?
 * 
 * @param {*} uid 
 */
const addObjCoords = function( uid ) {
  console.log( uid );
  let tgtObj = objSource.getFeatureByUid(uid);
  console.log( tgtObj );
  let able = tgtObj.values_.objType;
  console.log( able );
  
  switch( able ) {
    case 'Circle':
    
    case 'Polygon':
    case 'LineString':
    case 'Square' :
  }
 
  let  tgtCoordTab = $('#obj_coord_list_'+ uid);
  console.log( tgtCoordTab );
}

const unreadPoint = function( ele, uid, idx ) {
  status = 
  $('.obj_' + uid + '_coord_' + idx).attr('readonly', false );
}

const editPoint = function( ele, uid, idx ) {
  let tgt = $('#obj_' + uid + '_coord_' + idx);
  // console.log( tgt );
  console.log(  );
  // console.log( tgt.serializeArray() );
  let value = tgt.serializeObject();
  value = {
    uid: uid,
    coordIdx: idx,
    lat : {
      d: value.lat_d,
      m: value.lat_m,
      s: value.lat_s
    },
    lon : {
      d: value.lon_d,
      m: value.lon_m,
      s: value.lon_s
    }
  }
  console.log( value )
  value = dmsMapTo3857( value );
  // value = ol.proj.transform(value, 'EPSG:4326', 'EPSG:3857');
  // console.log( value );
  

}
