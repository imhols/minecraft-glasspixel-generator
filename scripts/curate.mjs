import fs from 'fs'

const raw = fs.readFileSync('output/palettes.ts', 'utf-8')
const blockMatches = [...raw.matchAll(/\{ name: '([^']+)', id: '([^']+)', color: \[(\d+), (\d+), (\d+)\], versions: \[([^\]]+)\](, transparent: true)?/g)]

const blocks = []
for (const m of blockMatches) {
  blocks.push({
    name: m[1],
    id: m[2],
    color: [parseInt(m[3]), parseInt(m[4]), parseInt(m[5])],
    versions: m[6].split(',').map(s => s.trim().replace(/'/g, '')),
    transparent: !!m[7],
  })
}

// Remove duplicate entries (same block ID from different naming conventions)
const seen = new Map()
const deduped = []
for (const b of blocks) {
  const key = b.id
  if (seen.has(key)) {
    // Merge versions (keep all unique versions)
    const existing = seen.get(key)
    const mergedVersions = [...new Set([...existing.versions, ...b.versions])].sort()
    // Keep the color from the newer version if available
    // Priority: newer > older
    const existingMaxVer = Math.max(...existing.versions.map(v => parseInt(v.split('.')[1] || '0')))
    const newMaxVer = Math.max(...b.versions.map(v => parseInt(v.split('.')[1] || '0')))
    if (newMaxVer > existingMaxVer) {
      existing.color = b.color
    }
    existing.versions = mergedVersions
  } else {
    seen.set(key, b)
    deduped.push(b)
  }
}

// Remove non-full-block entries by name patterns and known exclusions
const EXCLUDE_IDS = new Set([
  'minecraft:anvil_base', 'minecraft:anvil', 'minecraft:anvil_top', 'minecraft:chipped_anvil', 'minecraft:damaged_anvil',
  'minecraft:comparator', 'minecraft:repeater',
  'minecraft:debug', 'minecraft:debug2', 'minecraft:debug_2',
  'minecraft:barrel_top', 'minecraft:barrel_top_open', 'minecraft:barrel',
  'minecraft:crafter', 'minecraft:crafter_top_crafting', 'minecraft:crafter_top_triggered',
  'minecraft:crafter_east_crafting', 'minecraft:crafter_east_triggered',
  'minecraft:crafter_west_crafting', 'minecraft:crafter_west_triggered',
  'minecraft:crafter_north_crafting', 'minecraft:crafter_north_triggered',
  'minecraft:crafter_south_crafting', 'minecraft:crafter_south_triggered',
  'minecraft:composter', 'minecraft:composter_compost', 'minecraft:composter_ready',
  'minecraft:lectern', 'minecraft:lectern_base', 'minecraft:lectern_front', 'minecraft:lectern_sides', 'minecraft:lectern_top',
  'minecraft:loom_front', 'minecraft:loom', 'minecraft:loom_side', 'minecraft:loom_top',
  'minecraft:smoker', 'minecraft:smoker_bottom', 'minecraft:smoker_front', 'minecraft:smoker_front_on', 'minecraft:smoker_side', 'minecraft:smoker_top',
  'minecraft:furnace', 'minecraft:furnace_front_off', 'minecraft:furnace_front_on', 'minecraft:furnace_side', 'minecraft:furnace_top',
  'minecraft:grindstone', 'minecraft:grindstone_side', 'minecraft:grindstone_pivot', 'minecraft:grindstone_round',
  'minecraft:stonecutter', 'minecraft:stonecutter_bottom', 'minecraft:stonecutter_side', 'minecraft:stonecutter_top', 'minecraft:stonecutter_saw',
  'minecraft:brewing_stand', 'minecraft:brewing_stand_base',
  'minecraft:cartography_table', 'minecraft:cartography_table_side1', 'minecraft:cartography_table_side2', 'minecraft:cartography_table_side3', 'minecraft:cartography_table_top',
  'minecraft:smithing_table', 'minecraft:smithing_table_bottom', 'minecraft:smithing_table_front', 'minecraft:smithing_table_side', 'minecraft:smithing_table_top',
  'minecraft:fletching_table', 'minecraft:fletching_table_front', 'minecraft:fletching_table_side', 'minecraft:fletching_table_top',
  'minecraft:bee_nest', 'minecraft:bee_nest_front', 'minecraft:bee_nest_front_honey', 'minecraft:bee_nest_side', 'minecraft:bee_nest_top', 'minecraft:bee_nest_bottom',
  'minecraft:beehive', 'minecraft:beehive_end', 'minecraft:beehive_front', 'minecraft:beehive_front_honey', 'minecraft:beehive_side',
  'minecraft:jukebox', 'minecraft:jukebox_side', 'minecraft:jukebox_top',
  'minecraft:bookshelf',
  'minecraft:chest', 'minecraft:ender_chest', 'minecraft:trapped_chest',
  'minecraft:hopper', 'minecraft:hopper_inside', 'minecraft:hopper_outside', 'minecraft:hopper_top',
  'minecraft:sculk_catalyst', 'minecraft:sculk_catalyst_bottom', 'minecraft:sculk_catalyst_side', 'minecraft:sculk_catalyst_top',
  'minecraft:sculk_sensor', 'minecraft:sculk_sensor_bottom', 'minecraft:sculk_sensor_side', 'minecraft:sculk_sensor_top',
  'minecraft:sculk_shrieker', 'minecraft:sculk_shrieker_bottom', 'minecraft:sculk_shrieker_inner_top', 'minecraft:sculk_shrieker_side', 'minecraft:sculk_shrieker_top',
  'minecraft:trial_spawner', 'minecraft:trial_spawner_bottom', 'minecraft:trial_spawner_side', 'minecraft:trial_spawner_top',
  'minecraft:spawner',
  'minecraft:vault', 'minecraft:vault_front', 'minecraft:vault_front_off', 'minecraft:vault_side', 'minecraft:vault_top', 'minecraft:vault_bottom',
  'minecraft:bamboo_fence_gate_particle', 'minecraft:bamboo_fence_particle',
  'minecraft:chorus_flower', 'minecraft:chorus_flower_dead',
  'minecraft:concrete_powder_black', 'minecraft:concrete_powder_blue', 'minecraft:concrete_powder_brown',
  'minecraft:concrete_powder_cyan', 'minecraft:concrete_powder_gray', 'minecraft:concrete_powder_green',
  'minecraft:concrete_powder_light_blue', 'minecraft:concrete_powder_lime', 'minecraft:concrete_powder_magenta',
  'minecraft:concrete_powder_orange', 'minecraft:concrete_powder_pink', 'minecraft:concrete_powder_purple',
  'minecraft:concrete_powder_red', 'minecraft:concrete_powder_silver', 'minecraft:concrete_powder_white',
  'minecraft:concrete_powder_yellow',
  'minecraft:cobblestone_mossy',
])

// Exclude gravity-affected/patterned blocks not suitable for pixel art
const EXCLUDE_PATTERNS = [
  /_concrete_powder$/,
  /_glazed_terracotta$/,
  /_shulker_box$/,
  /_door$/,
  /_trapdoor$/,
  /_glass_pane$/,
]

const BLOCK_RENAME = new Map([
  ['minecraft:snow', 'minecraft:snow_block'],
])

const ALLOW_TRANSPARENT = new Set([
  'ice', 'packed_ice', 'blue_ice',
  'slime_block', 'honey_block', 'cobweb',
  'glowstone', 'shroomlight', 'sea_lantern', 'ochre_froglight', 'verdant_froglight', 'pearlescent_froglight',
  'oak_leaves', 'spruce_leaves', 'birch_leaves', 'jungle_leaves', 'acacia_leaves', 'dark_oak_leaves', 'mangrove_leaves', 'azalea_leaves', 'flowering_azalea_leaves', 'cherry_leaves',
  'moss_block', 'sculk', 'target',
  'grass_block', 'mycelium', 'podzol', 'crimson_nylium', 'warped_nylium',
])

const filtered = deduped.map(b => {
  const renamed = BLOCK_RENAME.get(b.id)
  if (renamed) b.id = renamed
  return b
}).filter(b => {
  if (EXCLUDE_IDS.has(b.id)) return false
  // Filter old-style IDs (pre-1.13 naming)
  const shortName = b.id.split(':')[1]
  if (/^(glazed_terracotta|shulker_top|shulker_|concrete_powder)_/.test(shortName)) return false
  // Filter by patterns (modern naming of excluded blocks)
  for (const pat of EXCLUDE_PATTERNS) {
    if (pat.test(shortName)) return false
  }
  // Allow glass always
  if (b.id.endsWith('_stained_glass')) return true
  // Allow known transparent blocks
  if (b.transparent) {
    if (!ALLOW_TRANSPARENT.has(shortName)) return false
  }
  return true
})

filtered.sort((a, b) => a.id.localeCompare(b.id))

const VERSION_ORDER = ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21']
const VERSION_LABELS = {
  '1.12.2': '1.12.2',
  '1.13.2': '1.13 / 1.14 / 1.15',
  '1.16.5': '1.16',
  '1.17.1': '1.17 / 1.18',
  '1.19': '1.19',
  '1.20': '1.20',
  '1.21': '1.21+',
}

let ts = `import type { MCVersion } from '../types'\n\n`
ts += `export const MC_VERSIONS: MCVersion[] = [\n`
for (const v of VERSION_ORDER) {
  ts += `  { id: '${v}', label: '${VERSION_LABELS[v]}' },\n`
}
ts += `]\n\n`
ts += `export interface PaletteBlock {\n`
ts += `  name: string\n`
ts += `  id: string\n`
ts += `  color: [number, number, number]\n`
ts += `  versions: string[]\n`
ts += `  transparent?: boolean\n`
ts += `}\n\n`
ts += `const BLOCKS: PaletteBlock[] = [\n`

const opaqueBlocks = filtered.filter(b => !b.transparent)
const glassBlocks = filtered.filter(b => b.id.endsWith('_stained_glass'))
const transparentBlocks = filtered.filter(b => b.transparent && !b.id.endsWith('_stained_glass'))

for (const block of filtered) {
  const vStr = block.versions.map(v => `'${v}'`).join(', ')
  const t = block.transparent ? ', transparent: true' : ''
  ts += `  { name: '${block.name}', id: '${block.id}', color: [${block.color.join(', ')}], versions: [${vStr}]${t} },\n`
}

ts += `]\n\n`
ts += `export function getBlocks(version: string, includeTransparent = false): PaletteBlock[] {\n`
ts += `  return BLOCKS.filter(b => b.versions.includes(version) && (includeTransparent || !b.transparent))\n`
ts += `}\n\n`
ts += `export function getGlassBlocks(version: string): PaletteBlock[] {\n`
ts += `  return BLOCKS.filter(b => b.versions.includes(version) && b.id.endsWith('_stained_glass'))\n`
ts += `}\n\n`
ts += `export function getAllBlocks(): PaletteBlock[] {\n`
ts += `  return BLOCKS\n`
ts += `}\n`

fs.writeFileSync('output/curated-palettes.ts', ts)

const opaqueCount = filtered.filter(b => !b.transparent).length
const glassCount = filtered.filter(b => b.id.endsWith('_stained_glass')).length
const transparentCount = filtered.filter(b => b.transparent).length - glassCount
console.log(`Opaque: ${opaqueCount}`)
console.log(`Stained glass: ${glassCount}`)
console.log(`Transparent non-glass: ${transparentCount}`)
console.log(`Total curated: ${filtered.length}`)
console.log(`Total excluded: ${blocks.length - filtered.length}`)
