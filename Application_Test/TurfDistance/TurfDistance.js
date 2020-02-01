// Currently drawToMsrn feature.
// @type {import("../src/ol/Feature.js").default}
let sketch;

//  The measure tooltip element.
//  @type {HTMLElement}
let measureTooltipElement;

// Overlay to show the measurement.
//  @type {Overlay}
let measureTooltip;

// global so we can remove it later
let drawToMsr;

// <-- global

function measure() {
  //  길이만 측정하므로 LineString으로 고정.
  let type = 'LineString';
  drawToMsr = new ol.interaction.Draw({
    source: source,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 0, 0, 1)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 3
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 0, 0, 1)'
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 1)'
        })
      })
    })
  });
  map.addInteraction(drawToMsr);

  snap = new ol.interaction.Snap({ source: source });
  map.addInteraction( snap );

  createMeasureTooltip();
  let listener;
  drawToMsr.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature;
    

    // @type {import("../src/ol/coordinate.js").Coordinate|undefined} 
    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', function (evt) {
      let geom = evt.target;
      // console.log( geom.getCoordinates() )
      let output;
      if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  drawToMsr.on('drawend', function ( evt ) {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    // console.log( sketch )
    // console.log( sketch.getGeometry().getCoordinates() )
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);

    map.removeInteraction( drawToMsr );
    map.removeInteraction( snap );
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
  console.log( 'line' );
  console.log( line )
  // console.log( line.getCoordinates() )
  let length = ol.sphere.getLength(line); //  1500
  // let length = turf.distance(line.getCoordinates()[0], line.getCoordinates()[1], {units: 'kilometers'})  //  unit -> kilometers : 7492 miles : 4770 
  console.log( length )
  let output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
    ' km';
  } else {
    output = (Math.round(length * 100) / 100) +
    ' m';
  }
  // console.log( line )
  console.log('distance : ' + output)

  return output;
}; 