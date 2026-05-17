import type { PaletteBlock } from '../data/palettes'
import { findBestBlend, findBestOrientedBlock } from './colorMatcher'
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

function yieldFrame(): Promise<void> {
  return new Promise(resolve => {
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = () => resolve()
    port2.postMessage(null)
  })
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
  return processImageBase(img, targetWidth, targetHeight, palette, 0, [], [], onProgress, undefined, ditherMode, ditherThreshold)
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
  return processImageBase(img, targetWidth, targetHeight, basePalette, glassLayers, [], glassPalette, onProgress, pureGlass, ditherMode, ditherThreshold)
}

async function processImageBase(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  palette: PaletteBlock[],
  glassLayers: number,
  _unused: PaletteBlock[],
  glassPalette: PaletteBlock[],
  onProgress?: (pct: number) => void,
  pureGlass?: boolean,
  ditherMode?: DitherMode,
  ditherThreshold?: number,
): Promise<ProcessedImage> {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  onProgress?.(0.1)

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
  const raw = imageData.data

  const pixels: number[][][] = []
  const alphaMask: boolean[][] = []
  const multiLayer = glassLayers > 0 && glassPalette.length > 0
  const glassGrids: (PaletteBlock | null)[][][] = []
  const blockGrid: (PaletteBlock | null)[][] = []
  const orientationGrid: (BlockOrientation | undefined)[][] = []
  const usedBlocks = new Map<string, number>()
  const batchSize = Math.max(1, Math.floor(targetHeight / 20))

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
  // RGB 距离阈值: 当像素匹配色与目标色的差距超过此值时, 误差才扩散到邻居.
  // 0 = 始终扩散 (传统抖动); 值越大抖动越保守, 纯色区域越干净. 推荐 20~40.
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
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4
      let r = raw[i], g = raw[i + 1], b = raw[i + 2]
      const a = raw[i + 3]
      aRow.push(a < 128)

      if (useDither && a >= 128) {
        r = Math.min(255, Math.max(0, r + Math.round(errR[cur][x])))
        g = Math.min(255, Math.max(0, g + Math.round(errG[cur][x])))
        b = Math.min(255, Math.max(0, b + Math.round(errB[cur][x])))
      }

      if (multiLayer) {
        const res = findBestBlend(r, g, b, palette, glassPalette, glassLayers, pureGlass)
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
        const ob = findBestOrientedBlock(r, g, b, palette)
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
    }
    pixels.push(row)
    alphaMask.push(aRow)
    blockGrid.push(bRow)
    orientationGrid.push(oRow)
    if (y % batchSize === 0 && y > 0) {
      onProgress?.(0.1 + 0.85 * (y / targetHeight))
      await yieldFrame()
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
