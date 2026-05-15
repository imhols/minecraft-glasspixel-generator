import type { ProcessedImage } from '../core/imageProcessor'
import { exportSchemV2, exportSchematic, downloadBlob } from '../core/schematicExporter'

export default function ExportButton({ result, version }: {
  result: ProcessedImage | null
  version: string
}) {
  if (!result) return null

  const handleExport = (format: 'schem' | 'schematic') => {
    if (format === 'schem') {
      const data = exportSchemV2(result, version)
      downloadBlob(data, `glasspixel_${result.width}x${result.height}.schem`)
    } else {
      const data = exportSchematic(result, version)
      downloadBlob(data, `glasspixel_${result.width}x${result.height}.schematic`)
    }
  }

  return (
    <div className="export-buttons">
      <button className="export-btn" onClick={() => handleExport('schem')}>
        下载 .schem (Sponge)
      </button>
      <button className="export-btn" onClick={() => handleExport('schematic')}>
        下载 .schematic (MCEdit)
      </button>
    </div>
  )
}
