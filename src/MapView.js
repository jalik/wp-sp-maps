import {
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  createFeatureFromPost,
  createHighlightLayer,
  createMap,
  createVectorLayer,
  zoomToContent,
} from './lib';
import MapFeature from './MapFeature';
import { createTeFenuaLayer } from './tefenua';

function MapView(props) {
  const { options } = props;
  const { posts } = options;
  const divRef = useRef(null);

  const map = useMemo(() => createMap(), []);
  const view = map.getView();

  const layer = useMemo(() => {
    const features = posts.map(createFeatureFromPost);
    return createVectorLayer(features);
  }, [map, posts]);

  const highlightLayer = useMemo(() => {
    return createHighlightLayer([]);
  }, []);

  useEffect(() => {
    map.addLayer(highlightLayer);
    return () => {
      map.removeLayer(highlightLayer);
    };
  }, [map, highlightLayer]);

  useEffect(() => {
    map.addLayer(layer);
    zoomToContent(layer, view);

    createTeFenuaLayer({
      layer: 'TEFENUA:FOND',
      matrixSet: 'EPSG:4326',
    }).then((el) => {
      map.addLayer(el);
      return el;
    });
    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer, view]);

  useEffect(() => {
    map.setTarget('map');

    const clickListener = (event) => {
      const { pixel } = event;

      const features = map.getFeaturesAtPixel(pixel);
      // todo open popover

      if (features.length === 1) {
        const url = features[0].get('guid');

        if (url != null) {
          window.location.href = url;
        }
      }
    };

    const pointerMoveListener = (event) => {
      const { pixel } = event;

      layer.getFeatures(pixel).then((features) => {
        highlightLayer.getSource().clear();
        highlightLayer.getSource().addFeatures(features);

        if (features.length > 0) {
          map.getTargetElement().style.cursor = 'pointer';
        } else {
          map.getTargetElement().style.cursor = null;
        }
      });
    };

    map.on('singleclick', clickListener);
    map.on('pointermove', pointerMoveListener);

    return () => {
      map.un('singleclick', clickListener);
      map.un('pointermove', pointerMoveListener);
    };
  }, [map, highlightLayer]);

  return (
    <div
      ref={divRef}
      id={'map'}
      style={{ width: '100%', height: '100%' }}
    >
      {options.showlist ? (
        <div className="spmaps-map-features">
          {posts.map((post) => (
            <MapFeature
              key={post.ID}
              post={post}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default MapView;
