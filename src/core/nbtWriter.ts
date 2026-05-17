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

  // 加在 byteArray 方法后面
varIntByteArray(indices: number[]): this {
  const encoded: number[] = []
  for (const v of indices) {
    let value = v
    do {
      let byte = value & 0x7F
      value >>>= 7
      if (value !== 0) byte |= 0x80  // 设置续位
      encoded.push(byte)
    } while (value !== 0)
  }
  // TAG_Byte_Array: 长度是编码后的字节数，不是方块数
  this.int(encoded.length)
  for (const b of encoded) this.buf.push(b)
  return this
}

  longArray(v: bigint[]): this {
    this.int(v.length)
    for (const n of v) {
      let val = n
      for (let i = 7; i >= 0; i--) {
        this.buf.push(Number(val >> BigInt(i * 8)) & 0xFF)
      }
    }
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
// writeSchemNbt 的参数类型改为
blockData: number[],   // 原来是 Uint8Array
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
w.varIntByteArray(blockData)

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

function getTimestampLong(): bigint {
  return BigInt(Math.floor(Date.now() / 1000)) << 32n
}

export function writeLitematicNbt(
  width: number,
  height: number,
  length: number,
  palette: string[],
  blockData: Uint8Array,
): Uint8Array {
  const bitsPerBlock = Math.max(1, Math.ceil(Math.log2(palette.length)))
  const totalBits = blockData.length * bitsPerBlock
  const longs = Math.ceil(totalBits / 64)
  const words = new Array<bigint>(longs).fill(0n)

  for (let i = 0; i < blockData.length; i++) {
    const bitPos = i * bitsPerBlock
    const word = Math.floor(bitPos / 64)
    const offset = bitPos % 64
    const val = BigInt(blockData[i])
    words[word] = words[word] | (val << BigInt(offset))
  }

  const now = getTimestampLong()

  const w = new NbtWriter()

  w.tag(10, 'Litematic')

  w.tag(10, 'Metadata')
  w.tag(10, 'EnclosingSize')
  w.tag(3, 'x'); w.int(width)
  w.tag(3, 'y'); w.int(height)
  w.tag(3, 'z'); w.int(length)
  w.end()
  w.tag(8, 'Author'); w.string('GlassPixel')
  w.tag(8, 'Description'); w.string('')
  w.tag(8, 'Name'); w.string('GlassPixel')
  w.tag(4, 'TimeCreated'); w.long(Number(now >> 32n), Number(now & 0xFFFFFFFFn))
  w.tag(4, 'TimeModified'); w.long(Number(now >> 32n), Number(now & 0xFFFFFFFFn))
  w.tag(3, 'TotalBlocks'); w.int(blockData.length)
  w.tag(3, 'TotalVolume'); w.int(width * height * length)
  w.tag(3, 'TotalBlockEntities'); w.int(0)
  w.end()

  w.tag(10, 'Regions')
  w.tag(10, 'GlassPixel')
  w.tag(3, 'PositionX'); w.int(0)
  w.tag(3, 'PositionY'); w.int(0)
  w.tag(3, 'PositionZ'); w.int(0)
  w.tag(3, 'SizeX'); w.int(width)
  w.tag(3, 'SizeY'); w.int(height)
  w.tag(3, 'SizeZ'); w.int(length)
  w.tag(12, 'BlockStates')
  w.longArray(words)
  w.tag(9, 'BlockStatePalette')
  w.listStart(10, palette.length)
  for (const entry of palette) {
    w.tag(10, '')
    // Parse "minecraft:block[prop=val]" into Name + Properties
    const bracketIdx = entry.indexOf('[')
    if (bracketIdx >= 0) {
      const name = entry.slice(0, bracketIdx)
      const propsStr = entry.slice(bracketIdx + 1, -1) // "axis=y"
      w.tag(8, 'Name'); w.string(name)
      w.tag(10, 'Properties')
      for (const part of propsStr.split(',')) {
        const eqIdx = part.indexOf('=')
        if (eqIdx >= 0) {
          w.tag(8, part.slice(0, eqIdx)); w.string(part.slice(eqIdx + 1))
        }
      }
      w.end()
    } else {
      w.tag(8, 'Name'); w.string(entry)
    }
    w.end()
  }
  w.tag(3, 'TotalVolume'); w.int(width * height * length)
  w.tag(3, 'TotalBlocks'); w.int(blockData.length)
  w.tag(9, 'PendingBlockTicks'); w.listStart(0, 0)
  w.tag(9, 'PendingFluidTicks'); w.listStart(0, 0)
  w.tag(9, 'BlockEntities'); w.listStart(0, 0)
  w.tag(9, 'Entities'); w.listStart(0, 0)
  w.end()

  w.end()

  return w.toBytes()
}
