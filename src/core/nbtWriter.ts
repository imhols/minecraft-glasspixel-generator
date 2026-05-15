export class NbtWriter {
  buf: number[] = []

  byte(v: number): this {
    this.buf.push(v & 0xFF)
    return this
  }

  short(v: number): this {
    this.buf.push((v >> 8) & 0xFF, v & 0xFF)
    return this
  }

  int(v: number): this {
    this.buf.push(
      (v >> 24) & 0xFF, (v >> 16) & 0xFF,
      (v >> 8) & 0xFF, v & 0xFF,
    )
    return this
  }

  long(hi: number, lo: number): this {
    this.int(hi)
    this.int(lo)
    return this
  }

  string(v: string): this {
    const bytes = new TextEncoder().encode(v)
    this.short(bytes.length)
    for (const b of bytes) this.buf.push(b)
    return this
  }

  byteArray(v: number[]): this {
    this.int(v.length)
    for (const b of v) this.buf.push(b & 0xFF)
    return this
  }

  listStart(typeId: number, length: number): this {
    this.byte(typeId)
    this.int(length)
    return this
  }

  tag(typeId: number, name: string): this {
    this.byte(typeId)
    this.string(name)
    return this
  }

  end(): this {
    this.byte(0)
    return this
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.buf)
  }
}

function writeCompound(w: NbtWriter, entries: [string, number][]): void {
  for (const [key, val] of entries) {
    w.tag(3, key)
    w.int(val)
  }
}

export function writeSchemNbt(
  width: number,
  height: number,
  length: number,
  palette: string[],
  paletteMap: Map<string, number>,
  blockData: Uint8Array,
  dataVersion: number,
): Uint8Array {
  const w = new NbtWriter()

  w.tag(10, 'Schematic')

  // Version: 2
  w.tag(3, 'Version')
  w.int(2)

  // DataVersion
  w.tag(3, 'DataVersion')
  w.int(dataVersion)

  // Width
  w.tag(2, 'Width')
  w.short(width)

  // Height
  w.tag(2, 'Height')
  w.short(height)

  // Length
  w.tag(2, 'Length')
  w.short(length)

  // PaletteMax
  w.tag(3, 'PaletteMax')
  w.int(palette.length)

  // Offset
  w.tag(10, 'Offset')
  w.tag(3, 'x'); w.int(0)
  w.tag(3, 'y'); w.int(0)
  w.tag(3, 'z'); w.int(0)
  w.end()

  // Metadata
  w.tag(10, 'Metadata')
  w.tag(8, 'Name'); w.string('GlassPixel')
  w.tag(8, 'Author'); w.string('GlassPixel')
  w.end()

  // BlockData
  const bd: number[] = []
  for (let i = 0; i < blockData.length; i++) bd.push(blockData[i])
  w.tag(7, 'BlockData')
  w.byteArray(bd)

  // Palette (compound with int entries)
  w.tag(10, 'Palette')
  writeCompound(w, palette.map(id => [id, paletteMap.get(id)!]))
  w.end()

  w.end()

  return w.toBytes()
}

export function writeLegacySchemNbt(
  width: number,
  height: number,
  length: number,
  blocks: Uint8Array,
  data: Uint8Array,
): Uint8Array {
  const w = new NbtWriter()

  w.tag(10, 'Schematic')

  w.tag(2, 'Width'); w.short(width)
  w.tag(2, 'Height'); w.short(height)
  w.tag(2, 'Length'); w.short(length)
  w.tag(8, 'Materials'); w.string('Alpha')

  const blk: number[] = []
  for (let i = 0; i < blocks.length; i++) blk.push(blocks[i])
  w.tag(7, 'Blocks'); w.byteArray(blk)

  const dat: number[] = []
  for (let i = 0; i < data.length; i++) dat.push(data[i])
  w.tag(7, 'Data'); w.byteArray(dat)

  w.tag(9, 'Entities'); w.listStart(0, 0)
  w.tag(9, 'TileEntities'); w.listStart(0, 0)

  w.tag(3, 'WEOriginX'); w.int(0)
  w.tag(3, 'WEOriginY'); w.int(0)
  w.tag(3, 'WEOriginZ'); w.int(0)
  w.tag(3, 'WEOffsetX'); w.int(0)
  w.tag(3, 'WEOffsetY'); w.int(0)
  w.tag(3, 'WEOffsetZ'); w.int(0)

  w.end()

  return w.toBytes()
}
