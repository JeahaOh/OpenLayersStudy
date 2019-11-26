
const saveSelectedObjList = function() {
  let allLi = $('.select_obj_mng_li');
  let target = [];
  // console.log( target );
  let length = allLi.length;
  // console.log( length )
  if( length > 0 ) {
    for( var i = 0; i < length; i++ ) {
      if( allLi[i].checked ) {
        // console.log( allLi[i].dataset.ol_uid );
        target.push(objSource.getFeatureByUid(allLi[i].dataset.ol_uid));
      }
    }
    // console.log( target );
  }
  if( target.length > 0 ) {
    target = rw.writeFeatures( target );
    let file = new Blob( [target], {type: 'application/json'});
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
    alert("Please select a file before clicking 'Load'");
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

const receivedText = function(e) {
  let lines = e.target.result;
  var newArr = lines;
  console.log( newArr );
  newArr = rw.readFeatures( newArr )
  objSource.addFeatures( newArr );

  console.log( newArr.features )

  let length = newArr.features.length;
  if ( length > 0 ) {
    for( var i = 0; i < length; i++ ) {
      let feature = newArr.features[i];
      // console.log( feature)
      // console.log( feature.id )
      let style = feature.properties.style;
      if ( style ) {
        // console.log( style );
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
            color: style.text_.color_
          })
        });
        objSource.getFeatureById(feature.id).setStyle(style);
      }
    }
  }
}