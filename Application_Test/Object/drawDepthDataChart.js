// 수심 데이터 layer를 띄우기 위한 설정 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



var envSurvWmsSrc = new ol.source.TileWMS({
  url : GEOSERVER_URL + 'EnvironmentSurvey/wms',
  params : {
    'LAYERS' : 'EnvironmentSurvey:tb_depth_data',
    'TILED' : true,
  },
  serverType : 'geoserver',
  projection : 'EPSG:3857',
  transition : 0,
  crossOrigin: "anonymous"
});

var envSurvLyr = new ol.layer.Tile({
  source : envSurvWmsSrc,
  //  map의 zoom이 8 이상일 경우에만 layer를 화면에 보이게 한다.
  minZoom : 8,
  crossOrigin: "anonymous"
});

map.addLayer(envSurvLyr);

// 수심 데이터 layer를 띄우기 위한 설정 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<



//  수심 데이터 "챠트"를 위한 변수 함수 들 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Global -->
Chart.pluginService.register({
  beforeDraw: function (chart, easing) {
      if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
          var helpers = Chart.helpers;
          var ctx = chart.chart.ctx;
          var chartArea = chart.chartArea;

          ctx.save();
          ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
          ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          ctx.restore();
      }
  }
});
let depthDataChart, depthDatasets, depthDataChartImg, depthDataLableLength, depthDataEmptyLabels;
const BORDER_COLOR = "rgba(250, 250, 250, 1)";
const BORDER_COLOR_LIST = [
  "#DC392A"
  , "#C35400"
  , "#E67E22"
  , "#F39C12"
  , "#F1C40F"
  , "#27AE60"
  , "#2ECC71"
  , "#16A085"
  , "#1ABC9C"
  , "#2980B9"
  , "#3498DB"
  , "#1850B9"
  , "#1045DB"
];

let GLOBAL_DEPTH_CHART_DATA;
let SHOWING_DEPTH_CHART_DATA = [];
let DEPTH_CHART;
//  <-- Global 
const drawDepthDataChart = function( depthData ) {
  console.group( 'drawDepthDataChart' );
  console.log( depthData );
  depthDatasets = [];
  depthDataEmptyLabels = [];
  let cnt = 0;
  
  while( depthData[cnt] ) {
    //  style
    depthData[cnt].backgroundColor = BORDER_COLOR_LIST[cnt];
    depthData[cnt].borderColor = BORDER_COLOR_LIST[cnt];
    depthData[cnt].borderWidth = 1;
    depthData[cnt].lineTension = 0.3;
//    depthData[cnt].fill = false;
    
    //  데이터
    depthDatasets[cnt] = depthData[cnt];
    
    // --> Chart의 X축 눈금을 위한 조건문.
    if( cnt == 0 ) depthDataLableLength = depthData[cnt].data.length;
    if( depthDataLableLength > depthData[cnt].data.length ) depthDataLableLength = (depthData[cnt].data.length);
    // <-- Chart의 X축 눈금을 위한 조건문.
    
    cnt++;
  }

  // --> Chart의 X축 눈금을 위한 반복문.
  for( let i = 0; i < depthDataLableLength; i++ ) {
    depthDataEmptyLabels.push('');
  }
  // <-- Chart의 X축 눈금을 위한 반복문.
  
  var data = {
    labels: depthDataEmptyLabels,
    datasets: depthDatasets.reverse()
  };
  console.log( 'Prepared Chart Data' );
// console.log( data );
  if( typeof DEPTH_CHART !== 'undefined' && !DEPTH_CHART) DEPTH_CHART.destroy();

  DEPTH_CHART = new Chart.Line(document.getElementById("waterDepthChart").getContext("2d"), {
    data: data,
    options: {
      responsive: true,
      chartArea: {
//          backgroundColor: 'rgba(0, 0, 0, 0.6)'
      },
      scales: {
          yAxes: [{
            ticks:{
              // min : 0,
              // stepSize : 1,
              fontColor : "#333",
              fontSize : 13
            },
            gridLines:{
              color: "#000",
              lineWidth:1,
              lineHeight:8
              // zeroLineColor :"#000",
              // zeroLineWidth : 2
            },
            // stacked: true
          }],
          xAxes: [{
            gridLines:{
              color: "#000",
              //color: "rgba(200, 200, 200, 0.8)",
              lineWidth:0.5
            }
          }]
        },
      animation: {
        onComplete: function(animation){
          document.querySelector('#savegraph').download = TimeStamp.getDateTime();
          document.querySelector('#savegraph').setAttribute('href', this.toBase64Image());
        }
      }
    }
  });
  
  var waterDepthModal = $('#side-waterDepth-modal');
  waterDepthModal.css({"width":"900px", "opacity":"1", "transform":"translateY(0px)"});
  
  console.groupEnd( 'drawDepthDataChart' );
};

/**
 * Chart를 이미지로 저장하기 위한 함수.
 * Issue -> 이미지의 배경이 없다.
 */
const chartToImg = function() {
  document.querySelector('#savegraph').click();
}

const redrawDepthChart = function() {
//  console.clear();
  console.group('Redraw Depth Chart');
  SHOWING_DEPTH_CHART_DATA = [];
  let unitList = $('.unit-li').get();
//  console.log( unitList );
  unitList.forEach(function(el, idx)  {
//  console.log( el.checked );
    if( el.checked ) {
      SHOWING_DEPTH_CHART_DATA[idx] = GLOBAL_DEPTH_CHART_DATA.find( function( unitData ) {
        return unitData.label == el.value;
      });
    }
  });
  //  간혹 empty 객체가 들어오므로 empty 객체를 지워주자.
  SHOWING_DEPTH_CHART_DATA = SHOWING_DEPTH_CHART_DATA.filter(Boolean);
  //  이전 차트를 지워준다.
  DEPTH_CHART.destroy();
  drawDepthDataChart( SHOWING_DEPTH_CHART_DATA );
  console.groupEnd('Redraw Depth Chart');
}

