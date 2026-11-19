// Vice Mosaic — the entry program for make.fun gta6-cover-art-01 (Node 22,
// standard library only). The app is plain static files under app/ (its
// index.html and ES modules, local fonts and samples, no network request),
// and this program hands it in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json with the vendored
// make.fun library, so the judge reads exactly the files that were built.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program refuses to write a dossier when the entry is incomplete, so a
// broken build fails loudly here instead of reaching the gate.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

/** Counts every file and directory under a path, for the gate's app caps. */
function countEntries(dir) {
  let entries = 0;
  let bytes = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const info = statSync(path);
    entries += 1;
    if (info.isDirectory()) {
      const sub = countEntries(path);
      entries += sub.entries;
      bytes += sub.bytes;
    } else {
      bytes += info.size;
    }
  }
  return { entries, bytes };
}

// Guard 1: the app entry point must exist and stay under the gate's 1 MiB.
const indexPath = join(appDir, 'index.html');
if (!existsSync(indexPath)) throw new Error('app/index.html is missing — nothing to hand in');
const indexBytes = statSync(indexPath).size;
if (indexBytes > 1048576) throw new Error(`app/index.html is ${indexBytes} bytes, over the 1 MiB cap`);

// Guard 2: the app must fit its caps (993 entries, 48 MiB) before copying.
const appSize = countEntries(appDir);
if (appSize.entries > 993) throw new Error(`app/ holds ${appSize.entries} entries, over the 993 cap`);
if (appSize.bytes > 50331648) throw new Error(`app/ is ${appSize.bytes} bytes, over the 48 MiB cap`);

// Guard 3: screenshots/ must hold 3 or 4 images, each at most 256 KiB.
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing');
const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ holds ${shots.length} images, expected 3 or 4`);
}
for (const name of shots) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > 262144) throw new Error(`screenshots/${name} is ${size} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of
// app files, in all, or a path under app/ over 1000 bytes: app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(
  `Vice Mosaic handed in: app/ ${appSize.entries} entries, ${appSize.bytes} bytes; ` +
  `${shots.length} screenshots; index.html ${indexBytes} bytes.`,
);
