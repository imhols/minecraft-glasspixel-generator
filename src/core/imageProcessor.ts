import type { PaletteBlock } from '../data/palettes'
import { findBestBlend, findBestOrientedBlock } from './colorMatcher'
import type { BlockFacing } from './colorMatcher'
import type { BlockOrientation } from '../types'

export type DitherMode = 'none' | 'floyd-steinberg' | 'jarvis-judice-ninke' | 'atkinson' | 'sierra-lite'

export interface ProcessedImage {
  width: number
  height: number
  pixels: number[][][]
  blockGrid: (PaletteBlock | null)[][]
  orientationGrid?: (BlockOrientation | undefined)[][]  // [y][x], per-block orientation
  usedBlocks: Map<string, number>
  glassGrids?: (PaletteBlock | null)[][][]  // [layer][y][x], layer 0 = top
  glassLayers?: number
  alphaMask?: boolean[][]  // true = transparent (air)
  blockMap?: Map<string, PaletteBlock>  // ID→block lookup for fast preview
}

const KERNELS: Record<Exclude<DitherMode, 'none'>, { dx: number; dy: number; w: number }[]> = {
  'floyd-steinberg': [
    { dx: 1, dy: 0, w: 7 },
    { dx: -1, dy: 1, w: 3 },
    { dx: 0, dy: 1, w: 5 },
    { dx: 1, dy: 1, w: 1 },
  ],
  'jarvis-judice-ninke': [
    { dx: 1, dy: 0, w: 7 }, { dx: 2, dy: 0, w: 5 },
    { dx: -2, dy: 1, w: 3 }, { dx: -1, dy: 1, w: 5 }, { dx: 0, dy: 1, w: 7 }, { dx: 1, dy: 1, w: 5 }, { dx: 2, dy: 1, w: 3 },
    { dx: -2, dy: 2, w: 1 }, { dx: -1, dy: 2, w: 3 }, { dx: 0, dy: 2, w: 5 }, { dx: 1, dy: 2, w: 3 }, { dx: 2, dy: 2, w: 1 },
  ],
  'atkinson': [
    { dx: 1, dy: 0, w: 1 }, { dx: 2, dy: 0, w: 1 },
    { dx: -1, dy: 1, w: 1 }, { dx: 0, dy: 1, w: 1 }, { dx: 1, dy: 1, w: 1 },
    { dx: 0, dy: 2, w: 1 },
  ],
  'sierra-lite': [
    { dx: 1, dy: 0, w: 2 },
    { dx: -1, dy: 1, w: 1 }, { dx: 0, dy: 1, w: 1 },
  ],
}

function diffuse(
  errR: Float64Array[], errG: Float64Array[], errB: Float64Array[],
  er: number, eg: number, eb: number,
  x: number, y: number, w: number, h: number,
  kernel: { dx: number; dy: number; w: number }[], divisor: number,
) {
  for (const k of kernel) {
    const nx = x + k.dx, ny = y + k.dy
    if (nx < 0 || nx >= w || ny >= h) continue
    const buf = ny === y ? 0 : 1
    const v = k.w / divisor
    errR[buf][nx] += er * v
    errG[buf][nx] += eg * v
    errB[buf][nx] += eb * v
  }
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function extractRawFromImage(img: HTMLImageElement, w: number, h: number): Uint8Array {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  const imageData = ctx.getImageData(0, 0, w, h)
  return new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength)
}

export interface ProcessPixelsOptions {
  glassLayers?: number
  glassPalette?: PaletteBlock[]
  pureGlass?: boolean
  ditherMode?: DitherMode
  ditherThreshold?: number
  facing?: BlockFacing
  onProgress?: (pct: number) => void
}

