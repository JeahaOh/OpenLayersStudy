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
어플리케이션에 대한 종속성으로 OpenLayers와 parcel-bundler 추가
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