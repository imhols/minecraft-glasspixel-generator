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
  'minecraft:acacia_log': {
    faces: {
    top: [151, 89, 55],
    side: [103, 97, 87],
    },
    group: 'axis',
  },
  'minecraft:bamboo_block': {
    faces: {
    top: [139, 142, 62],
    side: [127, 144, 58],
    },
    group: 'axis',
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
    group: 'fixed',
  },
  'minecraft:beehive': {
    faces: {
    top: [167, 132, 74],
    side: [157, 126, 76],
    front: [159, 128, 78],
    },
    group: 'fixed',
  },
  'minecraft:birch_log': {
    faces: {
    top: [193, 179, 135],
    side: [217, 215, 210],
    },
    group: 'axis',
  },
  'minecraft:blast_furnace': {
    faces: {
    top: [81, 80, 81],
    side: [108, 107, 108],
    front: [108, 108, 107],
    },
    group: 'fixed',
  },
  'minecraft:bone_block': {
    faces: {
    top: [210, 206, 179],
    side: [229, 226, 208],
    },
    group: 'axis',
  },
  'minecraft:cartography_table': {
    faces: {
    top: [103, 87, 67],
    side: [68, 44, 20],
    },
    group: 'fixed',
  },
  'minecraft:carved_pumpkin': {
    faces: {
    top: [197, 117, 24],
    side: [197, 117, 24],
    front: [150, 84, 17],
    },
    group: 'fixed',
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
  'minecraft:composter': {
    faces: {
    top: [153, 99, 52],
    bottom: [117, 72, 32],
    side: [112, 70, 32],
    },
    group: 'fixed',
  },
  'minecraft:crafter': {
    faces: {
    top: [112, 99, 100],
    bottom: [79, 79, 79],
    side: [129, 115, 95],
    },
    group: 'facing',
  },
  'minecraft:crafting_table': {
    faces: {
    top: [120, 73, 42],
    side: [129, 103, 63],
    front: [129, 106, 70],
    },
    group: 'fixed',
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
  'minecraft:dark_oak_log': {
    faces: {
    top: [68, 45, 22],
    side: [60, 47, 26],
    },
    group: 'axis',
  },
  'minecraft:deepslate': {
    faces: {
    top: [87, 87, 89],
    side: [80, 80, 83],
    },
    group: 'axis',
  },
  'minecraft:dispenser': {
    faces: {
    top: [99, 98, 98],
    front: [122, 122, 122],
    },
    group: 'facing',
  },
  'minecraft:dropper': {
    faces: {
    top: [98, 97, 97],
    front: [122, 122, 122],
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
  'minecraft:furnace': {
    faces: {
    top: [110, 110, 110],
    bottom: [121, 113, 94],
    side: [121, 120, 120],
    front: [92, 91, 91],
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
  'minecraft:jungle_log': {
    faces: {
    top: [150, 109, 71],
    side: [85, 68, 25],
    },
    group: 'axis',
  },
  'minecraft:loom': {
    faces: {
    top: [142, 119, 92],
    bottom: [76, 60, 36],
    side: [146, 101, 73],
    front: [148, 119, 82],
    },
    group: 'fixed',
  },
  'minecraft:mangrove_log': {
    faces: {
    top: [103, 49, 42],
    side: [84, 67, 41],
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
  'minecraft:piston': {
    faces: {
    top: [153, 128, 85],
    bottom: [97, 97, 97],
    side: [110, 105, 97],
    },
    group: 'facing',
  },
  'minecraft:podzol': {
    faces: {
    top: [92, 63, 24],
    side: [123, 88, 57],
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
  'minecraft:quartz_pillar': {
    faces: {
    top: [235, 230, 223],
    side: [236, 231, 224],
    },
    group: 'axis',
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
    group: 'fixed',
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
    group: 'fixed',
  },
  'minecraft:stripped_acacia_log': {
    faces: {
    top: [166, 91, 52],
    side: [175, 93, 60],
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
  'minecraft:target': {
    faces: {
    top: [226, 170, 158],
    side: [229, 176, 168],
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
}
