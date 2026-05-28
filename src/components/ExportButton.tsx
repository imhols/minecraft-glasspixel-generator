import { useState } from 'react'
import type { ProcessedImage } from '../core/imageProcessor'
import { exportSchemV2Async, exportSchematicAsync, exportLitematicAsync, downloadBlob } from '../core/schematicExporter'
import { useLang } from '../i18n/LangContext'

export default function ExportButton({ result, version, supportGravity, keepCoral, onExportChange }: {
  result: ProcessedImage | null
  version: string
  supportGravity: boolean
  keepCoral: boolean
  onExportChange?: (pct: number | null) => void
}) {
  const { t } = useLang()
  const [exporting, setExporting] = useState<'schem' | 'schematic' | 'litematic' | null>(null)

  if (!result) return null

  const handleExport = async (format: 'schem' | 'schematic' | 'litematic') => {
    setExporting(format)
    onExportChange?.(0)

    try {
      let data: Uint8Array
      if (format === 'schem') {
        data = await exportSchemV2Async(result, version, supportGravity, keepCoral, p => onExportChange?.(Math.round(p * 100)))
      } else if (format === 'schematic') {
        data = await exportSchematicAsync(result, version, supportGravity, keepCoral, p => onExportChange?.(Math.round(p * 100)))
      } else {
        data = await exportLitematicAsync(result, version, supportGravity, keepCoral, p => onExportChange?.(Math.round(p * 100)))
      }
      const suffix = result.glassLayers ? `_l${result.glassLayers}` : ''
      downloadBlob(data, `glasspixel_${result.width}x${result.height}${suffix}.${format}`)
    } finally {
      setExporting(null)
      onExportChange?.(null)
    }
  }

  return (
    <div className="export-buttons">
      <button className="export-btn" onClick={() => handleExport('schem')} disabled={!!exporting}>
        {exporting === 'schem' ? t('export.generating') : t('export.schem')}
      </button>
      <button className="export-btn" onClick={() => handleExport('schematic')} disabled={!!exporting}>
        {exporting === 'schematic' ? t('export.generating') : t('export.schematic')}
      </button>
      <button className="export-btn" onClick={() => handleExport('litematic')} disabled={!!exporting}>
        {exporting === 'litematic' ? t('export.generating') : t('export.litematic')}
      </button>
    </div>
  )
}
