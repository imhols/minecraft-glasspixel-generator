import type { DitherMode } from '../core/imageProcessor'
import { MC_VERSIONS } from '../data/palettes'
import { useLang } from '../i18n/LangContext'

const DITHER_OPTIONS: { value: DitherMode; labelKey: string }[] = [
  { value: 'none', labelKey: 'config.dither.none' },
  { value: 'floyd-steinberg', labelKey: 'config.dither.floyd' },
  { value: 'jarvis-judice-ninke', labelKey: 'config.dither.jjn' },
  { value: 'atkinson', labelKey: 'config.dither.atkinson' },
  { value: 'sierra-lite', labelKey: 'config.dither.sierra' },
]

export default function ConfigPanel({ onConvert, loading, hasImage, ditherMode, onDitherModeChange, pureGlass, onPureGlassChange, ditherThreshold, onDitherThresholdChange, survivalFriendly, onSurvivalFriendlyChange, supportGravity, onSupportGravityChange, keepCoral, onKeepCoralChange }: {
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
}) {
  const { t } = useLang()
  return (
    <div className="config-panel">
      <h3>{t('config.title')}</h3>
      <div className="config-group">
        <label>{t('config.version')}</label>
        <select id="version-select" defaultValue="1.21">
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
