// Vice Mosaic — wires the editor: photos, panel selection and drag-crop,
// layout / grade / caption controls, and the PNG export. A `?shot=` query sets
// up a fixed scene for screenshots instead (./shots.js).

import { createInitialState, FORMATS, assignPhotoToPanel, fillAllPanels, setOutputFormat, activePanelOf, resetPanelCrop } from './editor-state.js';
import { getPanelLayout, hitTestPanel } from './panel-layouts.js';
import { dragPanelCrop, computeCoverCrop } from './panel-crop.js';
import { loadImage, loadSamplePhotos, loadUserPhotos } from './photo-library.js';
import { renderPoster, drawActivePanelOutline } from './poster-renderer.js';
import { exportPosterPNG, exportFileName, downloadBlob } from './export-png.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('poster');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const state = createInitialState();
const photos = new Map();
let samplesLoaded = false;
let renderQueued = false;

function setStatus(text) {
  statusEl.textContent = text;
}

/** Schedules one render on the next animation frame, coalescing bursts. */
function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    drawPreview();
  });
}

/** Draws the preview at the format's aspect ratio, with the editor overlay. */
function drawPreview() {
  const format = FORMATS[state.formatId];
  const previewW = 1080;
  const previewH = Math.round((1080 * format.height) / format.width);
  if (canvas.width !== previewW || canvas.height !== previewH) {
    canvas.width = previewW;
    canvas.height = previewH;
  }
  renderPoster(ctx, state, photos, previewW, previewH, (c, layout) => {
    drawActivePanelOutline(c, layout, state.activePanel, previewW, previewH);
  });
  syncPanelControls();
}

/** Rebuilds the thumbnails, the panel photo picker and the panel label. */
function syncPanelControls() {
  const layout = getPanelLayout(state.layoutId, state.formatId);
  const panel = activePanelOf(state);
  const label = layout.panels[panel.id]?.label ?? `Panel ${panel.id + 1}`;
  document.getElementById('active-panel').textContent =
    `Panel ${panel.id + 1} of ${layout.panels.length} — ${label}`;
  const picker = document.getElementById('panel-photo');
  const current = picker.value;
  picker.innerHTML = '';
  for (const photo of photos.values()) {
    const opt = document.createElement('option');
    opt.value = photo.id;
    opt.textContent = photo.name;
    picker.appendChild(opt);
  }
  picker.value = panel.photoId ?? current ?? '';
  document.getElementById('zoom').value = Math.round(panel.zoom * 100);
  document.getElementById('zoom-value').textContent = `${Math.round(panel.zoom * 100)}%`;
  document.getElementById('intensity-value').textContent = `${Math.round(state.intensity * 100)}%`;
  const thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = '';
  for (const photo of photos.values()) {
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.name;
    img.tabIndex = 0;
    if (photo.id === panel.photoId) img.classList.add('selected');
    const pick = () => {
      assignPhotoToPanel(state, state.activePanel, photo.id);
      requestRender();
    };
    img.addEventListener('click', pick);
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
    thumbs.appendChild(img);
  }
}

/** Adds photo records to the library and fills empty panels with the first. */
function addPhotos(records) {
  for (const record of records) photos.set(record.id, record);
  const first = records[0];
  if (first) {
    for (const panel of state.panels) {
      if (!panel.photoId) panel.photoId = first.id;
    }
  }
  requestRender();
}

/** Loads the bundled samples once, then fills the panels from them. */
async function useSamples() {
  if (!samplesLoaded) {
    setStatus('Loading samples…');
    const samples = await loadSamplePhotos();
    samplesLoaded = true;
    addPhotos(samples);
    // Boulevard leads the main panel; the pier fills the waterfront panels.
    assignPhotoToPanel(state, 0, 'sample-boulevard');
    if (state.panels[4]) assignPhotoToPanel(state, 4, 'sample-pier');
    if (state.panels[1]) assignPhotoToPanel(state, 1, 'sample-pier');
    state.activePanel = 0;
    setStatus('Samples loaded — drag a photo inside a panel to crop it.');
  }
  requestRender();
}

