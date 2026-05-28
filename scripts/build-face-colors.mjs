import fs from 'fs'

const faceColors = JSON.parse(fs.readFileSync('output/face-colors.json', 'utf-8'))

// Block groups
const GROUP_A = new Set([
  'oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'cherry_log', 'mangrove_log',
  'stripped_oak_log', 'stripped_spruce_log', 'stripped_birch_log', 'stripped_jungle_log', 'stripped_acacia_log', 'stripped_dark_oak_log', 'stripped_cherry_log', 'stripped_mangrove_log',
  'crimson_stem', 'warped_stem', 'stripped_crimson_stem', 'stripped_warped_stem',
  'bone_block', 'hay_block', 'quartz_pillar', 'purpur_pillar', 'basalt', 'deepslate', 'bamboo_block',
])

const GROUP_B = new Set([
  'mycelium', 'podzol', 'crimson_nylium', 'warped_nylium',
  'crafting_table',
  'trial_spawner', 'sculk_catalyst', 'sculk_sensor', 'sculk_shrieker',
  'furnace', 'blast_furnace', 'smoker', 'carved_pumpkin',
  'beehive', 'bee_nest', 'loom', 'stonecutter', 'chiseled_bookshelf',
  'cartography_table', 'smithing_table', 'fletching_table', 'jukebox',
  'composter', 'target',
])

const GROUP_C = new Set([
  'barrel', 'dispenser', 'dropper', 'observer', 'piston',
  'sticky_piston', 'crafter', 'vault',
])

// Manual overrides for blocks that can't be auto-extracted from textures
const MANUAL_FACE_COLORS = {
  'carved_pumpkin': { front: [150, 84, 17], top: [197, 117, 24], side: [197, 117, 24] },
  // carved_pumpkin uses pumpkin_top texture, which maps to 'pumpkin' not 'carved_pumpkin'
}

const allIds = new Set([...GROUP_A, ...GROUP_B, ...GROUP_C])

let ts = `// Auto-generated from scripts/output/face-colors.json.
// Do not edit manually.

export type BlockFaces = {
  top?: [number, number, number]
  bottom?: [number, number, number]
  side?: [number, number, number]
  front?: [number, number, number]
  back?: [number, number, number]
}

export type BlockGroup = 'axis' | 'fixed' | 'facing'

// blockId -> { faces, group }
// 'axis':  try axis=y/x/z, write block state property
// 'fixed': use only top face color, no orientation
// 'facing': try facing=up/down/n/s/e/w, write block state property
export const DIRECTIONAL_BLOCKS: Record<string, { faces: BlockFaces; group: BlockGroup }> = {\n`

for (const id of [...allIds].sort()) {
  const data = MANUAL_FACE_COLORS[id] || faceColors[id]
  if (!data) {
    console.log('  MISSING:', id)
    continue
  }

  const group = GROUP_A.has(id) ? 'axis' : GROUP_B.has(id) ? 'fixed' : 'facing'
  const faces = {}
  for (const face of ['top', 'bottom', 'side', 'front', 'back']) {
    if (data[face]) {
      faces[face] = data[face]
    }
  }

  if (Object.keys(faces).length === 0) {
    console.log('  NO FACES:', id)
    continue
  }

  const faceStrs = Object.entries(faces).map(function(e) {
    return '    ' + e[0] + ': [' + e[1].join(', ') + ']'
  })
  ts += "  'minecraft:" + id + "': {\n"
  ts += '    faces: {\n' + faceStrs.join(',\n') + ',\n    },\n'
  ts += "    group: '" + group + "',\n"
  ts += '  },\n'
}

ts += '}\n'

fs.writeFileSync('output/face-colors.ts', ts)
console.log('Done!' + ' ' + allIds.size + ' blocks')
