import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { FILTER_CATEGORIES } from '../data/blockFilter'
import type { FilterCategory } from '../data/blockFilter'
import { getAllBlocks } from '../data/palettes'
import type { PaletteBlock } from '../data/palettes'
import { useLang } from '../i18n/LangContext'
import { preloadTextures, drawBlockTexture } from './textureLoader'

const SWATCH_SIZE = 44

interface BlockFilterProps {
  excluded: Set<string>
  onChange: (ids: Set<string>) => void
}

function rgbToCss(rgb: number[]): string {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}

function TextureSwatch({ blockId, fallbackColor }: { blockId: string; fallbackColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    if (!drawBlockTexture(ctx, blockId, 0, 0, SWATCH_SIZE)) {
      ctx.fillStyle = fallbackColor
      ctx.fillRect(0, 0, SWATCH_SIZE, SWATCH_SIZE)
    }
  }, [blockId, fallbackColor])

  return (
    <canvas
      ref={canvasRef}
      width={SWATCH_SIZE}
      height={SWATCH_SIZE}
      className="bf-swatch-bg"
    />
  )
}

export default function BlockFilter({ excluded, onChange }: BlockFilterProps) {
  const { t } = useLang()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return getAllBlocks().filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    if (!filtered) return
    const ids = filtered.map(b => b.id)
    preloadTextures(ids)
  }, [filtered])

  const allIds = FILTER_CATEGORIES.flatMap(c => c.blocks)
  const allChecked = allIds.length > 0 && allIds.every(id => excluded.has(id))

  const toggleCategory = useCallback((cat: FilterCategory) => {
    const next = new Set(excluded)
    const allExcluded = cat.blocks.every(id => excluded.has(id))
    if (allExcluded) {
      for (const id of cat.blocks) next.delete(id)
    } else {
      for (const id of cat.blocks) next.add(id)
    }
    onChange(next)
  }, [excluded, onChange])

  const toggleBlock = useCallback((blockId: string) => {
    const next = new Set(excluded)
    if (next.has(blockId)) next.delete(blockId)
    else next.add(blockId)
    onChange(next)
  }, [excluded, onChange])

  const blockMap = useMemo(() => {
    const m = new Map<string, PaletteBlock>()
    for (const b of getAllBlocks()) m.set(b.id, b)
    return m
  }, [])

  return (
    <div className="block-filter-root">
      <div className="bf-search-wrap">
        <input
          ref={inputRef}
          className="bf-search"
          type="text"
          placeholder={t('config.blockFilter.searchPlaceholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="bf-search-clear" onClick={() => { setQuery(''); inputRef.current?.focus() }}>
            &#x2715;
          </button>
        )}
      </div>

      {filtered !== null && (
        <div className="bf-search-results">
          {filtered.length === 0 ? (
            <div className="bf-search-empty">{t('config.blockFilter.noMatch')}</div>
          ) : (
            <div className="bf-swatch-grid">
              {filtered.map(b => (
                <label
                  key={b.id}
                  className={`bf-swatch-cell${excluded.has(b.id) ? ' excluded' : ''}`}
                  title={b.name}
                >
                  <input
                    type="checkbox"
                    checked={excluded.has(b.id)}
                    onChange={() => toggleBlock(b.id)}
                  />
                  <TextureSwatch blockId={b.id} fallbackColor={rgbToCss(b.color)} />
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {excluded.size > 0 && (
        <div className="bf-excluded-section">
          <div className="bf-excluded-header">{t('config.blockFilter.excludedCount').replace('{count}', String(excluded.size))}</div>
          <div className="bf-excluded-body">
            <div className="bf-swatch-grid">
              {Array.from(excluded).map(id => {
                const b = blockMap.get(id)
                return (
                  <label
                    key={id}
                    className="bf-swatch-cell excluded"
                    title={b?.name ?? id}
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleBlock(id)}
                    />
                    {b && <TextureSwatch blockId={b.id} fallbackColor={rgbToCss(b.color)} />}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {allIds.length > 0 && (
        <label className="bf-all-row">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={() => onChange(allChecked ? new Set() : new Set(allIds))}
          />
          <span>{t('config.blockFilter.all')}</span>
          <span className="bf-count">({allIds.length - excluded.size}/{allIds.length})</span>
        </label>
      )}

      {FILTER_CATEGORIES.filter(c => c.blocks.length > 0).map(cat => {
        const allExcluded = cat.blocks.every(id => excluded.has(id))
        const someExcluded = cat.blocks.some(id => excluded.has(id))
        const isCollapsed = collapsed.has(cat.id)

        return (
          <div key={cat.id} className="bf-preset">
            <div className="bf-preset-header" onClick={() => {
              setCollapsed(prev => {
                const next = new Set(prev)
                if (next.has(cat.id)) next.delete(cat.id)
                else next.add(cat.id)
                return next
              })
            }}>
              <label className="bf-preset-label" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={allExcluded}
                  ref={el => { if (el) el.indeterminate = someExcluded && !allExcluded }}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{t(cat.labelKey)}</span>
              </label>
              <span className="bf-count">{cat.blocks.length}</span>
              <button
                className={`bf-collapse-btn ${isCollapsed ? '' : 'expanded'}`}
                aria-label={isCollapsed ? 'expand' : 'collapse'}
              >
                &#9656;
              </button>
            </div>

            {!isCollapsed && (
              <div className="bf-preset-body">
                {cat.blocks.map(id => {
                  const b = blockMap.get(id)
                  return (
                    <label key={id} className="bf-block-row">
                      <input
                        type="checkbox"
                        checked={excluded.has(id)}
                        onChange={() => toggleBlock(id)}
                      />
                      {b && <span className="bf-color-swatch" style={{ background: rgbToCss(b.color) }} />}
                      <span className="bf-block-name">{b ? b.name : id.split(':')[1].replace(/_/g, ' ')}</span>
                      {b && <span className="bf-block-id">{b.id.split(':')[1]}</span>}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
