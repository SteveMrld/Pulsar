'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'

/* ══════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════ */
interface VitalSign {
  label: string; value: string; unit: string; color: string; icon: string
  severity: 0 | 1 | 2; waveform?: 'ecg' | 'spo2' | 'resp' | 'flat'
  numericValue?: number; range?: [number, number]
}

interface BrainMonitorProps {
  patientName: string; age: string; syndrome: string; hospDay: number
  gcs: number; seizuresPerHour: number; vpsScore: number
  vitals: VitalSign[]
  eegStatus: 'normal' | 'slowing' | 'seizure' | 'burst_suppression' | 'suppressed'
  eegBackground: string; ncsePossible: boolean; compact?: boolean
}

/* ══════════════════════════════════════════════════════════════
   WAVEFORM GENERATORS
   ══════════════════════════════════════════════════════════════ */
function genEEG(status: string, len: number, seed: number): number[] {
  const d: number[] = []
  const s = seed * 1000
  for (let i = 0; i < len; i++) {
    const t = (i + s) / len
    let v = 0
    switch (status) {
      case 'normal':
        v = Math.sin(t * 28 + seed) * 0.25 + Math.sin(t * 55 + seed * 2) * 0.12
          + Math.sin(t * 90 + seed * 3) * 0.06 + (Math.random() - 0.5) * 0.08
        break
      case 'slowing':
        v = Math.sin(t * 8 + seed) * 0.55 + Math.sin(t * 4 + seed * 2) * 0.35
          + Math.sin(t * 16 + seed) * 0.1 + (Math.random() - 0.5) * 0.1
        break
      case 'seizure':
        v = Math.sin(t * 70 + Math.sin(t * 6 + seed) * 4) * 0.75
          + Math.sin(t * 130 + seed * 3) * 0.35
          + Math.sin(t * 200 + seed * 5) * 0.15
          + (Math.random() - 0.5) * 0.25
        break
      case 'burst_suppression': {
        const bp = ((t * 3 + seed * 0.3) % 1)
        v = bp < 0.25
          ? (Math.sin(t * 90 + seed) * 0.65 + (Math.random() - 0.5) * 0.4)
          : (Math.random() - 0.5) * 0.03
        break
      }
      case 'suppressed':
        v = (Math.random() - 0.5) * 0.04 + Math.sin(t * 2) * 0.01
        break
    }
    d.push(v)
  }
  return d
}

function genECG(hr: number, len: number): number[] {
  const d: number[] = []
  const beatLen = len / (hr / 60 * 3)
  for (let i = 0; i < len; i++) {
    const ph = (i % beatLen) / beatLen
    let v = 0
    if (ph < 0.02) v = 0
    else if (ph < 0.04) v = -0.08
    else if (ph < 0.055) v = -0.15
    else if (ph < 0.08) v = 1.0
    else if (ph < 0.11) v = -0.25
    else if (ph < 0.14) v = 0.02
    else if (ph < 0.3) v = 0.18 * Math.sin((ph - 0.14) / 0.16 * Math.PI)
    else v = 0
    d.push(v + (Math.random() - 0.5) * 0.015)
  }
  return d
}

function genSpO2(len: number): number[] {
  const d: number[] = []
  for (let i = 0; i < len; i++) {
    const ph = ((i / len) * 8) % 1
    let v = 0
    if (ph < 0.12) v = Math.pow(Math.sin(ph / 0.12 * Math.PI * 0.5), 1.5) * 0.7
    else if (ph < 0.25) v = 0.7 * Math.exp(-(ph - 0.12) * 12)
    else if (ph < 0.45) v = 0.08 + 0.15 * Math.sin((ph - 0.25) / 0.2 * Math.PI)
    else v = 0.02 * Math.sin(ph * 10)
    d.push(v + (Math.random() - 0.5) * 0.01)
  }
  return d
}

function genResp(len: number): number[] {
  const d: number[] = []
  for (let i = 0; i < len; i++) {
    const t = i / len
    d.push(Math.sin(t * 12) * 0.4 + Math.sin(t * 24) * 0.1 + (Math.random() - 0.5) * 0.05)
  }
  return d
}

/* ══════════════════════════════════════════════════════════════
   ANIMATED CANVAS TRACE — Enhanced glow & sweep
   ══════════════════════════════════════════════════════════════ */
