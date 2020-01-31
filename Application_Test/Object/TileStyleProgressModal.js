const loaderTileOn = function(title, total) {
  console.group('Loader Tile On');
  console.log( 'title : ' + title, ' total : ' + total );
  let target = $('#loader_section');
  // target.css('z-index', 100).css('position', 'absolute');
  target.css('z-index', 100).css('position', 'absolute').css('display', 'block');
  let template = Handlebars.compile( $('#loader_tile').html() );
  let preCont = {
    title: title,
    total: total,
  }
  target.append( template(preCont) );
  console.groupEnd('Loader Tile On')
}

const loaderTileOff = function() {
  // $('#loader_section').css('z-index', 0).css('position', 'static');
  $('#loader_section').css('z-index', 0).css('position', 'static').css('display', 'none');
  $('#loader_section').empty();
}