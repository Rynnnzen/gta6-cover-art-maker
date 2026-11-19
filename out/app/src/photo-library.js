// Photo loading: samples shipped with the app and the user's own files.
// Photos are decoded on the user's machine and never uploaded anywhere.

/** Loads an image from a URL into an <img> that canvas can draw. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

/**
 * Loads the two bundled sample photos (made for make.fun, free to use) and
 * returns them as photo records { id, name, img, sample: true }.
 */
export async function loadSamplePhotos() {
  const defs = [
    { id: 'sample-boulevard', name: 'Boulevard', url: 'samples/boulevard.jpg' },
    { id: 'sample-pier', name: 'Pier', url: 'samples/pier.jpg' },
  ];
  const out = [];
  for (const def of defs) {
    const img = await loadImage(def.url);
    out.push({ id: def.id, name: def.name, img, sample: true });
  }
  return out;
}

/**
 * Decodes the user's chosen files into photo records. Very large photos are
 * downscaled to at most 2400px on the long side first, so a phone photo does
 * not exhaust memory when graded or exported.
 */
export async function loadUserPhotos(files) {
  const out = [];
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const img = await loadImage(canvas.toDataURL('image/jpeg', 0.92));
    out.push({
      id: `user-${Date.now()}-${out.length}`,
      name: file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Photo',
      img,
      sample: false,
    });
  }
  return out;
}
