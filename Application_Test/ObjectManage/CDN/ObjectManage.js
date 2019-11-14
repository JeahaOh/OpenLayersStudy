//  기본 맵 설정. -->
let objSource = new ol.source.Vector({wrapX: false});
let rularSource = new ol.source.Vector({wrapX: false});
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    // url: 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
    // url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  })
});
let vector = new ol.layer.Vector({
  source: objSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffeeee',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});
let rularVector = new ol.layer.Vector({
  source: rularSource,
});

let map = new ol.Map({
  layers: [
    raster,
    vector
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([128.4, 35.7]),
    zoom: 7
  }),
  controls: ol.control.defaults().extend([
    new ol.control.ZoomToExtent({
      extent: [
        14148305.929037487, 4495749.883884393,
        14149109.160882792, 4495402.038632968
      ]
    })
  ]),
});
//  <-- 기본 맵 설정.

//  Global
let objDraw, circleRular, objSnap, objModify, measureTooltipElement, coordTooltipElement;

//  Line을 그리면 사각형으로 변환한 geometry를 반환한다.
let squareFunction = function( coordinates, geometry ) {
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

/**
 * @param {*} flag : init 함수를 어디서 호출하는지 확인하기 위한 구분자.
 * true 라면 거리 재기가 끝났을 때 호출,
 * false 라면 거리 재기를 하지 않았을 때 호출.
 * 
 * true일 때 호출 한 경우
 * 리스트에 선택 된 항목을 선택 해제한다.
 * 
 * false일 때 호출 한 경우
 * 거리 재기에 사용된 자원들을 초기화 함.
 * 
 * 공통적으로
 * map에 있는 Draw, Snap, Modify Interaction을 지운다.
 */
const objMngInit = function( flag ){
  if( flag ) {
    let className = 'selectedType';
    let menuList = $('#obj_mng_li li');
    $.each(menuList, function( idx ){
      if( menuList.eq( idx ).hasClass( className )) {
        menuList.eq( idx ).removeClass( className );
      }
    });
  } else {
    map.removeLayer( rularVector );
    rularSource.clear();
    $('div').remove('.rular-point');
  }
  
  map.removeInteraction( objDraw );
  map.removeInteraction( objSnap );
  map.removeInteraction( objModify );
} // objMngInit

/**
 * Creates a new measure tooltip
 */
const createMeasureTooltip = function() {
  //  objMngInit을 하기 때문에 사용하지 않는다.
  // if (measureTooltipElement) {
  //   measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  // }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure rular-point';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
};  //  createMeasureTooltip

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
let formatLength = function(line) {
  let length = ol.sphere.getLength(line);
  // console.log( length );
  let output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
      ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
      ' ' + 'm';
  }
  return output;
};  //  formatLength

/**
 * 인자로 받은 좌표 지점에 Point Feature를 찍어주는 함수.
 * @param {*} coord [14365024.794099694, 4219904.888355112] ('EPSG:4326')형식의 좌표
 */
const drawPoint = function(coord) {
  console.group('Draw Point Func');
  // console.log(coord);
  let point = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat(coord, 'EPSG:4326', 'EPSG:3857')
    )
  });
  point.setStyle( new ol.style.Style({
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0.2)'
      })
    })
  }) );
  rularSource.addFeature( point );
  console.groupEnd('Draw Point Func');
};  //  drawPoint

const rularClick = function( evt ) {  }

