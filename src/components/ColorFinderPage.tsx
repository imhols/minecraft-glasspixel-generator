import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react'

function DockBlockItem({
  block,
  mouseX,
}: {
  block: PaletteBlock
  mouseX: ReturnType<typeof useMotionValue<number>>
}) {
  const BASE = BLOCK_SIZE + 4
  const MAG = BASE * 1.6
  const DIST = 200
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderBlock(ctx, block)
  })

  const mouseDist = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return 0
    return val - rect.x - rect.width / 2
  })

  const targetSize = useTransform(mouseDist, [-DIST, 0, DIST], [BASE, MAG, BASE])
  const size = useSpring(targetSize, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <motion.div
      ref={ref}
      className="dock-block-item"
      style={{ width: size, height: size }}
      onMouseMove={e => setTip({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setTip(null)}
    >
      <canvas
        ref={canvasRef}
        width={BLOCK_SIZE}
        height={BLOCK_SIZE}
        className="dock-block-canvas"
      />
      {tip && (
        <div className="dock-tooltip" style={{ left: tip.x + 12, top: tip.y - 4 }}>
          {block.id}
        </div>
      )}
    </motion.div>
  )
}

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.match(/^#?([0-9a-fA-F]{6})$/)
  if (!m) return null
  const h = m[1]
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function toHex(v: number) { return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0') }
function rgbToHex(r: number, g: number, b: number) { return `#${toHex(r)}${toHex(g)}${toHex(b)}` }

const STACK_SIZE = 256

export default function ColorFinderPage() {
  const { t } = useLang()

  const [r, setR] = useState(128)
  const [g, setG] = useState(128)
  const [b, setB] = useState(128)
  const [version, setVersion] = useState('1.21')
  const [glassLayers, setGlassLayers] = useState(2)
  const [pureGlass, setPureGlass] = useState(false)
  const [survivalFriendly, setSurvivalFriendly] = useState(false)
  const [result, setResult] = useState<BlendResult | null>(null)
  const [layerUrls, setLayerUrls] = useState<{ src: string; zOffset: number }[]>([])
  const [baseUrl, setBaseUrl] = useState('')
  const [textureVersion, setTextureVersion] = useState(0)
  const [searchKey, setSearchKey] = useState(0)

  const targetCanvasRef = useRef<HTMLCanvasElement>(null)
  const dockMouseX = useMotionValue(Infinity)


  const handleHexChange = useCallback((value: string) => {
    const rgb = parseHex(value)
    if (rgb) { setR(rgb[0]); setG(rgb[1]); setB(rgb[2]) }
  }, [])

  const handleRgbChange = useCallback((nr: number, ng: number, nb: number) => {
    setR(nr); setG(ng); setB(nb)
  }, [])

  const basePalette = useMemo(() => {
    let p = getBlocks(version)
    p = applyColorOverrides(p)
    if (survivalFriendly) p = filterSurvival(p)
    return p
  }, [version, survivalFriendly])

  const glassPalette = useMemo(() => {
    return glassLayers > 0 ? getGlassBlocks(version) : []
  }, [version, glassLayers])

  const handleSearch = useCallback(() => {
    const tr = Math.max(0, Math.min(255, r))
    const tg = Math.max(0, Math.min(255, g))
    const tb = Math.max(0, Math.min(255, b))

    const baseMatch = findClosestBlockRGB(tr, tg, tb, basePalette)

    setSearchKey(k => k + 1)

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
  }, [r, g, b, glassLayers, pureGlass, basePalette, glassPalette])

  useEffect(() => {
    const canvas = targetCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderColorSwatch(ctx, [r, g, b], BLOCK_SIZE)
  }, [r, g, b])

  useEffect(() => {
    if (!result) return
    let cancelled = false
    const ids: string[] = []
    if (result.base) ids.push(result.base.id)
    result.glasses.forEach(g => ids.push(g.id))
    preloadTextures(ids).then(() => {
      if (!cancelled) setTextureVersion(v => v + 1)
    })
    return () => { cancelled = true }
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
        <div className="finder-input-section">
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
                <input type="text" maxLength={7} value={rgbToHex(r, g, b)} onChange={e => handleHexChange(e.target.value)} />
              </label>
            </div>
            <div className="finder-target-swatch">
              <div className="finder-swatch-wrap">
                <canvas ref={targetCanvasRef} width={BLOCK_SIZE} height={BLOCK_SIZE} className="finder-canvas-block" />
                <input type="color" value={rgbToHex(r, g, b)} onChange={e => handleHexChange(e.target.value)} className="finder-swatch-picker" />
              </div>
              <span className="finder-color-label">RGB({r},{g},{b})</span>
            </div>
          </div>
        </div>

        {result && (
          <div className="finder-result-section">
            <div className="finder-result-body">
              <motion.div
                key={`dock-${searchKey}`}
                className="finder-horizontal-dock"
                onMouseMove={e => dockMouseX.set(e.pageX)}
                onMouseLeave={() => dockMouseX.set(Infinity)}
              >
                {getBlocksList(result).map(block => (
                  <DockBlockItem key={block.id} block={block} mouseX={dockMouseX} />
                ))}
              </motion.div>
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
