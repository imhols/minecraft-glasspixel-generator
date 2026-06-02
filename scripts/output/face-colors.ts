// Auto-generated from scripts/output/face-colors.json.
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
export const DIRECTIONAL_BLOCKS: Record<string, { faces: BlockFaces; group: BlockGroup }> = {
  'minecraft:acacia_door': {
    faces: {
    top: [168, 95, 61],
    bottom: [163, 92, 57],
    },
    group: 'facing',
  },
  'minecraft:acacia_log': {
    faces: {
    top: [151, 89, 55],
    side: [103, 97, 87],
    },
    group: 'axis',
  },
  'minecraft:ancient_debris': {
    faces: {
    top: [95, 66, 58],
    side: [96, 64, 56],
    },
    group: 'fixed',
  },
  'minecraft:anvil': {
    faces: {
    top: [73, 73, 73],
    side: [69, 69, 69],
    },
    group: 'facing',
  },
  'minecraft:azalea': {
    faces: {
    top: [102, 125, 48],
    side: [94, 118, 45],
    },
    group: 'fixed',
  },
  'minecraft:bamboo_block': {
    faces: {
    top: [139, 142, 62],
    side: [127, 144, 58],
    },
    group: 'axis',
  },
  'minecraft:bamboo_door': {
    faces: {
    top: [191, 171, 81],
    bottom: [199, 178, 85],
    },
    group: 'facing',
  },
  'minecraft:barrel': {
    faces: {
    top: [135, 101, 58],
    bottom: [116, 85, 49],
    side: [108, 81, 50],
    },
    group: 'facing',
  },
  'minecraft:basalt': {
    faces: {
    top: [81, 81, 86],
    side: [73, 73, 78],
    },
    group: 'axis',
  },
  'minecraft:bee_nest': {
    faces: {
    top: [202, 160, 75],
    bottom: [161, 127, 88],
    side: [196, 151, 77],
    front: [183, 142, 76],
    },
    group: 'facing',
  },
  'minecraft:beehive': {
    faces: {
    top: [167, 132, 74],
    side: [157, 126, 76],
    front: [159, 128, 78],
    },
    group: 'facing',
  },
  'minecraft:bell': {
    faces: {
    top: [253, 235, 111],
    bottom: [189, 148, 42],
    side: [253, 229, 97],
    },
    group: 'fixed',
  },
  'minecraft:big_dripleaf': {
    faces: {
    top: [112, 142, 52],
    side: [75, 98, 44],
    },
    group: 'facing',
  },
  'minecraft:birch_door': {
    faces: {
    top: [220, 210, 176],
    bottom: [208, 194, 144],
    },
    group: 'facing',
  },
  'minecraft:birch_log': {
    faces: {
    top: [193, 179, 135],
    side: [217, 215, 210],
    },
    group: 'axis',
  },
  'minecraft:blackstone': {
    faces: {
    top: [42, 36, 42],
    side: [42, 36, 41],
    },
    group: 'fixed',
  },
  'minecraft:blast_furnace': {
    faces: {
    top: [81, 80, 81],
    side: [108, 107, 108],
    front: [108, 108, 107],
    },
    group: 'facing',
  },
  'minecraft:bone_block': {
    faces: {
    top: [210, 206, 179],
    side: [229, 226, 208],
    },
    group: 'axis',
  },
  'minecraft:cactus': {
    faces: {
    top: [86, 127, 43],
    bottom: [143, 170, 86],
    side: [89, 130, 45],
    },
    group: 'fixed',
  },
  'minecraft:cake': {
    faces: {
    top: [248, 223, 214],
    bottom: [134, 62, 33],
    side: [203, 152, 122],
    },
    group: 'fixed',
  },
  'minecraft:cartography_table': {
    faces: {
    top: [103, 87, 67],
    side: [68, 44, 20],
    },
    group: 'fixed',
  },
  'minecraft:cauldron': {
    faces: {
    top: [74, 73, 74],
    bottom: [40, 40, 45],
    side: [74, 73, 75],
    },
    group: 'fixed',
  },
  'minecraft:chain_command_block': {
    faces: {
    top: [130, 162, 147],
    side: [131, 161, 147],
    front: [132, 165, 151],
    back: [130, 157, 145],
    },
    group: 'fixed',
  },
  'minecraft:cherry_door': {
    faces: {
    top: [223, 171, 165],
    bottom: [226, 176, 170],
    },
    group: 'facing',
  },
  'minecraft:cherry_log': {
    faces: {
    top: [185, 141, 137],
    side: [55, 33, 44],
    },
    group: 'axis',
  },
  'minecraft:chiseled_bookshelf': {
    faces: {
    top: [178, 145, 89],
    bottom: [90, 71, 42],
    side: [175, 142, 86],
    },
    group: 'fixed',
  },
  'minecraft:chiseled_quartz_block': {
    faces: {
    top: [232, 227, 217],
    side: [232, 227, 218],
    },
    group: 'fixed',
  },
  'minecraft:chiseled_tuff': {
    faces: {
    top: [94, 99, 91],
    side: [89, 94, 87],
    },
    group: 'fixed',
  },
  'minecraft:chiseled_tuff_bricks': {
    faces: {
    top: [111, 114, 107],
    side: [99, 103, 96],
    },
    group: 'fixed',
  },
  'minecraft:command_block': {
    faces: {
    top: [179, 133, 106],
    side: [177, 133, 108],
    front: [181, 136, 108],
    back: [174, 131, 107],
    },
    group: 'fixed',
  },
  'minecraft:composter': {
    faces: {
    top: [153, 99, 52],
    bottom: [117, 72, 32],
    side: [112, 70, 32],
    },
    group: 'fixed',
  },
  'minecraft:copper_door': {
    faces: {
    top: [193, 109, 83],
    bottom: [181, 103, 77],
    },
    group: 'facing',
  },
  'minecraft:crafter': {
    faces: {
    top: [112, 99, 100],
    bottom: [79, 79, 79],
    side: [129, 115, 95],
    },
    group: 'fixed',
  },
  'minecraft:crafting_table': {
    faces: {
    top: [120, 73, 42],
    side: [129, 103, 63],
    front: [129, 106, 70],
    },
    group: 'fixed',
  },
  'minecraft:crimson_door': {
    faces: {
    top: [114, 55, 79],
    bottom: [115, 55, 79],
    },
    group: 'facing',
  },
  'minecraft:crimson_nylium': {
    faces: {
    top: [131, 31, 31],
    side: [107, 27, 27],
    },
    group: 'fixed',
  },
  'minecraft:crimson_stem': {
    faces: {
    top: [113, 50, 70],
    side: [93, 26, 30],
    },
    group: 'axis',
  },
  'minecraft:dark_oak_door': {
    faces: {
    top: [77, 52, 25],
    bottom: [73, 49, 24],
    },
    group: 'facing',
  },
  'minecraft:dark_oak_log': {
    faces: {
    top: [68, 45, 22],
    side: [60, 47, 26],
    },
    group: 'axis',
  },
  'minecraft:daylight_detector': {
    faces: {
    top: [131, 116, 95],
    side: [67, 55, 36],
    },
    group: 'fixed',
  },
  'minecraft:deepslate': {
    faces: {
    top: [87, 87, 89],
    side: [80, 80, 83],
    },
    group: 'axis',
  },
  'minecraft:dirt_path': {
    faces: {
    top: [148, 122, 65],
    side: [137, 101, 67],
    },
    group: 'fixed',
  },
  'minecraft:dispenser': {
    faces: {
    top: [99, 98, 98],
    front: [122, 122, 122],
    },
    group: 'facing',
  },
  'minecraft:dried_kelp': {
    faces: {
    top: [50, 59, 39],
    bottom: [50, 59, 39],
    side: [38, 49, 30],
    },
    group: 'fixed',
  },
  'minecraft:dropper': {
    faces: {
    top: [98, 97, 97],
    front: [122, 122, 122],
    },
    group: 'facing',
  },
  'minecraft:end_portal_frame': {
    faces: {
    top: [91, 121, 97],
    side: [151, 163, 123],
    },
    group: 'fixed',
  },
  'minecraft:exposed_copper_door': {
    faces: {
    top: [164, 123, 106],
    bottom: [153, 118, 100],
    },
    group: 'facing',
  },
  'minecraft:fletching_table': {
    faces: {
    top: [197, 180, 133],
    side: [192, 167, 130],
    front: [173, 155, 111],
    },
    group: 'fixed',
  },
  'minecraft:flowering_azalea': {
    faces: {
    top: [112, 122, 64],
    side: [111, 113, 73],
    },
    group: 'fixed',
  },
  'minecraft:furnace': {
    faces: {
    top: [110, 110, 110],
    bottom: [121, 113, 94],
    side: [121, 120, 120],
    front: [92, 91, 91],
    },
    group: 'facing',
  },
  'minecraft:grass_block': {
    faces: {
    top: [147, 147, 147],
    bottom: [170, 151, 133],
    side: [127, 107, 66],
    },
    group: 'fixed',
  },
  'minecraft:grindstone': {
    faces: {
    top: [73, 46, 21],
    side: [140, 140, 140],
    },
    group: 'fixed',
  },
  'minecraft:hay_block': {
    faces: {
    top: [166, 139, 12],
    side: [166, 136, 38],
    },
    group: 'axis',
  },
  'minecraft:honey_block': {
    faces: {
    top: [251, 185, 53],
    bottom: [241, 146, 18],
    side: [251, 188, 58],
    },
    group: 'fixed',
  },
  'minecraft:hopper': {
    faces: {
    top: [76, 74, 76],
    side: [67, 66, 68],
    },
    group: 'facing',
  },
  'minecraft:iron_door': {
    faces: {
    top: [194, 193, 193],
    bottom: [196, 195, 195],
    },
    group: 'facing',
  },
  'minecraft:jigsaw': {
    faces: {
    top: [80, 70, 81],
    bottom: [34, 27, 37],
    side: [62, 54, 63],
    },
    group: 'fixed',
  },
  'minecraft:jungle_door': {
    faces: {
    top: [164, 120, 85],
    bottom: [158, 114, 79],
    },
    group: 'facing',
  },
  'minecraft:jungle_log': {
    faces: {
    top: [150, 109, 71],
    side: [85, 68, 25],
    },
    group: 'axis',
  },
  'minecraft:large_fern': {
    faces: {
    top: [125, 126, 125],
    bottom: [132, 132, 132],
    },
    group: 'fixed',
  },
  'minecraft:lectern': {
    faces: {
    top: [174, 138, 83],
    side: [163, 121, 74],
    front: [130, 101, 56],
    },
    group: 'facing',
  },
  'minecraft:lilac': {
    faces: {
    top: [155, 125, 147],
    bottom: [137, 124, 127],
    },
    group: 'fixed',
  },
  'minecraft:lodestone': {
    faces: {
    top: [147, 149, 153],
    side: [119, 120, 123],
    },
    group: 'fixed',
  },
  'minecraft:loom': {
    faces: {
    top: [142, 119, 92],
    bottom: [76, 60, 36],
    side: [146, 101, 73],
    front: [148, 119, 82],
    },
    group: 'facing',
  },
  'minecraft:mangrove_door': {
    faces: {
    top: [113, 49, 47],
    bottom: [112, 48, 46],
    },
    group: 'facing',
  },
  'minecraft:mangrove_log': {
    faces: {
    top: [103, 49, 42],
    side: [84, 67, 41],
    },
    group: 'axis',
  },
  'minecraft:mangrove_roots': {
    faces: {
    top: [75, 60, 39],
    side: [75, 60, 38],
    },
    group: 'fixed',
  },
  'minecraft:melon': {
    faces: {
    top: [111, 145, 31],
    side: [114, 146, 30],
    },
    group: 'fixed',
  },
  'minecraft:muddy_mangrove_roots': {
    faces: {
    top: [70, 59, 45],
    side: [68, 59, 48],
    },
    group: 'axis',
  },
  'minecraft:mycelium': {
    faces: {
    top: [111, 99, 101],
    side: [114, 88, 72],
    },
    group: 'fixed',
  },
  'minecraft:oak_door': {
    faces: {
    top: [141, 111, 66],
    bottom: [139, 108, 62],
    },
    group: 'facing',
  },
  'minecraft:oak_log': {
    faces: {
    top: [151, 122, 73],
    side: [109, 85, 51],
    },
    group: 'axis',
  },
  'minecraft:observer': {
    faces: {
    top: [98, 98, 98],
    side: [70, 69, 69],
    front: [104, 103, 103],
    back: [72, 70, 70],
    },
    group: 'facing',
  },
  'minecraft:ochre_froglight': {
    faces: {
    top: [251, 245, 207],
    side: [245, 233, 182],
    },
    group: 'axis',
  },
  'minecraft:oxidized_copper_door': {
    faces: {
    top: [82, 160, 133],
    bottom: [80, 153, 127],
    },
    group: 'facing',
  },
  'minecraft:pearlescent_froglight': {
    faces: {
    top: [246, 240, 240],
    side: [236, 225, 229],
    },
    group: 'axis',
  },
  'minecraft:peony': {
    faces: {
    top: [130, 127, 139],
    bottom: [87, 101, 94],
    },
    group: 'fixed',
  },
  'minecraft:piston': {
    faces: {
    top: [153, 128, 85],
    bottom: [97, 97, 97],
    side: [110, 105, 97],
    },
    group: 'fixed',
  },
  'minecraft:pitcher_crop': {
    faces: {
    top: [194, 166, 103],
    bottom: [100, 58, 37],
    side: [178, 126, 81],
    },
    group: 'fixed',
  },
  'minecraft:podzol': {
    faces: {
    top: [92, 63, 24],
    side: [123, 88, 57],
    },
    group: 'fixed',
  },
  'minecraft:polished_basalt': {
    faces: {
    top: [99, 99, 101],
    side: [89, 88, 92],
    },
    group: 'axis',
  },
  'minecraft:potted_azalea_bush': {
    faces: {
    top: [101, 123, 48],
    side: [96, 119, 47],
    },
    group: 'fixed',
  },
  'minecraft:potted_flowering_azalea_bush': {
    faces: {
    top: [115, 120, 70],
    side: [110, 114, 70],
    },
    group: 'fixed',
  },
  'minecraft:pumpkin': {
    faces: {
    top: [198, 119, 24],
    side: [196, 115, 24],
    },
    group: 'fixed',
  },
  'minecraft:purpur_pillar': {
    faces: {
    top: [172, 128, 171],
    side: [172, 130, 172],
    },
    group: 'axis',
  },
  'minecraft:quartz_block': {
    faces: {
    top: [236, 230, 223],
    bottom: [237, 230, 224],
    side: [236, 230, 223],
    },
    group: 'fixed',
  },
  'minecraft:quartz_pillar': {
    faces: {
    top: [235, 230, 223],
    side: [236, 231, 224],
    },
    group: 'axis',
  },
  'minecraft:red_sandstone': {
    faces: {
    top: [181, 98, 31],
    bottom: [186, 98, 28],
    side: [187, 99, 29],
    },
    group: 'fixed',
  },
  'minecraft:reinforced_deepslate': {
    faces: {
    top: [80, 83, 79],
    bottom: [79, 82, 80],
    side: [102, 109, 101],
    },
    group: 'fixed',
  },
  'minecraft:repeating_command_block': {
    faces: {
    top: [127, 109, 172],
    side: [129, 110, 171],
    front: [129, 111, 176],
    back: [128, 110, 167],
    },
    group: 'fixed',
  },
  'minecraft:respawn_anchor': {
    faces: {
    top: [75, 26, 144],
    bottom: [33, 10, 60],
    side: [34, 22, 52],
    },
    group: 'fixed',
  },
  'minecraft:rose_bush': {
    faces: {
    top: [131, 66, 37],
    bottom: [98, 84, 38],
    },
    group: 'fixed',
  },
  'minecraft:sandstone': {
    faces: {
    top: [224, 214, 170],
    bottom: [216, 202, 154],
    side: [216, 203, 156],
    },
    group: 'fixed',
  },
  'minecraft:scaffolding': {
    faces: {
    top: [170, 132, 73],
    bottom: [194, 173, 80],
    side: [193, 170, 79],
    },
    group: 'fixed',
  },
  'minecraft:sculk_catalyst': {
    faces: {
    top: [15, 32, 38],
    bottom: [89, 109, 109],
    side: [77, 94, 90],
    },
    group: 'fixed',
  },
  'minecraft:sculk_sensor': {
    faces: {
    top: [7, 70, 84],
    bottom: [13, 28, 34],
    side: [10, 39, 47],
    },
    group: 'fixed',
  },
  'minecraft:sculk_shrieker': {
    faces: {
    top: [30, 54, 55],
    bottom: [13, 28, 34],
    side: [75, 101, 95],
    },
    group: 'fixed',
  },
  'minecraft:small_dripleaf': {
    faces: {
    top: [95, 120, 46],
    side: [108, 128, 49],
    },
    group: 'facing',
  },
  'minecraft:small_dripleaf_stem': {
    faces: {
    top: [97, 121, 46],
    bottom: [95, 122, 45],
    },
    group: 'fixed',
  },
  'minecraft:smithing_table': {
    faces: {
    top: [57, 59, 71],
    bottom: [64, 28, 24],
    side: [55, 35, 36],
    front: [57, 37, 39],
    },
    group: 'fixed',
  },
  'minecraft:smoker': {
    faces: {
    top: [85, 84, 81],
    bottom: [107, 106, 104],
    side: [103, 92, 76],
    front: [88, 75, 58],
    },
    group: 'facing',
  },
  'minecraft:sniffer_egg_not_cracked': {
    faces: {
    top: [135, 105, 68],
    bottom: [73, 25, 26],
    side: [94, 73, 49],
    },
    group: 'fixed',
  },
  'minecraft:sniffer_egg_slightly_cracked': {
    faces: {
    top: [129, 97, 62],
    bottom: [71, 25, 26],
    side: [89, 72, 49],
    },
    group: 'fixed',
  },
  'minecraft:sniffer_egg_very_cracked': {
    faces: {
    top: [120, 89, 58],
    bottom: [70, 25, 26],
    side: [85, 69, 48],
    },
    group: 'fixed',
  },
  'minecraft:spruce_door': {
    faces: {
    top: [106, 80, 49],
    bottom: [106, 80, 49],
    },
    group: 'facing',
  },
  'minecraft:spruce_log': {
    faces: {
    top: [109, 80, 47],
    side: [59, 38, 17],
    },
    group: 'axis',
  },
  'minecraft:stonecutter': {
    faces: {
    top: [123, 119, 111],
    bottom: [118, 118, 118],
    side: [107, 90, 78],
    },
    group: 'facing',
  },
  'minecraft:stripped_acacia_log': {
    faces: {
    top: [166, 91, 52],
    side: [175, 93, 60],
    },
    group: 'axis',
  },
  'minecraft:stripped_bamboo_block': {
    faces: {
    top: [178, 159, 73],
    side: [193, 173, 80],
    },
    group: 'axis',
  },
  'minecraft:stripped_birch_log': {
    faces: {
    top: [191, 172, 116],
    side: [197, 176, 118],
    },
    group: 'axis',
  },
  'minecraft:stripped_cherry_log': {
    faces: {
    top: [221, 165, 158],
    side: [215, 145, 149],
    },
    group: 'axis',
  },
  'minecraft:stripped_crimson_stem': {
    faces: {
    top: [122, 56, 83],
    side: [137, 57, 90],
    },
    group: 'axis',
  },
  'minecraft:stripped_dark_oak_log': {
    faces: {
    top: [66, 44, 23],
    side: [73, 57, 36],
    },
    group: 'axis',
  },
  'minecraft:stripped_jungle_log': {
    faces: {
    top: [166, 123, 82],
    side: [171, 133, 85],
    },
    group: 'axis',
  },
  'minecraft:stripped_mangrove_log': {
    faces: {
    top: [109, 44, 43],
    side: [120, 54, 48],
    },
    group: 'axis',
  },
  'minecraft:stripped_oak_log': {
    faces: {
    top: [160, 130, 77],
    side: [177, 144, 86],
    },
    group: 'axis',
  },
  'minecraft:stripped_spruce_log': {
    faces: {
    top: [106, 80, 47],
    side: [116, 90, 52],
    },
    group: 'axis',
  },
  'minecraft:stripped_warped_stem': {
    faces: {
    top: [52, 129, 124],
    side: [58, 151, 148],
    },
    group: 'axis',
  },
  'minecraft:sunflower': {
    faces: {
    top: [50, 129, 27],
    bottom: [57, 135, 31],
    front: [246, 197, 54],
    back: [55, 128, 35],
    },
    group: 'fixed',
  },
  'minecraft:tall_grass': {
    faces: {
    top: [151, 149, 151],
    bottom: [128, 128, 128],
    },
    group: 'fixed',
  },
  'minecraft:tall_seagrass': {
    faces: {
    top: [59, 139, 14],
    bottom: [45, 117, 4],
    },
    group: 'fixed',
  },
  'minecraft:target': {
    faces: {
    top: [226, 170, 158],
    side: [229, 176, 168],
    },
    group: 'fixed',
  },
  'minecraft:tnt': {
    faces: {
    top: [143, 62, 54],
    bottom: [167, 67, 53],
    side: [182, 88, 84],
    },
    group: 'fixed',
  },
  'minecraft:vault': {
    faces: {
    top: [55, 70, 79],
    bottom: [44, 43, 56],
    side: [51, 66, 74],
    },
    group: 'facing',
  },
  'minecraft:verdant_froglight': {
    faces: {
    top: [229, 244, 228],
    side: [211, 235, 208],
    },
    group: 'axis',
  },
  'minecraft:warped_door': {
    faces: {
    top: [45, 127, 121],
    bottom: [43, 119, 112],
    },
    group: 'facing',
  },
  'minecraft:warped_nylium': {
    faces: {
    top: [43, 114, 101],
    side: [73, 62, 60],
    },
    group: 'fixed',
  },
  'minecraft:warped_stem': {
    faces: {
    top: [53, 110, 110],
    side: [58, 59, 78],
    },
    group: 'axis',
  },
  'minecraft:weathered_copper_door': {
    faces: {
    top: [110, 151, 110],
    bottom: [107, 143, 102],
    },
    group: 'facing',
  },
}
