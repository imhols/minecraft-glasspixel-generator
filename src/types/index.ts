export interface BlockInfo {
  id: string
  name: string
  color: [number, number, number]
  versions: string[]
  needsSupport: boolean
  flammable: boolean
}

export interface PaletteEntry {
  block: BlockInfo
  color: [number, number, number]
}

export interface OutputSettings {
  version: string
  width: number
  height: number
  dithering: DitherMode
  staircasing: boolean
}

export type DitherMode = 'none' | 'floyd-steinberg' | 'bayer-4x4' | 'bayer-2x2' | 'ordered-3x3'

export interface ConversionResult {
  width: number
  height: number
  palette: BlockInfo[]
  grid: (BlockInfo | null)[][]
}

export interface MCVersion {
  id: string
  label: string
}
