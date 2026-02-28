'use client'
import { useEffect, useRef, useState } from 'react'

/* ══════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════ */
interface VitalOverlay {
  label: string; icon: string; value: string; color: string
  severity: number
}

interface SilhouetteNeonProps {
  sex: 'M' | 'F'; vitals: VitalOverlay[]; vpsScore: number; compact?: boolean
}

/* ══════════════════════════════════════════════════════════════
   ORGAN HOTSPOT POSITIONS (% of silhouette)
   ══════════════════════════════════════════════════════════════ */
const ORGAN_SPOTS: Record<string, { x: number; y: number }> = {
  NEURO:  { x: 50, y: 10 },
  CARDIO: { x: 46, y: 35 },
  RESP:   { x: 54, y: 30 },
  INFLAM: { x: 50, y: 50 },
  TEMP:   { x: 50, y: 18 },
}

/* ══════════════════════════════════════════════════════════════
   VPS ARC GAUGE
   ══════════════════════════════════════════════════════════════ */
function VPSGauge({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(score, 100) / 100) * c * 0.75
  const color = score >= 70 ? '#FF4757' : score >= 50 ? '#FFA502' : score >= 30 ? '#FFB347' : '#2ED573'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-225deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(108,124,255,0.06)" strokeWidth="4"
        strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeLinecap="round" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}60)` }} />
      <g transform={`rotate(225, ${size / 2}, ${size / 2})`}>
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="14" fontWeight="900" fontFamily="var(--p-font-mono)">{score}</text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle"
          fill="rgba(180,180,200,0.35)" fontSize="6" fontFamily="var(--p-font-mono)" letterSpacing="1">VPS</text>
      </g>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   HOTSPOT — pulsing organ dot
   ══════════════════════════════════════════════════════════════ */
function Hotspot({ x, y, color, severity, active, onClick }: {
  x: number; y: number; color: string; severity: number; active: boolean; onClick: () => void
}) {
  const sz = severity >= 2 ? 10 : severity >= 1 ? 8 : 6
  return (
    <div onClick={onClick} style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 4,
    }}>
      {severity >= 1 && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${sz + 12}px`, height: `${sz + 12}px`, borderRadius: '50%',
          border: `1.5px solid ${color}40`,
          animation: 'hsPulse 2s ease-in-out infinite',
        }} />
      )}
      <div style={{
        width: `${sz}px`, height: `${sz}px`, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${severity >= 2 ? 12 : 6}px ${color}${severity >= 2 ? '80' : '50'}`,
        border: active ? '2px solid var(--p-white)' : 'none',
        transition: 'all 0.3s',
      }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   NEURAL PARTICLES — Canvas flow along body
   ══════════════════════════════════════════════════════════════ */
function NeuralParticles({ w, h, intensity, color }: { w: number; h: number; intensity: number; color: string }) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; life: number; max: number; sz: number }[]>([])

  useEffect(() => {
    const c = cvs.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let id: number
    const n = Math.floor(intensity / 4) + 8

    parts.current = Array.from({ length: n }, () => ({
      x: w * (0.3 + Math.random() * 0.4),
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.6,
      life: Math.random() * 100,
      max: 80 + Math.random() * 60,
      sz: 1 + Math.random() * 1.5,
    }))

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      c.width = w * dpr; c.height = h * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      for (const p of parts.current) {
        p.x += p.vx; p.y += p.vy; p.life++
        if (p.life > p.max || p.y < -5 || p.x < 0 || p.x > w) {
          p.x = w * (0.3 + Math.random() * 0.4)
          p.y = h * 0.85 + Math.random() * h * 0.15
          p.life = 0
        }
        const a = (1 - p.life / p.max) * 0.6
        ctx.globalAlpha = a
        ctx.fillStyle = color
        ctx.shadowColor = color; ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [w, h, intensity, color])

  return <canvas ref={cvs} style={{ position: 'absolute', inset: 0, width: w, height: h, pointerEvents: 'none', zIndex: 3, opacity: 0.7 }} />
}

/* ══════════════════════════════════════════════════════════════
   SEVERITY DOTS
   ══════════════════════════════════════════════════════════════ */
function SeverityDots({ severity }: { severity: number }) {
  const cs = severity >= 2
    ? ['var(--p-critical)', 'var(--p-critical)', 'var(--p-critical)']
    : severity >= 1 ? ['var(--p-warning)', 'var(--p-warning)', 'var(--p-dark-4)']
    : ['var(--p-success)', 'var(--p-dark-4)', 'var(--p-dark-4)']
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {cs.map((c, i) => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c,
          boxShadow: c !== 'var(--p-dark-4)' ? `0 0 4px ${c}` : 'none' }} />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SILHOUETTE NEON V2 — MAIN
   ══════════════════════════════════════════════════════════════ */
export default function SilhouetteNeon({ sex, vitals, vpsScore, compact = false }: SilhouetteNeonProps) {
  const img = sex === 'F' ? '/silhouette-girl.jpg' : '/silhouette-boy.jpg'
  const h = compact ? 340 : 440
  const [active, setActive] = useState<string | null>(null)

  const levelColor = vpsScore >= 70 ? '#FF4757' : vpsScore >= 50 ? '#FFA502' : vpsScore >= 30 ? '#FFB347' : '#2ED573'
  const level = vpsScore >= 70 ? 'CRITIQUE' : vpsScore >= 50 ? 'SÉVÈRE' : vpsScore >= 30 ? 'MODÉRÉ' : 'STABLE'
  const maxSev = Math.max(...vitals.map(v => v.severity), 0)
  const partColor = maxSev >= 2 ? '#FF4757' : maxSev >= 1 ? '#FFA502' : '#6C7CFF'

  return (
    <div className="glass-card" style={{
      position: 'relative', borderRadius: 'var(--p-radius-2xl)',
      overflow: 'hidden', padding: 0, height: `${h}px`,
    }}>
      <style>{`@keyframes hsPulse { 0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.6 } 50% { transform:translate(-50%,-50%) scale(1.8); opacity:0 } }`}</style>

      {/* ── Header ── */}
      <div style={{
        padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(108,124,255,0.08)', position: 'relative', zIndex: 5,
        background: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VPSGauge score={vpsScore} size={compact ? 44 : 52} />
          <div>
            <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>VISUAL PHYSIOLOGY</div>
            <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: levelColor }}>{level}</div>
          </div>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
          background: `${levelColor}12`, border: `1px solid ${levelColor}30`,
          fontSize: '8px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: levelColor,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <div className={maxSev >= 2 ? 'dot-critical' : 'dot-alive'} style={{
            width: 5, height: 5, background: levelColor, boxShadow: `0 0 6px ${levelColor}`,
          }} />
          {maxSev >= 2 ? 'ALERTE' : maxSev >= 1 ? 'VIGILANCE' : 'STABLE'}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', height: `${h - 52}px`, position: 'relative' }}>

        {/* Silhouette + hotspots + particles */}
        <div style={{ flex: compact ? '0 0 50%' : '0 0 48%', position: 'relative', overflow: 'hidden' }}>
          <img src={img} alt={`Silhouette ${sex === 'F' ? 'fille' : 'garçon'}`}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
              filter: `brightness(${vpsScore >= 70 ? 1.1 : 0.9}) saturate(${vpsScore >= 50 ? 1.3 : 1})`,
              transition: 'filter 0.6s',
            }} />

          <NeuralParticles w={compact ? 160 : 180} h={h - 52} intensity={vpsScore} color={partColor} />

          {vitals.map((v) => {
            const spot = ORGAN_SPOTS[v.label]
            if (!spot) return null
            return <Hotspot key={v.label} x={spot.x} y={spot.y} color={v.color} severity={v.severity}
              active={active === v.label} onClick={() => setActive(active === v.label ? null : v.label)} />
          })}

          {/* Fade right */}
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%',
            background: 'linear-gradient(to right, transparent, rgba(14,14,22,0.85))', zIndex: 2 }} />
        </div>

        {/* Vital cards */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: compact ? '5px' : '7px',
          padding: compact ? '8px' : '12px', position: 'relative', zIndex: 5,
        }}>
          {vitals.map((v, i) => {
            const isAct = active === v.label
            return (
              <div key={i} onClick={() => setActive(isAct ? null : v.label)} style={{
                padding: compact ? '7px 10px' : '9px 12px',
                borderRadius: '10px',
                background: isAct ? `${v.color}12` : `${v.color}06`,
                borderLeft: `3px solid ${v.severity >= 2 ? '#FF4757' : v.color}`,
                cursor: 'pointer',
                transform: isAct ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isAct ? `0 0 16px ${v.color}15` : 'none',
                transition: 'all 0.25s var(--p-ease)',
                position: 'relative', overflow: 'hidden',
              }}>
                {isAct && <div style={{
                  position: 'absolute', left: -3, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: '60%', borderRadius: 2,
                  background: `linear-gradient(to bottom, transparent, ${v.color}, transparent)`,
                  boxShadow: `0 0 8px ${v.color}60`,
                }} />}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, color: v.color,
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: 'var(--p-font-mono)', letterSpacing: '0.5px' }}>
                    <span style={{ fontSize: 12 }}>{v.icon}</span> {v.label}
                  </span>
                  <SeverityDots severity={v.severity} />
                </div>

                <div style={{
                  fontFamily: 'var(--p-font-mono)', fontSize: compact ? 11 : 12,
                  color: v.severity >= 2 ? '#FF4757' : v.severity >= 1 ? '#FFA502' : 'var(--p-text-muted)',
                  fontWeight: v.severity >= 1 ? 700 : 500,
                  textShadow: v.severity >= 2 ? '0 0 8px rgba(255,71,87,0.3)' : 'none',
                }}>{v.value}</div>

                {v.severity >= 1 && (
                  <div style={{ marginTop: 4, height: 2, borderRadius: 1, background: 'rgba(108,124,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 1,
                      width: v.severity >= 2 ? '100%' : '60%',
                      background: v.severity >= 2 ? '#FF4757' : '#FFA502',
                      boxShadow: `0 0 6px ${v.severity >= 2 ? 'rgba(255,71,87,0.5)' : 'rgba(255,165,2,0.5)'}`,
                      transition: 'width 0.6s var(--p-ease)',
                    }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
