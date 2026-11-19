// The editor's state: photos are kept apart from where they sit in panels, so a
// crop survives a layout or format change. Focal points are relative (0..1)
// inside the photo, never preview pixels, so preview and export agree.

export const FORMATS = {
  square: { id: 'square', label: 'Square', width: 1080, height: 1080 },
  portrait: { id: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
  landscape: { id: 'landscape', label: 'Landscape', width: 1920, height: 1080 },
};

export const GRADES = ['sunset', 'neon', 'none'];

/** Builds the fresh editor state: five panels, no photos yet, Vice Mosaic. */
export function createInitialState() {
  return {
    photos: [],
    panels: [
      { id: 0, photoId: null, focalX: 0.5, focalY: 0.42, zoom: 1 },
      { id: 1, photoId: null, focalX: 0.5, focalY: 0.5, zoom: 1 },
      { id: 2, photoId: null, focalX: 0.5, focalY: 0.5, zoom: 1 },
      { id: 3, photoId: null, focalX: 0.5, focalY: 0.55, zoom: 1 },
      { id: 4, photoId: null, focalX: 0.5, focalY: 0.5, zoom: 1 },
    ],
    activePanel: 0,
    layoutId: 'vice',
    formatId: 'square',
    grade: 'sunset',
    intensity: 0.7,
    title1: 'NEON',
    title2: 'GETAWAY',
    subtitle: 'LAST LIGHT OVER VICE CITY',
  };
}

/** Puts `photoId` into panel `panelId` and makes that panel active. */
export function assignPhotoToPanel(state, panelId, photoId) {
  const panel = state.panels.find((p) => p.id === panelId);
  if (!panel) return;
  panel.photoId = photoId;
  state.activePanel = panelId;
}

/** Fills every panel with the same photo, keeping each panel's own crop. */
export function fillAllPanels(state, photoId) {
  for (const panel of state.panels) panel.photoId = photoId;
}

/** Switches the output format; crops and assignments are kept as they are. */
export function setOutputFormat(state, formatId) {
  if (FORMATS[formatId]) state.formatId = formatId;
}

/** Returns the panel currently selected in the editor. */
export function activePanelOf(state) {
  return state.panels.find((p) => p.id === state.activePanel) ?? state.panels[0];
}

/** Resets one panel's crop to the centred default. */
export function resetPanelCrop(state, panelId) {
  const panel = state.panels.find((p) => p.id === panelId);
  if (!panel) return;
  panel.focalX = 0.5;
  panel.focalY = 0.5;
  panel.zoom = 1;
}
