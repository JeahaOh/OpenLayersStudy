//  Global
let notiDraw, notiSnap, objText, notiCnv, notiCtx, notiImg, notiPattern;
let sketch;
const imgDir = '/Application_Test/ObjectManage/NotiObject/img/';

/**
 * @param {*} flag : init 함수를 어디서 호출하는지 확인하기 위한 구분자.
 * true라면 draw가 끝났을 때 호출,
 * 리스트에 선택 된 항목을 선택 해제한다.
 * 
 * false라면 draw 하지 않았을 때 호출.
 * 이전 측정에 사용된 자원들을 초기화 함.
 * 
 * 공통적으로
 * map에 있는 Draw, Snap, Interaction을 지운다.
 */
const drawNotiInit = function( flag ) {
  if( !flag ) console.clear();

  map.removeInteraction( notiDraw );
  map.removeInteraction( notiSnap );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  // if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  $(window).unbind('keypress', escape);
} // drawNotiInit


/*
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
        text: new ol.style.Text({
          font: '12px Verdana',
          scale: 3,
          text: objText,
        })
      });
  }

  feature.setStyle( style );
  feature.setProperties( {style: style} )
}
*/

const imgFillColor = function() {
  drawNotiInit(); 
  
  notiCnv = document.createElement('canvas');
  // console.log( notiCnv );

  notiCtx = notiCnv.getContext('2d');
  // console.log( notiCtx );

  notiImg = new Image();
  // console.log( notiImg );

  notiImg.src = '/Application_Test/ObjectManage/NotiObject/img/test.png';
  notiImg.onload = function () {
    notiPattern = notiCtx.createPattern(notiImg, 'no-repeat');
    // console.log( notiPattern );
  };

  notiDraw = new ol.interaction.Draw({
    source: objSource,
    type: 'Polygon'
  });
  // console.log( notiDraw.source_ );
  map.addInteraction( notiDraw );

  notiDraw.on( 'drawstart', function( evt ) {
    sketch = evt.feature;
  });

  notiDraw.on( 'drawend', function( evt ) {

    console.log( sketch )
    sketch.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 1)'
      }),
      fill: new ol.style.Fill({
        color: notiPattern
      })
    }));
    drawNotiInit( true );
  });
};

const staticImg = function() {
  drawNotiInit(); 
  
  notiCnv = document.createElement('canvas');
  // console.log( notiCnv );

  notiCtx = notiCnv.getContext('2d');
  // console.log( notiCtx );

  notiImg = new Image();
  // console.log( notiImg );

  notiImg.src = '/Application_Test/ObjectManage/NotiObject/img/test.png';
  notiImg.onload = function () {
    notiPattern = notiCtx.createPattern(notiImg, 'no-repeat');
    // console.log( notiPattern );
  };

  notiDraw = new ol.interaction.Draw({
    source: null,
    type: 'Polygon'
  });
  // console.log( notiDraw.source_ );
  map.addInteraction( notiDraw );

  notiDraw.on( 'drawstart', function( evt ) {
    sketch = evt.feature;
  });

  notiDraw.on( 'drawend', function( evt ) {
    coords = sketch.getGeometry().getCoordinates();
    coords = coords[0].splice( coords.length );
    console.log( coords );
    // let extent = ol.proj.transformExtent( coords, 'EPSG:4326', 'EPSG:3857' );
    let extent = ol.proj.transform( coords, 'EPSG:4326', 'EPSG:3857' );
    console.log( extent );
    // let imageLayer = new ol.layer.Image({
    //   source: new ol.source.ImageStatic({
    //     url: '/Application_Test/ObjectManage/NotiObject/img/test.png',
    //     crossOrigin: 'anonymous',
    //     projection: 'EPSG:4326',
    //     imageExtent: [0, 0, 180, 3]
    //   })
    // });
    // console.log( imageLayer );
    // map.addLayer( imageLayer );
    // sketch.setStyle(new ol.style.Style({
    //   stroke: new ol.style.Stroke({
    //     color: 'rgba(0, 0, 0, 1)'
    //   }),
    //   fill: new ol.style.Fill({
    //     color: notiPattern
    //   })
    // }));
    // drawNotiInit( true );
  });
}
/*
var imageExtent = [0, 0, 180, 35];

let aSource = new ol.source.ImageStatic({
  url: '/Application_Test/ObjectManage/NotiObject/img/test.png',
  crossOrigin: 'anonymous',
  projection: 'EPSG:4326',
  imageExtent: imageExtent
});

let func = function(){
  var imageLayer = new ol.layer.Image({
    source: aSource
  });
  map.addLayer(imageLayer);
}
func();
*/