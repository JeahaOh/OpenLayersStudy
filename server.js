const http        = require('http');
const url         = require('url');
const querystring = require('querystring');
const fs          = require('fs');

http.createServer( function( req, res ) {

  pathName        = url.parse( req.url ).pathname;
  if( req.method === 'POST' ) {
    console.log( 'POST --> ' + __dirname + pathName );
    
    collectRequestData( req, result => {
      console.log( 'result : ' );
      console.log( result );
      console.log( 'result end' );
      res.end( result );
    });
  } else {
    
    fs.readFile( __dirname + pathName, function( err, data ) {
      if( err ) {
        console.log( 'GET :: 404 --> ' + __dirname + pathName );
        res.writeHead( 404, {'Content-Type' : 'text/plain'} );
        res.write( 'Page Was Not Found' + JSON.stringify( err ) );
        res.end();
      } else {
        console.log( 'GET :: 200 --> ' + __dirname + pathName );
        res.writeHead( 200 );
        res.write( data );
        res.end();
      }
    });
  }
}).listen( 3000, 'localhost', ( err ) => {
  if( err ) console.log( err );
  console.log( 'Simple Server On.');
});

const collectRequestData = function( req, callback ) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';
  console.log( 'req.headers' );
  console.log( req.headers );
  console.log( 'req.body' );
  console.log( req );
  // if( req.headers[ 'content-type' ] === FORM_URLENCODED ) {
    let body = '';
    req.on( 'data', chunk => {
      body += chunk.toString();
    });
    req.on( 'end', () => {
      callback( querystring( body ) );
    });
  // } else {
    // callback( null );
  // }
}