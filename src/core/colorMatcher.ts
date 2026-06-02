import type { PaletteBlock } from '../data/palettes'
import { TEXTURE_SIDES, type TextureSideEntry } from '../data/textureSides'
import type { BlockOrientation } from '../types'
import { buildKDTree, nearest } from './kdTree'
import type { KDNode } from './kdTree'

export type BlockFacing = 'vertical' | 'horizontal'

function labFromRgb(sr: number, sg: number, sb: number): [number, number, number] {
  let r = sr / 255, g = sg / 255, b = sb / 255
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.0
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883
  const fx = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16 / 116)
  const fy = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16 / 116)
  const fz = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16 / 116)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function ciede2000(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [l1, a1, b1] = lab1; const [l2, a2, b2] = lab2
  const c1 = Math.sqrt(a1 * a1 + b1 * b1); const c2 = Math.sqrt(a2 * a2 + b2 * b2); const cAvg = (c1 + c2) / 2
  const g = 0.5 * (1 - Math.sqrt(cAvg ** 7 / (cAvg ** 7 + 25 ** 7)))
  const a1p = a1 * (1 + g); const a2p = a2 * (1 + g)
  const c1p = Math.sqrt(a1p * a1p + b1 * b1); const c2p = Math.sqrt(a2p * a2p + b2 * b2)
  let h1p = Math.atan2(b1, a1p) * 180 / Math.PI; if (h1p < 0) h1p += 360
  let h2p = Math.atan2(b2, a2p) * 180 / Math.PI; if (h2p < 0) h2p += 360
  const dl = l2 - l1; const dc = c2p - c1p
  let dh = 0
  if (c1p * c2p !== 0) {
    let dhRaw = h2p - h1p; if (dhRaw > 180) dhRaw -= 360; else if (dhRaw < -180) dhRaw += 360
    dh = 2 * Math.sqrt(c1p * c2p) * Math.sin(dhRaw / 2 * Math.PI / 180)
  }
  const lAvgP = (l1 + l2) / 2; const cAvgP = (c1p + c2p) / 2
  let hAvg = h1p + h2p
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) { if (h1p + h2p < 360) hAvg += 360; else hAvg -= 360 }
    hAvg /= 2
  }
  const t = 1 - 0.17 * Math.cos((hAvg - 30) * Math.PI / 180) + 0.24 * Math.cos((2 * hAvg) * Math.PI / 180) + 0.32 * Math.cos((3 * hAvg + 6) * Math.PI / 180) - 0.20 * Math.cos((4 * hAvg - 63) * Math.PI / 180)
  const sl = 1 + (0.015 * (lAvgP - 50) ** 2) / Math.sqrt(20 + (lAvgP - 50) ** 2)
  const sc = 1 + 0.045 * cAvgP; const sh = 1 + 0.015 * cAvgP * t
  const rt = -2 * Math.sqrt(cAvgP ** 7 / (cAvgP ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hAvg - 275) / 25) ** 2)) * Math.PI / 180)
  return Math.sqrt((dl / sl) ** 2 + (dc / sc) ** 2 + (dh / sh) ** 2 + rt * (dc / sc) * (dh / sh))
}

export function findClosestBlock(r: number, g: number, b: number, palette: PaletteBlock[]): PaletteBlock {
  const targetLab = labFromRgb(r, g, b)
  let best: PaletteBlock | null = null, bestDist = Infinity
  for (const block of palette) {
    const dist = ciede2000(targetLab, labFromRgb(block.color[0], block.color[1], block.color[2]))
    if (dist < bestDist) { bestDist = dist; best = block }
  }
  return best!
}

function tryBlock(r: number, g: number, b: number, color: [number, number, number]): number {
  const dr = r - color[0], dg = g - color[1], db = b - color[2]
  return dr * dr + dg * dg + db * db
}

export function findClosestBlockRGB(r: number, g: number, b: number, palette: PaletteBlock[]): PaletteBlock {
  let best: PaletteBlock | null = null, bestDist = Infinity
  for (const block of palette) {
    const dr = r - block.color[0], dg = g - block.color[1], db = b - block.color[2]
    const dist = dr * dr + dg * dg + db * db
    if (dist < bestDist) { bestDist = dist; best = block }
  }
  return best!
}

export interface BlendResult {
  glasses: PaletteBlock[]
  base: PaletteBlock | null
  baseOrientation?: BlockOrientation
  color: [number, number, number]
}

// ── k-d tree based glass blend search ──
// Pre-compute all glass blend combinations (1-4 layers) into 4 k-d trees.
// Each tree entry = blended color (float) → glass palette indices.
// Per-pixel: search tree for nearest blend to residual (target minus base contribution).

