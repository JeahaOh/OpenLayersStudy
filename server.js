const http        = require('http');
const url         = require('url');
const querystring = require('querystring');
const fs          = require('fs');

http.createServer( function( req, res ) {
  console.log( req );
  pathName        = url.parse( req.url ).pathname;

  fs.readFile( __dirname + pathName, function( err, data ) {
    if( err ) {
      res.writeHead( 404, {'Content-Type' : 'text/plain'} );
      res.write( 'Page Was Not Found' + JSON.stringify( err ) );
      res.end();
    } else {
      res.writeHead( 200 );
      res.write( data );
      res.end();
    }
  });
}).listen( 3000, () => {
  console.log( 'Simple Server On.');
});