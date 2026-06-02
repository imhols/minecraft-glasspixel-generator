import type { PaletteBlock } from '../data/palettes'
import { TEXTURE_SIDES } from '../data/textureSides'

export type BlockFacing = 'vertical' | 'horizontal'

// 水平 = pixel art on ground, viewed from top → top/bottom faces
// 竖直 = pixel art stood up, viewed from side → side faces
const TOP = new Set(['top', 'bottom'])
const SIDE = new Set(['north', 'south', 'east', 'west', 'front', 'back'])

export function applyFacing(palette: PaletteBlock[], facing: BlockFacing): PaletteBlock[] {
  const allowed = facing === 'horizontal' ? TOP : SIDE
  const result: PaletteBlock[] = []

  for (const block of palette) {
    const dir = TEXTURE_SIDES[block.id]
    if (!dir) {
      result.push(block)
      continue
    }

    let matched = false
    for (const entry of dir.entries) {
      if (entry.sides.some(s => allowed.has(s))) {
        result.push({ ...block, color: entry.rgb })
        matched = true
      }
    }

    if (!matched) result.push(block)
  }

  return result
}
