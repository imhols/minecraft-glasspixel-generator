import { useState, useCallback, useRef, useEffect } from 'react'
import type { ProcessedImage, DitherMode } from './core/imageProcessor'
import { loadImage, processImage, processImageMultiLayer } from './core/imageProcessor'
import { getBlocks, getGlassBlocks } from './data/palettes'
import { filterSurvival } from './data/survival'
import { applyColorOverrides } from './data/colorOverrides'
import ImageUploader from './components/ImageUploader'
import ConfigPanel from './components/ConfigPanel'
import PreviewCanvas from './components/PreviewCanvas'
import ExportButton from './components/ExportButton'
import ProgressBar from './components/ProgressBar'
import HistoryPanel from './components/HistoryPanel'
import type { HistoryEntry } from './components/HistoryPanel'
import { useLang } from './i18n/LangContext'
import { useTheme } from './i18n/ThemeContext'
import './App.css'

const MAX_HISTORY = 10

export default function App() {
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
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const lastParams = useRef({ glassLayers: 0, pureGlass: false, ditherMode: 'none' as DitherMode, ditherThreshold: 30, survivalFriendly: false, supportGravity: false, keepCoral: false })

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
    try {
      const sel = document.getElementById('version-select') as HTMLSelectElement
      const widthInput = document.getElementById('width-input') as HTMLInputElement
      const glassSelect = document.getElementById('glass-layers') as HTMLSelectElement
      const v = sel?.value || '1.21'
      const w = parseInt(widthInput?.value || '64')
      const glassLayers = parseInt(glassSelect?.value || '0')
      lastParams.current = { glassLayers, pureGlass, ditherMode, ditherThreshold, survivalFriendly, supportGravity, keepCoral }

      setVersion(v)
      setProgress(2)
      const img = await loadImage(sourceFile)
      setProgress(5)
      const h = Math.round(w * (img.naturalHeight / img.naturalWidth))
      let basePalette = getBlocks(v)
      basePalette = applyColorOverrides(basePalette)
      if (survivalFriendly) basePalette = filterSurvival(basePalette)
      let res: ProcessedImage

      if (glassLayers > 0) {
        const glassPalette = getGlassBlocks(v)
        res = await processImageMultiLayer(img, w, h, basePalette, glassPalette, glassLayers, pct => {
          setProgress(5 + Math.round(pct * 90))
        }, pureGlass, ditherMode, ditherThreshold)
      } else {
        res = await processImage(img, w, h, basePalette, pct => {
          setProgress(5 + Math.round(pct * 90))
        }, ditherMode, ditherThreshold)
      }

      setProgress(100)
      setLoading(false)
      setResult(res)
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
      </div>
      <header className="header">
        <div className="header-row">
          <svg className="header-icon" width="28" height="28" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#07070d"/>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#a78bfa"/>
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="22" height="22" rx="4" fill="url(#g)"/>
            <rect x="5" y="5" width="22" height="10" rx="4" fill="#fff" opacity="0.12"/>
          </svg>
          <h1>{t('app.title')}</h1>
        </div>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <ConfigPanel onConvert={handleConvert} loading={loading} hasImage={!!sourceFile}
            ditherMode={ditherMode} onDitherModeChange={setDitherMode}
            pureGlass={pureGlass} onPureGlassChange={setPureGlass}
            ditherThreshold={ditherThreshold} onDitherThresholdChange={setDitherThreshold}
            survivalFriendly={survivalFriendly} onSurvivalFriendlyChange={setSurvivalFriendly}
            supportGravity={supportGravity} onSupportGravityChange={setSupportGravity}
            keepCoral={keepCoral} onKeepCoralChange={setKeepCoral} />
          <HistoryPanel entries={history} onSelect={handleHistorySelect} onDelete={handleHistoryDelete} onClear={handleHistoryClear} />
          <ExportButton result={result} version={version} supportGravity={supportGravity} keepCoral={keepCoral} />
        </aside>

        <main className="content">
          <ImageUploader onImageLoaded={handleImageLoaded} hasImage={!!sourceFile} />
          {result ? (
            <div className="preview-wrapper">
              <PreviewCanvas result={result} originalSrc={originalUrl} originalW={originalW} originalH={originalH} />
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
