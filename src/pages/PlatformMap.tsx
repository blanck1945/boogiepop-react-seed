import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { initialNodes, initialEdges, nodeDetails, CATEGORY_COLORS, SECTOR_COLORS, type NodeDetail } from './platform/platformData'
import { PlatformNode } from './platform/PlatformNode'
import { SectorNode } from './platform/SectorNode'
import { DetailPanel } from './platform/DetailPanel'

const nodeTypes = { platform: PlatformNode, sector: SectorNode }

const LEGEND = [
  { category: 'host',    label: 'Host' },
  { category: 'seed',    label: 'Seeds' },
  { category: 'backend', label: 'Backend' },
  { category: 'lib',     label: 'Libs' },
  { category: 'infra',   label: 'Infra / CI' },
] as const

export function PlatformMap() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [selected, setSelected] = useState<NodeDetail | null>(null)

  const onNodeClick: NodeMouseHandler<Node> = useCallback((_evt, node) => {
    const detail = nodeDetails[node.id]
    if (detail) setSelected(prev => prev?.id === detail.id ? null : detail)
  }, [])

  const onPaneClick = useCallback(() => setSelected(null), [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050810',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap');
        .react-flow__controls { background: #080e1c !important; border: 1px solid #1e293b !important; }
        .react-flow__controls-button { background: #080e1c !important; border-bottom: 1px solid #1e293b !important; color: #64748b !important; fill: #64748b !important; }
        .react-flow__controls-button:hover { background: #0f172a !important; color: #94a3b8 !important; fill: #94a3b8 !important; }
        .react-flow__minimap { background: #080e1c !important; border: 1px solid #1e293b !important; }
        .react-flow__edge-label { font-family: 'IBM Plex Mono', monospace !important; }
        .react-flow__attribution { display: none; }
      `}</style>

      {/* Top bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 48,
        background: 'linear-gradient(180deg, #080e1c 0%, #060a1480 100%)',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        zIndex: 5,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontSize: 11, color: '#475569', letterSpacing: '0.08em' }}>
          BOOGIEPOP
        </span>
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: '-0.01em' }}>
          Platform Map
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Sector labels */}
          {([
            { color: SECTOR_COLORS.ci,      label: 'CI / GitHub' },
            { color: SECTOR_COLORS.fr,      label: 'Frontend Remotes' },
            { color: SECTOR_COLORS.backend, label: 'Backend & Libs' },
            { color: SECTOR_COLORS.aws,     label: 'AWS' },
          ] as const).map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 1, background: color + '66' }} />
              <span style={{ fontSize: 10, color: color + '88', letterSpacing: '0.06em' }}>{label}</span>
            </div>
          ))}

          <div style={{ width: 1, height: 16, background: '#1e293b' }} />

          {/* Node type legend */}
          {LEGEND.map(({ category, label }) => (
            <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: CATEGORY_COLORS[category].badge,
                boxShadow: `0 0 6px ${CATEGORY_COLORS[category].glow}`,
              }} />
              <span style={{ fontSize: 10, color: '#475569', letterSpacing: '0.05em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* React Flow canvas */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: 48, paddingRight: selected ? 360 : 0, transition: 'padding-right 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1a2744"
          />
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              const detail = nodeDetails[node.id]
              return detail ? CATEGORY_COLORS[detail.category].badge + '80' : '#1e293b'
            }}
            maskColor="#050810cc"
          />
        </ReactFlow>
      </div>

      {/* Detail Panel */}
      <DetailPanel detail={selected} onClose={() => setSelected(null)} />

      {/* Hint */}
      {!selected && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10,
          color: '#334155',
          letterSpacing: '0.08em',
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          CLICK EN UN NODO PARA VER DETALLES
        </div>
      )}
    </div>
  )
}
