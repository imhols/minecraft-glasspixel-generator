import pako from 'pako'
import { writeSchemNbt, writeLegacySchemNbt, writeLitematicNbt } from './nbtWriter'
import type { ProcessedImage } from './imageProcessor'

const DATA_VERSION: Record<string, number> = {
  '1.12.2': 1343,
  '1.13.2': 1631,
  '1.14.4': 1976,
  '1.15.2': 2230,
  '1.16.5': 2586,
  '1.17.1': 2730,
  '1.18.2': 2975,
  '1.19': 3105,
  '1.20': 3463,
  '1.21': 3700,
}

function getVersionKey(version: string): string {
  const versions = Object.keys(DATA_VERSION)
  for (const v of versions) {
    if (version.startsWith(v.split('.')[0] + '.' + v.split('.')[1])) return v
  }
  return '1.21'
}

export function exportSchemV2(
  result: ProcessedImage,
  version: string,
): Uint8Array {
  const width = result.width
  const glassLayers = result.glassLayers || 0
  const totalHeight = glassLayers === 0 ? 1 : glassLayers * 2
  const length = result.height

  const AIR = 'minecraft:air'
  const blockSet = new Set<string>()
  blockSet.add(AIR)
  for (let z = 0; z < length; z++) {
    for (let x = 0; x < width; x++) {
      const block = result.blockGrid[z][x]
      if (block) blockSet.add(block.id)
      if (result.glassGrids) {
        for (let l = 0; l < glassLayers; l++) {
          const g = result.glassGrids[l][z][x]
          if (g) blockSet.add(g.id)
        }
      }
    }
  }

  const palette = Array.from(blockSet).sort()
  const paletteMap = new Map<string, number>()
  palette.forEach((id, i) => { paletteMap.set(id, i) })

// 改后（避免索引 > 255 时截断）
const blockData = new Array<number>(width * totalHeight * length).fill(0)
  let idx = 0
  for (let y = 0; y < totalHeight; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++) {
        if (y === 0) {
          const block = result.blockGrid[z][x]
          blockData[idx] = block ? paletteMap.get(block.id)! : paletteMap.get(AIR)!
        } else if (y % 2 === 1) {
          const glassIndex = (y - 1) / 2
          const layer = glassLayers - 1 - glassIndex
          const glass = result.glassGrids![layer][z][x]
          blockData[idx] = glass ? paletteMap.get(glass.id)! : paletteMap.get(AIR)!
        } else {
          // even y >= 2: air gap
          blockData[idx] = paletteMap.get(AIR)!
        }
        idx++
      }
    }
  }

  const raw = writeSchemNbt(
    width, totalHeight, length,
    palette, paletteMap, blockData,
    DATA_VERSION[getVersionKey(version)] || 3700,
  )
  return pako.gzip(raw)
}

export function exportLitematic(
  result: ProcessedImage,
  _version: string,
): Uint8Array {
  const width = result.width
  const glassLayers = result.glassLayers || 0
  const totalHeight = glassLayers === 0 ? 1 : glassLayers * 2
  const length = result.height

  const AIR = 'minecraft:air'
  const blockSet = new Set<string>()
  blockSet.add(AIR)
  for (let z = 0; z < length; z++) {
    for (let x = 0; x < width; x++) {
      const block = result.blockGrid[z][x]
      if (block) blockSet.add(block.id)
      if (result.glassGrids) {
        for (let l = 0; l < glassLayers; l++) {
          const g = result.glassGrids[l][z][x]
          if (g) blockSet.add(g.id)
        }
      }
    }
  }

  const palette = Array.from(blockSet).sort()
  const paletteMap = new Map<string, number>()
  palette.forEach((id, i) => { paletteMap.set(id, i) })

  const blockData = new Uint8Array(width * totalHeight * length)
  let idx = 0
  for (let y = 0; y < totalHeight; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++) {
        if (y === 0) {
          const block = result.blockGrid[z][x]
          blockData[idx] = block ? paletteMap.get(block.id)! : paletteMap.get(AIR)!
        } else if (y % 2 === 1) {
          const glassIndex = (y - 1) / 2
          const layer = glassLayers - 1 - glassIndex
          const glass = result.glassGrids![layer][z][x]
          blockData[idx] = glass ? paletteMap.get(glass.id)! : paletteMap.get(AIR)!
        } else {
          blockData[idx] = paletteMap.get(AIR)!
        }
        idx++
      }
    }
  }

  const raw = writeLitematicNbt(width, totalHeight, length, palette, blockData)
  return pako.gzip(raw)
}

