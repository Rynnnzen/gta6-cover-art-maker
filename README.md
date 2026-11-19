# Vice Mosaic — GTA-style Cover Art Maker

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Rynnnzen/gta6-cover-art-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Rynnnzen/gta6-cover-art-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your photo into a GTA-style poster cover — multi-panel mosaic, bold
caption lettering, sunset or neon colour grade — and export it as a PNG to
share. Built for the make.fun bounty
[Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01).
Try make.fun with my referral link: https://make.fun/r/3nca7vjq (code `3nca7vjq`).

## How it works

1. Open `app/index.html` in a desktop browser (or serve `app/` with any
   static server). A finished sample cover is already on screen.
2. Add your own photo, or keep the bundled samples. Click a thumbnail to put
   a photo into the selected panel.
3. Click a panel to select it, drag the photo inside it to crop, use the zoom
   slider for a closer look. "Fill all panels" uses one photo everywhere.
4. Pick a layout — Vice Mosaic (5 panels), Diagonal Heat (3), or Night Strip
   (4) — a colour grade (Sunset, Neon, or Original) and its intensity.
5. Edit the two-line title and the subtitle, pick a size, and download the
   PNG: 1080 × 1080, 1080 × 1350, or 1920 × 1080.

Everything runs offline in the browser: no build step, no network request,
no upload — your photos never leave your machine. The display fonts (Anton
and Barlow Condensed, SIL Open Font License) are vendored under
`app/assets/fonts/` with their licence text. No Rockstar Games logo,
wordmark, artwork, or font is used anywhere in this app.

## Files

- `app/index.html` — editor structure and controls
- `app/style.css` — responsive editor layout
- `app/src/main.js` — wiring: photos, panel picking, drag-crop, export
- `app/src/editor-state.js` — state: photos, panels, layout, format, caption
- `app/src/panel-layouts.js` — the three layouts, per output format
- `app/src/panel-crop.js` — cover-crop math, drag and zoom
- `app/src/photo-library.js` — sample and user photo loading
- `app/src/poster-renderer.js` — the one renderer for preview and export
- `app/src/color-grade.js` — sunset / neon grade and deterministic grain
- `app/src/poster-lettering.js` — auto-fit outlined title and subtitle
- `app/src/export-png.js` — exact-size PNG export and download
- `app/src/shots.js` — fixed scenes for screenshots
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json`

## License

MIT — see `LICENSE`.
