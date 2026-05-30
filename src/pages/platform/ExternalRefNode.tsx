import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { CATEGORY_COLORS, type NodeCategory } from './platformData'

interface ExternalRefNodeProps {
  data: { name: string; category: NodeCategory; sectorLabel: string }
}

export const ExternalRefNode = memo(({ data }: ExternalRefNodeProps) => {
  const colors = CATEGORY_COLORS[data.category]

  return (
    <div style={{
      padding: '7px 12px',
      borderRadius: 6,
      border: `1px dashed ${colors.border}40`,
      background: '#080e1c',
      fontFamily: "'IBM Plex Mono', monospace",
      opacity: 0.65,
      minWidth: 150,
    }}>
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{ fontSize: 8, color: '#334155', letterSpacing: '0.1em', marginBottom: 3 }}>
        ↗ {data.sectorLabel.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
        {data.name}
      </div>
    </div>
  )
})

ExternalRefNode.displayName = 'ExternalRefNode'