function getLegacyBlockId(blockId: string): [number, number] {
  const legacyMap: Record<string, [number, number]> = {
    'minecraft:air': [0, 0],
    'minecraft:stone': [1, 0],
    'minecraft:granite': [1, 1],
    'minecraft:diorite': [1, 3],
    'minecraft:andesite': [1, 5],
    'minecraft:grass_block': [2, 0],
    'minecraft:dirt': [3, 0],
    'minecraft:coarse_dirt': [3, 1],
    'minecraft:cobblestone': [4, 0],
    'minecraft:bedrock': [7, 0],
    'minecraft:sand': [12, 0],
    'minecraft:red_sand': [12, 1],
    'minecraft:gravel': [13, 0],
    'minecraft:gold_block': [41, 0],
    'minecraft:iron_block': [42, 0],
    'minecraft:stone_slab': [44, 0],
    'minecraft:bricks': [45, 0],
    'minecraft:obsidian': [49, 0],
    'minecraft:diamond_block': [57, 0],
    'minecraft:redstone_block': [152, 0],
    'minecraft:clay': [82, 0],
    'minecraft:netherrack': [87, 0],
    'minecraft:glowstone': [89, 0],
    'minecraft:melon': [103, 0],
    'minecraft:end_stone': [121, 0],
    'minecraft:coal_block': [173, 0],
    'minecraft:snow_block': [80, 0],
    'minecraft:ice': [79, 0],
    'minecraft:packed_ice': [174, 0],
    'minecraft:blue_ice': [212, 0],
    'minecraft:cactus': [81, 0],
    'minecraft:pumpkin': [86, 0],
    'minecraft:sponge': [19, 0],
    'minecraft:slime_block': [165, 0],
    'minecraft:quartz_block': [155, 0],
    'minecraft:bone_block': [216, 0],
    'minecraft:terracotta': [172, 0],
    'minecraft:prismarine': [168, 0],
    'minecraft:dark_prismarine': [168, 2],
    'minecraft:magma_block': [213, 0],
    'minecraft:nether_wart_block': [214, 0],
    'minecraft:hay_block': [170, 0],
    'minecraft:lapis_block': [22, 0],
    'minecraft:emerald_block': [133, 0],
  }

  if (legacyMap[blockId]) return legacyMap[blockId]

  const woolMap: Record<string, [number, number]> = {
    'minecraft:white_wool': [35, 0],
    'minecraft:orange_wool': [35, 1],
    'minecraft:magenta_wool': [35, 2],
    'minecraft:light_blue_wool': [35, 3],
    'minecraft:yellow_wool': [35, 4],
    'minecraft:lime_wool': [35, 5],
    'minecraft:pink_wool': [35, 6],
    'minecraft:gray_wool': [35, 7],
    'minecraft:light_gray_wool': [35, 8],
    'minecraft:cyan_wool': [35, 9],
    'minecraft:purple_wool': [35, 10],
    'minecraft:blue_wool': [35, 11],
    'minecraft:brown_wool': [35, 12],
    'minecraft:green_wool': [35, 13],
    'minecraft:red_wool': [35, 14],
    'minecraft:black_wool': [35, 15],
  }
  if (woolMap[blockId]) return woolMap[blockId]

  const glassMap: Record<string, [number, number]> = {
    'minecraft:white_stained_glass': [95, 0],
    'minecraft:orange_stained_glass': [95, 1],
    'minecraft:magenta_stained_glass': [95, 2],
    'minecraft:light_blue_stained_glass': [95, 3],
    'minecraft:yellow_stained_glass': [95, 4],
    'minecraft:lime_stained_glass': [95, 5],
    'minecraft:pink_stained_glass': [95, 6],
    'minecraft:gray_stained_glass': [95, 7],
    'minecraft:light_gray_stained_glass': [95, 8],
    'minecraft:cyan_stained_glass': [95, 9],
    'minecraft:purple_stained_glass': [95, 10],
    'minecraft:blue_stained_glass': [95, 11],
    'minecraft:brown_stained_glass': [95, 12],
    'minecraft:green_stained_glass': [95, 13],
    'minecraft:red_stained_glass': [95, 14],
    'minecraft:black_stained_glass': [95, 15],
  }
  if (glassMap[blockId]) return glassMap[blockId]

  return [1, 0]
}

export function exportSchematic(
  result: ProcessedImage,
  _version: string,
): Uint8Array {
  const width = result.width
  const glassLayers = result.glassLayers || 0
  const totalHeight = glassLayers === 0 ? 1 : glassLayers * 2
  const length = result.height
  const total = width * totalHeight * length

  const blocks = new Uint8Array(total)
  const blockData = new Uint8Array(total)

  let idx = 0
  for (let y = 0; y < totalHeight; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++) {
        if (y === 0) {
          const block = result.blockGrid[z][x]
          const [id, data] = block ? getLegacyBlockId(block.id) : [0, 0]
          blocks[idx] = id
          blockData[idx] = data
        } else if (y % 2 === 1) {
          const glassIndex = (y - 1) / 2
          const layer = glassLayers - 1 - glassIndex
          const glass = result.glassGrids![layer][z][x]
          const [id, data] = glass ? getLegacyBlockId(glass.id) : [0, 0]
          blocks[idx] = id
          blockData[idx] = data
        } else {
          blocks[idx] = 0
          blockData[idx] = 0
        }
        idx++
      }
    }
  }

  const raw = writeLegacySchemNbt(width, totalHeight, length, blocks, blockData)
  return pako.gzip(raw)
}

export function downloadBlob(data: Uint8Array, filename: string) {
  const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  const blob = new Blob([buf], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
