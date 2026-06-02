import { useState, useCallback, useRef, useEffect } from 'react'
import type { ProcessedImage, DitherMode } from './core/imageProcessor'
import { loadImage, extractRawFromImage } from './core/imageProcessor'
import type { PaletteBlock } from './data/palettes'
import type { BlockOrientation } from './types'
import { getBlocks, getGlassBlocks } from './data/palettes'
import { filterSurvival } from './data/survival'
import { applyColorOverrides } from './data/colorOverrides'
import type { ProcessResultMessage } from './worker/processor.worker'
import ImageUploader from './components/ImageUploader'
import ConfigPanel from './components/ConfigPanel'
import PreviewCanvas from './components/PreviewCanvas'
import ExportButton from './components/ExportButton'
import ProgressBar from './components/ProgressBar'
import HistoryPanel from './components/HistoryPanel'
import type { HistoryEntry } from './components/HistoryPanel'
import ColorFinderPage from './components/ColorFinderPage'
import { useLang } from './i18n/LangContext'
import { useTheme } from './i18n/ThemeContext'
import './App.css'

const MAX_HISTORY = 10

function parseOrientation(s: string | undefined): BlockOrientation | undefined {
  if (!s) return undefined
  if (s.startsWith('axis:')) return { axis: s.slice(5) as 'x' | 'y' | 'z' }
  if (s.startsWith('facing:')) return { facing: s.slice(7) as 'up' | 'down' | 'north' | 'south' | 'east' | 'west' }
  return undefined
}

function reconstructFromWorker(
  msg: ProcessResultMessage,
  palette: PaletteBlock[],
  glassPalette: PaletteBlock[],
): ProcessedImage {
  const { width, height, flatPixels, blockIds, usedBlocks, glassLayers, glassBlockIds, orientationStrs, alphaMask } = msg
  const paletteMap = new Map<string, PaletteBlock>()
  for (const b of palette) paletteMap.set(b.id, b)
  for (const b of glassPalette) paletteMap.set(b.id, b)

  const pixels: number[][][] = []
  const blockGrid: (PaletteBlock | null)[][] = []
  const orientationGrid: (BlockOrientation | undefined)[][] = []

  for (let y = 0; y < height; y++) {
    const pxRow: number[][] = []
    const blockRow: (PaletteBlock | null)[] = []
    const oRow: (BlockOrientation | undefined)[] = []
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      pxRow.push([flatPixels[i], flatPixels[i + 1], flatPixels[i + 2]])
      const id = blockIds[y][x]
      blockRow.push(id ? (paletteMap.get(id) ?? null) : null)
      oRow.push(parseOrientation(orientationStrs?.[y]?.[x]))
    }
    pixels.push(pxRow)
    blockGrid.push(blockRow)
    orientationGrid.push(oRow)
  }

  // Build block ID→PaletteBlock lookup to avoid .flat().find() in preview
  const blockMap = new Map<string, PaletteBlock>()
  for (const row of blockGrid) {
    for (const b of row) {
      if (b && !blockMap.has(b.id)) blockMap.set(b.id, b)
    }
  }

  const result: ProcessedImage = {
    width, height, pixels, blockGrid,
    orientationGrid,
    usedBlocks: new Map(usedBlocks),
    blockMap,
  }

  if (alphaMask && alphaMask.some(row => row.some(a => a))) result.alphaMask = alphaMask
  if (glassLayers && glassLayers > 0 && glassBlockIds) {
    result.glassLayers = glassLayers
    result.glassGrids = []
    for (let l = 0; l < glassLayers; l++) {
      const grid: (PaletteBlock | null)[][] = []
      for (let y = 0; y < height; y++) {
        const row: (PaletteBlock | null)[] = []
        for (let x = 0; x < width; x++) {
          const id = glassBlockIds[l]?.[y]?.[x]
          row.push(id ? (paletteMap.get(id) ?? null) : null)
        }
        grid.push(row)
      }
      result.glassGrids.push(grid)
    }
  }

  return result
}