function Trace({ data, color, w, h, alert: isAlert, speed = 1.3, thick }: {
  data: number[]; color: string; w: number; h: number; alert?: boolean; speed?: number; thick?: boolean
}) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const off = useRef(0)
  const buf = useRef(data)
  useEffect(() => { buf.current = data }, [data])

  useEffect(() => {
    const c = cvs.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let id: number

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      c.width = w * dpr; c.height = h * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      /* Grid — oscilloscope */
      ctx.strokeStyle = 'rgba(46,213,115,0.03)'
      ctx.lineWidth = 0.5
      for (let y = h / 4; y < h; y += h / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      for (let x = w / 10; x < w; x += w / 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }

      /* Center baseline */
      ctx.strokeStyle = 'rgba(108,124,255,0.04)'
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()

      const b = buf.current, step = w / b.length, mid = h / 2, amp = h * 0.42
      const tc = isAlert ? '#FF4757' : color
      const sweepIdx = Math.floor(off.current) % b.length

      /* Glow layer (wider, dimmer) */
      ctx.save()
      ctx.shadowColor = tc
      ctx.shadowBlur = isAlert ? 14 : 8
      ctx.strokeStyle = tc
      ctx.lineWidth = thick ? 2.5 : (isAlert ? 2.0 : 1.4)
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      for (let i = 0; i < b.length; i++) {
        const idx = (i + sweepIdx) % b.length
        const x = i * step, y = mid - b[idx] * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      /* Main trace (sharp) */
      ctx.shadowColor = tc
      ctx.shadowBlur = isAlert ? 6 : 3
      ctx.strokeStyle = tc
      ctx.lineWidth = thick ? 1.8 : (isAlert ? 1.5 : 1.0)
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 1
      ctx.beginPath()
      for (let i = 0; i < b.length; i++) {
        const idx = (i + sweepIdx) % b.length
        const x = i * step, y = mid - b[idx] * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      /* Sweep dot — bright phosphor point */
      const dotY = mid - b[sweepIdx] * amp
      ctx.fillStyle = tc
      ctx.shadowColor = tc
      ctx.shadowBlur = 16
      ctx.beginPath()
      ctx.arc(w - 1, dotY, thick ? 2.5 : 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      /* Fade-out at right edge */
      const gr = ctx.createLinearGradient(w - 35, 0, w, 0)
      gr.addColorStop(0, 'transparent')
      gr.addColorStop(1, 'rgba(3,3,8,0.85)')
      ctx.fillStyle = gr
      ctx.fillRect(w - 35, 0, 35, h)

      off.current += speed
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [w, h, color, isAlert, speed, thick])

  return <canvas ref={cvs} style={{ width: w, height: h, display: 'block' }} />
}

/* ══════════════════════════════════════════════════════════════
   VITAL BOX — Cleaner, larger values
   ══════════════════════════════════════════════════════════════ */
function VitalBox({ v, w }: { v: VitalSign; w: number }) {
  const [data, setData] = useState<number[]>([])
  const gen = useCallback(() => {
    const hr = v.numericValue || 120
    if (v.waveform === 'ecg') return genECG(hr, 180)
    if (v.waveform === 'spo2') return genSpO2(180)
    if (v.waveform === 'resp') return genResp(180)
    return Array.from({ length: 180 }, () => (Math.random() - 0.5) * 0.15)
  }, [v.waveform, v.numericValue])

  useEffect(() => { setData(gen()); const iv = setInterval(() => setData(gen()), 3500); return () => clearInterval(iv) }, [gen])

  const isCrit = v.severity === 2, isWarn = v.severity === 1
  const vc = isCrit ? '#FF4757' : isWarn ? '#FFA502' : v.color

  return (
    <div style={{
      background: 'rgba(3,3,8,0.6)', borderRadius: '10px', padding: '10px 12px',
      border: `1px solid ${isCrit ? 'rgba(255,71,87,0.3)' : isWarn ? 'rgba(255,165,2,0.15)' : 'rgba(108,124,255,0.06)'}`,
      boxShadow: isCrit ? '0 0 20px rgba(255,71,87,0.1), inset 0 0 12px rgba(255,71,87,0.03)' : 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Scanlines micro */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.02,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)' }} />

      {/* Label + alert */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', position: 'relative' }}>
        <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: v.color, fontWeight: 700, letterSpacing: '1.5px' }}>{v.label}</span>
        {isCrit && <span style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: '#FF4757', fontWeight: 800, letterSpacing: '1px' }} className="animate-breathe">ALERTE</span>}
        {isWarn && <span style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: '#FFA502', fontWeight: 700, letterSpacing: '0.5px' }}>VIGIL.</span>}
      </div>

      {/* Waveform */}
      {v.waveform && data.length > 0 && (
        <div style={{ margin: '3px 0', opacity: 0.85, borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
          <Trace data={data} color={v.color} w={w - 28} h={26} alert={isCrit} speed={v.waveform === 'ecg' ? 1.5 : 1} />
        </div>
      )}

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', position: 'relative', marginTop: '4px' }}>
        <span style={{
          fontSize: '24px', fontWeight: 900, fontFamily: 'var(--p-font-mono)',
          color: vc, textShadow: isCrit ? '0 0 14px rgba(255,71,87,0.5)' : `0 0 10px ${v.color}20`,
          letterSpacing: '-0.5px', lineHeight: 1,
        }}>{v.value}</span>
        <span style={{ fontSize: '10px', color: 'rgba(180,180,200,0.4)', fontFamily: 'var(--p-font-mono)', fontWeight: 500 }}>{v.unit}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   METRIC PILL — individual rounded card (as in GPT mockup)
   ══════════════════════════════════════════════════════════════ */
function MetricPill({ label, value, suffix, th, icon }: {
  label: string; value: number; suffix?: string; th: [number, number]; icon?: string
}) {
  const c = value > th[1] ? '#FF4757' : value > th[0] ? '#FFA502' : '#2ED573'
  const bars = Array.from({ length: 6 }, (_, i) => Math.random() * 0.6 + 0.2)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px', borderRadius: '8px',
      background: 'rgba(3,3,8,0.5)',
      border: `1px solid ${c}15`,
      minWidth: '80px',
    }}>
      {/* Icon */}
      {icon && <Picto name={icon} size={12} glow glowColor={`${c}40`} />}

      {/* Value */}
      <div>
        <div style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: 'rgba(180,180,200,0.3)', letterSpacing: '1px', lineHeight: 1 }}>{label}</div>
        <div style={{
          fontSize: '20px', fontWeight: 900, fontFamily: 'var(--p-font-mono)',
          color: c, textShadow: `0 0 8px ${c}30`, letterSpacing: '-0.5px', lineHeight: 1,
        }}>
          {value}<span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.5 }}>{suffix}</span>
        </div>
      </div>

      {/* Mini sparkline bars */}
      <svg width="18" height="16" viewBox="0 0 18 16" style={{ opacity: 0.45, flexShrink: 0 }}>
        {bars.map((d, i) => (
          <rect key={i} x={i * 3} y={16 - d * 16} width="2" height={d * 16} rx="0.5" fill={c} />
        ))}
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   BRAIN MONITOR — MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const CHANNELS = [
  { label: 'Fp1-F7', seed: 0.1 }, { label: 'F7-T3', seed: 0.4 },
  { label: 'T3-T5', seed: 0.7 }, { label: 'T5-O1', seed: 1.0 },
  { label: 'Fp2-F8', seed: 1.3 }, { label: 'F8-T4', seed: 1.6 },
]
const CH_COLORS = ['#6C7CFF', '#2FD1C8', '#B96BFF', '#FFB347', '#6C7CFF', '#FF6B8A']
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  normal: { label: 'NORMAL', color: '#2ED573' },
  slowing: { label: 'RALENTISSEMENT', color: '#FFA502' },
  seizure: { label: 'ACTIVITÉ CRITIQUE', color: '#FF4757' },
  burst_suppression: { label: 'BURST-SUPPRESSION', color: '#FF6B8A' },
  suppressed: { label: 'SUPPRIMÉ', color: '#6C7CFF' },
}