interface GlassBlendEntry {
  point: [number, number, number]
  indices: number[]
}

let _blendTrees: (KDNode<number[]> | null)[] | null = null
let _blendTreesSrc: PaletteBlock[] | null = null

function generateBlends(glassPalette: PaletteBlock[], layers: number): GlassBlendEntry[] {
  const n = glassPalette.length
  const w: Float32Array[] = []
  for (let d = 1; d <= layers; d++) {
    const factor = 1 / (1 << d)
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const c = glassPalette[i].color
      arr[i * 3] = c[0] * factor
      arr[i * 3 + 1] = c[1] * factor
      arr[i * 3 + 2] = c[2] * factor
    }
    w.push(arr)
  }

  const results: GlassBlendEntry[] = []

  if (layers === 1) {
    const a = w[0]
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      results.push({ point: [a[i3], a[i3 + 1], a[i3 + 2]], indices: [i] })
    }
  } else if (layers === 2) {
    const a = w[0], a2 = w[1]
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      const r1 = a[i3], g1 = a[i3 + 1], b1 = a[i3 + 2]
      for (let j = 0; j < n; j++) {
        const j3 = j * 3
        results.push({ point: [r1 + a2[j3], g1 + a2[j3 + 1], b1 + a2[j3 + 2]], indices: [i, j] })
      }
    }
  } else if (layers === 3) {
    const a = w[0], a2 = w[1], a3 = w[2]
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      const r1 = a[i3], g1 = a[i3 + 1], b1 = a[i3 + 2]
      for (let j = 0; j < n; j++) {
        const j3 = j * 3
        const r2 = r1 + a2[j3], g2 = g1 + a2[j3 + 1], b2 = b1 + a2[j3 + 2]
        for (let k = 0; k < n; k++) {
          const k3 = k * 3
          results.push({ point: [r2 + a3[k3], g2 + a3[k3 + 1], b2 + a3[k3 + 2]], indices: [i, j, k] })
        }
      }
    }
  } else if (layers === 4) {
    const a = w[0], a2 = w[1], a3 = w[2], a4 = w[3]
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      const r1 = a[i3], g1 = a[i3 + 1], b1 = a[i3 + 2]
      for (let j = 0; j < n; j++) {
        const j3 = j * 3
        const r2 = r1 + a2[j3], g2 = g1 + a2[j3 + 1], b2 = b1 + a2[j3 + 2]
        for (let k = 0; k < n; k++) {
          const k3 = k * 3
          const r3 = r2 + a3[k3], g3 = g2 + a3[k3 + 1], b3 = b2 + a3[k3 + 2]
          for (let l = 0; l < n; l++) {
            const l3 = l * 3
            results.push({ point: [r3 + a4[l3], g3 + a4[l3 + 1], b3 + a4[l3 + 2]], indices: [i, j, k, l] })
          }
        }
      }
    }
  }

  return results
}

function getBlendTrees(glassPalette: PaletteBlock[]): (KDNode<number[]> | null)[] {
  if (_blendTreesSrc === glassPalette && _blendTrees) return _blendTrees
  _blendTreesSrc = glassPalette
  const trees: (KDNode<number[]> | null)[] = []
  for (let layers = 1; layers <= 4; layers++) {
    const entries = generateBlends(glassPalette, layers)
    trees.push(buildKDTree(entries.map(e => ({ point: e.point, data: e.indices }))))
  }
  _blendTrees = trees
  return trees
}

interface FlatBlockEntry {
  block: PaletteBlock
  color: [number, number, number]
  orientation?: BlockOrientation
}

let _flatBase: FlatBlockEntry[] = []
let _flatBaseSrc: PaletteBlock[] = []

