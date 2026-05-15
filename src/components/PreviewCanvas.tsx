import { useRef, useEffect, useState, useCallback } from 'react'
import type { ProcessedImage } from '../core/imageProcessor'
import { useLang } from '../i18n/LangContext'

export default function PreviewCanvas({ result, originalSrc }: { result: ProcessedImage | null; originalSrc?: string }) {
  const { t } = useLang()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState('')
  const [showOrig, setShowOrig] = useState(false)

  const onHold = useCallback(() => setShowOrig(true), [])
  const onRelease = useCallback(() => setShowOrig(false), [])

  useEffect(() => {
    if (!result || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = result.width
    canvas.height = result.height
    const ctx = canvas.getContext('2d')!

    const imageData = ctx.createImageData(result.width, result.height)
    for (let y = 0; y < result.height; y++) {
      for (let x = 0; x < result.width; x++) {
        const [r, g, b] = result.pixels[y][x]
        const i = (y * result.width + x) * 4
        imageData.data[i] = r
        imageData.data[i + 1] = g
        imageData.data[i + 2] = b
        imageData.data[i + 3] = result.alphaMask?.[y]?.[x] ? 0 : 255
      }
    }
    ctx.putImageData(imageData, 0, 0)
    setDataUrl(canvas.toDataURL('image/png'))
  }, [result])

  if (!result) return null

  const total = result.width * result.height
  const displaySrc = showOrig && originalSrc ? originalSrc : dataUrl
  const isOrig = showOrig && originalSrc

  return (
    <div className="preview">
      <h3>{t('preview.title', { width: result.width, height: result.height, usedBlocks: result.usedBlocks.size })}</h3>
      {originalSrc && <span className="hold-hint">{t('preview.holdHint')}</span>}
      <img
        src={displaySrc}
        alt={isOrig ? t('preview.altOriginal') : t('preview.alt')}
        className="preview-img"
        style={isOrig ? { imageRendering: 'auto', maxHeight: 'none' } : undefined}
        onMouseDown={onHold}
        onMouseUp={onRelease}
        onMouseLeave={onRelease}
        onTouchStart={onHold}
        onTouchEnd={onRelease}
      />
      <canvas ref={canvasRef} hidden />
      <div className="block-stats">
        {Array.from(result.usedBlocks.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([id, count]) => {
            const block = result.blockGrid.flat().find(b => b?.id === id)
            return (
              <div key={id} className="stat-row">
                <span className="stat-color"
                  style={{ background: block ? `rgb(${block.color[0]},${block.color[1]},${block.color[2]})` : '#888' }}
                />
                <span className="stat-name">{id.split(':')[1]}</span>
                <span className="stat-count">{count}</span>
                <span className="stat-pct">({(count / total * 100).toFixed(1)}%)</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