// --- Panel picking and drag-crop on the canvas -----------------------------
let drag = null;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    rx: (event.clientX - rect.left) / rect.width,
    ry: (event.clientY - rect.top) / rect.height,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const p = canvasPoint(event);
  const layout = getPanelLayout(state.layoutId, state.formatId);
  const hit = hitTestPanel(layout, p.rx, p.ry);
  if (hit === null) return;
  state.activePanel = hit;
  canvas.setPointerCapture(event.pointerId);
  drag = { x: p.x, y: p.y, panel: activePanelOf(state) };
  requestRender();
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const p = canvasPoint(event);
  const panel = drag.panel;
  const layout = getPanelLayout(state.layoutId, state.formatId);
  const rect = layout.panels[panel.id];
  if (!rect || !panel.photoId) return;
  const photo = photos.get(panel.photoId);
  if (!photo) return;
  // Drag in preview pixels: convert to the poster's pixel space, then move
  // the focal point against the photo's actual draw rectangle.
  const previewPanel = {
    x: rect.x * canvas.width,
    y: rect.y * canvas.height,
    w: rect.w * canvas.width,
    h: rect.h * canvas.height,
  };
  const draw = computeCoverCrop(photo.img, previewPanel, panel);
  const next = dragPanelCrop(panel, draw, previewPanel.w, previewPanel.h, p.x - drag.x, p.y - drag.y);
  panel.focalX = next.focalX;
  panel.focalY = next.focalY;
  drag.x = p.x;
  drag.y = p.y;
  requestRender();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

// --- Controls ---------------------------------------------------------------
document.getElementById('upload').addEventListener('change', async (event) => {
  const records = await loadUserPhotos([...event.target.files]);
  if (records.length) {
    addPhotos(records);
    setStatus(`${records.length} photo${records.length > 1 ? 's' : ''} added — click a thumbnail to put it in the selected panel.`);
  }
  event.target.value = '';
});
document.getElementById('use-samples').addEventListener('click', useSamples);

document.getElementById('layouts').addEventListener('click', (event) => {
  const button = event.target.closest('[data-layout]');
  if (!button) return;
  state.layoutId = button.dataset.layout;
  state.activePanel = 0;
  document.querySelectorAll('#layouts button').forEach((b) => b.classList.toggle('active', b === button));
  requestRender();
});
document.getElementById('formats').addEventListener('click', (event) => {
  const button = event.target.closest('[data-format]');
  if (!button) return;
  setOutputFormat(state, button.dataset.format);
  document.querySelectorAll('#formats button').forEach((b) => b.classList.toggle('active', b === button));
  requestRender();
});
document.getElementById('grade').addEventListener('change', (event) => {
  state.grade = event.target.value;
  requestRender();
});
document.getElementById('intensity').addEventListener('input', (event) => {
  state.intensity = event.target.value / 100;
  requestRender();
});
document.getElementById('panel-photo').addEventListener('change', (event) => {
  assignPhotoToPanel(state, state.activePanel, event.target.value);
  requestRender();
});
document.getElementById('zoom').addEventListener('input', (event) => {
  activePanelOf(state).zoom = event.target.value / 100;
  requestRender();
});
document.getElementById('reset-crop').addEventListener('click', () => {
  resetPanelCrop(state, state.activePanel);
  requestRender();
});
document.getElementById('fill-all').addEventListener('click', () => {
  const panel = activePanelOf(state);
  if (panel.photoId) {
    fillAllPanels(state, panel.photoId);
    setStatus('Every panel now uses the selected panel’s photo.');
    requestRender();
  }
});
for (const [id, key] of [['title1', 'title1'], ['title2', 'title2'], ['subtitle', 'subtitle']]) {
  document.getElementById(id).addEventListener('input', (event) => {
    state[key] = event.target.value;
    requestRender();
  });
}
document.getElementById('export').addEventListener('click', async () => {
  const button = document.getElementById('export');
  button.disabled = true;
  setStatus('Rendering PNG…');
  try {
    await document.fonts.ready;
    const blob = await exportPosterPNG(state, photos);
    const name = exportFileName(state);
    downloadBlob(blob, name);
    const format = FORMATS[state.formatId];
    setStatus(`Saved ${name} — ${format.width} × ${format.height} PNG.`);
  } catch (error) {
    setStatus(`Export failed: ${error.message}`);
  } finally {
    button.disabled = false;
  }
});

// --- Start ------------------------------------------------------------------
const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query.get('shot'), query, async (sampleUrl, line1, line2, q) => {
    await useSamples();
    const img = await loadImage(sampleUrl);
    const photoId = sampleUrl.includes('boulevard') ? 'sample-boulevard' : 'sample-pier';
    photos.set(photoId, { id: photoId, name: photoId, img, sample: true });
    state.title1 = line1 || 'NEON';
    state.title2 = line2 || 'GETAWAY';
    document.getElementById('title1').value = state.title1;
    document.getElementById('title2').value = state.title2;
    if (q.get('layout')) state.layoutId = q.get('layout');
    if (q.get('grade')) state.grade = q.get('grade');
    if (q.get('format')) setOutputFormat(state, q.get('format'));
    requestRender();
  });
} else {
  useSamples().then(() => requestRender());
}
