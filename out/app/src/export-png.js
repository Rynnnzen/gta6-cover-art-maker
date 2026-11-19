// PNG export: renders the poster with the same renderer as the preview, at
// the exact pixel size of the chosen format, and downloads it.

import { FORMATS } from './editor-state.js';
import { renderPoster } from './poster-renderer.js';

/** Renders the poster at the format's exact size and returns a PNG blob. */
export function exportPosterPNG(state, photos) {
  const format = FORMATS[state.formatId];
  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');
  renderPoster(ctx, state, photos, format.width, format.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))),
      'image/png',
    );
  });
}

/** File name for an export, naming the format so several exports stay apart. */
export function exportFileName(state) {
  const format = FORMATS[state.formatId];
  const safe = (state.title1 || 'vice').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `vice-mosaic-${safe}-${format.width}x${format.height}.png`;
}

/** Triggers a browser download for a blob. The object URL is revoked after. */
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
