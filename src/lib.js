import {
  Feature,
  Map,
  View,
} from 'ol';
import {
  Attribution,
  FullScreen,
  Rotate,
  ScaleLine,
  Zoom,
} from 'ol/control';
import { Point } from 'ol/geom';
import { defaults } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import { Vector } from 'ol/source';
import {
  Circle,
  Fill,
  Stroke,
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

export function getIconColorFromPost(post) {
  const { metas } = { metas: {}, ...post };
  const { icon_color } = metas;
  return icon_color;
}

export function getIconColor(props, defaultValue = undefined) {
  return getIconColorFromPost(props) || defaultValue || 'gold';
}

export function createMap(options = {}) {
  return new Map({
    controls: [
      new Attribution(),
      new FullScreen(),
      new Rotate(),
      new ScaleLine(),
      new Zoom(),
    ],
    interactions: defaults({
      mouseWheelZoom: false,
      onFocusOnly: true,
    }),
    layers: [],
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
    ...post,
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
  const radius = 6;
  return new Circle({
    fill: new Fill({ color: getIconColor(feature.getProperties()) }),
    radius,
    stroke: new Stroke({
      color: 'rgba(0,0,0,0.3)',
      width: 1,
    }),
  });
}

export function createText(feature, resolution, options = {}) {
  return new Text({
    fill: new Fill({ color: getIconColor(feature.getProperties()) }),
    text: feature.get('label'),
    font: 'bold 14px sans-serif',
    // overflow: true,
    offsetY: -10,
    stroke: new Stroke({
      color: 'rgba(0,0,0,0.3)',
      width: 1,
    }),
    ...options,
  });
}

export function calculateIconTextOffset(image) {
  return (image.getRadius() * -1) - 12;
}

export function createDefaultStyle(feature, resolution) {
  const image = createIcon(feature, resolution);
  const text = createText(feature, resolution, { offsetY: calculateIconTextOffset(image) });
  return [
    new Style({ image }),
    new Style({ text }),
  ];
}

export function createHighlightStyle(feature, resolution) {
  const image = createIcon(feature, resolution);
  const text = createText(feature, resolution, { offsetY: calculateIconTextOffset(image) });
  const fill = new Fill({ color: 'white' });
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
