import { useState, useCallback, useRef, useEffect } from 'react'
import type { ProcessedImage } from './core/imageProcessor'
import { loadImage, processImage, processImageMultiLayer } from './core/imageProcessor'
import { getBlocks, getGlassBlocks } from './data/palettes'
import ImageUploader from './components/ImageUploader'
import ConfigPanel from './components/ConfigPanel'
import PreviewCanvas from './components/PreviewCanvas'
import ExportButton from './components/ExportButton'
import ProgressBar from './components/ProgressBar'
import HistoryPanel from './components/HistoryPanel'
import type { HistoryEntry } from './components/HistoryPanel'
import { useLang } from './i18n/LangContext'
import './App.css'

const MAX_HISTORY = 10

export default function App() {
  const [result, setResult] = useState<ProcessedImage | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [version, setVersion] = useState('1.21')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const lastParams = useRef({ glassLayers: 0, pureGlass: false })

  const handleImageLoaded = useCallback((file: File) => {
    setSourceFile(file)
    setResult(null)
    setOriginalUrl(URL.createObjectURL(file))
  }, [])

  const handleConvert = useCallback(async () => {
    if (!sourceFile) return
    setLoading(true)
    setProgress(0)
    try {
      const sel = document.getElementById('version-select') as HTMLSelectElement
      const widthInput = document.getElementById('width-input') as HTMLInputElement
      const glassSelect = document.getElementById('glass-layers') as HTMLSelectElement
      const pureGlassCheck = document.getElementById('pure-glass') as HTMLInputElement

      const v = sel?.value || '1.21'
      const w = parseInt(widthInput?.value || '64')
      const glassLayers = parseInt(glassSelect?.value || '0')
      const pureGlass = pureGlassCheck?.checked || false
      lastParams.current = { glassLayers, pureGlass }

      setVersion(v)
      setProgress(2)
      const img = await loadImage(sourceFile)
      setProgress(5)
      const h = Math.round(w * (img.naturalHeight / img.naturalWidth))
      const basePalette = getBlocks(v)
      let res: ProcessedImage

      if (glassLayers > 0) {
        const glassPalette = getGlassBlocks(v)
        res = await processImageMultiLayer(img, w, h, basePalette, glassPalette, glassLayers, pct => {
          setProgress(5 + Math.round(pct * 90))
        })
      } else {
        res = await processImage(img, w, h, basePalette, pct => {
          setProgress(5 + Math.round(pct * 90))
        })
      }

      if (pureGlass && res.glassGrids) {
        for (let z = 0; z < res.height; z++) {
          for (let x = 0; x < res.width; x++) {
            res.blockGrid[z][x] = null
          }
        }
        const glassOnlyBlocks = new Map<string, number>()
        for (const g of res.glassGrids.flat(2)) {
          if (g) glassOnlyBlocks.set(g.id, (glassOnlyBlocks.get(g.id) || 0) + 1)
        }
        res.usedBlocks = glassOnlyBlocks
      }

      setProgress(100)
      setLoading(false)
      setResult(res)
    } catch {
      setLoading(false)
    }
  }, [sourceFile])

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
      time,
    }
    setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY))
  }, [result, version, originalUrl])

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    restoringRef.current = true
    setResult(entry.result)
    setVersion(entry.version)
    setOriginalUrl(entry.originalUrl)
  }, [])

  const handleHistoryDelete = useCallback((i: number) => {
    setHistory(prev => prev.filter((_, idx) => idx !== i))
  }, [])

  const handleHistoryClear = useCallback(() => {
    setHistory([])
  }, [])

  const { t, toggleLang } = useLang()

  return (
    <div className="app">
      <button className="lang-btn" onClick={toggleLang}>{t('lang.switch')}</button>
      <header className="header">
        <div className="header-row">
          <h1>{t('app.title')}</h1>
        </div>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <ConfigPanel onConvert={handleConvert} loading={loading} hasImage={!!sourceFile} />
          <HistoryPanel entries={history} onSelect={handleHistorySelect} onDelete={handleHistoryDelete} onClear={handleHistoryClear} />
          <ExportButton result={result} version={version} pureGlass={lastParams.current.pureGlass} />
        </aside>

        <main className="content">
          <ImageUploader onImageLoaded={handleImageLoaded} hasImage={!!sourceFile} />
          {result ? (
            <div className="preview-wrapper">
              <PreviewCanvas result={result} originalSrc={originalUrl} />
              {loading && (
                <div className="preview-overlay">
                  <ProgressBar progress={progress} />
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="preview">
              <ProgressBar progress={progress} />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
