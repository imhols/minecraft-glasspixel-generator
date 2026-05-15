import { useRef, useEffect } from 'react'
import type { ProcessedImage } from '../core/imageProcessor'

export interface HistoryEntry {
  result: ProcessedImage
  version: string
  glassLayers: number
  originalUrl: string
  time: string
}

export default function HistoryPanel({ entries, onSelect, onDelete, onClear }: {
  entries: HistoryEntry[]
  onSelect: (e: HistoryEntry) => void
  onDelete: (i: number) => void
  onClear: () => void
}) {
  if (entries.length === 0) return null

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>历史记录</h3>
        <button className="history-clear" onClick={onClear}>清空</button>
      </div>
      <div className="history-list">
        {entries.map((entry, i) => (
          <HistoryItem key={i} entry={entry} index={i} onSelect={onSelect} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

function HistoryItem({ entry, index, onSelect, onDelete }: {
  entry: HistoryEntry
  index: number
  onSelect: (e: HistoryEntry) => void
  onDelete: (i: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = entry.result
    canvas.width = r.width
    canvas.height = r.height
    const ctx = canvas.getContext('2d')!
    const id = ctx.createImageData(r.width, r.height)
    for (let y = 0; y < r.height; y++) {
      for (let x = 0; x < r.width; x++) {
        const [pr, pg, pb] = r.pixels[y][x]
        const i = (y * r.width + x) * 4
        id.data[i] = pr; id.data[i + 1] = pg; id.data[i + 2] = pb
        id.data[i + 3] = r.alphaMask?.[y]?.[x] ? 0 : 255
      }
    }
    ctx.putImageData(id, 0, 0)
  }, [entry])

  return (
    <div className="history-item" onClick={() => onSelect(entry)}>
      <canvas ref={canvasRef} className="history-thumb" />
      <div className="history-info">
        <span className="history-time">{entry.time}</span>
        <span className="history-params">{entry.result.width}×{entry.result.height} | {entry.glassLayers}层</span>
      </div>
      <button className="history-del" onClick={e => { e.stopPropagation(); onDelete(index) }}>×</button>
    </div>
  )
}
