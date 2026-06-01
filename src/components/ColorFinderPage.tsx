import { useState, useCallback, useRef, useEffect } from 'react'
import type { PaletteBlock } from '../data/palettes'
import { getBlocks, getGlassBlocks } from '../data/palettes'
import { applyColorOverrides } from '../data/colorOverrides'
import { filterSurvival } from '../data/survival'
import { findClosestBlockRGB, findBestBlend } from '../core/colorMatcher'
import type { BlendResult } from '../core/colorMatcher'
import { useLang } from '../i18n/LangContext'
import { renderBlock, renderColorSwatch, BLOCK_SIZE } from './BlockRenderer'
import { preloadTextures } from './textureLoader'
import StackedPreview from './StackedPreview'

const STACK_SIZE = 256

export default function ColorFinderPage() {
  const { t } = useLang()

  const [r, setR] = useState(128)
  const [g, setG] = useState(128)
  const [b, setB] = useState(128)
  const [hex, setHex] = useState('#808080')
  const [version, setVersion] = useState('1.21')
  const [glassLayers, setGlassLayers] = useState(2)
  const [pureGlass, setPureGlass] = useState(false)
  const [survivalFriendly, setSurvivalFriendly] = useState(false)
  const [result, setResult] = useState<BlendResult | null>(null)
  const [targetColor, setTargetColor] = useState<[number, number, number]>([128, 128, 128])
  const [layerUrls, setLayerUrls] = useState<{ src: string; zOffset: number }[]>([])
  const [baseUrl, setBaseUrl] = useState('')
  const [textureVersion, setTextureVersion] = useState(0)

  const hCanvasRef = useRef<HTMLCanvasElement>(null)
  const targetCanvasRef = useRef<HTMLCanvasElement>(null)


  const handleHexChange = useCallback((value: string) => {
    setHex(value)
    const match = value.match(/^#?([0-9a-fA-F]{6})$/)
    if (match) {
      const hexVal = match[1]
      const nr = parseInt(hexVal.slice(0, 2), 16)
      const ng = parseInt(hexVal.slice(2, 4), 16)
      const nb = parseInt(hexVal.slice(4, 6), 16)
      setR(nr); setG(ng); setB(nb)
    }
  }, [])

  const handleRgbChange = useCallback((nr: number, ng: number, nb: number) => {
    setR(nr); setG(ng); setB(nb)
    const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')
    setHex(`#${toHex(nr)}${toHex(ng)}${toHex(nb)}`)
  }, [])

  const handleColorPicker = useCallback((value: string) => {
    setHex(value)
    const hexVal = value.replace('#', '')
    const nr = parseInt(hexVal.slice(0, 2), 16)
    const ng = parseInt(hexVal.slice(2, 4), 16)
    const nb = parseInt(hexVal.slice(4, 6), 16)
    setR(nr); setG(ng); setB(nb)
  }, [])

  const handleSearch = useCallback(() => {
    const tr = Math.max(0, Math.min(255, r))
    const tg = Math.max(0, Math.min(255, g))
    const tb = Math.max(0, Math.min(255, b))
    setTargetColor([tr, tg, tb])

    let basePalette = getBlocks(version)
    basePalette = applyColorOverrides(basePalette)
    if (survivalFriendly) basePalette = filterSurvival(basePalette)
    const glassPalette = glassLayers > 0 ? getGlassBlocks(version) : []

    const baseMatch = findClosestBlockRGB(tr, tg, tb, basePalette)

    if (glassLayers > 0 && glassPalette.length > 0) {
      const blend = findBestBlend(tr, tg, tb, basePalette, glassPalette, glassLayers, pureGlass)
      setResult(blend)
    } else {
      setResult({
        glasses: [],
        base: baseMatch,
        color: baseMatch.color,
      })
    }
  }, [r, g, b, version, glassLayers, pureGlass, survivalFriendly])

  useEffect(() => {
    const canvas = targetCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = BLOCK_SIZE
    canvas.height = BLOCK_SIZE
    renderColorSwatch(ctx, targetColor, BLOCK_SIZE)
  }, [targetColor])

  useEffect(() => {
    if (!result) return
    const ids: string[] = []
    if (result.base) ids.push(result.base.id)
    result.glasses.forEach(g => ids.push(g.id))
    preloadTextures(ids).then(() => {
      setTextureVersion(v => v + 1)
    })
  }, [result])

  useEffect(() => {
    if (!result) return
    const canvas = document.createElement('canvas')
    canvas.width = STACK_SIZE
    canvas.height = STACK_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = STACK_SIZE / BLOCK_SIZE
    ctx.imageSmoothingEnabled = false
    ctx.scale(scale, scale)

    const layers: { src: string; zOffset: number }[] = []
    const zStep = 15

    if (result.base) {
      ctx.clearRect(0, 0, BLOCK_SIZE, BLOCK_SIZE)
      renderBlock(ctx, result.base)
      setBaseUrl(canvas.toDataURL())
      result.glasses.forEach((glass, i) => {
        ctx.clearRect(0, 0, BLOCK_SIZE, BLOCK_SIZE)
        ctx.globalAlpha = 0.5
        renderBlock(ctx, glass)
        ctx.globalAlpha = 1
        layers.push({ src: canvas.toDataURL(), zOffset: (i + 1) * zStep })
      })
    } else if (result.glasses.length > 0) {
      ctx.clearRect(0, 0, BLOCK_SIZE, BLOCK_SIZE)
      renderBlock(ctx, result.glasses[0])
      setBaseUrl(canvas.toDataURL())
      for (let i = 1; i < result.glasses.length; i++) {
        ctx.clearRect(0, 0, BLOCK_SIZE, BLOCK_SIZE)
        ctx.globalAlpha = 0.5
        renderBlock(ctx, result.glasses[i])
        ctx.globalAlpha = 1
        layers.push({ src: canvas.toDataURL(), zOffset: i * zStep })
      }
    } else {
      setBaseUrl('')
    }

    setLayerUrls(layers)
  }, [result, textureVersion])

  function getBlocksList(res: BlendResult): PaletteBlock[] {
    const list: PaletteBlock[] = []
    if (res.base) list.push(res.base)
    for (let i = res.glasses.length - 1; i >= 0; i--) {
      list.push(res.glasses[i])
    }
    return list
  }

  useEffect(() => {
    const canvas = hCanvasRef.current
    if (!canvas || !result) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const blocks = getBlocksList(result)
    if (blocks.length === 0) return

    const spacing = BLOCK_SIZE + 4
    const totalW = blocks.length * spacing - 4
    canvas.width = totalW
    canvas.height = BLOCK_SIZE
    ctx.clearRect(0, 0, totalW, BLOCK_SIZE)
    ctx.imageSmoothingEnabled = false
    blocks.forEach((block, i) => {
      ctx.save()
      ctx.translate(i * spacing, 0)
      renderBlock(ctx, block)
      ctx.restore()
    })
  }, [result, textureVersion])

  return (
    <div className="finder-layout">
      <aside className="sidebar">
        <div className="config-panel">
          <h3>{t('finder.title')}</h3>

          <div className="config-group">
            <label>{t('config.version')}</label>
            <select
              id="finder-version-select"
              value={version}
              onChange={e => setVersion(e.target.value)}
            >
              <option value="1.12.2">1.12.2</option>
              <option value="1.13.2">1.13 / 1.14 / 1.15</option>
              <option value="1.16.5">1.16</option>
              <option value="1.17.1">1.17 / 1.18</option>
              <option value="1.19">1.19</option>
              <option value="1.20">1.20</option>
              <option value="1.21">1.21+</option>
            </select>
          </div>

          <div className="config-group">
            <label>{t('config.glassLayers')} <span id="finder-layers-value">{glassLayers}</span></label>
            <input type="range" min={0} max={4} step={1} value={glassLayers}
              onChange={e => setGlassLayers(Number(e.target.value))} />
          </div>

          <div className="config-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={pureGlass} onChange={e => setPureGlass(e.target.checked)} />
              {t('config.pureGlass')}
            </label>
          </div>

          <div className="config-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={survivalFriendly} onChange={e => setSurvivalFriendly(e.target.checked)} />
              {t('config.survival')}
            </label>
          </div>

          <button className="convert-btn" onClick={handleSearch}>
            {t('finder.search')}
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="finder-input-section glass-card">
          <h3>{t('finder.hint')}</h3>
          <div className="finder-input-row">
            <div className="finder-rgb-inputs">
              <label>
                R
                <input type="number" min={0} max={255} value={r} onChange={e => handleRgbChange(Number(e.target.value), g, b)} />
              </label>
              <label>
                G
                <input type="number" min={0} max={255} value={g} onChange={e => handleRgbChange(r, Number(e.target.value), b)} />
              </label>
              <label>
                B
                <input type="number" min={0} max={255} value={b} onChange={e => handleRgbChange(r, g, Number(e.target.value))} />
              </label>
            </div>
            <div className="finder-hex-input">
              <label>
                #
                <input type="text" maxLength={7} value={hex} onChange={e => handleHexChange(e.target.value)} />
              </label>
            </div>
            <div className="finder-color-picker">
              <input type="color" value={hex} onChange={e => handleColorPicker(e.target.value)} />
            </div>
            <div className="finder-target-swatch">
              <canvas ref={targetCanvasRef} width={BLOCK_SIZE} height={BLOCK_SIZE} className="finder-canvas-block" />
              <span className="finder-color-label">RGB({targetColor[0]},{targetColor[1]},{targetColor[2]})</span>
            </div>
          </div>
        </div>

        {result && (
          <div className="finder-result-section">
            <div className="finder-result-body">
              <div className="finder-horizontal-view">
                <canvas ref={hCanvasRef} className="finder-canvas-row" />
              </div>
              <StackedPreview
                baseUrl={baseUrl}
                layerUrls={layerUrls}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
