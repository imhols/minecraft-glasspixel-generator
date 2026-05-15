# Minecraft GlassPixel Generator

## Commands
- `npm run dev` — start Vite dev server on `localhost:5173`
- `npm run build` — `tsc -b && vite build` (do both)
- `npm run lint` — ESLint (runs on `**/*.{ts,tsx}`)

## Architecture

| Layer | File | Purpose |
|-------|------|---------|
| Entry | `index.html` → `main.tsx` → `App.tsx` | Vite standard |
| Config | `App.tsx` reads form IDs, calls processor | UI glue |
| Color matching | `core/colorMatcher.ts` | **Core algorithm** |
| Image processing | `core/imageProcessor.ts` | Pixel extraction + match |
| Schematic export | `core/schematicExporter.ts` | `.schem` / `.schematic` output |
| Palette data | `data/palettes.ts` | Block colors + version filter |
| NBT writer | `core/nbtWriter.ts` | Binary NBT format |
| Preview | `components/PreviewCanvas.tsx` | Image + hold-to-compare |

## Algorithm

1. **Base block**: independently matched to target via RGB squared distance (`findClosestBlockRGB`)
2. **Glass layers**: N=1~4 exhaustive over 16 stained glass colors. N>4 falls back to greedy top-down fill. Pre-computed weighted glass colors (pre-multiplied by 0.5/0.25/0.125/0.0625) eliminate multiplications in inner loops.
3. No dithering — each pixel matched independently.
4. Weights: glass layers top-to-bottom at 50%, 25%, 12.5%, 6.25%, ..., base = 0.5^N.

## Important details

- **Progress yielding**: uses `MessageChannel` (not `setTimeout`) to avoid browser throttle on background tabs.
- **Download filenames**: `glasspixel_{width}x{height}.schem` / `.schematic`
- **NBT metadata**: Name/Author = `GlassPixel`
- **History**: up to 10 entries, restored via `restoringRef` flag to prevent duplicate saves.
- **Schematic height**: `1 + glassLayers * 2` (air gaps between glass layers to prevent texture merging).
- **Block palette**: ~90 opaque blocks + 16 stained glass. Plain glass (`minecraft:glass`) removed.
- **No tests** (none configured).

## Palette structure

`getBlocks(version)` — opaque blocks only (filters `transparent: true` out).  
`getGlassBlocks(version)` — 16 stained glass only (filters by `*_stained_glass`).  
Both cache via `BLOCKS.filter()` (new array each call).
