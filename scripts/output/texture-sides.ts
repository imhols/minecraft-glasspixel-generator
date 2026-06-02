// Auto-generated from scripts/output/face-colors.json.
// Do not edit manually.

export type SideName = 'top' | 'bottom' | 'north' | 'south' | 'east' | 'west' | 'front' | 'back'

export interface TextureSideEntry {
  rgb: [number, number, number]
  sides: SideName[]
}

export type BlockGroup = 'axis' | 'fixed' | 'facing'

// blockId -> texture entries + orientation group.
// Each entry is a distinct face texture with its average color and which
// block-faces it covers. Blocks not listed here share one texture (palette avg).
export const TEXTURE_SIDES: Record<string, { entries: TextureSideEntry[]; group: BlockGroup }> = {
  'minecraft:acacia_door': {
    group: 'facing',
    entries: [
    { rgb: [168, 95, 61], sides: ['top'] },
    { rgb: [163, 92, 57], sides: ['bottom'] },
    ],
  },
  'minecraft:acacia_log': {
    group: 'axis',
    entries: [
    { rgb: [151, 89, 55], sides: ['top'] },
    { rgb: [103, 97, 87], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:ancient_debris': {
    group: 'fixed',
    entries: [
    { rgb: [95, 66, 58], sides: ['top'] },
    { rgb: [96, 64, 56], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:anvil': {
    group: 'facing',
    entries: [
    { rgb: [73, 73, 73], sides: ['top'] },
    { rgb: [69, 69, 69], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:azalea': {
    group: 'fixed',
    entries: [
    { rgb: [94, 118, 45], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [102, 125, 48], sides: ['top'] },
    ],
  },
  'minecraft:bamboo_block': {
    group: 'axis',
    entries: [
    { rgb: [139, 142, 62], sides: ['top'] },
    { rgb: [127, 144, 58], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:bamboo_door': {
    group: 'facing',
    entries: [
    { rgb: [191, 171, 81], sides: ['top'] },
    { rgb: [199, 178, 85], sides: ['bottom'] },
    ],
  },
  'minecraft:barrel': {
    group: 'facing',
    entries: [
    { rgb: [135, 101, 58], sides: ['top'] },
    { rgb: [108, 81, 50], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [116, 85, 49], sides: ['bottom'] },
    ],
  },
  'minecraft:basalt': {
    group: 'axis',
    entries: [
    { rgb: [73, 73, 78], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [81, 81, 86], sides: ['top'] },
    ],
  },
  'minecraft:bee_nest': {
    group: 'facing',
    entries: [
    { rgb: [196, 151, 77], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [161, 127, 88], sides: ['bottom'] },
    { rgb: [183, 142, 76], sides: ['front'] },
    { rgb: [202, 160, 75], sides: ['top'] },
    ],
  },
  'minecraft:beehive': {
    group: 'facing',
    entries: [
    { rgb: [159, 128, 78], sides: ['front'] },
    { rgb: [157, 126, 76], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [167, 132, 74], sides: ['top'] },
    ],
  },
  'minecraft:bell': {
    group: 'fixed',
    entries: [
    { rgb: [189, 148, 42], sides: ['bottom'] },
    { rgb: [253, 235, 111], sides: ['top'] },
    { rgb: [253, 229, 97], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:big_dripleaf': {
    group: 'facing',
    entries: [
    { rgb: [112, 142, 52], sides: ['top'] },
    { rgb: [75, 98, 44], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:birch_door': {
    group: 'facing',
    entries: [
    { rgb: [220, 210, 176], sides: ['top'] },
    { rgb: [208, 194, 144], sides: ['bottom'] },
    ],
  },
  'minecraft:birch_log': {
    group: 'axis',
    entries: [
    { rgb: [193, 179, 135], sides: ['top'] },
    { rgb: [217, 215, 210], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:blackstone': {
    group: 'fixed',
    entries: [
    { rgb: [42, 36, 42], sides: ['top'] },
    { rgb: [42, 36, 41], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:blast_furnace': {
    group: 'facing',
    entries: [
    { rgb: [81, 80, 81], sides: ['top'] },
    { rgb: [108, 107, 108], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [108, 108, 107], sides: ['front'] },
    ],
  },
  'minecraft:bone_block': {
    group: 'axis',
    entries: [
    { rgb: [210, 206, 179], sides: ['top'] },
    { rgb: [229, 226, 208], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:cactus': {
    group: 'fixed',
    entries: [
    { rgb: [143, 170, 86], sides: ['bottom'] },
    { rgb: [86, 127, 43], sides: ['top'] },
    { rgb: [89, 130, 45], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:cake': {
    group: 'fixed',
    entries: [
    { rgb: [248, 223, 214], sides: ['top'] },
    { rgb: [134, 62, 33], sides: ['bottom'] },
    { rgb: [203, 152, 122], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:cartography_table': {
    group: 'fixed',
    entries: [
    { rgb: [103, 87, 67], sides: ['top'] },
    { rgb: [68, 44, 20], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:carved_pumpkin': {
    group: 'facing',
    entries: [
    { rgb: [150, 84, 17], sides: ['front'] },
    { rgb: [197, 117, 24], sides: ['top'] },
    { rgb: [197, 117, 24], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:cauldron': {
    group: 'fixed',
    entries: [
    { rgb: [74, 73, 75], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [74, 73, 74], sides: ['top'] },
    { rgb: [40, 40, 45], sides: ['bottom'] },
    ],
  },
  'minecraft:chain_command_block': {
    group: 'fixed',
    entries: [
    { rgb: [132, 165, 151], sides: ['front'] },
    { rgb: [131, 161, 147], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [130, 157, 145], sides: ['back'] },
    { rgb: [130, 162, 147], sides: ['top'] },
    ],
  },
  'minecraft:cherry_door': {
    group: 'facing',
    entries: [
    { rgb: [226, 176, 170], sides: ['bottom'] },
    { rgb: [223, 171, 165], sides: ['top'] },
    ],
  },
  'minecraft:cherry_log': {
    group: 'axis',
    entries: [
    { rgb: [185, 141, 137], sides: ['top'] },
    { rgb: [55, 33, 44], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:chiseled_bookshelf': {
    group: 'fixed',
    entries: [
    { rgb: [178, 145, 89], sides: ['top'] },
    { rgb: [175, 142, 86], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [90, 71, 42], sides: ['bottom'] },
    ],
  },
  'minecraft:chiseled_quartz_block': {
    group: 'fixed',
    entries: [
    { rgb: [232, 227, 217], sides: ['top'] },
    { rgb: [232, 227, 218], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:chiseled_tuff': {
    group: 'fixed',
    entries: [
    { rgb: [94, 99, 91], sides: ['top'] },
    { rgb: [89, 94, 87], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:chiseled_tuff_bricks': {
    group: 'fixed',
    entries: [
    { rgb: [111, 114, 107], sides: ['top'] },
    { rgb: [99, 103, 96], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:command_block': {
    group: 'fixed',
    entries: [
    { rgb: [177, 133, 108], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [181, 136, 108], sides: ['front'] },
    { rgb: [174, 131, 107], sides: ['back'] },
    { rgb: [179, 133, 106], sides: ['top'] },
    ],
  },
  'minecraft:composter': {
    group: 'fixed',
    entries: [
    { rgb: [153, 99, 52], sides: ['top'] },
    { rgb: [117, 72, 32], sides: ['bottom'] },
    { rgb: [112, 70, 32], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:copper_door': {
    group: 'facing',
    entries: [
    { rgb: [193, 109, 83], sides: ['top'] },
    { rgb: [181, 103, 77], sides: ['bottom'] },
    ],
  },
  'minecraft:crafter': {
    group: 'fixed',
    entries: [
    { rgb: [79, 79, 79], sides: ['bottom'] },
    { rgb: [112, 99, 100], sides: ['top'] },
    { rgb: [129, 115, 95], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:crafting_table': {
    group: 'fixed',
    entries: [
    { rgb: [129, 106, 70], sides: ['front'] },
    { rgb: [129, 103, 63], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [120, 73, 42], sides: ['top'] },
    ],
  },
  'minecraft:crimson_door': {
    group: 'facing',
    entries: [
    { rgb: [115, 55, 79], sides: ['bottom'] },
    { rgb: [114, 55, 79], sides: ['top'] },
    ],
  },
  'minecraft:crimson_nylium': {
    group: 'fixed',
    entries: [
    { rgb: [107, 27, 27], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [131, 31, 31], sides: ['top'] },
    ],
  },
  'minecraft:crimson_stem': {
    group: 'axis',
    entries: [
    { rgb: [113, 50, 70], sides: ['top'] },
    { rgb: [93, 26, 30], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:dark_oak_door': {
    group: 'facing',
    entries: [
    { rgb: [73, 49, 24], sides: ['bottom'] },
    { rgb: [77, 52, 25], sides: ['top'] },
    ],
  },
  'minecraft:dark_oak_log': {
    group: 'axis',
    entries: [
    { rgb: [68, 45, 22], sides: ['top'] },
    { rgb: [60, 47, 26], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:daylight_detector': {
    group: 'fixed',
    entries: [
    { rgb: [131, 116, 95], sides: ['top'] },
    { rgb: [67, 55, 36], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:deepslate': {
    group: 'axis',
    entries: [
    { rgb: [87, 87, 89], sides: ['top'] },
    { rgb: [80, 80, 83], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:dirt_path': {
    group: 'fixed',
    entries: [
    { rgb: [148, 122, 65], sides: ['top'] },
    { rgb: [137, 101, 67], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:dispenser': {
    group: 'facing',
    entries: [
    { rgb: [122, 122, 122], sides: ['front'] },
    { rgb: [99, 98, 98], sides: ['top'] },
    ],
  },
  'minecraft:dried_kelp': {
    group: 'fixed',
    entries: [
    { rgb: [38, 49, 30], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [50, 59, 39], sides: ['bottom'] },
    { rgb: [50, 59, 39], sides: ['top'] },
    ],
  },
  'minecraft:dropper': {
    group: 'facing',
    entries: [
    { rgb: [122, 122, 122], sides: ['front'] },
    { rgb: [98, 97, 97], sides: ['top'] },
    ],
  },
  'minecraft:end_portal_frame': {
    group: 'fixed',
    entries: [
    { rgb: [91, 121, 97], sides: ['top'] },
    { rgb: [151, 163, 123], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:exposed_copper_door': {
    group: 'facing',
    entries: [
    { rgb: [164, 123, 106], sides: ['top'] },
    { rgb: [153, 118, 100], sides: ['bottom'] },
    ],
  },
  'minecraft:fletching_table': {
    group: 'fixed',
    entries: [
    { rgb: [173, 155, 111], sides: ['front'] },
    { rgb: [197, 180, 133], sides: ['top'] },
    { rgb: [192, 167, 130], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:flowering_azalea': {
    group: 'fixed',
    entries: [
    { rgb: [112, 122, 64], sides: ['top'] },
    { rgb: [111, 113, 73], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:furnace': {
    group: 'facing',
    entries: [
    { rgb: [92, 91, 91], sides: ['front'] },
    { rgb: [110, 110, 110], sides: ['top'] },
    { rgb: [121, 120, 120], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [121, 113, 94], sides: ['bottom'] },
    ],
  },
  'minecraft:grass_block': {
    group: 'fixed',
    entries: [
    { rgb: [127, 107, 66], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [147, 147, 147], sides: ['top'] },
    { rgb: [170, 151, 133], sides: ['bottom'] },
    ],
  },
  'minecraft:grindstone': {
    group: 'fixed',
    entries: [
    { rgb: [140, 140, 140], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [73, 46, 21], sides: ['top'] },
    ],
  },
  'minecraft:hay_block': {
    group: 'axis',
    entries: [
    { rgb: [166, 136, 38], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [166, 139, 12], sides: ['top'] },
    ],
  },
  'minecraft:honey_block': {
    group: 'fixed',
    entries: [
    { rgb: [251, 185, 53], sides: ['top'] },
    { rgb: [251, 188, 58], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [241, 146, 18], sides: ['bottom'] },
    ],
  },
  'minecraft:hopper': {
    group: 'facing',
    entries: [
    { rgb: [76, 74, 76], sides: ['top'] },
    { rgb: [67, 66, 68], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:iron_door': {
    group: 'facing',
    entries: [
    { rgb: [194, 193, 193], sides: ['top'] },
    { rgb: [196, 195, 195], sides: ['bottom'] },
    ],
  },
  'minecraft:jigsaw': {
    group: 'fixed',
    entries: [
    { rgb: [62, 54, 63], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [80, 70, 81], sides: ['top'] },
    { rgb: [34, 27, 37], sides: ['bottom'] },
    ],
  },
  'minecraft:jungle_door': {
    group: 'facing',
    entries: [
    { rgb: [164, 120, 85], sides: ['top'] },
    { rgb: [158, 114, 79], sides: ['bottom'] },
    ],
  },
  'minecraft:jungle_log': {
    group: 'axis',
    entries: [
    { rgb: [150, 109, 71], sides: ['top'] },
    { rgb: [85, 68, 25], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:large_fern': {
    group: 'fixed',
    entries: [
    { rgb: [132, 132, 132], sides: ['bottom'] },
    { rgb: [125, 126, 125], sides: ['top'] },
    ],
  },
  'minecraft:lectern': {
    group: 'facing',
    entries: [
    { rgb: [174, 138, 83], sides: ['top'] },
    { rgb: [130, 101, 56], sides: ['front'] },
    { rgb: [163, 121, 74], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:lilac': {
    group: 'fixed',
    entries: [
    { rgb: [155, 125, 147], sides: ['top'] },
    { rgb: [137, 124, 127], sides: ['bottom'] },
    ],
  },
  'minecraft:lodestone': {
    group: 'fixed',
    entries: [
    { rgb: [147, 149, 153], sides: ['top'] },
    { rgb: [119, 120, 123], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:loom': {
    group: 'facing',
    entries: [
    { rgb: [142, 119, 92], sides: ['top'] },
    { rgb: [76, 60, 36], sides: ['bottom'] },
    { rgb: [148, 119, 82], sides: ['front'] },
    { rgb: [146, 101, 73], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:mangrove_door': {
    group: 'facing',
    entries: [
    { rgb: [113, 49, 47], sides: ['top'] },
    { rgb: [112, 48, 46], sides: ['bottom'] },
    ],
  },
  'minecraft:mangrove_log': {
    group: 'axis',
    entries: [
    { rgb: [103, 49, 42], sides: ['top'] },
    { rgb: [84, 67, 41], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:mangrove_roots': {
    group: 'fixed',
    entries: [
    { rgb: [75, 60, 38], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [75, 60, 39], sides: ['top'] },
    ],
  },
  'minecraft:melon': {
    group: 'fixed',
    entries: [
    { rgb: [114, 146, 30], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [111, 145, 31], sides: ['top'] },
    ],
  },
  'minecraft:muddy_mangrove_roots': {
    group: 'axis',
    entries: [
    { rgb: [70, 59, 45], sides: ['top'] },
    { rgb: [68, 59, 48], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:mycelium': {
    group: 'fixed',
    entries: [
    { rgb: [111, 99, 101], sides: ['top'] },
    { rgb: [114, 88, 72], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:oak_door': {
    group: 'facing',
    entries: [
    { rgb: [139, 108, 62], sides: ['bottom'] },
    { rgb: [141, 111, 66], sides: ['top'] },
    ],
  },
  'minecraft:oak_log': {
    group: 'axis',
    entries: [
    { rgb: [151, 122, 73], sides: ['top'] },
    { rgb: [109, 85, 51], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:observer': {
    group: 'facing',
    entries: [
    { rgb: [72, 70, 70], sides: ['back'] },
    { rgb: [98, 98, 98], sides: ['top'] },
    { rgb: [104, 103, 103], sides: ['front'] },
    { rgb: [70, 69, 69], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:ochre_froglight': {
    group: 'axis',
    entries: [
    { rgb: [251, 245, 207], sides: ['top'] },
    { rgb: [245, 233, 182], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:oxidized_copper_door': {
    group: 'facing',
    entries: [
    { rgb: [82, 160, 133], sides: ['top'] },
    { rgb: [80, 153, 127], sides: ['bottom'] },
    ],
  },
  'minecraft:pearlescent_froglight': {
    group: 'axis',
    entries: [
    { rgb: [246, 240, 240], sides: ['top'] },
    { rgb: [236, 225, 229], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:peony': {
    group: 'fixed',
    entries: [
    { rgb: [87, 101, 94], sides: ['bottom'] },
    { rgb: [130, 127, 139], sides: ['top'] },
    ],
  },
  'minecraft:piston': {
    group: 'fixed',
    entries: [
    { rgb: [97, 97, 97], sides: ['bottom'] },
    { rgb: [153, 128, 85], sides: ['top'] },
    { rgb: [110, 105, 97], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:pitcher_crop': {
    group: 'fixed',
    entries: [
    { rgb: [100, 58, 37], sides: ['bottom'] },
    { rgb: [178, 126, 81], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [194, 166, 103], sides: ['top'] },
    ],
  },
  'minecraft:podzol': {
    group: 'fixed',
    entries: [
    { rgb: [92, 63, 24], sides: ['top'] },
    { rgb: [123, 88, 57], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:polished_basalt': {
    group: 'axis',
    entries: [
    { rgb: [89, 88, 92], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [99, 99, 101], sides: ['top'] },
    ],
  },
  'minecraft:potted_azalea_bush': {
    group: 'fixed',
    entries: [
    { rgb: [101, 123, 48], sides: ['top'] },
    { rgb: [96, 119, 47], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:potted_flowering_azalea_bush': {
    group: 'fixed',
    entries: [
    { rgb: [110, 114, 70], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [115, 120, 70], sides: ['top'] },
    ],
  },
  'minecraft:pumpkin': {
    group: 'fixed',
    entries: [
    { rgb: [196, 115, 24], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [198, 119, 24], sides: ['top'] },
    ],
  },
  'minecraft:purpur_pillar': {
    group: 'axis',
    entries: [
    { rgb: [172, 128, 171], sides: ['top'] },
    { rgb: [172, 130, 172], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:quartz_block': {
    group: 'fixed',
    entries: [
    { rgb: [237, 230, 224], sides: ['bottom'] },
    { rgb: [236, 230, 223], sides: ['top'] },
    { rgb: [236, 230, 223], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:quartz_pillar': {
    group: 'axis',
    entries: [
    { rgb: [235, 230, 223], sides: ['top'] },
    { rgb: [236, 231, 224], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:red_sandstone': {
    group: 'fixed',
    entries: [
    { rgb: [181, 98, 31], sides: ['top'] },
    { rgb: [186, 98, 28], sides: ['bottom'] },
    { rgb: [187, 99, 29], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:reinforced_deepslate': {
    group: 'fixed',
    entries: [
    { rgb: [102, 109, 101], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [79, 82, 80], sides: ['bottom'] },
    { rgb: [80, 83, 79], sides: ['top'] },
    ],
  },
  'minecraft:repeating_command_block': {
    group: 'fixed',
    entries: [
    { rgb: [129, 110, 171], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [129, 111, 176], sides: ['front'] },
    { rgb: [128, 110, 167], sides: ['back'] },
    { rgb: [127, 109, 172], sides: ['top'] },
    ],
  },
  'minecraft:respawn_anchor': {
    group: 'fixed',
    entries: [
    { rgb: [33, 10, 60], sides: ['bottom'] },
    { rgb: [75, 26, 144], sides: ['top'] },
    { rgb: [34, 22, 52], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:rose_bush': {
    group: 'fixed',
    entries: [
    { rgb: [131, 66, 37], sides: ['top'] },
    { rgb: [98, 84, 38], sides: ['bottom'] },
    ],
  },
  'minecraft:sandstone': {
    group: 'fixed',
    entries: [
    { rgb: [216, 202, 154], sides: ['bottom'] },
    { rgb: [224, 214, 170], sides: ['top'] },
    { rgb: [216, 203, 156], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:scaffolding': {
    group: 'fixed',
    entries: [
    { rgb: [193, 170, 79], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [170, 132, 73], sides: ['top'] },
    { rgb: [194, 173, 80], sides: ['bottom'] },
    ],
  },
  'minecraft:sculk_catalyst': {
    group: 'fixed',
    entries: [
    { rgb: [77, 94, 90], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [15, 32, 38], sides: ['top'] },
    { rgb: [89, 109, 109], sides: ['bottom'] },
    ],
  },
  'minecraft:sculk_sensor': {
    group: 'fixed',
    entries: [
    { rgb: [10, 39, 47], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [7, 70, 84], sides: ['top'] },
    { rgb: [13, 28, 34], sides: ['bottom'] },
    ],
  },
  'minecraft:sculk_shrieker': {
    group: 'fixed',
    entries: [
    { rgb: [30, 54, 55], sides: ['top'] },
    { rgb: [13, 28, 34], sides: ['bottom'] },
    { rgb: [75, 101, 95], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:small_dripleaf': {
    group: 'facing',
    entries: [
    { rgb: [95, 120, 46], sides: ['top'] },
    { rgb: [108, 128, 49], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:small_dripleaf_stem': {
    group: 'fixed',
    entries: [
    { rgb: [97, 121, 46], sides: ['top'] },
    { rgb: [95, 122, 45], sides: ['bottom'] },
    ],
  },
  'minecraft:smithing_table': {
    group: 'fixed',
    entries: [
    { rgb: [64, 28, 24], sides: ['bottom'] },
    { rgb: [57, 59, 71], sides: ['top'] },
    { rgb: [55, 35, 36], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [57, 37, 39], sides: ['front'] },
    ],
  },
  'minecraft:smoker': {
    group: 'facing',
    entries: [
    { rgb: [85, 84, 81], sides: ['top'] },
    { rgb: [88, 75, 58], sides: ['front'] },
    { rgb: [103, 92, 76], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [107, 106, 104], sides: ['bottom'] },
    ],
  },
  'minecraft:sniffer_egg_not_cracked': {
    group: 'fixed',
    entries: [
    { rgb: [135, 105, 68], sides: ['top'] },
    { rgb: [73, 25, 26], sides: ['bottom'] },
    { rgb: [94, 73, 49], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:sniffer_egg_slightly_cracked': {
    group: 'fixed',
    entries: [
    { rgb: [129, 97, 62], sides: ['top'] },
    { rgb: [71, 25, 26], sides: ['bottom'] },
    { rgb: [89, 72, 49], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:sniffer_egg_very_cracked': {
    group: 'fixed',
    entries: [
    { rgb: [120, 89, 58], sides: ['top'] },
    { rgb: [70, 25, 26], sides: ['bottom'] },
    { rgb: [85, 69, 48], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:spruce_door': {
    group: 'facing',
    entries: [
    { rgb: [106, 80, 49], sides: ['bottom'] },
    { rgb: [106, 80, 49], sides: ['top'] },
    ],
  },
  'minecraft:spruce_log': {
    group: 'axis',
    entries: [
    { rgb: [109, 80, 47], sides: ['top'] },
    { rgb: [59, 38, 17], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stonecutter': {
    group: 'facing',
    entries: [
    { rgb: [118, 118, 118], sides: ['bottom'] },
    { rgb: [107, 90, 78], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [123, 119, 111], sides: ['top'] },
    ],
  },
  'minecraft:stripped_acacia_log': {
    group: 'axis',
    entries: [
    { rgb: [166, 91, 52], sides: ['top'] },
    { rgb: [175, 93, 60], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_bamboo_block': {
    group: 'axis',
    entries: [
    { rgb: [178, 159, 73], sides: ['top'] },
    { rgb: [193, 173, 80], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_birch_log': {
    group: 'axis',
    entries: [
    { rgb: [191, 172, 116], sides: ['top'] },
    { rgb: [197, 176, 118], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_cherry_log': {
    group: 'axis',
    entries: [
    { rgb: [221, 165, 158], sides: ['top'] },
    { rgb: [215, 145, 149], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_crimson_stem': {
    group: 'axis',
    entries: [
    { rgb: [122, 56, 83], sides: ['top'] },
    { rgb: [137, 57, 90], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_dark_oak_log': {
    group: 'axis',
    entries: [
    { rgb: [66, 44, 23], sides: ['top'] },
    { rgb: [73, 57, 36], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_jungle_log': {
    group: 'axis',
    entries: [
    { rgb: [166, 123, 82], sides: ['top'] },
    { rgb: [171, 133, 85], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_mangrove_log': {
    group: 'axis',
    entries: [
    { rgb: [109, 44, 43], sides: ['top'] },
    { rgb: [120, 54, 48], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_oak_log': {
    group: 'axis',
    entries: [
    { rgb: [160, 130, 77], sides: ['top'] },
    { rgb: [177, 144, 86], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_spruce_log': {
    group: 'axis',
    entries: [
    { rgb: [106, 80, 47], sides: ['top'] },
    { rgb: [116, 90, 52], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:stripped_warped_stem': {
    group: 'axis',
    entries: [
    { rgb: [52, 129, 124], sides: ['top'] },
    { rgb: [58, 151, 148], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:sunflower': {
    group: 'fixed',
    entries: [
    { rgb: [50, 129, 27], sides: ['top'] },
    { rgb: [246, 197, 54], sides: ['front'] },
    { rgb: [55, 128, 35], sides: ['back'] },
    { rgb: [57, 135, 31], sides: ['bottom'] },
    ],
  },
  'minecraft:tall_grass': {
    group: 'fixed',
    entries: [
    { rgb: [128, 128, 128], sides: ['bottom'] },
    { rgb: [151, 149, 151], sides: ['top'] },
    ],
  },
  'minecraft:tall_seagrass': {
    group: 'fixed',
    entries: [
    { rgb: [45, 117, 4], sides: ['bottom'] },
    { rgb: [59, 139, 14], sides: ['top'] },
    ],
  },
  'minecraft:target': {
    group: 'fixed',
    entries: [
    { rgb: [226, 170, 158], sides: ['top'] },
    { rgb: [229, 176, 168], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:tnt': {
    group: 'fixed',
    entries: [
    { rgb: [182, 88, 84], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [143, 62, 54], sides: ['top'] },
    { rgb: [167, 67, 53], sides: ['bottom'] },
    ],
  },
  'minecraft:vault': {
    group: 'facing',
    entries: [
    { rgb: [44, 43, 56], sides: ['bottom'] },
    { rgb: [55, 70, 79], sides: ['top'] },
    { rgb: [51, 66, 74], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:verdant_froglight': {
    group: 'axis',
    entries: [
    { rgb: [211, 235, 208], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [229, 244, 228], sides: ['top'] },
    ],
  },
  'minecraft:warped_door': {
    group: 'facing',
    entries: [
    { rgb: [45, 127, 121], sides: ['top'] },
    { rgb: [43, 119, 112], sides: ['bottom'] },
    ],
  },
  'minecraft:warped_nylium': {
    group: 'fixed',
    entries: [
    { rgb: [73, 62, 60], sides: ['north', 'south', 'east', 'west'] },
    { rgb: [43, 114, 101], sides: ['top'] },
    ],
  },
  'minecraft:warped_stem': {
    group: 'axis',
    entries: [
    { rgb: [53, 110, 110], sides: ['top'] },
    { rgb: [58, 59, 78], sides: ['north', 'south', 'east', 'west'] },
    ],
  },
  'minecraft:weathered_copper_door': {
    group: 'facing',
    entries: [
    { rgb: [110, 151, 110], sides: ['top'] },
    { rgb: [107, 143, 102], sides: ['bottom'] },
    ],
  },
}
