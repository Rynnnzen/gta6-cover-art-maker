// Fixed scenes for screenshots: ?shot=editor shows the editor with a sample
// photo loaded; ?shot=cover hides the controls and shows the cover alone.
// `photo` picks the sample and `caption` sets both title lines ("A / B").
// window.__shotReady is set once the scene has painted.

/** Applies a shot scene, then calls `setup` with the sample and caption. */
export async function runShot(shot, query, setup) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const [line1, line2] = caption.split(' / ');
  await setup(`samples/${photo}.jpg`, line1 ?? caption, line2 ?? '', query);
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
