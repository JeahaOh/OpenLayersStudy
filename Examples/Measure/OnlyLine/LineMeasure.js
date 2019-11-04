// 기본 맵 설정
let raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

let source = new ol.source.Vector();

let vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
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


let map = new ol.Map({
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
    center: [-11000000, 4600000],
    zoom: 15
  })
});
// 기본 맵 설정


// Currently drawn feature.
// @type {import("../src/ol/Feature.js").default}
let sketch;

//  The help tooltip element.
// @type {HTMLElement}
let helpTooltipElement;

// Overlay to show the help messages.
// @type {Overlay}
let helpTooltip;

//  The measure tooltip element.
//  @type {HTMLElement}
let measureTooltipElement;

// Overlay to show the measurement.
//  @type {Overlay}
let measureTooltip;

// Message to show when the user is drawing a line.
// @type {string}
let continueLineMsg = 'Click to continue drawing the line';

// global so we can remove it later
let draw;

// Kor : 마우스가 움직이면 작동하는
// Handle pointer move.
// @param {import("../src/ol/MapBrowserEvent").default} evt The event.
let pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  //  측정 중이 아니라면 따라 다니지 않도록 하자.
  if( !getMeasureStatus() ) return;
  // @type {string}
  let helpMsg = 'Click to start drawing';

  if (sketch) {
    let geom = sketch.getGeometry();
    if (geom instanceof ol.geom.LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};

function addInteraction() {
  //  길이만 측정하므로 LineString으로 고정.
  let type = 'LineString';
  draw = new ol.interaction.Draw({
    source: source,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();
  let listener;
  draw.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature;
    
    // @type {import("../src/ol/coordinate.js").Coordinate|undefined} 
    let tooltipCoord = evt.coordinate;
    
    listener = sketch.getGeometry().on('change', function (evt) {
      let geom = evt.target;
      let output;
      if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });
  
  draw.on('drawend', function ( evt ) {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
    /*
    console.group( 'drawend' );
    console.log( `evt : ` );
    console.log( evt );

    console.log( `evt.feature : ` );
    console.log( evt.feature );

    console.log( `evt.feature.getGeometry() : ` );
    console.log( evt.feature.getGeometry() );

    console.log( `evt.feature.getGeometry().getCoordinates() : ` );
    console.log( evt.feature.getGeometry().getCoordinates() );

    let id = Math.floor(Math.random() * 1000);
    evt.feature.setId(id); 
    evt.feature.setProperties({"DevDefineProps" : 'feature - ' + id, "ASDF": '뭐지'});

    console.log( `vector : ` );
    console.log( vector );

    console.log( `vector.getSource() : ` );
    console.log( vector.getSource() );

    console.log( `vector.getSource().getFeatures() : ` );
    console.log( vector.getSource().getFeatures() );
    
    let feat = vector.getSource().getFeatures();
    console.log( `feat : `);
    console.log( feat );

    console.group( '$.each' );
    console.log( 'FOR EACH : ');
    $.each(feat, function( idx ){
      console.log( `feat[idx]` );
      console.log( feat[idx] );

      console.log( `feat[idx].getId()` );
      console.log( feat[idx].getId() );

      console.log( `feat[idx].get('DevDefineProps')` );
      console.log( feat[idx].get('DevDefineProps') );

      if( feat[idx].getId() == id ) {
        console.log("This Guy...");
      }
    })
    console.log( 'FOR EACH END ');
    console.groupEnd();
    console.groupEnd();
    */
  });
}

// Kor : 도움말 툴팁을 생성한다.
// Eng : Creates a new help tooltip
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}

// Kor : 측정 툴팁을 생성한다.
// Eng : Creates a new measure tooltip
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
}

// Kor : LineString Feature를 받아 그 길이를 리턴한다.
// Eng : Format length output.
// @param {LineString} line The line.
// @return {string} The formatted length.
let formatLength = function (line) {
  let length = ol.sphere.getLength(line);
  let output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
      ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
      ' ' + 'm';
  }
  //  console.log('distance : ' + output)
  return output;
};

//  Checkbox measure_status의 값에 따라 작동.
const measureStatus = function() {
  const val = $('#measure_status').val();
  if(val === 'on') {
    $('#measure_status').val('off');

    map.removeInteraction(draw);
  } else {
    $('#measure_status').val('on');

    addInteraction();
    map.on('pointermove', pointerMoveHandler);
  }
  console.log($('#measure_status').val());
}

//  작동 상태를 반환.
const getMeasureStatus = function() {
  const val = $('#measure_status').val();
  if( val === 'on') {
    return true;
  } else {
    return false;
  }
}



addInteraction();
map.on('pointermove', pointerMoveHandler);


const printFeatureList = function() {
  vector.getSource().getFeatures();
}