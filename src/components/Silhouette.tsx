'use client'
import { useMemo } from 'react'

interface SilhouetteProps {
  vpsScore: number
  sex?: 'M' | 'F'
  neuroIntensity?: number   // 0-100
  cardioIntensity?: number  // 0-100
  respIntensity?: number    // 0-100
  digestIntensity?: number  // 0-100
  renalIntensity?: number   // 0-100
  compact?: boolean
}

function intensityToColor(intensity: number): string {
  if (intensity >= 75) return '#FF4757'  // critical red
  if (intensity >= 50) return '#FFA502'  // warning amber
  if (intensity >= 25) return '#FFD93D'  // moderate yellow
  return '#2ED573'                        // stable green
}

function intensityToGlow(intensity: number): string {
  const c = intensityToColor(intensity)
  const a = Math.min(0.6, 0.15 + intensity * 0.005)
  return `drop-shadow(0 0 ${4 + intensity * 0.12}px ${c}) drop-shadow(0 0 ${2 + intensity * 0.06}px rgba(${c === '#FF4757' ? '255,71,87' : c === '#FFA502' ? '255,165,2' : c === '#FFD93D' ? '255,217,61' : '46,213,115'},${a}))`
}

// VPS severity level
function getLevel(score: number): { label: string; bodyGlow: string; breathDur: string } {
  if (score >= 70) return { label: 'S0 — CRITIQUE', bodyGlow: 'drop-shadow(0 0 16px rgba(255,71,87,0.4))', breathDur: '1.5s' }
  if (score >= 50) return { label: 'S1 — SÉVÈRE', bodyGlow: 'drop-shadow(0 0 12px rgba(255,165,2,0.35))', breathDur: '2.5s' }
  if (score >= 30) return { label: 'S2 — MODÉRÉ', bodyGlow: 'drop-shadow(0 0 8px rgba(255,217,61,0.3))', breathDur: '3.5s' }
  return { label: 'S3 — STABLE', bodyGlow: 'drop-shadow(0 0 6px rgba(46,213,115,0.25))', breathDur: '5s' }
}

