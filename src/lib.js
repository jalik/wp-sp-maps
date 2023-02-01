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
    // declutter: true,
    style: createStyle,
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

export function createStyle(feature, resolution) {
  const icon = createIcon(feature, resolution);
  return [
    new Style({
      image: icon,
    }),
    new Style({
      text: createText(feature, resolution, { offsetY: icon.getRadius() * -2.5 }),
    }),
  ];
}

export function zoomToContent(layer, view) {
  const source = layer.getSource();
  const features = source.getFeatures();

  if (features.length > 1) {
    view.fit(source.getExtent());
  } else if (features.length > 0) {
    const [feature] = features;
    view.setCenter(feature.getGeometry().getCoordinates());
    view.setZoom(feature.getProperties().zoom || 0);
  }
}
