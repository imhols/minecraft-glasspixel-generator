import { processPixels } from '../core/imageProcessor'
import type { DitherMode, ProcessPixelsOptions } from '../core/imageProcessor'
import type { BlockFacing } from '../core/colorMatcher'
import type { PaletteBlock } from '../data/palettes'

export interface ProcessTask {
  type: 'process'
  taskId: number
  raw: Uint8Array
  width: number
  height: number
  palette: PaletteBlock[]
  glassLayers: number
  glassPalette: PaletteBlock[]
  pureGlass: boolean
  ditherMode: DitherMode
  ditherThreshold: number
  facing: BlockFacing
}

export interface ProgressMessage {
  type: 'progress'
  taskId: number
  pct: number
}

export interface ProcessResultMessage {
  type: 'processResult'
  taskId: number
  width: number
  height: number
  flatPixels: Uint8Array
  blockIds: (string | null)[][]
  usedBlocks: [string, number][]
  glassLayers?: number
  glassBlockIds?: (string | null)[][][]
  orientationStrs?: (string | undefined)[][]
  alphaMask?: boolean[][]
  verticalLayout?: boolean
}

export type WorkerMessage = ProgressMessage | ProcessResultMessage

function workerYield(): Promise<void> {
  return new Promise(resolve => {
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = () => resolve()
    port2.postMessage(null)
  })
}

self.onmessage = async (e: MessageEvent<ProcessTask>) => {
  const task = e.data
  if (task.type !== 'process') return

  const { raw, width, height, palette, glassLayers, glassPalette, pureGlass, ditherMode, ditherThreshold, facing, taskId } = task
  const sendProgress = (pct: number) => self.postMessage({ type: 'progress', taskId, pct } as ProgressMessage)

  const options: ProcessPixelsOptions & { onProgress: (pct: number) => void } = {
    glassLayers,
    glassPalette,
    pureGlass,
    ditherMode,
    ditherThreshold,
    facing,
    onProgress: (pct: number) => sendProgress(pct * 0.80),
  }

  const result = await processPixels(raw, width, height, palette, options)

  // Serialization phase: progress 0.80 → 0.99
  const h = result.height, w = result.width
  const flatPixels = new Uint8Array(h * w * 4)
  const blockIds: (string | null)[][] = []
  const orientationStrs: (string | undefined)[][] = []

  const YIELD_INTERVAL = 20
  for (let y = 0; y < h; y++) {
    const idRow: (string | null)[] = []
    const oRow: (string | undefined)[] = []
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const px = result.pixels[y][x]
      flatPixels[i] = px[0]
      flatPixels[i + 1] = px[1]
      flatPixels[i + 2] = px[2]
      flatPixels[i + 3] = 255
      const block = result.blockGrid[y][x]
      idRow.push(block?.id ?? null)
      const orient = result.orientationGrid?.[y]?.[x]
      if (orient) {
        if ('axis' in orient) oRow.push(`axis:${orient.axis}`)
        else if ('facing' in orient) oRow.push(`facing:${orient.facing}`)
        else oRow.push(undefined)
      } else {
        oRow.push(undefined)
      }
    }
    blockIds.push(idRow)
    orientationStrs.push(oRow)

    if (y % YIELD_INTERVAL === 0 && y > 0) {
      sendProgress(0.80 + 0.18 * (y / h))
      await workerYield()
    }
  }

  const glassBlockIds: (string | null)[][][] | undefined = result.glassGrids
    ? result.glassGrids.map(layer =>
        layer.map(row =>
          row.map(g => g?.id ?? null)
        )
      )
    : undefined

  sendProgress(0.99)

  const msg: ProcessResultMessage = {
    type: 'processResult',
    taskId,
    width: w,
    height: h,
    flatPixels,
    blockIds,
    usedBlocks: Array.from(result.usedBlocks.entries()),
    glassLayers: result.glassLayers,
    glassBlockIds,
    orientationStrs,
    alphaMask: result.alphaMask,
    verticalLayout: facing === 'vertical',
  }

  self.postMessage(msg, { transfer: [flatPixels.buffer] })
}
