const Map = ol.Map;
const View = ol.View;
const GeoJSON = ol.format.GeoJSON;

const defaultInteractions = ol.interaction.defaults;
const Modify = ol.interaction.Modify;
const Select = ol.interaction.Select;

const VectorLayer = ol.layer.Vector;
const VectorSource = ol.source.Vector;

const CircleStyle = ol.style.Circle;
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;
const Style = ol.style.Style;

let styleFunction = (function() {
  let styles = {};
  let image = new CircleStyle({
    radius: 5,
    fill: null,
    stroke: new Stroke({color: 'orange', width: 2})
  });
  styles['Point'] = new Style({image: image});
  styles['Polygon'] = new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  });
  styles['MultiLineString'] = new Style({
    stroke: new Stroke({
      color: 'green',
      width: 3
    })
  });
  styles['MultiPolygon'] = new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 1
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  });
  styles['default'] = new Style({
    stroke: new Stroke({
      color: 'red',
      width: 3
    }),
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.1)'
    }),
    image: image
  });
  return function(feature) {
    return styles[feature.getGeometry().getType()] || styles['default'];
  };
})();

let geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857'
    }
  },
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [0, 0]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiPoint',
      'coordinates': [[-2e6, 0], [0, -2e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': [[4e6, -2e6], [8e6, 2e6], [9e6, 2e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': [[4e6, -2e6], [8e6, 2e6], [8e6, 3e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[-5e6, -1e6], [-4e6, 1e6],
        [-3e6, -1e6], [-5e6, -1e6]], [[-4.5e6, -0.5e6],
        [-3.5e6, -0.5e6], [-4e6, 0.5e6], [-4.5e6, -0.5e6]]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiLineString',
      'coordinates': [
        [[-1e6, -7.5e5], [-1e6, 7.5e5]],
        [[-1e6, -7.5e5], [-1e6, 7.5e5], [-5e5, 0], [-1e6, -7.5e5]],
        [[1e6, -7.5e5], [15e5, 0], [15e5, 0], [1e6, 7.5e5]],
        [[-7.5e5, -1e6], [7.5e5, -1e6]],
        [[-7.5e5, 1e6], [7.5e5, 1e6]]
      ]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [
        [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6],
          [-3e6, 6e6], [-5e6, 6e6]]],
        [[[-3e6, 6e6], [-2e6, 8e6], [0, 8e6],
          [0, 6e6], [-3e6, 6e6]]],
        [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6],
          [3e6, 6e6], [1e6, 6e6]]]
      ]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'GeometryCollection',
      'geometries': [{
        'type': 'LineString',
        'coordinates': [[-5e6, -5e6], [0, -5e6]]
      }, {
        'type': 'Point',
        'coordinates': [4e6, -5e6]
      }, {
        'type': 'Polygon',
        'coordinates': [
          [[1e6, -6e6], [2e6, -4e6], [3e6, -6e6], [1e6, -6e6]]
        ]
      }]
    }
  }]
};

let source = new VectorSource({
  features: (new GeoJSON()).readFeatures(geojsonObject)
});

let layer = new VectorLayer({
  source: source,
  style: styleFunction
});

let overlayStyle = (function() {
  let styles = {};
  styles['Polygon'] = [
    new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5]
      })
    }),
    new Style({
      stroke: new Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new Style({
      stroke: new Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles['MultiPolygon'] = styles['Polygon'];

  styles['LineString'] = [
    new Style({
      stroke: new Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new Style({
      stroke: new Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles['MultiLineString'] = styles['LineString'];

  styles['Point'] = [
    new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: [0, 153, 255, 1]
        }),
        stroke: new Stroke({
          color: [255, 255, 255, 0.75],
          width: 1.5
        })
      }),
      zIndex: 100000
    })
  ];
  styles['MultiPoint'] = styles['Point'];

  styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);

  return function(feature) {
    return styles[feature.getGeometry().getType()];
  };
})();

let select = new Select({
  style: overlayStyle
});

let modify = new Modify({
  features: select.getFeatures(),
  style: overlayStyle,
  insertVertexCondition: function() {
    // prevent new vertices to be added to the polygons
    return !select.getFeatures().getArray().every(function(feature) {
      return feature.getGeometry().getType().match(/Polygon/);
    });
  }
});

let map = new Map({
  interactions: defaultInteractions().extend([select, modify]),
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 1000000],
    zoom: 2
  })
});