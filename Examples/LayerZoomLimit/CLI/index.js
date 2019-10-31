import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import {transformExtent, fromLonLat} from 'ol/proj';

let mapExtent = [ -112.261791, 35.983744, -112.113981, 36.132062 ];

let map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      // visible at zoom levels 14 or below.
      maxZoom: 14,
      source: new OSM()
    }),
    new TileLayer({
      //  visible at zoom levels above 14
      minZoom: 14,
      source: new XYZ({
        attributions: 'Tiles @ USGS, rendered with <a href="http://www.maptiler.com/"> MapTiler</a>',
        url: 'https://tileserver.maptiler.com/grandcanyon/{z}/{x}/{y}.png'
      })
    })
  ],
  view: new View({
    center: fromLonLat([ -112.18688965, 36.057944835 ]),
    zoom: 15,
    maxZoom: 18,
    extent: transformExtent( mapExtent, 'EPSG:4326', 'EPSG:3857'),
    constrainOnlyCenter: false
  })
});

/**
 * 지도 줌에 Limit을 줄 수 있다.
 * 예제는 그랜드 캐년 지도를 레이어로 쌓아서,
 * 그랜드 캐년의 지도만 보이게 해놓은 것 같다.
 */