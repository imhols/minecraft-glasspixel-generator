import type { MCVersion } from '../types'

export const MC_VERSIONS: MCVersion[] = [
  { id: '1.12.2', label: '1.12.2' },
  { id: '1.13.2', label: '1.13 / 1.14 / 1.15' },
  { id: '1.16.5', label: '1.16' },
  { id: '1.17.1', label: '1.17 / 1.18' },
  { id: '1.19', label: '1.19' },
  { id: '1.20', label: '1.20' },
  { id: '1.21', label: '1.21+' },
]

export interface PaletteBlock {
  name: string
  id: string
  color: [number, number, number]
  versions: string[]
  transparent?: boolean
}

const BLOCKS: PaletteBlock[] = [
  // White
  { name: 'White Wool', id: 'minecraft:white_wool', color: [234, 236, 239], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'White Concrete', id: 'minecraft:white_concrete', color: [207, 213, 214], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'White Terracotta', id: 'minecraft:white_terracotta', color: [209, 177, 161], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'White Stained Glass', id: 'minecraft:white_stained_glass', color: [230, 237, 241], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Snow Block', id: 'minecraft:snow_block', color: [237, 244, 251], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Bone Block', id: 'minecraft:bone_block', color: [228, 222, 196], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Quartz Block', id: 'minecraft:quartz_block', color: [234, 224, 215], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Birch Planks', id: 'minecraft:birch_planks', color: [195, 178, 134], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Light Gray
  { name: 'Light Gray Wool', id: 'minecraft:light_gray_wool', color: [157, 158, 158], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Light Gray Concrete', id: 'minecraft:light_gray_concrete', color: [139, 141, 142], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Light Gray Terracotta', id: 'minecraft:light_gray_terracotta', color: [135, 107, 98], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Light Gray Stained Glass', id: 'minecraft:light_gray_stained_glass', color: [170, 175, 178], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Cobweb', id: 'minecraft:cobweb', color: [196, 202, 206], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Mushroom Stem', id: 'minecraft:mushroom_stem', color: [199, 195, 190], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Iron Block', id: 'minecraft:iron_block', color: [217, 217, 217], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Gray
  { name: 'Gray Wool', id: 'minecraft:gray_wool', color: [68, 70, 71], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Gray Concrete', id: 'minecraft:gray_concrete', color: [56, 58, 59], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Gray Terracotta', id: 'minecraft:gray_terracotta', color: [57, 41, 35], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Gray Stained Glass', id: 'minecraft:gray_stained_glass', color: [66, 68, 73], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Stone', id: 'minecraft:stone', color: [125, 125, 125], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Cobblestone', id: 'minecraft:cobblestone', color: [119, 119, 119], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Black
  { name: 'Black Wool', id: 'minecraft:black_wool', color: [22, 22, 27], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Black Concrete', id: 'minecraft:black_concrete', color: [8, 10, 15], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Black Terracotta', id: 'minecraft:black_terracotta', color: [37, 23, 16], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Black Stained Glass', id: 'minecraft:black_stained_glass', color: [25, 26, 31], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Obsidian', id: 'minecraft:obsidian', color: [15, 10, 26], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Coal Block', id: 'minecraft:coal_block', color: [17, 17, 17], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Brown
  { name: 'Brown Wool', id: 'minecraft:brown_wool', color: [96, 60, 33], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Brown Concrete', id: 'minecraft:brown_concrete', color: [89, 58, 39], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Brown Terracotta', id: 'minecraft:brown_terracotta', color: [94, 56, 27], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Brown Stained Glass', id: 'minecraft:brown_stained_glass', color: [95, 60, 33], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Oak Planks', id: 'minecraft:oak_planks', color: [161, 120, 65], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Oak Log', id: 'minecraft:oak_log', color: [113, 83, 45], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Spruce Planks', id: 'minecraft:spruce_planks', color: [93, 70, 44], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Dark Oak Planks', id: 'minecraft:dark_oak_planks', color: [60, 42, 23], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Dirt', id: 'minecraft:dirt', color: [131, 94, 67], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Coarse Dirt', id: 'minecraft:coarse_dirt', color: [101, 73, 52], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Red
  { name: 'Red Wool', id: 'minecraft:red_wool', color: [161, 40, 36], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Red Concrete', id: 'minecraft:red_concrete', color: [150, 34, 24], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Red Terracotta', id: 'minecraft:red_terracotta', color: [143, 60, 34], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Red Stained Glass', id: 'minecraft:red_stained_glass', color: [166, 38, 38], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Red Mushroom Block', id: 'minecraft:red_mushroom_block', color: [183, 63, 57], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Redstone Block', id: 'minecraft:redstone_block', color: [186, 30, 25], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Netherrack', id: 'minecraft:netherrack', color: [118, 37, 36], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Bricks', id: 'minecraft:bricks', color: [154, 100, 87], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Orange
  { name: 'Orange Wool', id: 'minecraft:orange_wool', color: [219, 126, 43], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Orange Concrete', id: 'minecraft:orange_concrete', color: [210, 94, 28], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Orange Terracotta', id: 'minecraft:orange_terracotta', color: [159, 82, 36], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Orange Stained Glass', id: 'minecraft:orange_stained_glass', color: [221, 116, 39], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Acacia Planks', id: 'minecraft:acacia_planks', color: [186, 90, 41], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Red Sand', id: 'minecraft:red_sand', color: [195, 113, 58], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Pumpkin', id: 'minecraft:pumpkin', color: [192, 116, 34], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Yellow
  { name: 'Yellow Wool', id: 'minecraft:yellow_wool', color: [233, 206, 59], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Yellow Concrete', id: 'minecraft:yellow_concrete', color: [235, 180, 36], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Yellow Terracotta', id: 'minecraft:yellow_terracotta', color: [186, 133, 36], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Yellow Stained Glass', id: 'minecraft:yellow_stained_glass', color: [235, 205, 52], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Sponge', id: 'minecraft:sponge', color: [195, 192, 58], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Honeycomb Block', id: 'minecraft:honeycomb_block', color: [200, 142, 34], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Sand', id: 'minecraft:sand', color: [219, 207, 159], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Sandstone', id: 'minecraft:sandstone', color: [222, 209, 165], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Glowstone', id: 'minecraft:glowstone', color: [203, 179, 122], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'End Stone', id: 'minecraft:end_stone', color: [222, 212, 168], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Lime
  { name: 'Lime Wool', id: 'minecraft:lime_wool', color: [103, 175, 56], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Lime Concrete', id: 'minecraft:lime_concrete', color: [92, 155, 35], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Lime Terracotta', id: 'minecraft:lime_terracotta', color: [103, 117, 53], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Lime Stained Glass', id: 'minecraft:lime_stained_glass', color: [108, 178, 57], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Melon', id: 'minecraft:melon', color: [151, 187, 66], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Green
  { name: 'Green Wool', id: 'minecraft:green_wool', color: [57, 82, 38], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Green Concrete', id: 'minecraft:green_concrete', color: [53, 70, 27], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Green Terracotta', id: 'minecraft:green_terracotta', color: [76, 83, 42], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Green Stained Glass', id: 'minecraft:green_stained_glass', color: [57, 83, 36], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Moss Block', id: 'minecraft:moss_block', color: [62, 107, 42], versions: ['1.17.1', '1.19', '1.20', '1.21'] },

  // Cyan
  { name: 'Cyan Wool', id: 'minecraft:cyan_wool', color: [22, 131, 137], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Cyan Concrete', id: 'minecraft:cyan_concrete', color: [35, 97, 93], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Cyan Terracotta', id: 'minecraft:cyan_terracotta', color: [86, 91, 92], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Cyan Stained Glass', id: 'minecraft:cyan_stained_glass', color: [28, 125, 133], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Prismarine', id: 'minecraft:prismarine', color: [93, 168, 152], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Dark Prismarine', id: 'minecraft:dark_prismarine', color: [46, 107, 98], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Warped Planks', id: 'minecraft:warped_planks', color: [44, 130, 119], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Light Blue
  { name: 'Light Blue Wool', id: 'minecraft:light_blue_wool', color: [107, 139, 203], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Light Blue Concrete', id: 'minecraft:light_blue_concrete', color: [71, 115, 196], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Light Blue Terracotta', id: 'minecraft:light_blue_terracotta', color: [112, 108, 138], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Light Blue Stained Glass', id: 'minecraft:light_blue_stained_glass', color: [106, 131, 206], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Ice', id: 'minecraft:ice', color: [153, 186, 226], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Packed Ice', id: 'minecraft:packed_ice', color: [152, 183, 214], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Blue Ice', id: 'minecraft:blue_ice', color: [119, 158, 193], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },

  // Blue
  { name: 'Blue Wool', id: 'minecraft:blue_wool', color: [37, 50, 153], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Blue Concrete', id: 'minecraft:blue_concrete', color: [37, 50, 95], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Blue Terracotta', id: 'minecraft:blue_terracotta', color: [74, 60, 91], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Blue Stained Glass', id: 'minecraft:blue_stained_glass', color: [34, 47, 150], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Lapis Block', id: 'minecraft:lapis_block', color: [32, 62, 135], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },

  // Purple
  { name: 'Purple Wool', id: 'minecraft:purple_wool', color: [123, 48, 178], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Purple Concrete', id: 'minecraft:purple_concrete', color: [95, 42, 117], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Purple Terracotta', id: 'minecraft:purple_terracotta', color: [118, 70, 86], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Purple Stained Glass', id: 'minecraft:purple_stained_glass', color: [120, 49, 174], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Amethyst Block', id: 'minecraft:amethyst_block', color: [145, 107, 182], versions: ['1.17.1', '1.19', '1.20', '1.21'] },

  // Magenta
  { name: 'Magenta Wool', id: 'minecraft:magenta_wool', color: [178, 76, 179], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Magenta Concrete', id: 'minecraft:magenta_concrete', color: [156, 74, 162], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Magenta Terracotta', id: 'minecraft:magenta_terracotta', color: [149, 87, 108], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Magenta Stained Glass', id: 'minecraft:magenta_stained_glass', color: [182, 82, 173], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },

  // Pink
  { name: 'Pink Wool', id: 'minecraft:pink_wool', color: [212, 123, 140], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Pink Concrete', id: 'minecraft:pink_concrete', color: [182, 83, 108], versions: ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Pink Terracotta', id: 'minecraft:pink_terracotta', color: [160, 77, 78], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Pink Stained Glass', id: 'minecraft:pink_stained_glass', color: [216, 118, 141], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Cherry Planks', id: 'minecraft:cherry_planks', color: [199, 120, 107], versions: ['1.20', '1.21'] },
  { name: 'Cherry Leaves', id: 'minecraft:cherry_leaves', color: [198, 139, 144], versions: ['1.20', '1.21'], transparent: true },

  // Miscellaneous important blocks
  { name: 'Water', id: 'minecraft:water', color: [63, 118, 228], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Grass Block', id: 'minecraft:grass_block', color: [127, 178, 56], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Oak Leaves', id: 'minecraft:oak_leaves', color: [71, 109, 49], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Clay', id: 'minecraft:clay', color: [164, 168, 184], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Terracotta', id: 'minecraft:terracotta', color: [146, 107, 73], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Slime Block', id: 'minecraft:slime_block', color: [115, 180, 68], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'], transparent: true },
  { name: 'Gold Block', id: 'minecraft:gold_block', color: [243, 198, 75], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Diamond Block', id: 'minecraft:diamond_block', color: [101, 219, 214], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Emerald Block', id: 'minecraft:emerald_block', color: [70, 195, 112], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Netherite Block', id: 'minecraft:netherite_block', color: [60, 56, 56], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Copper Block', id: 'minecraft:copper_block', color: [186, 114, 76], versions: ['1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Deepslate', id: 'minecraft:deepslate', color: [74, 76, 77], versions: ['1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Tuff', id: 'minecraft:tuff', color: [122, 119, 118], versions: ['1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Calcite', id: 'minecraft:calcite', color: [220, 216, 205], versions: ['1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Dripstone Block', id: 'minecraft:dripstone_block', color: [133, 115, 96], versions: ['1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Magma Block', id: 'minecraft:magma_block', color: [130, 60, 47], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Crimson Planks', id: 'minecraft:crimson_planks', color: [108, 60, 70], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Mud', id: 'minecraft:mud', color: [62, 53, 47], versions: ['1.19', '1.20', '1.21'] },
  { name: 'Packed Mud', id: 'minecraft:packed_mud', color: [133, 112, 93], versions: ['1.19', '1.20', '1.21'] },
  { name: 'Mud Bricks', id: 'minecraft:mud_bricks', color: [107, 87, 71], versions: ['1.19', '1.20', '1.21'] },
  { name: 'Target', id: 'minecraft:target', color: [196, 144, 144], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Hay Block', id: 'minecraft:hay_block', color: [160, 136, 44], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Gravel', id: 'minecraft:gravel', color: [131, 124, 121], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Granite', id: 'minecraft:granite', color: [151, 105, 84], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Diorite', id: 'minecraft:diorite', color: [189, 185, 178], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Andesite', id: 'minecraft:andesite', color: [138, 135, 131], versions: ['1.12.2', '1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Basalt', id: 'minecraft:basalt', color: [73, 71, 71], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
  { name: 'Blackstone', id: 'minecraft:blackstone', color: [42, 36, 35], versions: ['1.16.5', '1.17.1', '1.19', '1.20', '1.21'] },
]

export function getBlocks(version: string, includeTransparent = false): PaletteBlock[] {
  return BLOCKS.filter(b => b.versions.includes(version) && (includeTransparent || !b.transparent))
}

export function getGlassBlocks(version: string): PaletteBlock[] {
  return BLOCKS.filter(b => b.versions.includes(version) && b.id.endsWith('_stained_glass'))
}

export function getAllBlocks(): PaletteBlock[] {
  return BLOCKS
}