export default function BrainMonitor({
  patientName, age, syndrome, hospDay, gcs, seizuresPerHour, vpsScore,
  vitals, eegStatus, eegBackground, ncsePossible, compact = false,
}: BrainMonitorProps) {
  const [bufs, setBufs] = useState<number[][]>([])
  const [clock, setClock] = useState('')
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const r = () => setBufs(CHANNELS.map((ch, i) => {
      const st = eegStatus === 'seizure' && (i === 0 || i === 1 || i === 5) ? 'seizure' : eegStatus
      return genEEG(st, 300, ch.seed + Math.random() * 0.01)
    }))
    r(); const iv = setInterval(r, 4000); return () => clearInterval(iv)
  }, [eegStatus])

  useEffect(() => {
    const t = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    t(); const iv = setInterval(t, 1000); return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (vpsScore > 65 || seizuresPerHour > 6) {
      const iv = setInterval(() => setFlash(f => !f), 900); return () => clearInterval(iv)
    }
    setFlash(false)
  }, [vpsScore, seizuresPerHour])

  const st = STATUS_MAP[eegStatus] || STATUS_MAP.normal
  const crit = eegStatus === 'seizure' || vpsScore > 65
  const trW = compact ? 280 : 460
  const trH = compact ? 22 : 30

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(3,3,8,0.98), rgba(6,6,16,0.98) 50%, rgba(4,4,12,0.98))',
      borderRadius: '14px', overflow: 'hidden', position: 'relative',
      border: `1px solid ${crit && flash ? 'rgba(255,71,87,0.25)' : 'rgba(108,124,255,0.08)'}`,
      boxShadow: crit
        ? `0 0 50px rgba(255,71,87,${flash ? '0.12' : '0.04'}), 0 8px 40px rgba(0,0,0,0.6)`
        : '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,124,255,0.04)',
      transition: 'box-shadow 0.4s, border-color 0.4s',
    }}>
      {/* Scanlines CRT */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.015,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)' }} />

      {/* Vignette edges */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)' }} />

      {/* ════ TOP BAR — BRAINMONITOR title ════ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 18px',
        borderBottom: `1px solid ${crit && flash ? 'rgba(255,71,87,0.12)' : 'rgba(108,124,255,0.06)'}`,
        background: crit && flash ? 'rgba(255,71,87,0.025)' : 'rgba(108,124,255,0.01)',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Picto name="brain" size={18} glow glowColor="rgba(108,124,255,0.4)" />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 900, fontSize: '14px', letterSpacing: '1px' }}>
            <span style={{ color: 'var(--p-white)' }}>BRAIN</span>
            <span style={{ color: '#6C7CFF' }}>MONITOR</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="dot-alive" style={{
            width: '6px', height: '6px',
            background: crit ? '#FF4757' : '#2ED573',
            boxShadow: `0 0 8px ${crit ? 'rgba(255,71,87,0.6)' : 'rgba(46,213,115,0.5)'}`,
          }} />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '13px', color: '#6C7CFF', fontWeight: 700, letterSpacing: '1px' }}>{clock}</span>
        </div>
      </div>

      {/* ════ PATIENT BAR ════ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 18px',
        borderBottom: '1px solid rgba(108,124,255,0.04)',
        background: 'rgba(0,0,0,0.15)',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: crit ? '#FF4757' : '#2ED573',
            boxShadow: `0 0 6px ${crit ? 'rgba(255,71,87,0.5)' : 'rgba(46,213,115,0.4)'}`,
          }} className="animate-breathe" />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--p-white)' }}>{patientName}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {age} <span style={{ opacity: 0.3 }}>·</span> {syndrome} <span style={{ opacity: 0.3 }}>·</span> <span style={{ display: 'inline-flex' }}><Picto name="eeg" size={11} /></span> <span style={{ opacity: 0.3 }}>·</span> <span style={{ color: crit ? '#FF4757' : '#6C7CFF', fontWeight: 700 }}>J+{hospDay}</span>
          </span>
          {ncsePossible && (
            <span className="animate-breathe" style={{
              fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, letterSpacing: '1px',
              padding: '3px 8px', borderRadius: '4px', marginLeft: '4px',
              background: 'rgba(255,71,87,0.12)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.25)',
              boxShadow: '0 0 8px rgba(255,71,87,0.1)',
            }}>NCSE ?</span>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px',
          padding: '4px 12px', borderRadius: '6px',
          background: `${st.color}12`, color: st.color, border: `1px solid ${st.color}25`,
          boxShadow: crit ? `0 0 12px ${st.color}15` : 'none',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          {crit && <span style={{ fontSize: '10px' }}>▲</span>}
          {st.label}
        </span>
      </div>

      {/* ════ MAIN GRID ════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '1fr 230px',
        position: 'relative', zIndex: 3,
      }}>
        {/* ──── LEFT: EEG TRACES ──── */}
        <div style={{
          padding: '12px 14px',
          borderRight: compact ? 'none' : '1px solid rgba(108,124,255,0.04)',
          background: 'rgba(0,0,0,0.1)',
        }}>
          {/* Compact: alert summary strip (mobile mockup) */}
          {compact && crit && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '10px', padding: '6px 10px',
              background: 'rgba(255,71,87,0.06)', borderRadius: '8px',
              border: '1px solid rgba(255,71,87,0.15)',
            }}>
              <span className="animate-breathe" style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800,
                padding: '3px 10px', borderRadius: '4px', letterSpacing: '1px',
                background: 'rgba(255,71,87,0.15)', color: '#FF4757',
                border: '1px solid rgba(255,71,87,0.25)',
              }}>▲ ALERTE</span>
              <span style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800,
                padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.5px',
                background: 'rgba(255,165,2,0.1)', color: '#FFA502',
                border: '1px solid rgba(255,165,2,0.2)',
              }}>▲ VPS</span>
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'var(--p-font-mono)', fontSize: '20px', fontWeight: 900,
                color: '#FF4757', textShadow: '0 0 10px rgba(255,71,87,0.3)',
              }}>={vpsScore}</span>
              {/* Mini sparkline */}
              <svg width="24" height="14" viewBox="0 0 24 14" style={{ opacity: 0.4, flexShrink: 0 }}>
                {[0.4, 0.6, 0.3, 0.8, 0.5, 0.9, 0.7, 0.4].map((d, i) => (
                  <rect key={i} x={i * 3} y={14 - d * 14} width="2" height={d * 14} rx="0.5" fill="#FF4757" />
                ))}
              </svg>
            </div>
          )}
          {/* EEG header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Picto name="eeg" size={14} glow glowColor="rgba(108,124,255,0.3)" />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '2px' }}>cEEG CONTINU</span>
            <div style={{ width: '1px', height: '10px', background: 'rgba(108,124,255,0.1)' }} />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'rgba(180,180,200,0.25)' }}>{eegBackground}</span>
            <Link href="/neurocore?tab=eeg" style={{ marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'rgba(108,124,255,0.35)', textDecoration: 'none', letterSpacing: '0.5px' }}>NeuroCore →</Link>
          </div>

          {/* Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {CHANNELS.map((ch, i) => {
              const isSeiz = eegStatus === 'seizure' && (i === 0 || i === 1 || i === 5)
              return (
                <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '42px', textAlign: 'right',
                    fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 600,
                    color: isSeiz ? 'rgba(255,71,87,0.7)' : 'rgba(180,180,200,0.2)',
                    letterSpacing: '0.3px',
                  }}>{ch.label}</span>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden',
                    border: isSeiz ? '1px solid rgba(255,71,87,0.15)' : '1px solid rgba(108,124,255,0.02)',
                  }}>
                    {bufs[i] && (
                      <Trace
                        data={bufs[i]}
                        color={isSeiz ? '#FF4757' : CH_COLORS[i]}
                        w={trW} h={trH}
                        alert={isSeiz}
                        speed={1.2 + i * 0.08}
                        thick={isSeiz}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Bottom metrics bar — individual pill cards ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginTop: '12px', flexWrap: 'wrap',
          }}>
            {/* EEG label + link (as in mockup) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '6px',
              background: 'rgba(108,124,255,0.06)',
              border: '1px solid rgba(108,124,255,0.08)',
              marginRight: '4px',
            }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '1px' }}>EEG</span>
              <Link href="/neurocore?tab=eeg" style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'rgba(108,124,255,0.4)', textDecoration: 'none' }}>cEEG continu →</Link>
            </div>

            {/* Metric pill cards */}
            <MetricPill label="CRISES/H" value={seizuresPerHour} th={[3, 6]} icon="eeg" />
            <MetricPill label="GCS" value={gcs} suffix="/15" th={[12, 8]} icon="brain" />
            <MetricPill label="VPS" value={vpsScore} th={[40, 65]} icon="heart" />

            <Link href="/neurocore?tab=redflags" style={{
              marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
              padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
              background: 'rgba(255,71,87,0.08)', color: '#FF4757',
              border: '1px solid rgba(255,71,87,0.18)',
              boxShadow: '0 0 8px rgba(255,71,87,0.06)',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>Red Flags →</Link>
          </div>
        </div>

        {/* ──── RIGHT: VITAL SIGNS ──── */}
        {!compact && (
          <div style={{
            padding: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            background: 'rgba(0,0,0,0.05)',
          }}>
            <div style={{
              fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
              color: 'rgba(255,107,138,0.45)', letterSpacing: '2px', marginBottom: '2px',
            }}>CONSTANTES VITALES</div>
            {vitals.map((v, i) => <VitalBox key={i} v={v} w={226} />)}
            <Link href="/neurocore" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 600,
              color: 'rgba(108,124,255,0.4)', textDecoration: 'none',
              marginTop: '4px', padding: '6px 0',
              borderTop: '1px solid rgba(108,124,255,0.04)',
              letterSpacing: '0.5px',
            }}>
              NeuroCore → <Picto name="clipboard" size={11} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
