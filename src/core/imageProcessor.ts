import type { PaletteBlock } from '../data/palettes'
import { findBestBlend, findClosestBlockRGB } from './colorMatcher'

export interface ProcessedImage {
  width: number
  height: number
  pixels: number[][][]
  blockGrid: (PaletteBlock | null)[][]
  usedBlocks: Map<string, number>
  glassGrids?: (PaletteBlock | null)[][][]  // [layer][y][x], layer 0 = top
  glassLayers?: number
  alphaMask?: boolean[][]  // true = transparent (air)
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
): Promise<ProcessedImage> {
  return processImageBase(img, targetWidth, targetHeight, palette, 0, [], [], onProgress)
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
): Promise<ProcessedImage> {
  return processImageBase(img, targetWidth, targetHeight, basePalette, glassLayers, [], glassPalette, onProgress, pureGlass)
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
  const usedBlocks = new Map<string, number>()
  const batchSize = Math.max(1, Math.floor(targetHeight / 20))

  for (let l = 0; l < glassLayers; l++) {
    const grid: (PaletteBlock | null)[][] = []
    for (let y = 0; y < targetHeight; y++) grid.push(new Array(targetWidth).fill(null))
    glassGrids.push(grid)
  }

  for (let y = 0; y < targetHeight; y++) {
    const row: number[][] = []
    const aRow: boolean[] = []
    const bRow: (PaletteBlock | null)[] = []
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4
      const r = raw[i], g = raw[i + 1], b = raw[i + 2], a = raw[i + 3]
      aRow.push(a < 128)

      if (multiLayer) {
        const res = findBestBlend(r, g, b, palette, glassPalette, glassLayers, pureGlass)
        row.push(res.color)
        bRow.push(res.base)
        for (let l = 0; l < glassLayers; l++) glassGrids[l][y][x] = res.glasses[l]
        if (res.base) usedBlocks.set(res.base.id, (usedBlocks.get(res.base.id) || 0) + 1)
        for (const gl of res.glasses) usedBlocks.set(gl.id, (usedBlocks.get(gl.id) || 0) + 1)
      } else {
        const block = findClosestBlockRGB(r, g, b, palette)
        row.push([block.color[0], block.color[1], block.color[2]])
        bRow.push(block)
        usedBlocks.set(block.id, (usedBlocks.get(block.id) || 0) + 1)
      }
    }
    pixels.push(row)
    alphaMask.push(aRow)
    blockGrid.push(bRow)
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
        for (let l = 0; l < glassLayers; l++) glassGrids[l][y][x] = null
      }
    }
  }

  onProgress?.(1)
  const result: ProcessedImage = {
    width: targetWidth, height: targetHeight,
    pixels, blockGrid, usedBlocks,
  }
  if (alphaMask.some(row => row.some(a => a))) result.alphaMask = alphaMask
  if (multiLayer) { result.glassGrids = glassGrids; result.glassLayers = glassLayers }
  return result
}
