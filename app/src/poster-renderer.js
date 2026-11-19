// The one renderer used for both the live preview and the PNG export, so
// what you see is exactly what you download. It draws the panels, the
// sunset/neon grade, the diagonal accents, the title block and the grain.

import { getPanelLayout } from './panel-layouts.js';
import { computeCoverCrop } from './panel-crop.js';
import { applyPosterGrade, drawGrain } from './color-grade.js';
import { drawTitleBlock } from './poster-lettering.js';

const GAP = 10; // dark separator between panels, in output pixels at 1080 wide

/**
 * Renders the whole poster into `ctx` at `width` x `height`.
 * `state` is the editor state, `photos` is a Map of id -> photo record.
 * `overlay` (optional) draws editor-only marks such as the active panel.
 */
export function renderPoster(ctx, state, photos, width, height, overlay) {
  const layout = getPanelLayout(state.layoutId, state.formatId);
  const gap = Math.max(4, Math.round((GAP * width) / 1080));
  // Deep violet base: fills the separators and the title band.
  ctx.save();
  ctx.fillStyle = '#160a20';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  for (const rect of layout.panels) {
    const panel = state.panels[rect.id];
    const px = rect.x * width;
    const py = rect.y * height;
    const pw = rect.w * width;
    const ph = rect.h * height;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    const photo = panel && panel.photoId ? photos.get(panel.photoId) : null;
    if (photo && photo.img) {
      ctx.filter = 'saturate(1.28) contrast(1.09) brightness(1.02)';
      const draw = computeCoverCrop(photo.img, { x: px, y: py, w: pw, h: ph }, panel);
      ctx.drawImage(photo.img, draw.dx, draw.dy, draw.dw, draw.dh);
      ctx.filter = 'none';
    } else {
      // Empty panel: a violet gradient placeholder with its label.
      const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
      g.addColorStop(0, '#3a1c52');
      g.addColorStop(1, '#1c0e2c');
      ctx.fillStyle = g;
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = 'rgba(255, 238, 200, 0.75)';
      ctx.font = `600 ${Math.max(14, pw * 0.045)}px "Barlow Condensed", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rect.label.toUpperCase(), px + pw / 2, py + ph / 2);
    }
    ctx.restore();
  }

  // Thick dark separators between panels, with a small diagonal speed-line
  // accent tucked into the title band so it never crosses a photo.
  ctx.save();
  ctx.strokeStyle = '#160a20';
  ctx.lineWidth = gap;
  for (const rect of layout.panels) {
    ctx.strokeRect(rect.x * width, rect.y * height, rect.w * width, rect.h * height);
  }
  const bandTop = layout.titleBand.y * height;
  ctx.lineWidth = Math.max(3, gap * 0.45);
  ctx.strokeStyle = 'rgba(255, 94, 138, 0.9)';
  ctx.beginPath();
  ctx.moveTo(width * 0.06, height);
  ctx.lineTo(width * 0.12, bandTop);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(126, 231, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(width * 0.09, height);
  ctx.lineTo(width * 0.15, bandTop);
  ctx.stroke();
  ctx.restore();

  // Colour grade over the photos, then the title block and grain.
  applyPosterGrade(ctx, width, height, state.grade, state.intensity);
  const band = {
    x: layout.titleBand.x * width,
    y: layout.titleBand.y * height,
    w: layout.titleBand.w * width,
    h: layout.titleBand.h * height,
  };
  // A soft dark wash behind the lettering so it reads on any photo.
  ctx.save();
  const wash = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  wash.addColorStop(0, 'rgba(22, 10, 32, 0)');
  wash.addColorStop(0.35, 'rgba(22, 10, 32, 0.82)');
  wash.addColorStop(1, 'rgba(22, 10, 32, 0.95)');
  ctx.fillStyle = wash;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  ctx.restore();
  drawTitleBlock(ctx, band, state.title1, state.title2, state.subtitle, width);
  drawGrain(ctx, width, height);

  if (overlay) overlay(ctx, layout, width, height);
}

/** Draws the editor-only outline around the active panel. */
export function drawActivePanelOutline(ctx, layout, activeId, width, height) {
  const rect = layout.panels.find((p) => p.id === activeId);
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = Math.max(3, width * 0.004);
  ctx.setLineDash([Math.max(10, width * 0.012), Math.max(8, width * 0.008)]);
  ctx.strokeRect(rect.x * width + 2, rect.y * height + 2, rect.w * width - 4, rect.h * height - 4);
  ctx.setLineDash([]);
  ctx.restore();
}
