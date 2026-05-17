import { useRef, useState, useCallback } from 'react'
import { useLang } from '../i18n/LangContext'

export default function ImageUploader({ onImageLoaded, hasImage }: {
  onImageLoaded: (file: File) => void
  hasImage?: boolean
}) {
  const { t } = useLang()
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setFileName(file.name)
    onImageLoaded(file)
  }, [onImageLoaded])

  if (hasImage) {
    return (
      <div className="upload-bar">
        <span className="upload-bar-name">{fileName || t('upload.loaded')}</span>
        <button className="upload-bar-btn" onClick={() => fileRef.current?.click()}>{t('upload.change')}</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>
    )
  }

  return (
    <div
      className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <div className="upload-text">{t('upload.dropText')}</div>
      <div className="upload-hint">{t('upload.dropHint')}</div>
    </div>
  )
}
