const textureCache = new Map<string, HTMLImageElement>()

function blockIdToFileName(id: string): string {
  return id.replace('minecraft:', '') + '.png'
}

export function preloadTextures(blockIds: string[]): Promise<void> {
  const promises = blockIds.map(id => {
    if (textureCache.has(id)) return Promise.resolve()
    return new Promise<void>(resolve => {
      const img = new Image()
      img.onload = () => { textureCache.set(id, img); resolve() }
      img.onerror = () => resolve()
      img.src = `/minecraft-glasspixel-generator/textures/${blockIdToFileName(id)}`
    })
  })
  return Promise.all(promises).then(() => {})
}

export function drawBlockTexture(
  ctx: CanvasRenderingContext2D,
  blockId: string,
  x: number,
  y: number,
  size: number,
): boolean {
  const img = textureCache.get(blockId)
  if (!img || !img.complete || img.naturalWidth === 0) return false
  ctx.imageSmoothingEnabled = false

  const iw = img.naturalWidth
  const ih = img.naturalHeight

  // Animated textures have multiple frames stacked vertically; use only first 16x16
  if (iw !== 16 || ih !== 16) {
    ctx.drawImage(img, 0, 0, 16, 16, x, y, size, size)
  } else {
    ctx.drawImage(img, x, y, size, size)
  }
  return true
}

export function hasTexture(id: string): boolean {
  const img = textureCache.get(id)
  return !!img && img.complete && img.naturalWidth > 0
}
