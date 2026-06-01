import type { PaletteBlock } from '../data/palettes'
import { drawBlockTexture } from './textureLoader'

export const BLOCK_SIZE = 64

export function renderBlock(
  ctx: CanvasRenderingContext2D,
  block: PaletteBlock,
) {
  ctx.clearRect(0, 0, BLOCK_SIZE, BLOCK_SIZE)
  ctx.imageSmoothingEnabled = false
  drawBlockTexture(ctx, block.id, 0, 0, BLOCK_SIZE)
}

export function renderColorSwatch(
  ctx: CanvasRenderingContext2D,
  color: [number, number, number],
  size: number,
) {
  ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
  ctx.fillRect(0, 0, size, size)
}
