import type { PaletteBlock } from '../data/palettes'
import { DIRECTIONAL_BLOCKS } from '../data/faceColors'
import type { BlockOrientation } from '../types'

export function getGlassWeights(layers: number): number[] {
  const w: number[] = []
  for (let i = 1; i <= layers; i++) w.push(1 / (1 << i))
  w.push(1 / (1 << layers))
  return w
}

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

const FACING_DIRS: ('up' | 'down' | 'north' | 'south' | 'east' | 'west')[] = ['up', 'down', 'north', 'south', 'east', 'west']
const AXIS_DIRS: ('x' | 'y' | 'z')[] = ['y', 'x', 'z']

function tryBlock(r: number, g: number, b: number, color: [number, number, number]): number {
  const dr = r - color[0], dg = g - color[1], db = b - color[2]
  return dr * dr + dg * dg + db * db
}

export function findBestOrientedBlock(
  tr: number, tg: number, tb: number,
  palette: PaletteBlock[],
): { block: PaletteBlock; color: [number, number, number]; orientation?: BlockOrientation } {
  let best: PaletteBlock | null = null
  let bestColor: [number, number, number] = [0, 0, 0]
  let bestOrientation: BlockOrientation | undefined
  let bestDist = Infinity

  for (const block of palette) {
    const dirInfo = DIRECTIONAL_BLOCKS[block.id]

    if (!dirInfo) {
      const d = tryBlock(tr, tg, tb, block.color)
      if (d < bestDist) {
        bestDist = d
        best = block
        bestColor = block.color
        bestOrientation = undefined
      }
      continue
    }

    const { faces, group } = dirInfo

    if (group === 'axis') {
      for (const axis of AXIS_DIRS) {
        const faceColor = axis === 'y'
          ? (faces.top || block.color)
          : (faces.side || block.color)
        const d = tryBlock(tr, tg, tb, faceColor)
        if (d < bestDist) {
          bestDist = d
          best = block
          bestColor = faceColor
          bestOrientation = { axis }
        }
      }
    } else if (group === 'fixed') {
      const faceColor = faces.top || block.color
      const d = tryBlock(tr, tg, tb, faceColor)
      if (d < bestDist) {
        bestDist = d
        best = block
        bestColor = faceColor
        bestOrientation = undefined
      }
    } else if (group === 'facing') {
      for (const facing of FACING_DIRS) {
        let faceColor: [number, number, number]
        if (facing === 'up') {
          faceColor = faces.top || block.color
        } else if (facing === 'down') {
          faceColor = faces.bottom || faces.top || block.color
        } else {
          faceColor = faces.front || faces.side || block.color
        }
        const d = tryBlock(tr, tg, tb, faceColor)
        if (d < bestDist) {
          bestDist = d
          best = block
          bestColor = faceColor
          bestOrientation = { facing }
        }
      }
    }
  }

  return { block: best!, color: bestColor, orientation: bestOrientation }
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

function computeColor(glasses: PaletteBlock[], base: PaletteBlock | null, weights: number[]): [number, number, number] {
  let r = 0, g = 0, b = 0
  for (let i = 0; i < glasses.length; i++) {
    r += glasses[i].color[0] * weights[i]
    g += glasses[i].color[1] * weights[i]
    b += glasses[i].color[2] * weights[i]
  }
  if (base) {
    const bw = weights[weights.length - 1]
    r += base.color[0] * bw
    g += base.color[1] * bw
    b += base.color[2] * bw
  }
  return [Math.round(r), Math.round(g), Math.round(b)]
}

interface Wg {
  g: PaletteBlock
  r05: number; g05: number; b05: number
  r025: number; g025: number; b025: number
  r0125: number; g0125: number; b0125: number
  r00625: number; g00625: number; b00625: number
}

let _wgCache: Wg[] = []
let _wgSrc: PaletteBlock[] = []

function getWg(glassPalette: PaletteBlock[]): Wg[] {
  if (_wgSrc === glassPalette && _wgCache.length > 0) return _wgCache
  _wgSrc = glassPalette
  _wgCache = glassPalette.map(g => {
    const c = g.color
    return {
      g,
      r05: c[0] * 0.5, g05: c[1] * 0.5, b05: c[2] * 0.5,
      r025: c[0] * 0.25, g025: c[1] * 0.25, b025: c[2] * 0.25,
      r0125: c[0] * 0.125, g0125: c[1] * 0.125, b0125: c[2] * 0.125,
      r00625: c[0] * 0.0625, g00625: c[1] * 0.0625, b00625: c[2] * 0.0625,
    }
  })
  return _wgCache
}

function bestGlass1(rr: number, rg: number, rb: number, wg: Wg[]): PaletteBlock[] {
  let best: PaletteBlock | null = null, bestD = Infinity
  for (const w of wg) {
    const dr = rr - w.r05, dg = rg - w.g05, db = rb - w.b05
    const d = dr * dr + dg * dg + db * db
    if (d < bestD) { bestD = d; best = w.g }
  }
  return [best!]
}

function bestGlass2(rr: number, rg: number, rb: number, wg: Wg[]): PaletteBlock[] {
  let bestG: PaletteBlock[] = [], bestD = Infinity
  for (const w1 of wg) {
    const r1 = rr - w1.r05, g1 = rg - w1.g05, b1 = rb - w1.b05
    for (const w2 of wg) {
      const dr = r1 - w2.r025, dg = g1 - w2.g025, db = b1 - w2.b025
      const d = dr * dr + dg * dg + db * db
      if (d < bestD) { bestD = d; bestG = [w1.g, w2.g] }
    }
  }
  return bestG
}

function bestGlass3(rr: number, rg: number, rb: number, wg: Wg[]): PaletteBlock[] {
  let bestG: PaletteBlock[] = [], bestD = Infinity
  for (const w1 of wg) {
    const r1 = rr - w1.r05, g1 = rg - w1.g05, b1 = rb - w1.b05
    for (const w2 of wg) {
      const r2 = r1 - w2.r025, g2 = g1 - w2.g025, b2 = b1 - w2.b025
      for (const w3 of wg) {
        const dr = r2 - w3.r0125, dg = g2 - w3.g0125, db = b2 - w3.b0125
        const d = dr * dr + dg * dg + db * db
        if (d < bestD) { bestD = d; bestG = [w1.g, w2.g, w3.g] }
      }
    }
  }
  return bestG
}

function bestGlass4(rr: number, rg: number, rb: number, wg: Wg[]): PaletteBlock[] {
  let bestG: PaletteBlock[] = [], bestD = Infinity
  for (const w1 of wg) {
    const r1 = rr - w1.r05, g1 = rg - w1.g05, b1 = rb - w1.b05
    for (const w2 of wg) {
      const r2 = r1 - w2.r025, g2 = g1 - w2.g025, b2 = b1 - w2.b025
      for (const w3 of wg) {
        const r3 = r2 - w3.r0125, g3 = g2 - w3.g0125, b3 = b2 - w3.b0125
        for (const w4 of wg) {
          const dr = r3 - w4.r00625, dg = g3 - w4.g00625, db = b3 - w4.b00625
          const d = dr * dr + dg * dg + db * db
          if (d < bestD) { bestD = d; bestG = [w1.g, w2.g, w3.g, w4.g] }
        }
      }
    }
  }
  return bestG
}

export function findBestBlend(
  tr: number, tg: number, tb: number,
  basePalette: PaletteBlock[],
  glassPalette: PaletteBlock[],
  glassLayers: number,
  pureGlass?: boolean,
): BlendResult {
  const orientedBase = pureGlass ? null : findBestOrientedBlock(tr, tg, tb, basePalette)
  const base = orientedBase?.block ?? null
  const baseOrientation = orientedBase?.orientation
  let best: BlendResult | null = null
  let bestDist = Infinity

  const maxLayers = Math.min(glassLayers, 4)
  for (let layers = 0; layers <= maxLayers; layers++) {
    let result: BlendResult

    if (layers === 0) {
      if (pureGlass) {
        result = { glasses: [], base: null, color: [0, 0, 0] }
      } else {
        result = { glasses: [], base: base!, baseOrientation, color: [base!.color[0], base!.color[1], base!.color[2]] }
      }
    } else {
      const w = getGlassWeights(layers)

      let rr: number, rg: number, rb: number
      if (pureGlass) {
        rr = tr; rg = tg; rb = tb
      } else {
        const bw = w[layers]
        const bc = base!.color
        rr = tr - bc[0] * bw; rg = tg - bc[1] * bw; rb = tb - bc[2] * bw
      }

      const wg = getWg(glassPalette)

      let glasses: PaletteBlock[]
      if (layers === 1) glasses = bestGlass1(rr, rg, rb, wg)
      else if (layers === 2) glasses = bestGlass2(rr, rg, rb, wg)
      else if (layers === 3) glasses = bestGlass3(rr, rg, rb, wg)
      else glasses = bestGlass4(rr, rg, rb, wg)

      const [cr, cg, cb] = computeColor(glasses, base, w)
      result = { glasses, base, baseOrientation, color: [cr, cg, cb] }
    }

    const [cr, cg, cb] = result.color
    const dr = tr - cr, dg = tg - cg, db = tb - cb
    const dist = dr * dr + dg * dg + db * db
    if (dist < bestDist) { bestDist = dist; best = result }
  }

  return best!
}