import {
  Feature,
  Map,
  View,
} from 'ol';
import { Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {
  OSM,
  Vector,
} from 'ol/source';
import {
  Fill,
  RegularShape,
  Style,
  Text,
} from 'ol/style';

export function getLonLatFromPost(post) {
  const { metas } = { metas: {}, ...post };
  const { longitude, latitude } = metas;
  const [lon, lat] = [parseFloat(longitude), parseFloat(latitude)];

  if (isNaN(lon) || isNaN(lat)) {
    return [null, null];
  }
  return [lon, lat];
}

export function getZoomFromPost(post) {
  const { metas } = { metas: {}, ...post };
  const { zoom } = metas;
  return parseFloat(zoom);
}

export function createMap(options = {}) {
  return new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      projection: 'EPSG:4326',
      center: [0, 0],
      zoom: 3,
    }),
    ...options,
  });
}

export function createFeatureFromPost(post) {
  const lonLat = getLonLatFromPost(post);
  return new Feature({
    geometry: new Point(lonLat),
    label: post.post_title,
    guid: post.guid,
    slug: post.post_name,
    id: post.ID,
    zoom: getZoomFromPost(post),
  });
}

export function createVectorLayer(features, options) {
  return new VectorLayer({
    ...options,
    source: new Vector({
      features: features.filter((el) => el != null),
    }),
    style: createDefaultStyle,
    zIndex: 1,
  });
}

export function createHighlightLayer(features, options) {
  return new VectorLayer({
    ...options,
    source: new Vector({ features }),
    style: createHighlightStyle,
    zIndex: 1000,
  });
}

export function createIcon(feature, resolution) {
  const radius = 10;
  return new RegularShape({
    fill: new Fill({ color: 'red' }),
    radius,
    points: 3,
    angle: 45,
    displacement: [0, radius],
  });
}

export function createText(feature, resolution, options = {}) {
  return new Text({
    fill: new Fill({ color: 'red' }),
    text: feature.get('label'),
    font: '14px sans-serif',
    // overflow: true,
    offsetY: -10,
    ...options,
  });
}

export function createDefaultStyle(feature, resolution) {
  const image = createIcon(feature, resolution);
  const text = createText(feature, resolution, { offsetY: image.getRadius() * -2.5 });
  return [
    new Style({ image }),
    new Style({ text }),
  ];
}

export function createHighlightStyle(feature, resolution) {
  const image = createIcon(feature, resolution);
  const text = createText(feature, resolution, { offsetY: image.getRadius() * -2.5 });
  const fill = new Fill({ color: 'black' });
  image.setFill(fill);
  text.setFill(fill);
  return [
    new Style({ image }),
    new Style({ text }),
  ];
}

export function zoomToContent(layer, view) {
  const source = layer.getSource();
  const features = source.getFeatures();

  if (features.length > 1) {
    const opts = { padding: [100, 100, 100, 100] };
    view.fit(source.getExtent(), opts);
    setTimeout(() => {
      view.fit(source.getExtent(), opts);
    }, 100);
  } else if (features.length > 0) {
    const [feature] = features;
    view.setCenter(feature.getGeometry().getCoordinates());
    view.setZoom(feature.getProperties().zoom || 0);
  }
}
