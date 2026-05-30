import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type NodeMouseHandler,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  initialNodes, initialEdges, nodeDetails, CATEGORY_COLORS, SECTOR_COLORS,
  SECTORS, SECTOR_EXTERNAL_CONNECTIONS,
  type NodeDetail, type NodeCategory,
} from './platform/platformData'
import { PlatformNode } from './platform/PlatformNode'
import { SectorNode } from './platform/SectorNode'
import { OverviewNode } from './platform/OverviewNode'
import { ExternalRefNode } from './platform/ExternalRefNode'
import { DetailPanel } from './platform/DetailPanel'

// ─── Overview graph ───────────────────────────────────────────────────────────
function buildOverviewGraph(onDrillDown: (id: string) => void): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    { id: 'ov-ci',      type: 'overview', position: { x: 0,   y: 0   }, style: { width: 700, height: 120 }, data: { ...SECTORS.ci,      onDrillDown } },
    { id: 'ov-fr',      type: 'overview', position: { x: 0,   y: 160 }, style: { width: 460, height: 150 }, data: { ...SECTORS.fr,      onDrillDown } },
    { id: 'ov-libs',    type: 'overview', position: { x: 490, y: 160 }, style: { width: 210, height: 150 }, data: { ...SECTORS.libs,    onDrillDown } },
    { id: 'ov-backend', type: 'overview', position: { x: 0,   y: 350 }, style: { width: 340, height: 120 }, data: { ...SECTORS.backend, onDrillDown } },
    { id: 'ov-aws',     type: 'overview', position: { x: 0,   y: 520 }, style: { width: 700, height: 120 }, data: { ...SECTORS.aws,     onDrillDown } },
  ]
  return { nodes, edges: [] }
}

// ─── Detail graph for a sector ────────────────────────────────────────────────
function buildDetailGraph(sectorId: string): { nodes: Node[]; edges: Edge[] } {
  const sector     = SECTORS[sectorId]
  const sectorSet  = new Set(sector.nodeIds)
  const externals  = SECTOR_EXTERNAL_CONNECTIONS[sectorId] ?? []
  const externalSet = new Set(externals.map(e => e.nodeId))

  // Internal nodes from the full graph
  const internalNodes = initialNodes
    .filter(n => sectorSet.has(n.id))
    .map(n => ({ ...n }))

  // Re-layout internal nodes in a row centered in view
  const spacing = 240
  const startX = (internalNodes.length * spacing) / -2 + 60
  internalNodes.forEach((n, i) => {
    n.position = { x: startX + i * spacing, y: 100 }
  })

  // External reference nodes
  const extNodes: Node[] = externals.map((ext, i) => {
    const detail = nodeDetails[ext.nodeId]
    const sectorOfExt = Object.values(SECTORS).find(s => s.nodeIds.includes(ext.nodeId))
    return {
      id: `ext-${ext.nodeId}`,
      type: 'externalRef',
      position: { x: startX + i * 220, y: 350 },
      data: {
        name: detail?.name ?? ext.nodeId,
        category: (detail?.category ?? 'backend') as NodeCategory,
        sectorLabel: sectorOfExt?.label ?? '',
      },
    }
  })

  // Edges: internal → external
  const edges: Edge[] = []

  // Also carry over internal→internal edges from the full graph
  initialEdges.forEach(e => {
    const srcIn = sectorSet.has(e.source)
    const tgtIn = sectorSet.has(e.target)
    if (srcIn && tgtIn) edges.push({ ...e })
    else if (srcIn && externalSet.has(e.target)) {
      edges.push({ ...e, target: `ext-${e.target}` })
    } else if (tgtIn && externalSet.has(e.source)) {
      edges.push({ ...e, source: `ext-${e.source}` })
    }
  })

  return { nodes: [...internalNodes, ...extNodes], edges }
}

// ─── Node types ───────────────────────────────────────────────────────────────
const nodeTypes = {
  platform:    PlatformNode,
  sector:      SectorNode,
  overview:    OverviewNode,
  externalRef: ExternalRefNode,
}

const LEGEND = [
  { category: 'host',    label: 'Host' },
  { category: 'seed',    label: 'Seeds' },
  { category: 'backend', label: 'Backend' },
  { category: 'lib',     label: 'Libs' },
  { category: 'infra',   label: 'CI' },
  { category: 'aws',     label: 'AWS' },
] as const

