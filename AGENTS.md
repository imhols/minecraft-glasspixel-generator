# Minecraft GlassPixel Generator

## Commands
- `npm run dev` — Vite dev server at `http://localhost:5173/minecraft-glasspixel-generator/`
- `npm run build` — `tsc -b && vite build` (do both)
- `npm run lint` — ESLint (runs on `**/*.{ts,tsx}`)

## Architecture

| Layer | File | Purpose |
|-------|------|---------|
| Entry | `index.html` → `main.tsx` → `App.tsx` | Vite standard |
| Config | `App.tsx` reads form IDs, calls processor | UI glue |
| Color matching | `core/colorMatcher.ts` | Core algorithm |
| Image processing | `core/imageProcessor.ts` | Pixel extraction + match |
| Schematic export | `core/schematicExporter.ts` | `.schem` / `.schematic` / `.litematic` |
| Palette data | `data/palettes.ts` | Block colors + version filter |
| NBT writer | `core/nbtWriter.ts` | Binary NBT (Sponge v2, MCEdit, Litematica) |
| i18n | `src/i18n/LangContext.tsx` | zh/en switching via React context |
| Preview | `components/PreviewCanvas.tsx` | Image + hold-to-compare |

## Algorithm

1. **Base block**: RGB squared distance match (`findClosestBlockRGB`)
2. **Glass layers**: N=1~4 exhaustive over 16 stained glass colors. Pre-computed weighted glass colors eliminate inner-loop multiplications.
3. **Pure glass mode**: skips base block entirely — glass layers matched directly to target color (`findBestBlend` param `pureGlass=true`)
4. No dithering — each pixel matched independently.
5. Weights: glass layers top-to-bottom at 50%, 25%, 12.5%, 6.25%, ..., base = 0.5^N.

## Important details

- **Progress yielding**: uses `MessageChannel` (not `setTimeout`) to avoid browser throttle on background tabs.
- **Download filenames**: `glasspixel_{width}x{height}.schem` / `.schematic` / `.litematic`
- **History**: up to 10 entries, restored via `restoringRef` flag to prevent duplicate saves.
- **Schematic height**: `1 + glassLayers * 2` (air gaps between glass layers to prevent texture merging).
- **Block palette**: ~390 blocks (opaque + 16 stained glass + semi-transparent). `minecraft:cactus` removed (breaks next to other blocks).
- **vite.config.ts**: `base: '/minecraft-glasspixel-generator/'` required for GitHub Pages deploy.
- **i18n**: `useLang()` hook returns `{ t, toggleLang, lang }`. Keys in `src/i18n/translations.ts`. Default `zh`.
- **Export Blob**: `downloadBlob` slices exact bytes (`buffer.slice(byteOffset, byteOffset + byteLength)`) — passing `.buffer` directly can append extra garbage bytes.

## Palette structure

`getBlocks(version)` — opaque blocks only (filters `transparent: true` out).  
`getGlassBlocks(version)` — 16 stained glass only (filters by `*_stained_glass`).  
Both cache via `BLOCKS.filter()` (new array each call).

## Updating the block palette

The palette (`src/data/palettes.ts`) is auto-generated from real game textures by downloading each MC version's JAR and computing average RGB.

```bash
cd scripts
npm ci   # if first time (needs adm-zip + pngjs)
node generate-palette.mjs   # downloads cache (~2 min first run, then cached)
node curate.mjs              # filters non-full blocks, merges old/new naming
copy output/curated-palettes.ts ../src/data/palettes.ts
```

Cached per-version data lives in `scripts/output/`. Delete individual `{version}.json` to re-fetch a specific version.