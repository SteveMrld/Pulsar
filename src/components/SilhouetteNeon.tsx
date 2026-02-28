'use client'

interface VitalOverlay {
  label: string
  icon: string
  value: string
  color: string
  severity: number // 0=ok, 1=warning, 2=critical
  top?: string // CSS position (optional)
}

interface SilhouetteNeonProps {
  sex: 'M' | 'F'
  vitals: VitalOverlay[]
  vpsScore: number
  compact?: boolean
}

function SeverityDots({ severity }: { severity: number }) {
  const colors = severity >= 2
    ? ['var(--p-critical)', 'var(--p-critical)', 'var(--p-critical)']
    : severity >= 1
    ? ['var(--p-warning)', 'var(--p-warning)', 'var(--p-dark-4)']
    : ['var(--p-success)', 'var(--p-dark-4)', 'var(--p-dark-4)']

  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {colors.map((c, i) => (
        <div key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%', background: c,
          boxShadow: c !== 'var(--p-dark-4)' ? `0 0 4px ${c}` : 'none',
        }} />
      ))}
    </div>
  )
}

export default function SilhouetteNeon({ sex, vitals, vpsScore, compact = false }: SilhouetteNeonProps) {
  const img = sex === 'F' ? '/assets/silhouette-girl.jpg' : '/assets/silhouette-boy.jpg'
  const h = compact ? 320 : 420
  const level = vpsScore >= 70 ? 'CRITIQUE' : vpsScore >= 50 ? 'SÉVÈRE' : vpsScore >= 30 ? 'MODÉRÉ' : 'STABLE'
  const levelColor = vpsScore >= 70 ? 'var(--p-critical)' : vpsScore >= 50 ? 'var(--p-warning)' : vpsScore >= 30 ? 'var(--p-tpe)' : 'var(--p-success)'

  return (
    <div className="glass-card" style={{
      position: 'relative', borderRadius: 'var(--p-radius-2xl)',
      overflow: 'hidden', padding: 0, height: `${h}px`,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(108,124,255,0.08)', position: 'relative', zIndex: 2,
      }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1.5px' }}>
          PULSAR — VISUAL PHYSIOLOGY
        </div>
        <div style={{
          padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
          background: `${levelColor}20`, border: `1px solid ${levelColor}40`,
          fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: levelColor,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: levelColor,
            boxShadow: `0 0 6px ${levelColor}`, animation: vpsScore >= 50 ? 'breathe 1.5s ease-in-out infinite' : undefined }} />
          {level}
        </div>
      </div>

      {/* Content: Image + Overlays */}
      <div style={{ display: 'flex', height: `${h - 44}px`, position: 'relative' }}>
        {/* Silhouette image */}
        <div style={{ flex: compact ? '0 0 55%' : '0 0 50%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={img}
            alt={`Silhouette ${sex === 'F' ? 'fille' : 'garçon'}`}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
              filter: `brightness(${vpsScore >= 70 ? 1.1 : 0.95}) saturate(${vpsScore >= 50 ? 1.3 : 1})`,
              animation: 'vpsBreath 4s ease-in-out infinite',
            }}
          />
          {/* Gradient fade on right edge */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%',
            background: 'linear-gradient(to right, transparent, rgba(14,14,22,0.8))',
          }} />
        </div>

        {/* Vital data overlays */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: compact ? '6px' : '8px',
          padding: compact ? '8px' : '12px', position: 'relative', zIndex: 2,
        }}>
          {vitals.map((v, i) => (
            <div key={i} className="animate-in" style={{
              padding: compact ? '6px 8px' : '8px 12px',
              borderRadius: 'var(--p-radius-md)',
              background: `${v.color}08`,
              borderLeft: `2px solid ${v.color}`,
              animationDelay: `${i * 80}ms`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: compact ? '9px' : '10px', fontWeight: 700, color: v.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{v.icon}</span> {v.label}
                </span>
                <SeverityDots severity={v.severity} />
              </div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: compact ? '10px' : '11px', color: 'var(--p-text-muted)' }}>
                {v.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
