import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { CATEGORY_COLORS, type NodeDetail } from './platformData'

interface PlatformNodeProps {
  data: { detail: NodeDetail }
  selected: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  host:    'HOST',
  seed:    'SEED',
  backend: 'API',
  lib:     'LIB',
  infra:   'INFRA',
}

export const PlatformNode = memo(({ data, selected }: PlatformNodeProps) => {
  const { detail } = data
  const colors = CATEGORY_COLORS[detail.category]

  return (
    <div
      style={{
        background: selected
          ? `linear-gradient(135deg, #0d1526 0%, #111827 100%)`
          : `linear-gradient(135deg, #080e1c 0%, #0d1220 100%)`,
        border: `1px solid ${selected ? colors.border : colors.border + '80'}`,
        borderRadius: 8,
        padding: '10px 14px',
        minWidth: 180,
        maxWidth: 200,
        boxShadow: selected
          ? `0 0 0 1px ${colors.border}, 0 0 20px ${colors.glow}, 0 4px 24px rgba(0,0,0,0.6)`
          : `0 0 12px ${colors.glow}40, 0 2px 8px rgba(0,0,0,0.5)`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: colors.badge,
          background: colors.badge + '18',
          border: `1px solid ${colors.badge}40`,
          borderRadius: 3,
          padding: '1px 5px',
          lineHeight: 1.6,
        }}>
          {CATEGORY_LABELS[detail.category]}
        </span>
      </div>

      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: selected ? '#f1f5f9' : '#cbd5e1',
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      }}>
        {detail.name}
      </div>
    </div>
  )
})

PlatformNode.displayName = 'PlatformNode'
