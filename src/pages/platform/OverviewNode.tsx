import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
interface OverviewNodeProps {
  data: {
    id: string
    label: string
    sublabel: string
    repos: string[]
    color: string
  }
}

const SECTOR_ICONS: Record<string, string> = {
  ci:      '⬡',
  fr:      '◈',
  libs:    '◎',
  backend: '▣',
  aws:     '▲',
}

export const OverviewNode = memo(({ data }: OverviewNodeProps) => {
  const icon = SECTOR_ICONS[data.id] ?? '◉'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        border: `1px solid ${data.color}30`,
        background: `linear-gradient(135deg, ${data.color}0c 0%, ${data.color}05 100%)`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 28px',
        gap: 8,
        fontFamily: "'IBM Plex Mono', monospace",
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.border = `1px solid ${data.color}70`
        el.style.background = `linear-gradient(135deg, ${data.color}18 0%, ${data.color}0a 100%)`
        el.style.boxShadow = `0 0 32px ${data.color}20, inset 0 0 32px ${data.color}06`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.border = `1px solid ${data.color}30`
        el.style.background = `linear-gradient(135deg, ${data.color}0c 0%, ${data.color}05 100%)`
        el.style.boxShadow = 'none'
      }}
    >
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* Decorative corner accent */}
      <div style={{
        position: 'absolute', top: 12, right: 16,
        fontSize: 28, color: data.color + '18', lineHeight: 1,
        fontFamily: 'monospace',
      }}>
        {icon}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: data.color + 'cc',
          textTransform: 'uppercase' as const,
        }}>
          {data.label}
        </span>
        <span style={{
          fontSize: 9,
          color: data.color + '50',
          background: data.color + '12',
          border: `1px solid ${data.color}25`,
          borderRadius: 3,
          padding: '1px 6px',
          letterSpacing: '0.05em',
        }}>
          {data.repos.length} {data.repos.length === 1 ? 'repo' : 'repos'}
        </span>
      </div>

      <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.04em', lineHeight: 1.5 }}>
        {data.sublabel}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}>
        {data.repos.map(r => (
          <span key={r} style={{
            fontSize: 9,
            color: data.color + '70',
            background: data.color + '0a',
            border: `1px solid ${data.color}1a`,
            borderRadius: 3,
            padding: '1px 6px',
            letterSpacing: '0.03em',
          }}>
            {r}
          </span>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 10, right: 14,
        fontSize: 9, color: data.color + '50',
        letterSpacing: '0.08em',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        EXPLORAR
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  )
})

OverviewNode.displayName = 'OverviewNode'
