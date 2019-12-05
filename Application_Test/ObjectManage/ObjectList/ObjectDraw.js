//  Global
let objDraw, objSnap, objModify, pointTooltip, status, pointCNT;
let rw = new ol.format.GeoJSON();
const areaType = ['Polygon', 'CircleP', 'Square'];
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
  let className = 'selectedType';
  let menuList = $('#draw_obj_type_li li');
  
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  if( !flag ) console.clear();

  map.removeInteraction( objDraw );
  map.removeInteraction( objSnap );
  map.removeInteraction( objModify );
  map.removeInteraction( select );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
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

const select = new ol.interaction.Select({ wrapx: false });
// map.addInteraction( select );

const drawObj = function( evt ) {
  //  map의 interaction들을 초기화.
  drawObjInit();

  //  변수 선언
  // let sketch;
  let className = 'selectedType';
  let menuList = $('#obj_mng_li li');

  //  이미 같은 type으로 함수를 한번 호출 했었다면 OFF 시키고 리턴.
  if( evt.classList.contains( className) ) {
    $('.' + className ).removeClass( className);
    return false;
  }

  //  다른 type으로 함수를 한번 호출했다면 이전 type의 css 를 되돌림.
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  //  선택한 type에 class를 넣어서 css 컨트롤
  evt.classList.add( className );
  
  //  drawObj 작동할 type
  let selectedType = type = evt.dataset.val;
  
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
      console.log( objText );
      type='Point';
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
    
    
    if( selectedType == 'CircleP' ) {
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
      /**
       * !! sketch의 uid는 db랑 연결 해줘야 함 !!
       */
      // sketch.setId( TimeStamp.getMiliTime() );
      // sketch.setProperties({
      //   info: {
      //     'objName': selectedType + '_' + sketch.ol_uid,
      //     'objGroup': '기본',
      //     'selectedType': selectedType,
      //     'realType': type,
      //     'objCreateDate': TimeStamp.getDateTime(),
      //     'objLastEditor': 'USER'
      //   }
      // });

      setCoordsAtProps( circle );
      defaultStyler( circle );

      objSource.addFeature( circle );
      // console.log( circle )
    } else {
      setCoordsAtProps( sketch );
      // sketch.on('change', function(evt) {
      //   console.log(evt)
      // });
      defaultStyler( sketch );
    }
    // if( selectedType == 'Arrow' ) {
    //   arrowFunction(sketch)
    // }

    
    drawObjInit( true );

    console.groupEnd( 'draw end' );
  });
  //  drawend
}
//  drawObj


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
        // image: new ol.style.Circle({
        //   radius: 7,
        //   fill: new ol.style.Fill({
        //     color: '#ffcc33'
        //   })
        // }),
        text: new ol.style.Text({
          font: '12px Verdana',
          scale: 3,
          text: objText,
        })
      });
  }

  feature.setStyle( style );
  feature.setProperties( {style: style})
}