export async function processPixels(
  raw: Uint8Array,
  targetWidth: number,
  targetHeight: number,
  palette: PaletteBlock[],
  options?: ProcessPixelsOptions,
): Promise<ProcessedImage> {
  const {
    glassLayers = 0,
    glassPalette = [],
    pureGlass = false,
    ditherMode = undefined,
    ditherThreshold = 30,
    facing = 'vertical',
    onProgress = undefined,
  } = options ?? {}

  const pixels: number[][][] = []
  const alphaMask: boolean[][] = []
  const multiLayer = glassLayers > 0 && glassPalette.length > 0
  const glassGrids: (PaletteBlock | null)[][][] = []
  const blockGrid: (PaletteBlock | null)[][] = []
  const orientationGrid: (BlockOrientation | undefined)[][] = []
  const usedBlocks = new Map<string, number>()
  const PIXEL_YIELD_INTERVAL = 2000
  const PROGRESS_BATCH = Math.max(1, Math.floor(targetHeight / 20))
  let pixelCount = 0

  for (let l = 0; l < glassLayers; l++) {
    const grid: (PaletteBlock | null)[][] = []
    for (let y = 0; y < targetHeight; y++) grid.push(new Array(targetWidth).fill(null))
    glassGrids.push(grid)
  }

  const useDither = ditherMode && ditherMode !== 'none'
  const kernel = useDither ? KERNELS[ditherMode!] : null
  let divisor = 0
  if (kernel) {
    if (ditherMode === 'atkinson') divisor = 8
    else divisor = kernel.reduce((s, k) => s + k.w, 0)
  }
  const threshold = ditherThreshold ?? 30

  const errR = [new Float64Array(targetWidth), new Float64Array(targetWidth)]
  const errG = [new Float64Array(targetWidth), new Float64Array(targetWidth)]
  const errB = [new Float64Array(targetWidth), new Float64Array(targetWidth)]

  for (let y = 0; y < targetHeight; y++) {
    const cur = y & 1
    const nxt = (y + 1) & 1
    errR[nxt].fill(0)
    errG[nxt].fill(0)
    errB[nxt].fill(0)

    const row: number[][] = []
    const aRow: boolean[] = []
    const bRow: (PaletteBlock | null)[] = []
    const oRow: (BlockOrientation | undefined)[] = []
    const yOff = y * targetWidth * 4
    for (let x = 0; x < targetWidth; x++) {
      const i = yOff + x * 4
      let r = raw[i], g = raw[i + 1], b = raw[i + 2]
      const a = raw[i + 3]
      aRow.push(a < 128)

      if (useDither && a >= 128) {
        r = Math.min(255, Math.max(0, r + Math.round(errR[cur][x])))
        g = Math.min(255, Math.max(0, g + Math.round(errG[cur][x])))
        b = Math.min(255, Math.max(0, b + Math.round(errB[cur][x])))
      }

      if (multiLayer) {
        const res = findBestBlend(r, g, b, palette, glassPalette, glassLayers, pureGlass, facing)
        row.push(res.color)
        bRow.push(res.base)
        oRow.push(res.baseOrientation)
        for (let l = 0; l < glassLayers; l++) glassGrids[l][y][x] = res.glasses[l]
        if (res.base) usedBlocks.set(res.base.id, (usedBlocks.get(res.base.id) || 0) + 1)
        for (const gl of res.glasses) usedBlocks.set(gl.id, (usedBlocks.get(gl.id) || 0) + 1)
        if (useDither) {
          const er = r - res.color[0], eg = g - res.color[1], eb = b - res.color[2]
          if (er * er + eg * eg + eb * eb > threshold * threshold) {
            diffuse(errR, errG, errB, er, eg, eb, x, y, targetWidth, targetHeight, kernel!, divisor)
          }
        }
      } else {
        const ob = findBestOrientedBlock(r, g, b, palette, facing)
        const mc = ob.color
        row.push([mc[0], mc[1], mc[2]])
        bRow.push(ob.block)
        oRow.push(ob.orientation)
        usedBlocks.set(ob.block.id, (usedBlocks.get(ob.block.id) || 0) + 1)
        if (useDither) {
          const er = r - mc[0], eg = g - mc[1], eb = b - mc[2]
          if (er * er + eg * eg + eb * eb > threshold * threshold) {
            diffuse(errR, errG, errB, er, eg, eb, x, y, targetWidth, targetHeight, kernel!, divisor)
          }
        }
      }
      pixelCount++
    }
    pixels.push(row)
    alphaMask.push(aRow)
    blockGrid.push(bRow)
    orientationGrid.push(oRow)
    if (y % PROGRESS_BATCH === 0 && y > 0) {
      onProgress?.(0.1 + 0.85 * (y / targetHeight))
    }
    if (pixelCount >= PIXEL_YIELD_INTERVAL) {
      await new Promise<void>(resolve => {
        const { port1, port2 } = new MessageChannel()
        port1.onmessage = () => resolve()
        port2.postMessage(null)
      })
      pixelCount = 0
    }
  }

  // Null out transparent pixels (air)
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      if (alphaMask[y][x]) {
        blockGrid[y][x] = null
        orientationGrid[y][x] = undefined
        for (let l = 0; l < glassLayers; l++) glassGrids[l][y][x] = null
      }
    }
  }

  onProgress?.(1)
  const result: ProcessedImage = {
    width: targetWidth, height: targetHeight,
    pixels, blockGrid, orientationGrid, usedBlocks,
  }
  if (alphaMask.some(row => row.some(a => a))) result.alphaMask = alphaMask
  if (multiLayer) { result.glassGrids = glassGrids; result.glassLayers = glassLayers }
  return result
}

export async function processImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  palette: PaletteBlock[],
  onProgress?: (pct: number) => void,
  ditherMode?: DitherMode,
  ditherThreshold?: number,
): Promise<ProcessedImage> {
  const raw = extractRawFromImage(img, targetWidth, targetHeight)
  return processPixels(raw, targetWidth, targetHeight, palette, {
    ditherMode, ditherThreshold, onProgress,
  })
}

export async function processImageMultiLayer(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  basePalette: PaletteBlock[],
  glassPalette: PaletteBlock[],
  glassLayers: number,
  onProgress?: (pct: number) => void,
  pureGlass?: boolean,
  ditherMode?: DitherMode,
  ditherThreshold?: number,
): Promise<ProcessedImage> {
  const raw = extractRawFromImage(img, targetWidth, targetHeight)
  return processPixels(raw, targetWidth, targetHeight, basePalette, {
    glassLayers, glassPalette, pureGlass, ditherMode, ditherThreshold, onProgress,
  })
}
