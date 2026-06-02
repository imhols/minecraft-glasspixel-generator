import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { PaletteBlock } from '../data/palettes'
import { getBlocks, getGlassBlocks } from '../data/palettes'
import { applyColorOverrides } from '../data/colorOverrides'
import { filterSurvival } from '../data/survival'
import { findBestOrientedBlock, findBestBlend } from '../core/colorMatcher'
import type { BlendResult } from '../core/colorMatcher'
import { useLang } from '../i18n/LangContext'
import { renderBlock, renderColorSwatch, BLOCK_SIZE } from './BlockRenderer'
import { preloadTextures } from './textureLoader'
import StackedPreview from './StackedPreview'
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react'
import type { BlockFacing } from '../core/facingFilter'
import { applyFacing } from '../core/facingFilter'
import BlockFilter from './BlockFilter'

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

function BlockFilterModal({ excluded, onChange }: { excluded: Set<string>; onChange: (ids: Set<string>) => void }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="bf-open-btn" onClick={() => setOpen(true)}>
        {t('config.blockFilter')}
      </button>
      {open && (
        <div className="bf-overlay" onClick={() => setOpen(false)}>
          <div className="bf-modal" onClick={e => e.stopPropagation()}>
            <div className="bf-modal-header">
              <span>{t('config.blockFilter')}</span>
              <button className="bf-modal-close" onClick={() => setOpen(false)}>&#x2715;</button>
            </div>
            <div className="bf-modal-body">
              <BlockFilter excluded={excluded} onChange={onChange} />
            </div>
          </div>
        </div>
      )}
    </>
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
const MAX_HISTORY = 10

interface ColorFinderHistoryEntry {
  r: number
  g: number
  b: number
  result: BlendResult
  version: string
  glassLayers: number
  pureGlass: boolean
  survivalFriendly: boolean
  facing: string
  excludedBlocks: Set<string>
  time: string
}

export default function ColorFinderPage() {
  const { t } = useLang()

  const [r, setR] = useState(128)
  const [g, setG] = useState(128)
  const [b, setB] = useState(128)
  const [version, setVersion] = useState('1.21')
  const [glassLayers, setGlassLayers] = useState(2)
  const [pureGlass, setPureGlass] = useState(false)
  const [survivalFriendly, setSurvivalFriendly] = useState(false)
  const [facing, setFacing] = useState<BlockFacing>('horizontal')
  const [excludedBlocks, setExcludedBlocks] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<BlendResult | null>(null)
  const [layerUrls, setLayerUrls] = useState<{ src: string; zOffset: number }[]>([])
  const [baseUrl, setBaseUrl] = useState('')
  const [textureVersion, setTextureVersion] = useState(0)
  const [searchKey, setSearchKey] = useState(0)
  const [finderHistory, setFinderHistory] = useState<ColorFinderHistoryEntry[]>([])

  const targetCanvasRef = useRef<HTMLCanvasElement>(null)
  const dockMouseX = useMotionValue(Infinity)
  const restoringRef = useRef(false)
  const prevResultRef = useRef<BlendResult | null>(null)
  const lastParamsRef = useRef({ r: 128, g: 128, b: 128, version: '1.21', glassLayers: 2, pureGlass: false, survivalFriendly: false, facing: 'horizontal' as BlockFacing, excludedBlocks: new Set<string>() })

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
    if (excludedBlocks.size > 0) p = p.filter(b => !excludedBlocks.has(b.id))
    p = applyFacing(p, facing)
    return p
  }, [version, survivalFriendly, facing, excludedBlocks])

  const glassPalette = useMemo(() => {
    let p = glassLayers > 0 ? getGlassBlocks(version) : []
    if (excludedBlocks.size > 0 && p.length > 0) p = p.filter(b => !excludedBlocks.has(b.id))
    return p
  }, [version, glassLayers, excludedBlocks])

  const handleSearch = useCallback(() => {
    const tr = Math.max(0, Math.min(255, r))
    const tg = Math.max(0, Math.min(255, g))
    const tb = Math.max(0, Math.min(255, b))

    lastParamsRef.current = { r: tr, g: tg, b: tb, version, glassLayers, pureGlass, survivalFriendly, facing, excludedBlocks }

    setSearchKey(k => k + 1)

    if (glassLayers > 0 && glassPalette.length > 0) {
      const blend = findBestBlend(tr, tg, tb, basePalette, glassPalette, glassLayers, pureGlass, facing)
      setResult(blend)
    } else {
      const oriented = findBestOrientedBlock(tr, tg, tb, basePalette, facing)
      setResult({
        glasses: [],
        base: oriented.block,
        baseOrientation: oriented.orientation,
        color: oriented.color,
      })
    }
  }, [r, g, b, glassLayers, pureGlass, basePalette, glassPalette, facing])

  useEffect(() => {
    if (!result || result === prevResultRef.current || restoringRef.current) {
      restoringRef.current = false
      return
    }
    prevResultRef.current = result
    const p = lastParamsRef.current
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const entry: ColorFinderHistoryEntry = {
      r: p.r, g: p.g, b: p.b, result,
      version: p.version, glassLayers: p.glassLayers,
      pureGlass: p.pureGlass, survivalFriendly: p.survivalFriendly,
      facing: p.facing, excludedBlocks: p.excludedBlocks,
      time,
    }
    setFinderHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY))
  }, [result])

  const handleHistorySelect = useCallback((entry: ColorFinderHistoryEntry) => {
    restoringRef.current = true
    setR(entry.r)
    setG(entry.g)
    setB(entry.b)
    setVersion(entry.version)
    setGlassLayers(entry.glassLayers)
    setPureGlass(entry.pureGlass)
    setSurvivalFriendly(entry.survivalFriendly)
    setFacing(entry.facing === 'all' ? 'vertical' : entry.facing as BlockFacing)
    setExcludedBlocks(new Set(entry.excludedBlocks))
    setSearchKey(k => k + 1)
    setResult(entry.result)
  }, [])

  const handleHistoryDelete = useCallback((i: number) => {
    setFinderHistory(prev => prev.filter((_, idx) => idx !== i))
  }, [])

  const handleHistoryClear = useCallback(() => {
    setFinderHistory([])
  }, [])

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

          <div className="config-group">
            <label>{t('config.facing')}</label>
            <select value={facing} onChange={e => setFacing(e.target.value as BlockFacing)}>
              <option value="vertical">{t('config.facing.vertical')}</option>
              <option value="horizontal">{t('config.facing.horizontal')}</option>
            </select>
            <span className="hint">{t('config.facingHint')}</span>
          </div>

          <div className="config-group config-filter-row">
            <BlockFilterModal excluded={excludedBlocks} onChange={setExcludedBlocks} />
          </div>

          <button className="convert-btn" onClick={handleSearch}>
            {t('finder.search')}
          </button>
        </div>

        {finderHistory.length > 0 && (
          <div className="history-panel">
            <div className="history-header">
              <h3>{t('history.title')}</h3>
              <button className="history-clear" onClick={handleHistoryClear}>{t('history.clear')}</button>
            </div>
            <div className="history-list">
              {finderHistory.map((entry, i) => (
                <div key={i} className="history-item" onClick={() => handleHistorySelect(entry)}>
                  <div className="finder-history-swatch" style={{ backgroundColor: rgbToHex(entry.r, entry.g, entry.b) }} />
                  <div className="history-info">
                    <span className="history-time">{entry.time}</span>
                    <span className="history-params">
                      RGB({entry.r},{entry.g},{entry.b}) | {entry.glassLayers}{t('history.layers')}{entry.pureGlass ? ' · PG' : ''}{entry.survivalFriendly ? ' · SF' : ''}{entry.facing !== 'vertical' ? ' · H' : ' · V'}
                    </span>
                  </div>
                  <button className="history-del" onClick={e => { e.stopPropagation(); handleHistoryDelete(i) }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
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
