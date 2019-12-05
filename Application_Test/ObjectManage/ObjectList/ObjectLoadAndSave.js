const getSelectedObjList = function() {
  console.group( 'get Selected Obj List');
  let allLi = $('.select_obj_mng_li');
  // console.log( allLi );
  let selected = [];

  let length = allLi.length;
  console.log( length );

  if( length > 0 ) {
    for( var i = 0; i < length; i++ ) {
      if( allLi[i].checked ) {
        selected.push( objSource.getFeatureByUid( allLi[i].dataset.ol_uid ) );
      }
    }
  }

  console.groupEnd( 'get Selected Obj List');
  return selected;
}

/**
 * Session Storage에 저장된 Features를 File로 저장, 다시 Session에 저장하기 위한 js 파일.
 * Read시 스타일이 바로 적용되지 않는 문제가 있고,
 * 문제 해결을 추후에 하기 위해 이 부분만 따로 분리해둠.
 * 
 */

const saveSelectedObjList = function() {
  let target = getSelectedObjList();
  
  if( target.length > 0 ) {
    console.log( target );
    target = rw.writeFeatures( target );
    let file = new Blob( [target.toString()], {type: 'application/json'});

    console.log( target );
    // console.log( file );

    let a = document.createElement('a');
    a.href = URL.createObjectURL( file );
    a.download = TimeStamp.getDateTime() + '.json';
    a.click();
    // console.log( target );
  } else {
    alert('저장할 객체를 선택하세요.');
  }
}

const loadFile = function() {
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  } else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  } else if (!input.files[0]) {
    alert("파일이 없습니다.");
  } else if( input.files[0].type != 'application/json' ) {
    alert('올바른 형식의 파일이 아닙니다.');
    return false;
  } else {
    file = input.files[0];
    // console.log( file );
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }

  //  객체 로드 완료시 페이지를 재 로드 시키는건 어떨까?
  // location.reload();
};

const receivedText = function(e) {
  let lines = e.target.result;
  var newArr = lines;
  console.log( newArr );
  newArr = rw.readFeatures( newArr );
  console.log( newArr.features );

  objSource.addFeatures( newArr );

  let length = 0;
  try { length = newArr.features.length; } catch( e ) { console.log( e ) }

  if ( length > 0 ) {
    for( var i = 0; i < length; i++ ) {
      let feature = newArr.features[i];
      // console.log( feature);
      // console.log( feature.id );
      try{
        if ( feature.properties.style ) {
          let style = feature.properties.style;
          // console.log( style );
          // console.log( style.stroke_.lineDash_ );
          /**
           * 이 블럭 없이 적용해도 될듯 한데?
           */
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
              color: style.text_.color_
            })
          });
          objSource.getFeatureById(feature.id).setStyle(style);
        }
      } catch( e ) { console.log( e ); }
    }
  }
}

$('#loadFeaturesFromFile').on('click', function( evt ){
  evt.stopPropagation();
  // console.log( evt );
  $('#fileinput').click();
})