export default function Silhouette({ vpsScore, sex = 'M', neuroIntensity = 0, cardioIntensity = 0, respIntensity = 0, digestIntensity = 0, renalIntensity = 0, compact = false }: SilhouetteProps) {
  const level = useMemo(() => getLevel(vpsScore), [vpsScore])
  const w = compact ? 140 : 200
  const h = compact ? 280 : 400
  const s = compact ? 0.7 : 1

  // Organ definitions: position (cx, cy relative to body center), radius, label
  const organs = useMemo(() => [
    { id: 'brain',   cx: 100, cy: 52,  rx: 22, ry: 18, intensity: neuroIntensity,  label: 'Cerveau',  icon: '🧠' },
    { id: 'lungs-l', cx: 78,  cy: 140, rx: 16, ry: 24, intensity: respIntensity,   label: 'Poumon G', icon: '🫁' },
    { id: 'lungs-r', cx: 122, cy: 140, rx: 16, ry: 24, intensity: respIntensity,   label: 'Poumon D', icon: '🫁' },
    { id: 'heart',   cx: 105, cy: 135, rx: 10, ry: 10, intensity: cardioIntensity,  label: 'Cœur',     icon: '❤️' },
    { id: 'stomach', cx: 100, cy: 185, rx: 18, ry: 15, intensity: digestIntensity,  label: 'Digestif', icon: '🟠' },
    { id: 'kidney-l',cx: 80,  cy: 190, rx: 8,  ry: 12, intensity: renalIntensity,  label: 'Rein G',   icon: '🫘' },
    { id: 'kidney-r',cx: 120, cy: 190, rx: 8,  ry: 12, intensity: renalIntensity,  label: 'Rein D',   icon: '🫘' },
  ], [neuroIntensity, respIntensity, cardioIntensity, digestIntensity, renalIntensity])

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* VPS Level Badge */}
      {!compact && (
        <div style={{
          marginBottom: '8px', padding: '3px 14px',
          borderRadius: 'var(--p-radius-full)',
          background: vpsScore >= 70 ? 'var(--p-critical-bg)' : vpsScore >= 50 ? 'var(--p-warning-bg)' : vpsScore >= 30 ? 'rgba(255,217,61,0.12)' : 'var(--p-success-bg)',
          color: vpsScore >= 70 ? 'var(--p-critical)' : vpsScore >= 50 ? 'var(--p-warning)' : vpsScore >= 30 ? '#FFD93D' : 'var(--p-success)',
          fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '10px', letterSpacing: '1px',
        }}>{level.label} · VPS {vpsScore}</div>
      )}

      <svg
        width={w} height={h} viewBox="0 0 200 400"
        style={{ filter: level.bodyGlow }}
        className="body-breathe"
      >
        <defs>
          {organs.map(o => (
            <radialGradient key={`g-${o.id}`} id={`grad-${o.id}`}>
              <stop offset="0%" stopColor={intensityToColor(o.intensity)} stopOpacity={0.9} />
              <stop offset="70%" stopColor={intensityToColor(o.intensity)} stopOpacity={0.3} />
              <stop offset="100%" stopColor={intensityToColor(o.intensity)} stopOpacity={0} />
            </radialGradient>
          ))}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--p-vps)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--p-pve)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Body Silhouette */}
        <g opacity="0.5" fill="url(#bodyGrad)" stroke="var(--p-gray-2)" strokeWidth="1">
          {/* Head */}
          <ellipse cx="100" cy="45" rx="28" ry="32" />
          {/* Neck */}
          <rect x="90" y="75" width="20" height="18" rx="4" />
          {/* Torso */}
          <path d="M65 93 Q60 93 58 100 L52 200 Q50 215 60 220 L80 225 L100 228 L120 225 L140 220 Q150 215 148 200 L142 100 Q140 93 135 93 Z" />
          {/* Arms */}
          <path d="M58 100 Q40 105 35 140 L30 200 Q28 210 34 212 L42 212 Q48 210 46 200 L50 150 Q52 130 55 115" opacity="0.7" />
          <path d="M142 100 Q160 105 165 140 L170 200 Q172 210 166 212 L158 212 Q152 210 154 200 L150 150 Q148 130 145 115" opacity="0.7" />
          {/* Legs */}
          <path d="M75 225 L68 310 Q66 330 72 340 L82 340 Q88 335 86 320 L92 240" opacity="0.7" />
          <path d="M125 225 L132 310 Q134 330 128 340 L118 340 Q112 335 114 320 L108 240" opacity="0.7" />
          {/* Feet */}
          <ellipse cx="75" cy="348" rx="14" ry="6" opacity="0.5" />
          <ellipse cx="125" cy="348" rx="14" ry="6" opacity="0.5" />
        </g>

        {/* Organ Glows */}
        {organs.map(o => (
          <g key={o.id}>
            {/* Outer glow */}
            <ellipse
              cx={o.cx} cy={o.cy} rx={o.rx * 1.5} ry={o.ry * 1.5}
              fill={`url(#grad-${o.id})`}
              opacity={0.3 + o.intensity * 0.006}
              style={{ filter: intensityToGlow(o.intensity) }}
              className={o.intensity >= 50 ? 'organ-glow' : ''}
            />
            {/* Core organ */}
            <ellipse
              cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry}
              fill={intensityToColor(o.intensity)}
              opacity={0.4 + o.intensity * 0.005}
              style={{
                filter: intensityToGlow(o.intensity),
                '--organ-color': intensityToColor(o.intensity),
              } as React.CSSProperties}
              className={o.id === 'heart' ? 'organ-pulse' : o.intensity >= 70 ? 'organ-glow' : ''}
            />
          </g>
        ))}

        {/* Spinal cord glow for neuro */}
        {neuroIntensity >= 40 && (
          <line x1="100" y1="70" x2="100" y2="220"
            stroke={intensityToColor(neuroIntensity)} strokeWidth="2" opacity="0.3"
            strokeDasharray="4 4" className="animate-breathe" />
        )}
      </svg>

      {/* Organ Legend (non-compact) */}
      {!compact && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px', maxWidth: `${w}px` }}>
          {[
            { label: 'Neuro', v: neuroIntensity },
            { label: 'Cardio', v: cardioIntensity },
            { label: 'Resp', v: respIntensity },
            { label: 'Digest', v: digestIntensity },
            { label: 'Rénal', v: renalIntensity },
          ].map(o => (
            <div key={o.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: intensityToColor(o.v) }} />
              <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{o.label} {o.v}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
