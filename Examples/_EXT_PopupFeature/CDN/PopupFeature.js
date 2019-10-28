// Layers
const layers = [
  new ol.layer.Tile({
    title: 'terrain-background',
    source: new ol.source.Stamen({ layer: 'terrain' })
  })
];

// Map
const map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 5,
    center: [ 166326, 5992663 ]
  }),
  interaction: ol.interaction.defaults({
    altShiftDrageRotate: false, pinchRotate: false
  }),
  layers: layers
});

// GeoJSON Layer
const vectorSource = new ol.source.Vector({
  //  source 파일을 포함해주는 방법 연구 하는 시간보다 원본을 가져오는게 더 빠르니 원본 주소로 주자.
  url: 'https://viglino.github.io/ol-ext/examples/data/departements.geojson',
  format: new ol.format.GeoJSON(),
  attributions:  [ "&copy; <a href='https://www.insee.fr'>INSEE</a>", "&copy; <a href='https://www.data.gouv.fr/fr/datasets/geofla-r/'>IGN</a>" ]
});

map.addLayer( new ol.layer.Vector({
  name: 'Departements',
  source: vectorSource,
  style: function( f ) {
    return new ol.style.Style({
      image: new ol.style.RegularShape({
        radius: 5,
        radius2: 0,
        points: 4,
        stroke: new ol.style.Stroke({ color: '#000', width: 1})
      }),
      text: new ol.style.Text({
        text: f.get('id').toString(),
        font: 'bold 11px sans-serif'
      }),
      stroke: new ol.style.Stroke({
        width: 1,
        color: [255, 128, 0]
      }),
      fill: new ol.style.Fill({
        color: [255, 128, 0, .2]
      })
    })
  }
}));

// Select Interaction
const select = new ol.interaction.Select({
  hitTolerance: 5,
  multi: true,
  condition: ol.events.condition.singleClick
});

// Select Control
var popup = new ol.Overlay.PopupFeature({
  popupClass: 'default anim',
  select: select,
  canFix: true,
  template: {
      title: 
        // 'nom',   // only display the name
        function(f) {
          return f.get('nom')+' ('+f.get('id')+')';
        },
      attributes: // [ 'region', 'arrond', 'cantons', 'communes', 'pop' ]
      {
        'region': { title: 'Région' },
        'arrond': { title: 'Arrondissement' },
        'cantons': { title: 'Cantons' },
        'communes': { title: 'Communes' },
        // with prefix and suffix
        'pop': { 
          title: 'Population',  // attribute's title
          before: '',           // something to add before
          format: ol.Overlay.PopupFeature.localString(),  // format as local string
          after: ' hab.'        // something to add after
        },
        // calculated attribute
        'pop2': {
          title: 'Population (kHab.)',  // attribute's title
          format: function(val, f) { 
            return Math.round(parseInt(f.get('pop'))/100).toLocaleString() + ' kHab.' 
          }
        }
        /* Using localString with a date * /
        'date': { 
          title: 'Date', 
          format: ol.Overlay.PopupFeature.localString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
        }
        /**/
      }
  }
});
map.addOverlay( popup );
