import {
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  createFeatureFromPost,
  createMap,
  createVectorLayer,
  getLonLatFromPost,
  zoomToContent,
} from './lib';

function MapSelect(props) {
  const { options } = props;
  const { fields, post } = options;
  const divRef = useRef(null);

  const map = useMemo(() => createMap(), []);
  const view = map.getView();

  const layer = useMemo(() => {
    const [lon, lat] = getLonLatFromPost(post);
    const features = lon != null && lat != null ? [createFeatureFromPost(post)] : [];
    return createVectorLayer(features);
  }, [map, post]);

  useEffect(() => {
    map.addLayer(layer);
    zoomToContent(layer, view);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer, view]);

  useEffect(() => {
    map.setTarget('map');

    const clickListener = (event) => {
      const { coordinate } = event;
      const zoom = map.getView().getZoom();

      const latitudeInput = document.getElementById(fields.latitude.id);
      const longitudeInput = document.getElementById(fields.longitude.id);
      const zoomInput = document.getElementById(fields.zoom.id);

      // Update inputs.
      longitudeInput.value = coordinate[0];
      latitudeInput.value = coordinate[1];
      zoomInput.value = zoom;

      // Update marker location.
      const marker = createFeatureFromPost({
        ...post,
        metas: {
          longitude: coordinate[0],
          latitude: coordinate[1],
          zoom,
        },
      });
      layer.getSource().clear();
      layer.getSource().addFeature(marker);
    };
    map.on('singleclick', clickListener);

    return () => {
      map.un('singleclick', clickListener);
    };
  }, [map, layer, fields, post]);

  return (
    <div
      ref={divRef}
      id={'map'}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default MapSelect;
