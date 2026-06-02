import { useState } from 'react'
import type { DitherMode } from '../core/imageProcessor'
import type { BlockFacing } from '../core/facingFilter'
import { MC_VERSIONS } from '../data/palettes'
import { useLang } from '../i18n/LangContext'
import BlockFilter from './BlockFilter'

const DITHER_OPTIONS: { value: DitherMode; labelKey: string }[] = [
  { value: 'none', labelKey: 'config.dither.none' },
  { value: 'floyd-steinberg', labelKey: 'config.dither.floyd' },
  { value: 'jarvis-judice-ninke', labelKey: 'config.dither.jjn' },
  { value: 'atkinson', labelKey: 'config.dither.atkinson' },
  { value: 'sierra-lite', labelKey: 'config.dither.sierra' },
]

const FACING_OPTIONS: { value: BlockFacing; labelKey: string }[] = [
  { value: 'vertical', labelKey: 'config.facing.vertical' },
  { value: 'horizontal', labelKey: 'config.facing.horizontal' },
]

export default function ConfigPanel({ onConvert, loading, hasImage, ditherMode, onDitherModeChange, pureGlass, onPureGlassChange, ditherThreshold, onDitherThresholdChange, survivalFriendly, onSurvivalFriendlyChange, supportGravity, onSupportGravityChange, keepCoral, onKeepCoralChange, showPreview, onShowPreviewChange, facing, onFacingChange, excluded, onBlockFilterChange, version, onVersionChange }: {
  onConvert: () => void
  loading: boolean
  hasImage: boolean
  ditherMode: DitherMode
  onDitherModeChange: (m: DitherMode) => void
  pureGlass: boolean
  onPureGlassChange: (b: boolean) => void
  ditherThreshold: number
  onDitherThresholdChange: (n: number) => void
  survivalFriendly: boolean
  onSurvivalFriendlyChange: (b: boolean) => void
  supportGravity: boolean
  onSupportGravityChange: (b: boolean) => void
  keepCoral: boolean
  onKeepCoralChange: (b: boolean) => void
  showPreview: boolean
  onShowPreviewChange: (b: boolean) => void
  facing: BlockFacing
  onFacingChange: (f: BlockFacing) => void
  excluded: Set<string>
  onBlockFilterChange: (ids: Set<string>) => void
  version: string
  onVersionChange: (v: string) => void
}) {
  const { t } = useLang()
  return (
    <div className="config-panel">
      <h3>{t('config.title')}</h3>
      <div className="config-group">
        <label>{t('config.version')}</label>
        <select id="version-select" value={version} onChange={e => onVersionChange(e.target.value)}>
          {MC_VERSIONS.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="config-group">
        <label>{t('config.width')}</label>
        <input id="width-input" type="number" defaultValue={256} min={8} max={512} />
        <span className="hint">{t('config.widthHint')}</span>
      </div>

      <div className="config-group">
        <label>{t('config.glassLayers')} <span id="layers-value">3</span></label>
        <input id="glass-layers" type="range" min={0} max={4} step={1} defaultValue={3}
          onInput={e => { const el = document.getElementById('layers-value'); if (el) el.textContent = (e.target as HTMLInputElement).value }} />
        <span className="hint">{t('config.glassHint')}</span>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={pureGlass} onChange={e => onPureGlassChange(e.target.checked)} />
          {t('config.pureGlass')}
        </label>
        <span className="sub-hint">{t('config.pureGlassHint')}</span>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={survivalFriendly} onChange={e => onSurvivalFriendlyChange(e.target.checked)} />
          {t('config.survival')}
        </label>
        <span className="sub-hint">{t('config.survivalHint')}</span>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={supportGravity} onChange={e => onSupportGravityChange(e.target.checked)} />
          {t('config.supportGravity')}
        </label>
        <span className="sub-hint">{t('config.supportGravityHint')}</span>
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={keepCoral} onChange={e => onKeepCoralChange(e.target.checked)} />
          {t('config.keepCoral')}
        </label>
        <span className="sub-hint">{t('config.keepCoralHint')}</span>
      </div>

      <div className="config-group config-filter-row">
        <BlockFilterModal excluded={excluded} onChange={onBlockFilterChange} />
      </div>

      <div className="config-group checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={showPreview} onChange={e => onShowPreviewChange(e.target.checked)} />
          {t('config.showPreview')}
        </label>
        <span className="sub-hint">{t('config.showPreviewHint')}</span>
      </div>

      <div className="config-group">
        <label>{t('config.dither')}</label>
        <select value={ditherMode} onChange={e => onDitherModeChange(e.target.value as DitherMode)}>
          {DITHER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
      </div>

      {ditherMode !== 'none' && (
        <div className="config-group">
          <label>{t('config.ditherThreshold')}: <span id="dither-threshold-value">{ditherThreshold}</span></label>
          <input type="range" min={0} max={60} step={1} value={ditherThreshold}
            onChange={e => onDitherThresholdChange(parseInt(e.target.value))} />
          <span className="hint">{t('config.ditherThresholdHint')}</span>
        </div>
      )}

      <div className="config-group">
        <label>{t('config.facing')}</label>
        <select value={facing} onChange={e => onFacingChange(e.target.value as BlockFacing)}>
          {FACING_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </select>
        <span className="hint">{t('config.facingHint')}</span>
      </div>

      <button
        className="convert-btn"
        onClick={onConvert}
        disabled={loading || !hasImage}
      >
        {loading ? t('config.converting') : t('config.convert')}
      </button>
    </div>
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
