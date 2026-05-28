import type { PaletteBlock } from './palettes'

// 生存模式下无法获取或挖掘的方块 ID (creative-only / unbreakable / no item form)
const SURVIVAL_EXCLUDED = new Set([
  'minecraft:bedrock',
  'minecraft:command_block',
  'minecraft:chain_command_block',
  'minecraft:repeating_command_block',
  'minecraft:budding_amethyst',
  'minecraft:reinforced_deepslate',
])

export function filterSurvival(blocks: PaletteBlock[]): PaletteBlock[] {
  return blocks.filter(b => !SURVIVAL_EXCLUDED.has(b.id))
}