function getFlatBase(palette: PaletteBlock[], facing: BlockFacing): FlatBlockEntry[] {
  if (_flatBaseSrc === palette && _flatBase.length > 0 && _lastFacing === facing) return _flatBase
  _flatBaseSrc = palette
  _lastFacing = facing
  _flatBase = []
  // 竖直 (vertical) = pixel art stood up, viewer sees side → side textures
  // 水平 (horizontal) = pixel art flat on ground, viewer sees top → top textures
  const useSide = facing === 'vertical'
  for (const block of palette) {
    const dirData = TEXTURE_SIDES[block.id]
    if (!dirData) {
      _flatBase.push({ block, color: block.color })
      continue
    }
    const { entries, group } = dirData
    const find = (side: string) => {
      const e = entries.find((e: TextureSideEntry) => e.sides.includes(side as TextureSideEntry['sides'][number]))
      return e ? e.rgb : undefined
    }
    const findAny = (sides: string[]) => {
      const e = entries.find((e: TextureSideEntry) => sides.some(s => e.sides.includes(s as TextureSideEntry['sides'][number])))
      return e ? e.rgb : undefined
    }
    if (group === 'axis') {
      if (useSide) {
        const sideColor = findAny(['north', 'south', 'east', 'west']) || block.color
        _flatBase.push({ block, color: sideColor, orientation: { axis: 'x' } })
        _flatBase.push({ block, color: sideColor, orientation: { axis: 'z' } })
      } else {
        _flatBase.push({ block, color: find('top') || block.color, orientation: { axis: 'y' } })
      }
    } else if (group === 'fixed') {
      const color = useSide
        ? (findAny(['north', 'south', 'east', 'west']) || find('front') || find('back') || block.color)
        : (find('top') || block.color)
      _flatBase.push({ block, color })
    } else if (group === 'facing') {
      const topColor = find('top') || block.color
      const bottomColor = find('bottom') || find('top') || block.color
      const horizontalColor = find('front') || findAny(['north', 'south', 'east', 'west']) || block.color
      if (useSide) {
        for (const facingDir of (['north', 'south', 'east', 'west'] as const)) {
          _flatBase.push({ block, color: horizontalColor, orientation: { facing: facingDir } })
        }
      } else {
        _flatBase.push({ block, color: topColor, orientation: { facing: 'up' } })
        _flatBase.push({ block, color: bottomColor, orientation: { facing: 'down' } })
      }
    }
  }
  return _flatBase
}

let _lastFacing: BlockFacing = 'vertical'

export function findBestOrientedBlock(
  tr: number, tg: number, tb: number,
  palette: PaletteBlock[],
  facing: BlockFacing = 'vertical',
): { block: PaletteBlock; color: [number, number, number]; orientation?: BlockOrientation } {
  const entries = getFlatBase(palette, facing)
  let best = entries[0]
  let bestDist = tryBlock(tr, tg, tb, entries[0].color)
  for (let i = 1; i < entries.length; i++) {
    const d = tryBlock(tr, tg, tb, entries[i].color)
    if (d < bestDist) { bestDist = d; best = entries[i] }
  }
  return { block: best.block, color: best.color, orientation: best.orientation }
}

export function findBestBlend(
  tr: number, tg: number, tb: number,
  basePalette: PaletteBlock[],
  glassPalette: PaletteBlock[],
  glassLayers: number,
  pureGlass?: boolean,
  facing: BlockFacing = 'vertical',
): BlendResult {
  const orientedBase = pureGlass ? null : findBestOrientedBlock(tr, tg, tb, basePalette, facing)
  const base = orientedBase?.block ?? null
  const baseOrientation = orientedBase?.orientation
  let best: BlendResult | null = null
  let bestDist = Infinity

  const maxLayers = Math.min(glassLayers, 4)

  // L=0: no glass
  if (!pureGlass && base) {
    const color: [number, number, number] = [base.color[0], base.color[1], base.color[2]]
    const dr = tr - color[0], dg = tg - color[1], db = tb - color[2]
    bestDist = dr * dr + dg * dg + db * db
    best = { glasses: [], base, baseOrientation, color }
  } else if (pureGlass) {
    bestDist = tr * tr + tg * tg + tb * tb
    best = { glasses: [], base: null, color: [0, 0, 0] }
  }

  if (glassPalette.length === 0) return best!

  const trees = getBlendTrees(glassPalette)

  for (let layers = 1; layers <= maxLayers; layers++) {
    const bw = 1 / (1 << layers)
    let rr = tr, rg = tg, rb = tb
    if (!pureGlass && base) {
      rr -= base.color[0] * bw
      rg -= base.color[1] * bw
      rb -= base.color[2] * bw
    }

    const tree = trees[layers - 1]
    if (!tree) continue
    const result = nearest(tree, [rr, rg, rb])
    if (!result) continue

    const glasses = result.data.map(i => glassPalette[i])

    const cr = result.point[0] + (base && !pureGlass ? base.color[0] * bw : 0)
    const cg = result.point[1] + (base && !pureGlass ? base.color[1] * bw : 0)
    const cb = result.point[2] + (base && !pureGlass ? base.color[2] * bw : 0)
    const color: [number, number, number] = [Math.round(cr), Math.round(cg), Math.round(cb)]

    const dr = tr - color[0], dg = tg - color[1], db = tb - color[2]
    const dist = dr * dr + dg * dg + db * db

    if (dist < bestDist) {
      bestDist = dist
      best = { glasses, base, baseOrientation, color }
    }
  }

  return best!
}