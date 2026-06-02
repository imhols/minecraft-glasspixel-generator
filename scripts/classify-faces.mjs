import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AdmZip from 'adm-zip'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const FACE_COLORS_PATH = path.join(DIR, 'output/face-colors.json')
const OUTPUT_PATH = path.join(DIR, 'output/face-classification.json')
const VERSION = '1.21'
const MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'

const faceColors = JSON.parse(fs.readFileSync(FACE_COLORS_PATH, 'utf-8'))
const blockIds = Object.keys(faceColors)

console.log(`  Downloading client.jar for ${VERSION}...`)
const manifest = await (await fetch(MANIFEST_URL)).json()
const ver = manifest.versions.find(v => v.id === VERSION)
if (!ver) throw new Error(`Version ${VERSION} not found`)
const versionData = await (await fetch(ver.url)).json()
const jarRes = await fetch(versionData.downloads.client.url)
const jarBuf = Buffer.from(await jarRes.arrayBuffer())
const zip = new AdmZip(jarBuf)

function classifyBlockstate(jsonStr, blockId) {
  try {
    const data = JSON.parse(jsonStr)
    if (data.multipart) return 'fixed'
    const variants = data.variants
    if (!variants || typeof variants !== 'object') return 'fixed'
    const keys = Object.keys(variants)
    if (keys.length === 0) return 'fixed'
    for (const key of keys) {
      if (key.startsWith('axis=')) return 'axis'
      if (key.startsWith('facing=')) return 'facing'
    }
    return 'fixed'
  } catch {
    console.log(`  PARSE ERROR: ${blockId}`)
    return 'fixed'
  }
}

const classified = {}
let missing = 0

for (const blockId of blockIds) {
  const ns = blockId.includes(':') ? blockId.split(':')[0] : 'minecraft'
  const id = blockId.includes(':') ? blockId.split(':')[1] : blockId
  const entryName = `assets/${ns}/blockstates/${id}.json`
  let entry = zip.getEntry(entryName)

  if (!entry) {
    const altName = `assets/minecraft/blockstates/${id}.json`
    entry = zip.getEntry(altName)
  }

  if (!entry) {
    console.log(`  MISSING blockstate: ${blockId}`)
    classified[blockId] = 'fixed'
    missing++
    continue
  }

  classified[blockId] = classifyBlockstate(entry.getData().toString('utf-8'), blockId)
}

console.log(`\nResults:`)
console.log(`  axis:   ${Object.values(classified).filter(v => v === 'axis').length}`)
console.log(`  facing: ${Object.values(classified).filter(v => v === 'facing').length}`)
console.log(`  fixed:  ${Object.values(classified).filter(v => v === 'fixed').length}`)
console.log(`  missing blockstates: ${missing}`)

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(classified, null, 2))
console.log(`\nWrote ${OUTPUT_PATH}`)
