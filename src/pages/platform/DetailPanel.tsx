import { useMemo } from 'react'
import { CATEGORY_COLORS, nodeDetails, initialEdges, type NodeDetail } from './platformData'

interface DetailPanelProps {
  detail: NodeDetail | null
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  host:    'HOST',
  seed:    'SEED',
  backend: 'API',
  lib:     'LIB',
  infra:   'INFRA',
  aws:     'AWS',
}

// Edge label → color
const EDGE_COLORS: Record<string, string> = {
  'Module Federation': '#3b82f6',
  'iframe embed':      '#60a5fa',
  'REST API':          '#f97316',
  'GET /api/auth/me':  '#f97316',
  'npm import':        '#a855f7',
  'CI guard':          '#10b981',
  'bp update':         '#06b6d4',
  'docker push':       '#ff9900',
  'force-new-deployment': '#ff9900',
}

function edgeColor(label: string): string {
  return EDGE_COLORS[label] ?? '#475569'
}

interface Connection {
  nodeId:    string
  name:      string
  label:     string
  direction: 'out' | 'in'
  category:  string
}

function useConnections(nodeId: string): { out: Connection[]; in: Connection[] } {
  return useMemo(() => {
    const out: Connection[] = []
    const inn: Connection[] = []

    for (const edge of initialEdges) {
      if (edge.source === nodeId) {
        const target = nodeDetails[edge.target]
        if (target) out.push({
          nodeId: edge.target,
          name: target.name,
          label: String(edge.label ?? ''),
          direction: 'out',
          category: target.category,
        })
      }
      if (edge.target === nodeId) {
        const source = nodeDetails[edge.source]
        if (source) inn.push({
          nodeId: edge.source,
          name: source.name,
          label: String(edge.label ?? ''),
          direction: 'in',
          category: source.category,
        })
      }
    }
    return { out, in: inn }
  }, [nodeId])
}

function ConnectionRow({ conn }: { conn: Connection }) {
  const colors = CATEGORY_COLORS[conn.category as keyof typeof CATEGORY_COLORS]
  const color  = edgeColor(conn.label)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 0',
      borderBottom: '1px solid #0f172a',
    }}>
      {/* Direction arrow */}
      <span style={{ fontSize: 10, color, width: 14, textAlign: 'center', flexShrink: 0 }}>
        {conn.direction === 'out' ? '→' : '←'}
      </span>

      {/* Repo name */}
      <span style={{
        fontSize: 10, fontWeight: 500, color: colors?.text ?? '#94a3b8',
        fontFamily: "'IBM Plex Mono', monospace",
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {conn.name}
      </span>

      {/* Edge label badge */}
      <span style={{
        fontSize: 9, color, background: color + '14',
        border: `1px solid ${color}30`,
        borderRadius: 3, padding: '1px 6px',
        letterSpacing: '0.03em', flexShrink: 0,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {conn.label}
      </span>
    </div>
  )
}

export function DetailPanel({ detail, onClose }: DetailPanelProps) {
  const visible = detail !== null
  const colors  = detail ? CATEGORY_COLORS[detail.category] : CATEGORY_COLORS.host
  const conns   = useConnections(detail?.id ?? '')

  const allConnections = [...conns.out, ...conns.in]

  // Group by edge label for summary
  const byLabel = useMemo(() => {
    const map = new Map<string, Connection[]>()
    for (const c of allConnections) {
      const arr = map.get(c.label) ?? []
      arr.push(c)
      map.set(c.label, arr)
    }
    return map
  }, [allConnections])

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 360,
      background: 'linear-gradient(180deg, #080e1c 0%, #060a16 100%)',
      borderLeft: `1px solid ${visible ? colors.border + '50' : 'transparent'}`,
      transform: visible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 10, display: 'flex', flexDirection: 'column',
      fontFamily: "'IBM Plex Mono', monospace", overflow: 'hidden',
    }}>
      {detail && (
        <>
          {/* Header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: `1px solid ${colors.border}25`,
            background: `linear-gradient(135deg, ${colors.border}08, transparent)`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                  color: colors.text, background: colors.badge + '18',
                  border: `1px solid ${colors.badge}40`, borderRadius: 3,
                  padding: '2px 6px', display: 'inline-block', marginBottom: 8,
                }}>
                  {CATEGORY_LABELS[detail.category] ?? detail.category.toUpperCase()}
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  {detail.name}
                </div>
              </div>
              <button onClick={onClose} style={{
                background: 'none', border: '1px solid #1e293b', borderRadius: 4,
                color: '#64748b', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                padding: '4px 8px', marginTop: 4, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.border + '60'; e.currentTarget.style.color = '#94a3b8' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
              >✕</button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Description */}
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, margin: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {detail.description}
            </p>

            {/* Tech stack */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#334155', marginBottom: 8 }}>TECH STACK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {detail.tech.map(t => (
                  <span key={t} style={{
                    fontSize: 10, color: '#64748b', background: '#0f172a',
                    border: '1px solid #1e293b', borderRadius: 4, padding: '2px 8px',
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Connections map */}
            {allConnections.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#334155', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  CONEXIONES CON LA PLATAFORMA
                  <span style={{ fontSize: 9, color: '#1e293b', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '1px 6px' }}>
                    {allConnections.length}
                  </span>
                </div>

                {/* Summary badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                  {Array.from(byLabel.entries()).map(([label, items]) => (
                    <span key={label} style={{
                      fontSize: 9, color: edgeColor(label),
                      background: edgeColor(label) + '12',
                      border: `1px solid ${edgeColor(label)}25`,
                      borderRadius: 3, padding: '2px 7px',
                    }}>
                      {label} ×{items.length}
                    </span>
                  ))}
                </div>

                {/* Outgoing */}
                {conns.out.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.08em', marginBottom: 4 }}>
                      → SALE DE ESTE REPO
                    </div>
                    {conns.out.map((c, i) => <ConnectionRow key={i} conn={c} />)}
                  </div>
                )}

                {/* Incoming */}
                {conns.in.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.08em', marginBottom: 4 }}>
                      ← ENTRA A ESTE REPO
                    </div>
                    {conns.in.map((c, i) => <ConnectionRow key={i} conn={c} />)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer — links */}
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${colors.border}20`, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {detail.readme && (
              <a href={detail.readme} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 10,
                color: colors.text, textDecoration: 'none', padding: '8px 12px',
                border: `1px solid ${colors.border}50`, borderRadius: 6,
                transition: 'all 0.15s', background: colors.badge + '12',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.border + '90'; e.currentTarget.style.background = colors.badge + '20' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border + '50'; e.currentTarget.style.background = colors.badge + '12' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                README.md
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            )}

            {detail.github !== 'https://github.com/blanck1945' && (
              <a href={detail.github} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 10,
                color: '#64748b', textDecoration: 'none', padding: '7px 12px',
                border: '1px solid #1e293b', borderRadius: 6, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                {detail.github.replace('https://github.com/', 'github.com/')}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.4 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}
