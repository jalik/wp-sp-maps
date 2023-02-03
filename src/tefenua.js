import { WMTSCapabilities } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import { WMTS } from 'ol/source';
import { optionsFromCapabilities } from 'ol/source/WMTS';

export const TEFENUA_WMTS_URL = 'https://www.tefenua.gov.pf/api/wmts';

let cache = null;

export function getOptionsFromCapabilities(filter) {
  const parser = new WMTSCapabilities();

  if (!cache) {
    return fetch(TEFENUA_WMTS_URL + '?request=GetCapabilities')
      .then((resp) => resp.text())
      .then((xml) => {
        const capabilities = parser.read(xml);
        cache = capabilities;
        return optionsFromCapabilities(capabilities, filter);
      });
  }
  return optionsFromCapabilities(cache, filter);
}

export function createTeFenuaLayer(filter) {
  return getOptionsFromCapabilities(filter).then((options) => {
    return new TileLayer({ source: new TeFenua(options) });
  });
}

class TeFenua extends WMTS {
  constructor(options) {
    options = options || {};

    const attributions = '<a href="https://www.tefenua.gov.pf/">Te Fenua</a>';
    const url = options.url || TEFENUA_WMTS_URL;

    super({
      ...options,
      attributions: attributions,
      attributionsCollapsible: false,
      url: url,
    });
  }
}

export default TeFenua;
