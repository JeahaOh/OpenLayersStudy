# Introduction
최신 JS는 모듈을 사용하고 제작할 때 잘 작동한다.  
`OpenLayers`를 사용하는 권장 방법은 npm을 사용, `ol` 패키지를 설치하는 거임.  
  
---
  
## Initial Steps
프로젝트를 위한 빈 디렉토리를 새로 만든다음 프로젝트를 초기화.  
  
```
>> npm init

This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.

package name: (02-building an openlayers application) ol_study
version: (1.0.0)
description: OpenLayers Study
entry point: (index.js)
test command:
git repository:
keywords:
author: Jeaha Oh
license: (ISC)
About to write to C:\Users\GMTC_JH\git\OpenLayersStudy\02 Building an OpenLayers Application\package.json:

{
  "name": "ol_study",
  "version": "1.0.0",
  "description": "OpenLayers Study",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Jeaha Oh",
  "license": "ISC"
}

Is this OK? (yes)
```
  
`package.json` 파일이 디렉토리에 생성됨.  
어플리케이션에 대한 종속성으로 OpenLayers와 parcel-bundler 추가.
  
```
npm install ol
npm install --save-dev parcel-bundler
```
  
---
  
## Application Code
간단하게 시작할 수 있는 어플리케이션 코드
- `index.js`  
  ```
    import 'ol/ol.css';
    import {Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: [15.41, 58.82],
        zoom: 4
      })
    });
  ```
- `index.html`  
  ```
    <!DOCTYPE html>
    <html lang="kor">
    <head>
      <meta charset="utf-8">
      <title>Using Parcel with OpenLayers</title>
      <style>
        #map {
          width: 100%;
          height: 800px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script type="text/javascript" src="index.js"></script>
    </body>
    </html>
  ```
  
---
  
## Creating a bundle
`package.json`에 두개의 추가 라인을 사용하면  
번들을 수동으로 만들고 변경 사항을 각각 보기위해  `npm run build`와 `npm start`명령을 사용할 수 있다.  
두개의 추가 명령 `start`와 `build`가 있는 `package.json`은 다음과 같을것임.  
  
```
{
  "name": "ol_study",
  "version": "1.0.0",
  "description": "OpenLayers Study",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "parcel index.html",
    "build": "parcel build --public-url . index.html"
  },
  "author": "Jeaha Oh",
  "license": "ISC",
  "dependencies": {
    "ol": "^6.0.1"
  },
  "devDependencies": {
    "parcel-bundler": "^1.12.4"
  }
}
```
  
실행을 하기 위해서 다음 명령을 입력하면 됨.
```
npm start
```
  
`localhost:1234`에 접속하면 테스트 해 볼수 있음.  
무언가를 변경할 때마다 페이지가 자동으로 로드되어 변경 결과를 표시함.  
  
모든 어플리케이션 코드와 어플리케이션에 사용된 모든 종속성이 포함된 단일 JS 파일이 작성 되어 있음.  
OL 패키지에는 필수 구성요소만 포함되어 있음.  
어플리케이션의 상품을 번들로 작성 하려거든 `npm run build` 명령을 입력하면  
`dist/` 폴더가 생기고 서버에 올리면 됨.
  
  ---  

# Basic Concepts
## Map
OpenLayers의 핵심 구성 요소는 지도 (`ol/Map`)임.  
`target` container (ex: `div` 지도가 포함 된 웹 페이지의 요소)로 렌더링 됨.  
모든 지도 속성은 생성시 또는 설정 밥법에 따가 사용을 구성할 수 있음. (ex: `setTarget()`)  
  
```
import Map from 'ol/Map';

var map = new Map({target: 'map'});
```
  
## View
지도는 중심, 확대 / 축소 수준 및 지도 투영과 같은 것을 책임지지 않음.  
이들은 `ol/View` 인스턴스의 속성임.  
  
```
import View from 'ol/View';

map.setView( new View({
  center: [x, y],
  zoom: 8
}));
```
  
`View`는 또한 `projection`을 가지고 있음.  
투영법에 따라 좌표계 `center` 및 지도 축척 계산 단위가 결정됨.  
위의 스니펫과 같이 지정되지 않은 경우 기본 투영법은 미터 단위가 맵 단위인 EPSG: 3857임.  
  
이 `zoom` 옵션은 지도의 축척 지정하는 편리한 방법임.  
사용 가능한 줌 레벨은 다음 3요소에 의해 결정됨.  
`maxZoom`(기본값 : 28),  
`zoomFactor`(기본값 : 2),  
`maxResolution`(기본 값은 프로젝션의 유효 범위가 256 X 256 픽셀 타일에 맞는 방식으로 계산 됨.)  
  
`maxResolution` 픽셀 당 단위의 해상도로 확대 / 축소 단위 0에서 시작하여 `zoomFactor`, `maxZoom`에 도달 할 때까지 축척을 나누어 계산함.

## Source
레이어에 대한 원격 데이터를 얻기 위해 OpenLayers는 `ol/source/Source` 서브 클래스를 사용함.  
OpenStreetMap 또는 Bing과 같은 무료 및 상용지도 타일 서비스,  
WMS 또는 WMTX와 같은 OGG 소스,  
GeoJSON 또는 KML과 같은 형식의 벡터 데이터에 사용할 수 있음.  
  
```
import OSM from 'ol/source/OSM';
var osmSource = OSM();
```
  
## Layer
레이어는 `source`의 데이터를 시각적으로 표현한 것임.  
OpenLayers에는 네가지 기본 유형의 레이어가 있음.  
- `ol/layer/Tile`   : 특정 축척의 클로즈업 수준으로 구성된 격자 이미지로 타일 이미지를 제공하는 소스를 렌더링함.
- `ol/layer/Image`  : 임의의 범위와 해상도로 맵 이미지를 제공하는 소스를 렌더링함.  
- `ol/layer/Vector` : 벡터 데이터를 클라이언트 측으로 렌더링함.
- `ol/layer/VectorTile` : 벡터 타일로 제공되는 데이터를 렌더링함.
  
```
import TileLayer from 'ol/layer/Tile';

var osmLayer = new TileLayer({source: osmSource});
map.addLayer(osmLayer);
```
  
## Putting it all together
위의 스니펫은 단일 레이어로 지도를 렌더링 하는 단일 스크립트로 결합 될 수 있음.  
```
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

new Map({
  layers : [
    new TileLayer({ source : new OSM() })
  ],
  view : new TileLayer({
    center: [0, 0],
    zoom: 2
  }),
  target: 'map'
})