import 'ol/ol.css';
import { render } from 'react-dom';
import MapSelect from './MapSelect';
import MapView from './MapView';

const { options, tagId } = spmaps || {};

const appNode = document.getElementById(tagId || 'spmaps-app');

if (options.fields) {
  render(<MapSelect options={options || {}} />, appNode);
} else {
  render(<MapView options={options || {}} />, appNode);
}
