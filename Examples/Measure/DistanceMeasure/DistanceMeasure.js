// 기본 맵 설정
let raster = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
  })
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
    center: ol.proj.fromLonLat([128.4, 35.7]),
    zoom: 14
  })
});
// 기본 맵 설정

//  global -->

// Currently drawn feature.
// @type {import("../src/ol/Feature.js").default}
let sketch;

//  The measure tooltip element.
//  @type {HTMLElement}
let measureTooltipElement;

// Overlay to show the measurement.
//  @type {Overlay}
let measureTooltip;

// global so we can remove it later
let draw;

// <-- global

function measure() {
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
        width: 0.5
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

    map.removeInteraction( draw );
  });
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
  // console.log('distance : ' + output)
  return output;
};