import { CATEGORY_COLORS, type NodeDetail } from './platformData'

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
}

export function DetailPanel({ detail, onClose }: DetailPanelProps) {
  const visible = detail !== null
  const colors = detail ? CATEGORY_COLORS[detail.category] : CATEGORY_COLORS.host

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 360,
      background: 'linear-gradient(180deg, #080e1c 0%, #060a16 100%)',
      borderLeft: `1px solid ${visible ? colors.border + '50' : 'transparent'}`,
      transform: visible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'IBM Plex Mono', monospace",
      overflow: 'hidden',
    }}>
      {detail && (
        <>
          {/* Header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: `1px solid ${colors.border}25`,
            background: `linear-gradient(135deg, ${colors.border}08, transparent)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: colors.text,
                  background: colors.badge + '18',
                  border: `1px solid ${colors.badge}40`,
                  borderRadius: 3,
                  padding: '2px 6px',
                  display: 'inline-block',
                  marginBottom: 8,
                }}>
                  {CATEGORY_LABELS[detail.category]}
                </span>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#f1f5f9',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                }}>
                  {detail.name}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid #1e293b',
                  borderRadius: 4,
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: '4px 8px',
                  marginTop: 4,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = colors.border + '60'
                  e.currentTarget.style.color = '#94a3b8'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e293b'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Description */}
            <p style={{
              fontSize: 11,
              color: '#94a3b8',
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              {detail.description}
            </p>

            {/* Tech stack */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 8 }}>
                TECH STACK
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {detail.tech.map(t => (
                  <span key={t} style={{
                    fontSize: 10,
                    color: '#64748b',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 4,
                    padding: '2px 8px',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Relationships */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 8 }}>
                RELACIONES
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {detail.relationships.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: colors.text, fontSize: 10, marginTop: 1, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer — links */}
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${colors.border}20`, display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* README link */}
            {detail.readme && (
              <a
                href={detail.readme}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 10, color: colors.text, textDecoration: 'none',
                  padding: '8px 12px',
                  border: `1px solid ${colors.border}50`,
                  borderRadius: 6, transition: 'all 0.15s',
                  background: colors.badge + '12',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = colors.border + '90'
                  e.currentTarget.style.background = colors.badge + '20'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.border + '50'
                  e.currentTarget.style.background = colors.badge + '12'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                README.md
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            )}

            {/* GitHub repo link */}
            {detail.github !== 'https://github.com/blanck1945' && (
              <a
                href={detail.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 10, color: '#64748b', textDecoration: 'none',
                  padding: '7px 12px',
                  border: '1px solid #1e293b',
                  borderRadius: 6, transition: 'all 0.15s',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#334155'
                  e.currentTarget.style.color = '#94a3b8'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e293b'
                  e.currentTarget.style.color = '#64748b'
                }}
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
