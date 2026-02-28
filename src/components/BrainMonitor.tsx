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
   ANIMATED CANVAS TRACE
   ══════════════════════════════════════════════════════════════ */
function Trace({ data, color, w, h, alert: isAlert, speed = 1.3 }: {
  data: number[]; color: string; w: number; h: number; alert?: boolean; speed?: number
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

      /* Grid (oscilloscope feel) */
      ctx.strokeStyle = 'rgba(46,213,115,0.035)'
      ctx.lineWidth = 0.5
      for (let y = h / 4; y < h; y += h / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      for (let x = w / 8; x < w; x += w / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }

      /* Center baseline */
      ctx.strokeStyle = 'rgba(108,124,255,0.05)'
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()

      /* Trace */
      const b = buf.current, step = w / b.length, mid = h / 2, amp = h * 0.42
      const tc = isAlert ? '#FF4757' : color
      const sweepIdx = Math.floor(off.current) % b.length

      ctx.shadowColor = tc; ctx.shadowBlur = isAlert ? 8 : 4
      ctx.strokeStyle = tc; ctx.lineWidth = isAlert ? 1.6 : 1.1; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (let i = 0; i < b.length; i++) {
        const idx = (i + sweepIdx) % b.length
        const x = i * step, y = mid - b[idx] * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      /* Sweep dot */
      ctx.fillStyle = tc; ctx.shadowColor = tc; ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(w - 2, mid - b[sweepIdx] * amp, 1.8, 0, Math.PI * 2)
      ctx.fill(); ctx.shadowBlur = 0

      /* Fade-out trail */
      const gr = ctx.createLinearGradient(w - 30, 0, w, 0)
      gr.addColorStop(0, 'transparent'); gr.addColorStop(1, 'rgba(4,4,10,0.7)')
      ctx.fillStyle = gr; ctx.fillRect(w - 30, 0, 30, h)

      off.current += speed
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [w, h, color, isAlert, speed])

  return <canvas ref={cvs} style={{ width: w, height: h, display: 'block' }} />
}

/* ══════════════════════════════════════════════════════════════
   VITAL BOX
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
      background: 'rgba(4,4,10,0.5)', borderRadius: '8px', padding: '8px 10px',
      border: `1px solid ${isCrit ? 'rgba(255,71,87,0.25)' : 'rgba(108,124,255,0.06)'}`,
      boxShadow: isCrit ? '0 0 16px rgba(255,71,87,0.1), inset 0 0 10px rgba(255,71,87,0.03)' : 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Micro scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', position: 'relative' }}>
        <span style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: v.color, fontWeight: 700, letterSpacing: '1.5px' }}>{v.label}</span>
        {isCrit && <span style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: '#FF4757', fontWeight: 800, letterSpacing: '1px' }} className="animate-breathe">ALERTE</span>}
        {isWarn && <span style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: '#FFA502', fontWeight: 700 }}>VIGIL.</span>}
      </div>

      {v.waveform && data.length > 0 && (
        <div style={{ margin: '2px 0', opacity: 0.85 }}>
          <Trace data={data} color={v.color} w={w - 24} h={22} alert={isCrit} speed={v.waveform === 'ecg' ? 1.5 : 1} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', position: 'relative' }}>
        <span style={{
          fontSize: '20px', fontWeight: 900, fontFamily: 'var(--p-font-mono)',
          color: vc, textShadow: isCrit ? '0 0 12px rgba(255,71,87,0.5)' : `0 0 8px ${v.color}25`,
          letterSpacing: '-0.5px',
        }}>{v.value}</span>
        <span style={{ fontSize: '9px', color: 'rgba(180,180,200,0.4)', fontFamily: 'var(--p-font-mono)' }}>{v.unit}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   METRIC CHIP
   ══════════════════════════════════════════════════════════════ */
function Metric({ label, value, suffix, th }: { label: string; value: number; suffix?: string; th: [number, number] }) {
  const c = value > th[1] ? '#FF4757' : value > th[0] ? '#FFA502' : '#2ED573'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: 'rgba(180,180,200,0.35)', letterSpacing: '1.5px', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--p-font-mono)', color: c, textShadow: `0 0 10px ${c}35`, letterSpacing: '-1px', lineHeight: 1 }}>
        {value}<span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.5 }}>{suffix}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   BRAIN MONITOR — MAIN
   ══════════════════════════════════════════════════════════════ */
