import { memo } from 'react'

interface SectorNodeProps {
  data: { label: string; sublabel: string; color: string }
}

export const SectorNode = memo(({ data }: SectorNodeProps) => (
  <div style={{
    width: '100%',
    height: '100%',
    borderRadius: 12,
    border: `1px solid ${data.color}18`,
    background: `linear-gradient(135deg, ${data.color}06 0%, ${data.color}03 100%)`,
    pointerEvents: 'none',
  }}>
    <div style={{
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.14em',
        color: data.color + 'aa',
        textTransform: 'uppercase' as const,
      }}>
        {data.label}
      </span>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        color: data.color + '44',
        letterSpacing: '0.06em',
      }}>
        {data.sublabel}
      </span>
    </div>
  </div>
))

SectorNode.displayName = 'SectorNode'
