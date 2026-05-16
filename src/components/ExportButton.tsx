import type { ProcessedImage } from '../core/imageProcessor'
import { exportSchemV2, exportSchematic, exportLitematic, downloadBlob } from '../core/schematicExporter'
import { useLang } from '../i18n/LangContext'

export default function ExportButton({ result, version, supportGravity, keepCoral }: {
  result: ProcessedImage | null
  version: string
  supportGravity: boolean
  keepCoral: boolean
}) {
  const { t } = useLang()
  if (!result) return null

  const handleExport = (format: 'schem' | 'schematic' | 'litematic') => {
    if (format === 'schem') {
      const data = exportSchemV2(result, version, supportGravity, keepCoral)
      downloadBlob(data, `glasspixel_${result.width}x${result.height}.schem`)
    } else if (format === 'schematic') {
      const data = exportSchematic(result, version, supportGravity, keepCoral)
      downloadBlob(data, `glasspixel_${result.width}x${result.height}.schematic`)
    } else {
      const data = exportLitematic(result, version, supportGravity, keepCoral)
      downloadBlob(data, `glasspixel_${result.width}x${result.height}.litematic`)
    }
  }

  return (
    <div className="export-buttons">
      <button className="export-btn" onClick={() => handleExport('schem')}>
        {t('export.schem')}
      </button>
      <button className="export-btn" onClick={() => handleExport('schematic')}>
        {t('export.schematic')}
      </button>
      <button className="export-btn" onClick={() => handleExport('litematic')}>
        {t('export.litematic')}
      </button>
    </div>
  )
}
