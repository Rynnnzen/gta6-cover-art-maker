// Sunset / neon colour grade. The grade is painted as translucent gradients
// over the finished panels (never a flat pink wash), so the photos keep their
// detail: warm highlights, magenta midtones, deep violet shadows, cyan accents.

/**
 * Paints the grade over the whole poster. `intensity` is 0..1; 0 paints
 * nothing. The grade is deterministic — preview and export match exactly.
 */
export function applyPosterGrade(ctx, width, height, grade, intensity) {
  if (grade === 'none' || intensity <= 0) return;
  ctx.save();
  const k = intensity;
  if (grade === 'sunset') {
    // Warm light falling from the top, magenta pooling at the bottom.
    let g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, `rgba(255, 176, 92, ${0.22 * k})`);
    g.addColorStop(0.55, `rgba(255, 94, 138, ${0.1 * k})`);
    g.addColorStop(1, `rgba(94, 32, 120, ${0.34 * k})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // Peach highlight in one corner, cyan counter-accent in the other.
    g = ctx.createRadialGradient(width * 0.85, height * 0.08, 0, width * 0.85, height * 0.08, width * 0.55);
    g.addColorStop(0, `rgba(255, 214, 140, ${0.25 * k})`);
    g.addColorStop(1, 'rgba(255, 214, 140, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    g = ctx.createRadialGradient(width * 0.08, height * 0.9, 0, width * 0.08, height * 0.9, width * 0.4);
    g.addColorStop(0, `rgba(126, 231, 255, ${0.14 * k})`);
    g.addColorStop(1, 'rgba(126, 231, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  } else if (grade === 'neon') {
    // Electric magenta + cyan over a violet base.
    let g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, `rgba(255, 46, 126, ${0.26 * k})`);
    g.addColorStop(0.5, `rgba(120, 40, 200, ${0.12 * k})`);
    g.addColorStop(1, `rgba(0, 229, 255, ${0.22 * k})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
  // Vignette: darkens the edges so the lettering band reads cleanly.
  const v = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  v.addColorStop(0, 'rgba(10, 4, 18, 0)');
  v.addColorStop(1, `rgba(10, 4, 18, ${0.38 * k})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/** Deterministic fine grain, seeded so preview and export are identical. */
export function drawGrain(ctx, width, height, seed = 7) {
  const step = Math.max(3, Math.round(width / 360));
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (rand() > 0.5) ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.restore();
}
