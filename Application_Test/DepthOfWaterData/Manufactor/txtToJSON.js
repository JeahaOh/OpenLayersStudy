'use strict';
// GLOBAL -->
let fs = require('fs');

const pointTemplate = {
  'geom' : '',
  'depth': '',
  'unit' : 2006
};

let features = [];

const reflexiveClone = function(obj) {
  //  Deep Copy by reflexive use. 
  let clone = {};
  for(var i in obj) {
    if(typeof(obj[i])=="object" && obj[i] != null)
        clone[i] = reflexiveClone(obj[i]);
    else
        clone[i] = obj[i];
  }
  return clone;
}

//  <-- GLOBAL

//  process start

//  getData
let doc = fs.readFileSync('2006.txt', 'utf8');
console.log( 'doc.length : ' +  doc.length );

doc = doc.split('\n');
// console.log(doc[0]);
let docLength = doc.length;
console.log( 'doc.split().length : ' + docLength );

// return;
console.group('Manufactor Loop');
if( docLength > 1 ) {
  console.log( doc[0].split('\t') );
  let pointAsArray;
  try{
    // for( var i = 0; i <= docLength - 1; i++ ) {
    for( var i = 0; i <= 10000; i++ ) {
      // console.log(doc[i])
      
      //  [ '443766.000', '3782662.000', '-76.5\r' ]
      pointAsArray = doc[i].split('\t');
      
      // console.log(pointAsArray);
      
      let point = reflexiveClone(pointTemplate);
      point.geom = 'Point(' + pointAsArray[0] + ' ' + pointAsArray[1] +')';
      point.depth = Number(pointAsArray[2])
      // console.log(point);
      
      features.push(point);
      console.log(i + ' / ' + docLength);
    }
  } catch( err ) {
    console.log( err );
  }
}
console.groupEnd('Manufactor Loop');
// 
console.log(features);

try {
  console.log('File Write Start')
  fs.writeFileSync('2006.json', JSON.stringify(features), 'utf8');
  console.log('File Write END')
} catch( err ) {
  console.log( err )
}

console.log('Process END');
