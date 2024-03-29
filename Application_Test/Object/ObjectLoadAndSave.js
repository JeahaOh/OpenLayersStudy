/**
 * 관리창에서 선택된 Features 목록을 배열에 담아서 리턴.
 */
const getSelectedObjList = function() {
  console.group( 'get Selected Obj List');
  let allLi = $('.select_obj_mng_li');
  // console.log( allLi );
  let selected = [];

  let length = allLi.length;
  // console.log( length );

  if( length > 0 ) {
    for( var i = 0; i < length; i++ ) {
      if( allLi[i].checked ) {
        selected.push( objSource.getFeatureByUid( allLi[i].dataset.ol_uid ) );
      }
    }
  }
  console.log( selected );
  console.groupEnd( 'get Selected Obj List');
  return selected;
}

/**
 * Session Storage에 저장된 Features를 Client에서 다운로드 하기 위한 함수.
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

/**
 * 사용자가 업로드한 객체를 읽기위한 함수
 */
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
};

/**
 * 업로드 된 파일을 읽어서 스타일을 적용한 뒤,
 * 객체들을 objSource에 addFeature 한다.
 * @param {} e 
 */
const receivedText = function(e) {
  let lines = e.target.result;
  var loadedFeatures = lines;
  // console.log( loadedFeatures );
  loadedFeatures = rw.readFeatures( loadedFeatures );
  // console.log( loadedFeatures );
  console.log( loadedFeatures.length + ' Features Have Loaded From File.');

  let length = 0;
  try { length = loadedFeatures.length; } catch( e ) { console.log( e ) }

  if ( length > 0 ) {
    for( var i = 0; i < length; i++ ) {
      let feature = loadedFeatures[i];
      console.log( feature );
      // console.log( feature.id );
      let type = feature.values_.info.selectedType;
      console.log( i + ' : ' + type );
      if( type == 'Mark' || type == 'Text' || type == 'Arrow' ) {
        defaultStyler( feature );
        continue;
      }
     
      if( type == 'Image' ) imgLayerFunc( feature );
      
      try{
        if ( feature.values_.style ) {
          feature.setStyle( propStyleToStyle( feature ) );
        }
      } catch( e ) { console.log( e ); }
    }
  }
  objSource.addFeatures( loadedFeatures );
}

$('#loadFeaturesFromFile').on('click', function( evt ){
  evt.stopPropagation();
  // console.log( evt );
  $('#fileinput').click();
})