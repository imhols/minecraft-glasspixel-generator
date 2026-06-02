import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const FACE_COLORS_PATH = path.join(DIR, 'output/face-colors.json')
const CLASSIFICATION_PATH = path.join(DIR, 'output/face-classification.json')
const OUTPUT_PATH = path.join(DIR, 'output/texture-sides.ts')

// Manual overrides for blocks whose faces can't be auto-extracted
const MANUAL = {
  'carved_pumpkin': { front: [150, 84, 17], top: [197, 117, 24], side: [197, 117, 24] },
}

const faceColors = JSON.parse(fs.readFileSync(FACE_COLORS_PATH, 'utf-8'))
const classification = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf-8'))

const FACE_TO_SIDES = {
  top:    ['top'],
  bottom: ['bottom'],
  side:   ['north', 'south', 'east', 'west'],
  front:  ['front'],
  back:   ['back'],
}

const allIds = new Set([...Object.keys(faceColors), ...Object.keys(MANUAL)])
const sortedIds = [...allIds].sort()

let ts = `// Auto-generated from scripts/output/face-colors.json.
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
export const TEXTURE_SIDES: Record<string, { entries: TextureSideEntry[]; group: BlockGroup }> = {\n`

for (const id of sortedIds) {
  const data = MANUAL[id] || faceColors[id]
  if (!data) continue

  const faceNames = Object.keys(data)
  const entries = []

  for (const face of faceNames) {
    const mappedSides = FACE_TO_SIDES[face]
    if (!mappedSides) continue
    entries.push({ rgb: data[face], sides: mappedSides })
  }

  if (entries.length === 0) continue

  // Use blockstate-based classification when available, fall back to inference
  const group = classification[id] || inferGroup(entries)
  const entryStrs = entries.map(e => {
    const sidesStr = e.sides.map(s => "'" + s + "'").join(', ')
    return '    { rgb: [' + e.rgb.join(', ') + '], sides: [' + sidesStr + '] }'
  })
  ts += "  'minecraft:" + id + "': {\n"
  ts += '    group: \'' + group + '\',\n'
  ts += '    entries: [\n' + entryStrs.join(',\n') + ',\n    ],\n'
  ts += '  },\n'
}

ts += '}\n'

fs.writeFileSync(OUTPUT_PATH, ts)
console.log('Wrote ' + OUTPUT_PATH)
console.log('  ' + sortedIds.length + ' blocks with per-texture entries')

function inferGroup(entries) {
  const allSides = new Set()
  for (const e of entries) {
    for (const s of e.sides) allSides.add(s)
  }
  const hasVertical = allSides.has('top') || allSides.has('bottom')
  const hasHorizontal = allSides.has('north') || allSides.has('south') || allSides.has('east') || allSides.has('west')
  const hasFront = allSides.has('front') || allSides.has('back')
  if (hasFront) return 'facing'
  if (hasVertical && hasHorizontal) return 'axis'
  return 'fixed'
}
