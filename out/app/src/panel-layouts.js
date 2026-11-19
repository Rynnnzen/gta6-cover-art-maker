// Panel layouts. Every layout is defined per output format as rectangles in
// relative coordinates (0..1 of the poster), so the same identity survives a
// format switch — only the arrangement changes, never a blind centre-crop of
// the square composition. The title band sits in its own reserved strip at the
// bottom (square/portrait) or is overlaid on the lower strip (landscape).

// Each entry: [x, y, width, height, label]
const LAYOUTS = {
  vice: {
    name: 'Vice Mosaic',
    panels: 5,
    square: [
      [0, 0, 0.62, 0.52, 'Main shot'],
      [0.62, 0, 0.38, 0.26, 'Boulevard'],
      [0.62, 0.26, 0.38, 0.26, 'Skyline'],
      [0, 0.52, 0.31, 0.28, 'Street detail'],
      [0.31, 0.52, 0.69, 0.28, 'Waterfront'],
    ],
    portrait: [
      [0, 0, 0.66, 0.48, 'Main shot'],
      [0.66, 0, 0.34, 0.24, 'Boulevard'],
      [0.66, 0.24, 0.34, 0.24, 'Skyline'],
      [0, 0.48, 0.5, 0.24, 'Street detail'],
      [0.5, 0.48, 0.5, 0.24, 'Waterfront'],
    ],
    landscape: [
      [0, 0, 0.45, 0.78, 'Main shot'],
      [0.45, 0, 0.28, 0.39, 'Boulevard'],
      [0.45, 0.39, 0.28, 0.39, 'Skyline'],
      [0.73, 0, 0.27, 0.39, 'Street detail'],
      [0.73, 0.39, 0.27, 0.39, 'Waterfront'],
    ],
  },
  diagonal: {
    name: 'Diagonal Heat',
    panels: 3,
    square: [
      [0, 0, 0.62, 0.8, 'Main shot'],
      [0.62, 0, 0.38, 0.4, 'Boulevard'],
      [0.62, 0.4, 0.38, 0.4, 'Waterfront'],
    ],
    portrait: [
      [0, 0, 1, 0.46, 'Main shot'],
      [0, 0.46, 0.5, 0.26, 'Boulevard'],
      [0.5, 0.46, 0.5, 0.26, 'Waterfront'],
    ],
    landscape: [
      [0, 0, 0.5, 0.78, 'Main shot'],
      [0.5, 0, 0.25, 0.78, 'Boulevard'],
      [0.75, 0, 0.25, 0.78, 'Waterfront'],
    ],
  },
  strip: {
    name: 'Night Strip',
    panels: 4,
    square: [
      [0, 0, 0.55, 0.55, 'Main shot'],
      [0.55, 0, 0.45, 0.55, 'Boulevard'],
      [0, 0.55, 0.5, 0.25, 'Street detail'],
      [0.5, 0.55, 0.5, 0.25, 'Waterfront'],
    ],
    portrait: [
      [0, 0, 1, 0.38, 'Main shot'],
      [0, 0.38, 0.34, 0.34, 'Boulevard'],
      [0.34, 0.38, 0.33, 0.34, 'Skyline'],
      [0.67, 0.38, 0.33, 0.34, 'Waterfront'],
    ],
    landscape: [
      [0, 0, 0.34, 0.78, 'Main shot'],
      [0.34, 0, 0.33, 0.78, 'Boulevard'],
      [0.67, 0, 0.33, 0.39, 'Skyline'],
      [0.67, 0.39, 0.33, 0.39, 'Waterfront'],
    ],
  },
};

/** Returns the panel rectangles and title band for a layout and format. */
export function getPanelLayout(layoutId, formatId) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS.vice;
  const rects = (layout[formatId] ?? layout.square)
    .filter((r) => r[2] > 0 && r[3] > 0)
    .map(([x, y, w, h, label], i) => ({ id: i, x, y, w, h, label }));
  const titleBand =
    formatId === 'landscape'
      ? { x: 0, y: 0.78, w: 1, h: 0.22 }
      : formatId === 'portrait'
        ? { x: 0, y: 0.72, w: 1, h: 0.28 }
        : { x: 0, y: 0.8, w: 1, h: 0.2 };
  return { layoutId, name: layout.name, panels: rects, titleBand };
}

/** Finds the panel id whose rectangle contains relative point (rx, ry). */
export function hitTestPanel(layout, rx, ry) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (rx >= p.x && rx <= p.x + p.w && ry >= p.y && ry <= p.y + p.h) return p.id;
  }
  return null;
}

/** Human-readable list of layout names for the editor. */
export function listLayouts() {
  return Object.entries(LAYOUTS).map(([id, l]) => ({ id, name: l.name, panels: l.panels }));
}
