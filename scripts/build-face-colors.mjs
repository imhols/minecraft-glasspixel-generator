import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const DIR = path.dirname(fileURLToPath(import.meta.url))

const faceColors = JSON.parse(fs.readFileSync(path.join(DIR, 'output/face-colors.json'), 'utf-8'))
const classification = JSON.parse(fs.readFileSync(path.join(DIR, 'output/face-classification.json'), 'utf-8'))

// Manual overrides for blocks that can't be auto-extracted from textures
const MANUAL_FACE_COLORS = {
  'carved_pumpkin': { front: [150, 84, 17], top: [197, 117, 24], side: [197, 117, 24] },
}

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

const allIds = Object.keys(classification).sort()

for (const id of allIds) {
  const data = MANUAL_FACE_COLORS[id] || faceColors[id]
  if (!data) {
    console.log('  MISSING face data:', id)
    continue
  }

  const group = classification[id]
  if (!group) {
    console.log('  MISSING classification:', id)
    continue
  }

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

fs.writeFileSync(path.join(DIR, 'output/face-colors.ts'), ts)
console.log('Done!' + ' ' + allIds.length + ' blocks')
