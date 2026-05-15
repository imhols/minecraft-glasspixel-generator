import { MC_VERSIONS } from '../data/palettes'

export default function ConfigPanel({ onConvert, loading, hasImage }: {
  onConvert: () => void
  loading: boolean
  hasImage: boolean
}) {
  return (
    <div className="config-panel">
      <h3>参数设置</h3>
      <div className="config-group">
        <label>Minecraft 版本</label>
        <select id="version-select" defaultValue="1.21">
          {MC_VERSIONS.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="config-group">
        <label>宽度（方块）</label>
        <input id="width-input" type="number" defaultValue={256} min={8} max={512} />
        <span className="hint">高度按比例自动计算</span>
      </div>

      <div className="config-group">
        <label>玻璃覆盖层数: <span id="layers-value">3</span></label>
        <input id="glass-layers" type="range" min={0} max={4} step={1} defaultValue={3}
          onInput={e => { const el = document.getElementById('layers-value'); if (el) el.textContent = (e.target as HTMLInputElement).value }} />
        <span className="hint">0=无，1~4 穷举匹配全部组合</span>
      </div>

      <button
        className="convert-btn"
        onClick={onConvert}
        disabled={loading || !hasImage}
      >
        {loading ? '处理中...' : '转换'}
      </button>
    </div>
  )
}