const objMng = function( evt ) {
  //  map의 interaction들을 초기화.
  objMngInit();

  //  변수 선언
  let sketch, status, listener;
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
  
  //  objMng 작동할 type
  let type = evt.dataset.val;
  
  let geometryFunction, maxPoints;
  //  type에 따라 switch
  switch( type ) {
    case 'None':
      return;
    case 'Modify':
      objModify = new ol.interaction.Modify({ source: objSource });
      map.addInteraction( objModify );
      return;
    case 'Square':
      type = 'Circle';
      geometryFunction = squareFunction;
      break;
    case 'Rular':
      //  거리를 잴 경우 LineString으로 Feature를 그리고, 분기처리를 위해 변수 선언.
      type = 'LineString';
      maxPoints = 2;
      status = true;
      break;
    case 'ESL':
      type = 'Circle';
      status = true;
      break;
  }

  //  draw 선언.
  objDraw = new ol.interaction.Draw({
    source: !status ? objSource: rularSource,
    type: type,
    geometryFunction: geometryFunction,
    maxPoints: maxPoints
  });
  map.addInteraction( objDraw );
  
  //  type이 rular 라면 거리를 보여줄 tooltip을 띄움.
  //  rularFeature를 보여줄 layer를 띄움.
  if( status ) {
    createMeasureTooltip();
    map.addLayer(rularVector);
  }
  //  snap 넣어줌.
  objSnap = new ol.interaction.Snap({ source: objSource});
  map.addInteraction( objSnap );

  objDraw.on('drawstart', function( evt ) {
    console.group( 'draw start' );

    //  type이 rular일 경우.
    if( status ) {
      //  거리재기 시작점에 점 찍어줌.
      // console.log( evt.feature.getGeometry().getCoordinates()[0] );
      if( type == 'LineString') drawPoint(evt.feature.getGeometry().getCoordinates()[0]);
      if( type == 'Circle') {
        // map.on('click', eslClick);
        drawPoint( evt.feature.getGeometry().getCenter() );
        // drawPoint( evt.feature.getFirstCoordinate() );
        console.log( evt.feature.getGeometry().getCenter() );
      }
      //  거리재기 시 클릭마다 rularFunction을 사용함.
      
      // set sketch
      sketch = evt.feature;
      /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
      let tooltipCoord = evt.coordinate;
      listener = sketch.getGeometry().on('change', function (evt) {
        let geom = evt.target;
        console.log('geom');
        console.log( geom );
        console.log( geom.getLastCoordinate() );
        let output;
        if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
      map.on('click', rularClick );
      
    }
    console.groupEnd( 'draw start' );
  }); //  drawstart

  objDraw.on('drawend', function( evt ) {
    console.group( 'draw end' );

    //  type이 rular일 경우
    if( status ) {
      //  거리재기 끝점에 점 찍어줌.
      if( type == 'LineString' ) drawPoint( evt.feature.getGeometry().getLastCoordinate() );
      if( type == 'Circle' ) {
        // map.un('click', eslClick);
        // console.log( evt.type );
        // console.log( evt.feature );
        // console.log( evt.target );
        // console.log( evt.target.sketchCoords_ );
        let radiusLine = new ol.Feature({
          geometry: new ol.geom.LineString(evt.target.sketchCoords_)
        })
        rularSource.addFeature(radiusLine);
        // console.log( radiusLine )
        // console.log( radiusLine.getGeometry() )
        // console.log( radiusLine.getGeometry().getLastCoordinate() )
        try {
        console.log( formatLength(radiusLine.getGeometry()) );
        } catch ( err ) { console.log(err); }
        drawPoint(radiusLine.getGeometry().getLastCoordinate());
      }
      //  거리재기가 끝나면 rularClick 없애줌.
      map.un('click', rularClick );

      // console.log( evt.feature.getCenter() )

      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static rular-point';
      measureTooltip.setOffset([0, -7]);
      sketch.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          width: 2,
          lineDash: [3, 7]
        })
      }));
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      ol.Observable.unByKey(listener);


      status = undefined;
    }
    objMngInit( true );
    console.groupEnd( 'draw end' );

    // objModify = new ol.interaction.Modify({ source: rularSource });
    // map.addInteraction( objModify );

  }); //  drawend
} //  objMng

const eslClick = function(evt) {
  console.group( 'ESL Click');
  console.log( evt );

  console.groupEnd( 'ESL Click');
}