export default function App() {
  const [page, setPage] = useState<'converter' | 'finder'>('converter')
  const [result, setResult] = useState<ProcessedImage | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [originalW, setOriginalW] = useState(0)
  const [originalH, setOriginalH] = useState(0)
  const [version, setVersion] = useState('1.21')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pureGlass, setPureGlass] = useState(false)
  const [ditherMode, setDitherMode] = useState<DitherMode>('none')
  const [ditherThreshold, setDitherThreshold] = useState(30)
  const [survivalFriendly, setSurvivalFriendly] = useState(false)
  const [supportGravity, setSupportGravity] = useState(false)
  const [keepCoral, setKeepCoral] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [exportPct, setExportPct] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const lastParams = useRef({ glassLayers: 0, pureGlass: false, ditherMode: 'none' as DitherMode, ditherThreshold: 30, survivalFriendly: false, supportGravity: false, keepCoral: false })

  const workerRef = useRef<Worker | null>(null)
  const taskIdRef = useRef(0)

  useEffect(() => {
    const worker = new Worker(new URL('./worker/processor.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    return () => { worker.terminate(); workerRef.current = null }
  }, [])

  const handleImageLoaded = useCallback((file: File) => {
    setSourceFile(file)
    setResult(null)
    const url = URL.createObjectURL(file)
    setOriginalUrl(url)
    const img = new Image()
    img.onload = () => { setOriginalW(img.naturalWidth); setOriginalH(img.naturalHeight) }
    img.src = url
  }, [])

  const handleConvert = useCallback(async () => {
    if (!sourceFile) return
    setLoading(true)
    setProgress(0)

    const sel = document.getElementById('version-select') as HTMLSelectElement
    const widthInput = document.getElementById('width-input') as HTMLInputElement
    const glassSelect = document.getElementById('glass-layers') as HTMLSelectElement
    const v = sel?.value || '1.21'
    const w = parseInt(widthInput?.value || '64')
    const glassLayers = parseInt(glassSelect?.value || '0')
    lastParams.current = { glassLayers, pureGlass, ditherMode, ditherThreshold, survivalFriendly, supportGravity, keepCoral }

    setVersion(v)
    setProgress(2)

    try {
      const img = await loadImage(sourceFile)
      setProgress(5)
      const h = Math.round(w * (img.naturalHeight / img.naturalWidth))
      let basePalette = getBlocks(v)
      basePalette = applyColorOverrides(basePalette)
      if (survivalFriendly) basePalette = filterSurvival(basePalette)
      const glassPalette = glassLayers > 0 ? getGlassBlocks(v) : []

      // Extract raw pixels on main thread
      const raw = extractRawFromImage(img, w, h)

      // Send to worker
      const taskId = ++taskIdRef.current
      const worker = workerRef.current
      if (!worker) return

      const onMessage = (e: MessageEvent) => {
        const msg = e.data
        if (msg.taskId !== taskId) return

        if (msg.type === 'progress') {
          setProgress(5 + Math.round(msg.pct * 90))
        } else if (msg.type === 'processResult') {
          worker.removeEventListener('message', onMessage)
          setProgress(100)
          setLoading(false)
          const res = reconstructFromWorker(msg, basePalette, glassPalette)
          setResult(res)
        }
      }

      worker.addEventListener('message', onMessage)
      worker.postMessage({
        type: 'process',
        taskId,
        raw,
        width: w,
        height: h,
        palette: basePalette,
        glassLayers,
        glassPalette,
        pureGlass,
        ditherMode,
        ditherThreshold,
      }, [raw.buffer])
    } catch {
      setLoading(false)
    }
  }, [sourceFile, ditherMode, pureGlass, ditherThreshold, survivalFriendly, supportGravity, keepCoral])

  // Save to history when result changes (skip when restoring from history)
  const restoringRef = useRef(false)
  const prevResultRef = useRef<ProcessedImage | null>(null)
  useEffect(() => {
    if (!result || result === prevResultRef.current || restoringRef.current) {
      restoringRef.current = false
      return
    }
    prevResultRef.current = result
    const p = lastParams.current
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const entry: HistoryEntry = {
      result, version, originalUrl,
      glassLayers: p.glassLayers,
      pureGlass: p.pureGlass,
      ditherMode: p.ditherMode,
      ditherThreshold: p.ditherThreshold,
      survivalFriendly: p.survivalFriendly,
      supportGravity: p.supportGravity,
      keepCoral: p.keepCoral,
      time,
    }
    setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY))
  }, [result, version, originalUrl])

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    restoringRef.current = true
    setResult(entry.result)
    setVersion(entry.version)
    setOriginalUrl(entry.originalUrl)
    setPureGlass(entry.pureGlass)
    setDitherMode(entry.ditherMode)
    setDitherThreshold(entry.ditherThreshold)
    setSurvivalFriendly(entry.survivalFriendly)
    setSupportGravity(entry.supportGravity)
    setKeepCoral(entry.keepCoral)
  }, [])

  const handleHistoryDelete = useCallback((i: number) => {
    setHistory(prev => prev.filter((_, idx) => idx !== i))
  }, [])

  const handleHistoryClear = useCallback(() => {
    setHistory([])
  }, [])

  const { t, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app">
      <div className="top-buttons">
        <button className="theme-btn" onClick={toggleTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
        <button className="lang-btn" onClick={toggleLang}>{t('lang.switch')}</button>
        <button className="nav-btn" onClick={() => setPage(p => p === 'converter' ? 'finder' : 'converter')}>
          {page === 'converter' ? t('finder.pageTitle') : t('app.pageTitle')}
        </button>
      </div>
      <header className="header">
        <div className="header-row">
          <svg className="header-icon" width="28" height="28" viewBox="0 0 32 32" style={{display:'block'}}>
            <rect width="32" height="32" rx="7" fill="#07070d"/>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="22" height="22" rx="4" fill="url(#g)"/>
            <rect x="5" y="5" width="22" height="10" rx="4" fill="#fff" opacity="0.12"/>
          </svg>
          <h1>{t('app.title')}</h1>
        </div>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      {page === 'finder' ? (
        <ColorFinderPage />
      ) : (
      <div className="main-layout">
        <aside className="sidebar">
          <ConfigPanel onConvert={handleConvert} loading={loading} hasImage={!!sourceFile}
            ditherMode={ditherMode} onDitherModeChange={setDitherMode}
            pureGlass={pureGlass} onPureGlassChange={setPureGlass}
            ditherThreshold={ditherThreshold} onDitherThresholdChange={setDitherThreshold}
            survivalFriendly={survivalFriendly} onSurvivalFriendlyChange={setSurvivalFriendly}
            supportGravity={supportGravity} onSupportGravityChange={setSupportGravity}
            keepCoral={keepCoral} onKeepCoralChange={setKeepCoral}
            showPreview={showPreview} onShowPreviewChange={setShowPreview} />
          <HistoryPanel entries={history} onSelect={handleHistorySelect} onDelete={handleHistoryDelete} onClear={handleHistoryClear} />
          <ExportButton result={result} version={version} supportGravity={supportGravity} keepCoral={keepCoral} onExportChange={setExportPct} />
        </aside>

        <main className="content">
          <ImageUploader onImageLoaded={handleImageLoaded} hasImage={!!sourceFile} originalW={originalW} originalH={originalH} />
          {result ? (showPreview ? (
            <div className="preview-wrapper">
              <PreviewCanvas result={result} originalSrc={originalUrl} originalW={originalW} originalH={originalH} />
              {(loading || exportPct !== null) && (
                <div className="preview-overlay">
                  <ProgressBar progress={exportPct !== null ? exportPct : progress} />
                </div>
              )}
            </div>
          ) : (loading || exportPct !== null) ? (
            <div className="preview">
              <ProgressBar progress={exportPct !== null ? exportPct : progress} />
            </div>
          ) : null) : loading ? (
            <div className="preview">
              <ProgressBar progress={progress} />
            </div>
          ) : null}
        </main>
      </div>
      )}
    </div>
  )
}
