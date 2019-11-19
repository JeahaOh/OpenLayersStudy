/**
 * feature를 WKT로 변환함.
 */
let toWKT = function( feature ){
  return (new ol.format.WKT()).writeFeature( feature );
}

/**
 * feature의 uid를 받아서 해당 feature를 삭제한다.
 * @param uid 
 */
const removeObj = function( uid ) {
  console.group( 'remove obj' );
  // console.log( uid );

  target = objSource.getFeatureByUid( uid );
  objSource.removeFeature( target );

  console.groupEnd( 'remove obj' );
}

//  sessionStorage에 objSource의 피쳐들을 저장한다.
const syncObjGeoj = function() {
  objGeoJ = rw.writeFeatures( objSource.getFeatures() );
  sessionStorage.setItem( 'objGeoJ', objGeoJ );
  objGeoJ = JSON.parse( objGeoJ );
}

/**
 * objSource 가 변하면
 */
let _objFeature, objList;
objSource.on('change', function(){
  console.group(' objSource.on change');
  syncObjGeoj();

  list = objSource.getFeatures();
  // objList = list;
  // console.log( list );
  $('#obj_management_table').empty();
  for( let obj in list ) {
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
    let template = Handlebars.compile( templateSource );
    let html = template(_objFeature);
    console.log( _objFeature );
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
(function() {
  console.group('on load');
  objGeoJ = sessionStorage.getItem( 'objGeoJ');
  // objGeoJ = objGeoJ ? objGeoJ : objSource.getFeatures();

  if( objGeoJ != null ) {
    objGeoJ = rw.readFeatures( objGeoJ );
    objSource.addFeatures( objGeoJ );
  }
  console.groupEnd('on load');
})();

const objPanelTogle = function(uid) {

  console.log()
  tgt = $('#panel_' + uid );
  // console.log( tgt );
  if( tgt.hasClass('panel_hidden') ) {

    let _objFeature = objSource.getFeatureByUid(uid);
    // console.log( _objFeature );

    let templateSource = $('#obj_panel_template').html();
    let template = Handlebars.compile( templateSource );
    let html = template( _objFeature );
    
    // console.log( html );
    tgt.append(html);

    tgt.removeClass('panel_hidden')
    tgt.css('display', 'block');
  } else {
    tgt.addClass('panel_hidden')
    tgt.css('display', 'none');
    tgt.empty();
  }
}