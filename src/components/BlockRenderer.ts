import type { PaletteBlock } from '../data/palettes'
import { drawBlockTexture } from './textureLoader'

export const BLOCK_SIZE = 64
const PIXEL = BLOCK_SIZE / 16
const DEPTH = 16

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function renderFallbackTexture(
  ctx: CanvasRenderingContext2D,
  color: [number, number, number],
  alpha: number,
  isGlass: boolean,
  offsetX = 0,
  offsetY = 0,
) {
  const [r, g, b] = color
  const rand = seededRandom(r * 65536 + g * 256 + b)

  for (let py = 0; py < 16; py++) {
    for (let px = 0; px < 16; px++) {
      const noise = (rand() - 0.5) * (isGlass ? 8 : 12)
      const nr = Math.max(0, Math.min(255, r + noise))
      const ng = Math.max(0, Math.min(255, g + noise))
      const nb = Math.max(0, Math.min(255, b + noise))

      ctx.fillStyle = `rgba(${Math.round(nr)},${Math.round(ng)},${Math.round(nb)},${alpha})`
      ctx.fillRect(offsetX + px * PIXEL, offsetY + py * PIXEL, PIXEL, PIXEL)
    }
  }

  if (isGlass) {
    ctx.fillStyle = `rgba(255,255,255,${0.08 * alpha})`
    for (let i = 0; i < 4; i++) {
      const lx = offsetX + Math.round(rand() * (BLOCK_SIZE - 4))
      const ly = offsetY + Math.round(rand() * (BLOCK_SIZE - 4))
      ctx.fillRect(lx, ly, 4, 2)
    }
  }
}

export function renderBlockTexture(
  ctx: CanvasRenderingContext2D,
  color: [number, number, number],
  alpha: number,
  isGlass: boolean,
  offsetX = 0,
  offsetY = 0,
) {
  renderFallbackTexture(ctx, color, alpha, isGlass, offsetX, offsetY)
}

function darken(c: [number, number, number], factor: number): [number, number, number] {
  return [
    Math.round(c[0] * factor),
    Math.round(c[1] * factor),
    Math.round(c[2] * factor),
  ]
}

export function renderBlock(
  ctx: CanvasRenderingContext2D,
  block: PaletteBlock,
) {
  const isGlass = block.id.endsWith('_stained_glass')

  ctx.imageSmoothingEnabled = false
  if (!drawBlockTexture(ctx, block.id, 0, 0, BLOCK_SIZE)) {
    renderFallbackTexture(ctx, block.color, isGlass ? 0.65 : 1, isGlass)
  }
}

export function renderStacked(
  ctx: CanvasRenderingContext2D,
  base: PaletteBlock | null,
  glasses: PaletteBlock[],
  size: number,
) {
  ctx.clearRect(0, 0, size, size)
  ctx.imageSmoothingEnabled = false

  if (base) {
    if (!drawBlockTexture(ctx, base.id, 0, 0, size)) {
      renderFallbackTexture(ctx, base.color, 1, false)
    }
  }

  for (const glass of glasses) {
    if (!drawBlockTexture(ctx, glass.id, 0, 0, size)) {
      renderFallbackTexture(ctx, glass.color, 0.45, true)
    }
  }
}

function drawCube(
  ctx: CanvasRenderingContext2D,
  color: [number, number, number],
  alpha: number,
  isGlass: boolean,
  x: number,
  y: number,
) {
  const d = DEPTH

  const rightColor = darken(color, 0.6)
  ctx.fillStyle = `rgba(${rightColor[0]},${rightColor[1]},${rightColor[2]},${alpha})`
  ctx.beginPath()
  ctx.moveTo(x + BLOCK_SIZE, y + d)
  ctx.lineTo(x + BLOCK_SIZE + d, y)
  ctx.lineTo(x + BLOCK_SIZE + d, y - BLOCK_SIZE + d)
  ctx.lineTo(x + BLOCK_SIZE, y - BLOCK_SIZE + d * 2)
  ctx.closePath()
  ctx.fill()

  const topColor = darken(color, 0.8)
  ctx.fillStyle = `rgba(${topColor[0]},${topColor[1]},${topColor[2]},${alpha})`
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + d, y - d)
  ctx.lineTo(x + BLOCK_SIZE + d, y - d)
  ctx.lineTo(x + BLOCK_SIZE, y)
  ctx.closePath()
  ctx.fill()

  renderFallbackTexture(ctx, color, alpha, isGlass, x, y + d)

  if (isGlass && alpha > 0.3) {
    ctx.fillStyle = `rgba(255,255,255,${0.06 * alpha})`
    ctx.beginPath()
    ctx.moveTo(x + d, y - d)
    ctx.lineTo(x + BLOCK_SIZE + d, y - d)
    ctx.lineTo(x + BLOCK_SIZE, y)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = `rgba(255,255,255,${0.04 * alpha})`
    ctx.beginPath()
    ctx.moveTo(x + BLOCK_SIZE, y + d)
    ctx.lineTo(x + BLOCK_SIZE + d, y)
    ctx.lineTo(x + BLOCK_SIZE + d, y - BLOCK_SIZE + d)
    ctx.lineTo(x + BLOCK_SIZE, y - BLOCK_SIZE + d * 2)
    ctx.closePath()
    ctx.fill()
  }
}

export function renderColumn3D(
  ctx: CanvasRenderingContext2D,
  base: PaletteBlock | null,
  glasses: PaletteBlock[],
) {
  const d = DEPTH
  const airGap = 8
  const count = (base ? 1 : 0) + glasses.length
  if (count === 0) return

  const totalH = count * (BLOCK_SIZE + d) + (count - 1) * airGap + d
  const totalW = BLOCK_SIZE + d

  const canvas = ctx.canvas
  canvas.width = totalW
  canvas.height = totalH

  ctx.clearRect(0, 0, totalW, totalH)

  let cy = totalH - d

  const layers: { color: [number, number, number]; alpha: number; isGlass: boolean }[] = []

  if (base) {
    layers.push({ color: base.color, alpha: 1, isGlass: false })
  }
  for (const g of glasses) {
    layers.push({ color: g.color, alpha: 0.5, isGlass: true })
  }

  for (const layer of layers) {
    const topY = cy - BLOCK_SIZE
    drawCube(ctx, layer.color, layer.alpha, layer.isGlass, 0, topY)
    cy = topY - airGap
  }
}

export function renderColorSwatch(
  ctx: CanvasRenderingContext2D,
  color: [number, number, number],
  size: number,
) {
  ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
  ctx.fillRect(0, 0, size, size)
}