//  수심 데이터 "챠트"를 위한 변수 함수 들 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


//  선택한 LineString에 걸치는 지점들의 수심데이터를 가져와서 챠트 함수를 호출하기 위한 로직 >>>>>>>>>>>>>>>>>>>>>>>>

const drawRangeLine = new ol.interaction.Draw({
  source : null,
  type : 'LineString',
  maxPoints : 2
});

//  ready, drawing, preparing, sending, waiting, preprocessing, charting
let getDepthStatus = 'ready';
const checkChartStatus = function( prev, next ) {
  console.log( 'Get Depth Status : ' + getDepthStatus );
  if(getDepthStatus !== prev) {
    return false;
  } else {
    getDepthStatus = next;
    return true;
  }
}

const getDepthDataAtLine = function() {
//  console.clear();
  if( !checkChartStatus('ready', 'drawing')) return;
  
  
  console.group('getDepthDataAtLine');
  
  map.addInteraction( drawRangeLine );


  drawRangeLine.once('drawend', function(evt) {
    if( !checkChartStatus('drawing', 'preparing')) return;
    
    console.group('drawRangeLine End');
    res2chart(toWKT(evt.feature))
    //  Draw End Finally End.
    map.removeInteraction(drawRangeLine);
    console.groupEnd('drawRangeLine End');

  }); //  drawend
  console.groupEnd('getDepthDataAtLine');
  
} //  lineToSquare

const res2chart = function(area) {
  if( !checkChartStatus('preparing', 'sending')) return;

  function getData(area) {
    return new Promise(function(resolve, reject) {
      console.group('GET DATA');
      area = {
        'area' : area
      };
      //  console.log( area );
      $.ajax({
        type : "POST",
        url : "reqWaterDepth.do",
        data : area,
        dataType : 'json',
        beforeSend : function(xhr, opts) {
          console.log("before send");
          // when validation is false
          if( !checkChartStatus('sending', 'waiting')) {
            xhr.abort();
            return;
          }
          if (false) {
            xhr.abort();
          }
        },
        success : function(res) {
          console.log("200");
//            console.log(res);
          if (res.length === 0
              && JSON.stringify(res) === JSON.stringify([])) {
            alert('해당 영역에 수심데이터가 없습니다.');
            getDepthStatus = 'ready';
            return;
          } else {
            resolve(res);
          }
        },
        error : function(err) {
          console.log("ERR");
          console.error(err.statusText);
          alert('데이터를 처리 하던중 에러가 발생했습니다.\n' + err.statusText + ' : ' + err.status);
          getDepthStatus = 'ready';
          reject(err);
        }
      });
      console.groupEnd('GET DEPTH DATA');
    });
  }
  getData(area).then(function(data) {
    if( !checkChartStatus('waiting', 'preprocessing')) return;

    console.group('THEN PREPARE');
    GLOBAL_DEPTH_CHART_DATA = data;
    console.log( GLOBAL_DEPTH_CHART_DATA );
    let target = $('#unit-list');
    target.empty();
    let template = Handlebars.compile( $('#water-depth-li-template').html() );
//      console.log( $('#water-depth-li-template').html() );
    
    GLOBAL_DEPTH_CHART_DATA.forEach( function( obj ) {
      target.append( template(obj) );
    });
    console.groupEnd('THEN PREPARE');
    return data;
  }).then( function(data) {
    if( !checkChartStatus('preprocessing', 'charting')) return;
//      console.clear();
    console.group('THEN CHART');
    drawDepthDataChart( data );
    console.groupEnd('THEN CHART');
  }).then( function() {
    if( !checkChartStatus('charting', 'ready')) return;
    
    console.log( 'getDepthStatus : ' + getDepthStatus );
    console.log( 'END' );
  });
}

//  선택한 LineString에 걸치는 지점들의 수심데이터를 가져와서 챠트 함수를 호출하기 위한 로직 <<<<<<<<<<<<<<<<<<<<<<<<<



/**
const makeRandomPoints =  function() {
	objSource.addFeatures( ( new ol.format.GeoJSON()).readFeatures( turf.randomPoint( 5000, {bbox:[-180, -90, 180, 90]} ) ))
	
	features = objSource.getFeatures();
	
	for( i in features ) {
	  features[i] = toWKT(features[i])
	}
	
	features = JSON.stringify( features );
	
	return features;
}

*/
/*
14615931 4497472
14615931 4483591
14635998 4483591
14635998 4497472


objSource.addFeatures(rw.readFeatures( turf.randomPoint( 5000, {bbox:[14615931, 4483591, 14635998, 4497472]} ) ));


objSource.addFeatures( ( new ol.format.GeoJSON()).readFeatures( turf.randomPoint( 5000, {bbox:[-180, -90, 180, 90]} ) ))
objSource.addFeatures(rw.readFeatures( turf.randomPoint( 5000, {bbox:[131, 38, 136, 40]} ) ));

features = objSource.getFeatures();

for( i in features ) {
  features[i] = toWKT(features[i])
}

JSON.stringify( features )

const makeRandomPoints =  function() {
	objSource.addFeatures(rw.readFeatures( turf.randomPoint( 5000, {bbox:[14615931, 4483591, 14635998, 4497472]} ) ));
	
	features = objSource.getFeatures();
	
	for( i in features ) {
	  features[i] = toWKT(features[i])
	}
	
	features = JSON.stringify( features );
	
	return features;
}
 */