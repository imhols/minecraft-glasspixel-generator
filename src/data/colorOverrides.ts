import type { PaletteBlock } from './palettes'

// 修正多面颜色不一致/生物群系染色的方块颜色, 使其更接近生存模式顶部实际颜色.
// 键: block ID, 值: [R, G, B]
// grass_block 的基础贴图为灰色 [148, 135, 115], 游戏内被生物群系着色器染成绿色.
const OVERRIDES: Record<string, [number, number, number]> = {
  'minecraft:grass_block': [91, 125, 39],
}

export function applyColorOverrides(blocks: PaletteBlock[]): PaletteBlock[] {
  return blocks.map(b => {
    const override = OVERRIDES[b.id]
    if (override) {
      return { ...b, color: override }
    }
    return b
  })
}
