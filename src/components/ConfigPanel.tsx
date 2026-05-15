import { MC_VERSIONS } from '../data/palettes'
import { useLang } from '../i18n/LangContext'

export default function ConfigPanel({ onConvert, loading, hasImage }: {
  onConvert: () => void
  loading: boolean
  hasImage: boolean
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
          <input id="pure-glass" type="checkbox" />
          {t('config.pureGlass')}
        </label>
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
