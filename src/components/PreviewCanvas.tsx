import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { ProcessedImage } from '../core/imageProcessor'
import { useLang } from '../i18n/LangContext'

export default function PreviewCanvas({ result, originalSrc, originalW, originalH }: { result: ProcessedImage | null; originalSrc?: string; originalW?: number; originalH?: number }) {
  const { t } = useLang()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState('')
  const [showOrig, setShowOrig] = useState(false)
  const blobUrlRef = useRef('')

  const onHold = useCallback(() => setShowOrig(true), [])
  const onRelease = useCallback(() => setShowOrig(false), [])

  const { cw, ch } = useMemo(() => {
    if (!result) return { cw: 0, ch: 0 }
    const rw = result.width, rh = result.height
    const scale = Math.min(800 / rw, 800 / rh, 1)
    const cw = Math.round(rw * scale)
    const ch = Math.round(cw * rh / rw)
    return { cw, ch }
  }, [result])

  const previewAspect = cw && ch ? cw / ch : undefined

  useEffect(() => {
    if (!result || !canvasRef.current) return

    const rw = result.width, rh = result.height

    const canvas = canvasRef.current
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    const imageData = ctx.createImageData(cw, ch)
    for (let yy = 0; yy < ch; yy++) {
      const sy = Math.min(Math.floor(yy * rh / ch), rh - 1)
      const srcRow = result.pixels[sy]
      for (let xx = 0; xx < cw; xx++) {
        const sx = Math.min(Math.floor(xx * rw / cw), rw - 1)
        const px = srcRow[sx]
        const i = (yy * cw + xx) * 4
        imageData.data[i] = px[0]
        imageData.data[i + 1] = px[1]
        imageData.data[i + 2] = px[2]
        imageData.data[i + 3] = result.alphaMask?.[sy]?.[sx] ? 0 : 255
      }
    }
    ctx.putImageData(imageData, 0, 0)
    canvas.toBlob(blob => {
      if (blob) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = URL.createObjectURL(blob)
        setDataUrl(blobUrlRef.current)
      }
    })
  }, [result, cw, ch, originalSrc])

  // — Zoom state —
  const [shiftHeld, setShiftHeld] = useState(false)
  const [mouseOnImg, setMouseOnImg] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !e.repeat) setShiftHeld(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false)
    }
    const onBlur = () => setShiftHeld(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const magnifierActive = shiftHeld

  const onMouseEnter = useCallback(() => setMouseOnImg(true), [])

  const onMouseLeave = useCallback(() => {
    setMouseOnImg(false)
    onRelease()
  }, [onRelease])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!magnifierActive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pctX = ((e.clientX - rect.left) / rect.width * 100).toFixed(2)
    const pctY = ((e.clientY - rect.top) / rect.height * 100).toFixed(2)
    const imgs = e.currentTarget.querySelectorAll<HTMLImageElement>('.preview-img, .preview-img-orig')
    for (const img of imgs) {
      img.style.transformOrigin = `${pctX}% ${pctY}%`
    }
  }, [magnifierActive])

  if (!result) return null

  const total = result.width * result.height

  return (
    <div className="preview">
      <h3>
        {t('preview.title', { width: result.width, height: result.height, usedBlocks: result.usedBlocks.size })}
        {originalW ? <span className="original-size">{t('preview.originalSize', { w: originalW!, h: originalH! })}</span> : null}
        {originalSrc && <>
          <span className="hold-hint">{t('preview.holdHint')}</span>
          <span className="zoom-hint">{t('preview.magnifierHint')}</span>
        </>}
      </h3>
      <div className={'preview-img-wrap' + (magnifierActive && mouseOnImg ? ' zoomed' : '')}
        onMouseDown={onHold}
        onMouseUp={onRelease}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onTouchStart={onHold}
        onTouchEnd={onRelease}
        style={{ aspectRatio: previewAspect }}
      >
        {dataUrl && (
          <img src={dataUrl} alt={t('preview.alt')} className="preview-img" draggable={false}
            style={{ opacity: showOrig ? 0 : 1 }} />
        )}
        {originalSrc && (
          <img src={originalSrc} alt={t('preview.altOriginal')} className="preview-img-orig" draggable={false}
            style={{ opacity: showOrig ? 1 : 0 }} />
        )}
      </div>
      <canvas ref={canvasRef} hidden />
      <div className="block-stats">
        {Array.from(result.usedBlocks.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([id, count]) => {
            const block = result.blockMap?.get(id)
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
