// Cover-crop math: given a photo and the panel it must fill, work out where to
// draw it so the focal point stays centred and no empty space shows.

/**
 * Computes the draw rectangle for a photo inside a panel.
 * `photo` has naturalWidth/naturalHeight; `panel` is in pixels;
 * `crop` is { focalX, focalY, zoom } with focal values relative to the photo.
 * Returns { dx, dy, dw, dh } in panel coordinates.
 */
export function computeCoverCrop(photo, panel, crop) {
  const pw = photo.naturalWidth;
  const ph = photo.naturalHeight;
  const base = Math.max(panel.w / pw, panel.h / ph);
  const scale = base * Math.max(1, crop.zoom || 1);
  const dw = pw * scale;
  const dh = ph * scale;
  // Place the focal point at the panel centre, then clamp so the photo still
  // covers the whole panel (no empty edges).
  let dx = panel.x + panel.w / 2 - crop.focalX * dw;
  let dy = panel.y + panel.h / 2 - crop.focalY * dh;
  dx = Math.min(panel.x, Math.max(panel.x + panel.w - dw, dx));
  dy = Math.min(panel.y, Math.max(panel.y + panel.h - dh, dy));
  return { dx, dy, dw, dh };
}

/**
 * Moves a panel's focal point by a drag of (dx, dy) pixels inside a panel of
 * size (panelW, panelH), given the current draw rectangle. The focal point
 * moves opposite to the drag, like dragging the photo itself.
 */
export function dragPanelCrop(crop, draw, panelW, panelH, dx, dy) {
  const next = { ...crop };
  next.focalX = clamp01(crop.focalX - dx / draw.dw);
  next.focalY = clamp01(crop.focalY - dy / draw.dh);
  return next;
}

/** Zooms a panel's crop around its focal point, clamped to 1x–2.6x. */
export function zoomPanelCrop(crop, zoom) {
  return { ...crop, zoom: Math.min(2.6, Math.max(1, zoom)) };
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