const CHANNELS = [
  { label: 'Fp1-F7', seed: 0.1 }, { label: 'F7-T3', seed: 0.4 },
  { label: 'T3-T5', seed: 0.7 }, { label: 'T5-O1', seed: 1.0 },
  { label: 'Fp2-F8', seed: 1.3 }, { label: 'F8-T4', seed: 1.6 },
]
const CH_COLORS = ['#6C7CFF', '#2FD1C8', '#B96BFF', '#FFB347', '#6C7CFF', '#FF6B8A']
const STATUS: Record<string, { label: string; color: string }> = {
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
      const st = (eegStatus === 'seizure' && i >= 4) ? 'seizure' : eegStatus
      return genEEG(st, 280, ch.seed + Math.random() * 0.01)
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

  const st = STATUS[eegStatus] || STATUS.normal
  const crit = eegStatus === 'seizure' || vpsScore > 65
  const trW = compact ? 260 : 440
  const trH = compact ? 18 : 24

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(4,4,10,0.97), rgba(8,8,18,0.97) 50%, rgba(6,6,14,0.97))',
      borderRadius: 'var(--p-radius-xl)', overflow: 'hidden', position: 'relative',
      border: `1px solid ${crit && flash ? 'rgba(255,71,87,0.2)' : 'rgba(108,124,255,0.08)'}`,
      boxShadow: crit
        ? `0 0 40px rgba(255,71,87,${flash ? '0.1' : '0.04'}), 0 8px 32px rgba(0,0,0,0.5)`
        : '0 8px 32px rgba(0,0,0,0.4)',
      transition: 'box-shadow 0.4s, border-color 0.4s',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.018,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.12) 1px, rgba(255,255,255,0.12) 2px)' }} />

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', borderBottom: '1px solid rgba(108,124,255,0.05)',
        background: crit && flash ? 'rgba(255,71,87,0.03)' : 'rgba(108,124,255,0.015)',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="dot-alive" style={{ width: '7px', height: '7px',
            background: crit ? '#FF4757' : '#2ED573',
            boxShadow: `0 0 8px ${crit ? 'rgba(255,71,87,0.6)' : 'rgba(46,213,115,0.5)'}` }} />
          <Picto name="brain" size={16} glow glowColor="rgba(108,124,255,0.3)" />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '12px', color: 'var(--p-white)' }}>{patientName}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
            {age} · {syndrome} · <span style={{ color: crit ? '#FF4757' : '#6C7CFF' }}>J+{hospDay}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {ncsePossible && (
            <span className="animate-breathe" style={{
              fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, letterSpacing: '1px',
              padding: '3px 8px', borderRadius: '4px',
              background: 'rgba(255,71,87,0.1)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.2)',
            }}>NCSE ?</span>
          )}
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.8px',
            padding: '3px 10px', borderRadius: '6px',
            background: `${st.color}0D`, color: st.color, border: `1px solid ${st.color}20`,
          }}>{st.label}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'rgba(108,124,255,0.6)', fontWeight: 600, letterSpacing: '1px' }}>{clock}</span>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 220px', position: 'relative', zIndex: 3 }}>

        {/* LEFT: EEG */}
        <div style={{ padding: '10px 12px', borderRight: compact ? 'none' : '1px solid rgba(108,124,255,0.04)', background: 'rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Picto name="eeg" size={13} glow glowColor="rgba(108,124,255,0.3)" />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '2px' }}>cEEG CONTINU</span>
            <div style={{ width: '1px', height: '10px', background: 'rgba(108,124,255,0.12)' }} />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'rgba(180,180,200,0.3)' }}>{eegBackground}</span>
            <Link href="/neurocore?tab=eeg" style={{ marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'rgba(108,124,255,0.4)', textDecoration: 'none' }}>NeuroCore →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {CHANNELS.map((ch, i) => {
              const isSeiz = eegStatus === 'seizure' && (i === 0 || i === 1 || i === 5)
              return (
                <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '38px', textAlign: 'right', fontFamily: 'var(--p-font-mono)', fontSize: '7px', fontWeight: 600,
                    color: isSeiz ? 'rgba(255,71,87,0.6)' : 'rgba(180,180,200,0.25)' }}>{ch.label}</span>
                  <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '2px', overflow: 'hidden',
                    border: isSeiz ? '1px solid rgba(255,71,87,0.12)' : '1px solid rgba(108,124,255,0.025)' }}>
                    {bufs[i] && <Trace data={bufs[i]} color={isSeiz ? '#FF4757' : CH_COLORS[i]} w={trW} h={trH} alert={isSeiz} speed={1.2 + i * 0.08} />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom metrics */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', padding: '8px 12px',
            background: crit ? 'rgba(255,71,87,0.03)' : 'rgba(108,124,255,0.015)',
            borderRadius: 'var(--p-radius-md)', border: `1px solid ${crit ? 'rgba(255,71,87,0.08)' : 'rgba(108,124,255,0.04)'}`,
          }}>
            <Metric label="CRISES/H" value={seizuresPerHour} th={[3, 6]} />
            <div style={{ width: '1px', height: '28px', background: 'rgba(108,124,255,0.06)' }} />
            <Metric label="GCS" value={gcs} suffix="/15" th={[12, 8]} />
            <div style={{ width: '1px', height: '28px', background: 'rgba(108,124,255,0.06)' }} />
            <Metric label="VPS" value={vpsScore} th={[40, 65]} />
            <Link href="/neurocore?tab=redflags" style={{
              marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
              padding: '5px 12px', borderRadius: '6px', textDecoration: 'none',
              background: 'rgba(255,71,87,0.06)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.12)',
            }}>Red Flags →</Link>
          </div>
        </div>

        {/* RIGHT: VITALS */}
        {!compact && (
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', fontWeight: 800, color: 'rgba(255,107,138,0.5)', letterSpacing: '2px', marginBottom: '2px' }}>
              CONSTANTES VITALES
            </div>
            {vitals.map((v, i) => <VitalBox key={i} v={v} w={218} />)}
          </div>
        )}
      </div>
    </div>
  )
}
