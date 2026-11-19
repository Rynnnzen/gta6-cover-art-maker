// Bold poster lettering: warm-white Anton capitals with a near-black violet
// outline and a short offset shadow, plus a tracked-out Barlow Condensed
// subtitle. Titles auto-fit to the band width instead of clipping silently.

/**
 * Fits a title line to `maxWidth` by shrinking the font from `startSize`.
 * Returns the font size that fits.
 */
export function fitCaption(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size = Math.max(14, size - 4);
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/**
 * Draws one title line centred at (cx, y) in Anton, with outline + shadow.
 * `size` is the font size in pixels; `outline` scales with it.
 */
export function drawOutlinedTitle(ctx, text, cx, y, size, color = '#fff7ec') {
  const upper = text.toUpperCase();
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.strokeStyle = '#1c0b2e';
  ctx.shadowColor = 'rgba(255, 46, 126, 0.55)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = size * 0.05;
  ctx.shadowOffsetY = size * 0.06;
  ctx.strokeText(upper, cx, y);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = color;
  ctx.fillText(upper, cx, y);
  ctx.restore();
}

/** Draws the small tracked-out subtitle centred at (cx, y). */
export function drawSubtitle(ctx, text, cx, y, size, color = '#ffe9a8') {
  const upper = text.toUpperCase();
  ctx.save();
  ctx.font = `600 ${size}px "Barlow Condensed", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  // Manual letter tracking: draw the spaced string the canvas cannot.
  const spaced = upper.split('').join('  ');
  ctx.fillText(spaced, cx, y);
  ctx.restore();
}

/** Draws both title lines and the subtitle inside the title band. */
export function drawTitleBlock(ctx, band, title1, title2, subtitle, width) {
  const cx = band.x + band.w / 2;
  const bandH = band.h;
  const line1 = (title1 || '').trim() || 'VICE';
  const line2 = (title2 || '').trim();
  const maxW = band.w * 0.92;
  // Budget the band: two title lines, one subtitle, small gaps — all inside.
  const unit = bandH / (line2 ? 2.62 : 1.62);
  const size1 = fitCaption(ctx, line1.toUpperCase(), maxW, unit);
  const size2 = line2 ? fitCaption(ctx, line2.toUpperCase(), maxW, unit) : 0;
  const subSize = Math.max(12, unit * 0.32);
  const gap = unit * 0.08;
  const total = size1 + (line2 ? size2 + gap : 0) + subSize + gap * 2;
  let y = band.y + (bandH - total) / 2 + size1 * 0.92;
  drawOutlinedTitle(ctx, line1, cx, y, size1);
  if (line2) {
    y += size2 + gap;
    drawOutlinedTitle(ctx, line2, cx, y, size2);
  }
  if ((subtitle || '').trim()) {
    y += subSize + gap * 2;
    drawSubtitle(ctx, subtitle, cx, y, subSize);
  }
}
