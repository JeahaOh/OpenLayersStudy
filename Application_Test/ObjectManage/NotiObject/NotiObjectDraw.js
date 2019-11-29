//  Global
let notiDraw, notiSnap, pointTooltip, objText;
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
 * map에 있는 Draw, Snap, Interaction을 지운다.
 */
const drawNotiInit = function( flag ) {
  let className = 'selectedType';
  let menuList = $('#draw_noti_type_li li');
  objText = '';
  $.each(menuList, function( idx ){
    if( menuList.eq( idx ).hasClass( className )) {
      menuList.eq( idx ).removeClass( className );
    }
  });

  if( !flag ) console.clear();

  map.removeInteraction( notiDraw );
  map.removeInteraction( notiSnap );

  //  초기화 함수를 measureInit에서 호출 하지 않았다면 measureInit 함수를 호출함.
  // if( flag !== 'measureInit' ) measureInit( 'drawObjInit' );
  $(window).unbind('keypress', escape);
} // drawNotiInit


const drawNoti = function( evt ) {
  //  map의 interaction들을 초기화.
  drawNotiInit();

  //  변수 선언
  // let sketch;
  let className = 'selectedType';
  let menuList = $('#noti_obj_type_li li');

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
    case 'Text':
      objText = prompt('Text 내용을 입력하세요');
      console.log( objText );
      type='Point';
      break;
    case 'Icon':
      type='Point';
      break;
    case 'Image':
      
      break;
  }

  //  draw 선언.
  notiDraw = new ol.interaction.Draw({
    source: objSource,
    type: type,
    geometryFunction: geometryFunction,
    maxPoints: maxPoints
  });
  // console.log( notiDraw.source_ );
  map.addInteraction( notiDraw );

  //  snap 넣어줌.
  notiSnap = new ol.interaction.Snap({ source: objSource, pixelTolerance: $('#snapSensitivity').val() });
  map.addInteraction( notiSnap );

  notiDraw.on('drawstart', function( evt ) {
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

  notiDraw.on('drawend', function( evt ) {
    console.group( 'draw end' );
    
    // setCoordsAtProps( sketch );
    defaultStyler( sketch );
    
    drawNotiInit( true );

    console.groupEnd( 'draw end' );
  });
  //  drawend
}
//  drawObj

const defaultStyler = function( feature ) {
  let style = new ol.style.Style({
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

  feature.setStyle( style );
  feature.setProperties( {style: style})
}