// ─── Inner component (needs ReactFlowProvider) ────────────────────────────────
function PlatformMapInner() {
  const [selected,    setSelected]    = useState<NodeDetail | null>(null)
  const [activeSector, setActiveSector] = useState<string | null>(null)
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Build graph based on current view
  const { overviewNodes, overviewEdges } = useMemo(() => {
    const g = buildOverviewGraph((id) => setActiveSector(id))
    return { overviewNodes: g.nodes, overviewEdges: g.edges }
  }, [])

  const detailGraph = useMemo(
    () => activeSector ? buildDetailGraph(activeSector) : null,
    [activeSector]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(overviewNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(overviewEdges)

  // Switch graph when sector changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeSector && detailGraph) {
      setNodes(detailGraph.nodes)
      setEdges(detailGraph.edges)
    } else {
      setNodes(overviewNodes)
      setEdges(overviewEdges)
    }
    setTimeout(() => {
      setSelected(null)
      fitView({ padding: 0.2, duration: 400 })
    }, 50)
  }, [activeSector]) // intentional: only re-run on sector change

  const onNodeClick: NodeMouseHandler<Node> = useCallback((_evt, node) => {
    if (node.type === 'overview') return  // handled by OverviewNode's own onClick
    if (node.type === 'externalRef') return
    const detail = nodeDetails[node.id]
    if (detail) setSelected(prev => prev?.id === detail.id ? null : detail)
  }, [])

  const onPaneClick = useCallback(() => setSelected(null), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') zoomIn({ duration: 200 })
      if (e.key === '-')                   zoomOut({ duration: 200 })
      if (e.key === 'Escape')              { setActiveSector(null); setSelected(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoomIn, zoomOut])

  const currentSector = activeSector ? SECTORS[activeSector] : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050810', fontFamily: "'IBM Plex Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500&display=swap');
        .react-flow__controls { background: #080e1c !important; border: 1px solid #1e293b !important; }
        .react-flow__controls-button { background: #080e1c !important; border-bottom: 1px solid #1e293b !important; color: #64748b !important; fill: #64748b !important; }
        .react-flow__controls-button:hover { background: #0f172a !important; fill: #94a3b8 !important; }
        .react-flow__attribution { display: none; }
      `}</style>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 48,
        background: 'linear-gradient(180deg, #080e1c 0%, #06091480 100%)',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
        zIndex: 5, backdropFilter: 'blur(8px)',
      }}>
        {/* Breadcrumb */}
        <span
          onClick={() => { setActiveSector(null); setSelected(null) }}
          style={{
            fontSize: 11, color: activeSector ? '#475569' : '#94a3b8',
            cursor: activeSector ? 'pointer' : 'default',
            letterSpacing: '0.06em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => activeSector && (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => activeSector && (e.currentTarget.style.color = '#475569')}
        >
          BOOGIEPOP · Platform Map
        </span>

        {currentSector && (
          <>
            <span style={{ color: '#1e293b', fontSize: 14 }}>›</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: currentSector.color, letterSpacing: '0.06em' }}>
              {currentSector.label.toUpperCase()}
            </span>
            <button
              onClick={() => { setActiveSector(null); setSelected(null) }}
              style={{
                marginLeft: 4, background: 'none', border: '1px solid #1e293b',
                borderRadius: 4, color: '#475569', cursor: 'pointer',
                fontSize: 10, padding: '3px 8px', letterSpacing: '0.06em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#475569' }}
            >
              ← OVERVIEW
            </button>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          {!activeSector && ([
            { color: SECTOR_COLORS.ci,      label: 'CI / GitHub' },
            { color: SECTOR_COLORS.fr,      label: 'Frontend' },
            { color: SECTOR_COLORS.libs,    label: 'Libs' },
            { color: SECTOR_COLORS.backend, label: 'Backend' },
            { color: SECTOR_COLORS.aws,     label: 'AWS' },
          ] as const).map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 1, background: color + '60' }} />
              <span style={{ fontSize: 10, color: color + '80' }}>{label}</span>
            </div>
          ))}

          {activeSector && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {LEGEND.map(({ category, label }) => (
                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[category].badge + '80' }} />
                  <span style={{ fontSize: 10, color: '#475569' }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        position: 'absolute', inset: 0, paddingTop: 48,
        paddingRight: selected ? 360 : 0,
        transition: 'padding-right 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1a2744" />
          <Controls position="bottom-left" />
        </ReactFlow>
      </div>

      {/* Detail Panel */}
      <DetailPanel detail={selected} onClose={() => setSelected(null)} />

      {/* Hint */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, color: '#1e293b', letterSpacing: '0.08em',
        pointerEvents: 'none', zIndex: 5, whiteSpace: 'nowrap',
      }}>
        {activeSector ? 'CLICK REPO · ESC OVERVIEW · + / − ZOOM' : 'CLICK SECTOR PARA EXPLORAR · + / − ZOOM'}
      </div>
    </div>
  )
}

export function PlatformMap() {
  return (
    <ReactFlowProvider>
      <PlatformMapInner />
    </ReactFlowProvider>
  )
}
