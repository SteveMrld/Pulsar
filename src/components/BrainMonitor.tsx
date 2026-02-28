'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'

// ── Types ──
interface VitalSign {
  label: string
  value: string
  unit: string
  color: string
  icon: string
  severity: 0 | 1 | 2  // 0=normal, 1=warning, 2=critical
  waveform?: 'ecg' | 'spo2' | 'resp' | 'flat'
  numericValue?: number
  range?: [number, number]
}

interface EEGChannel {
  label: string
  data: number[]
  color: string
  alert?: boolean
}

interface BrainMonitorProps {
  patientName: string
  age: string
  syndrome: string
  hospDay: number
  gcs: number
  seizuresPerHour: number
  vpsScore: number
  vitals: VitalSign[]
  eegStatus: 'normal' | 'slowing' | 'seizure' | 'burst_suppression' | 'suppressed'
  eegBackground: string
  ncsePossible: boolean
  compact?: boolean
}

// ── EEG waveform generator ──
function generateEEGSegment(status: string, length: number): number[] {
  const data: number[] = []
  for (let i = 0; i < length; i++) {
    const t = i / length
    let v = 0
    switch (status) {
      case 'normal':
        v = Math.sin(t * 30) * 0.3 + Math.sin(t * 60) * 0.15 + (Math.random() - 0.5) * 0.2
        break
      case 'slowing':
        v = Math.sin(t * 12) * 0.5 + Math.sin(t * 6) * 0.3 + (Math.random() - 0.5) * 0.15
        break
      case 'seizure':
        v = Math.sin(t * 80 + Math.sin(t * 8) * 3) * 0.8 + Math.sin(t * 120) * 0.4 +
            (Math.random() - 0.5) * 0.3 + Math.sin(t * 200) * 0.2
        break
      case 'burst_suppression': {
        const burstPhase = (t * 4) % 1
        v = burstPhase < 0.3
          ? Math.sin(t * 100) * 0.7 + (Math.random() - 0.5) * 0.5
          : (Math.random() - 0.5) * 0.04
        break
      }
      case 'suppressed':
        v = (Math.random() - 0.5) * 0.05
        break
    }
    data.push(v)
  }
  return data
}

// ── ECG waveform generator ──
function generateECGSegment(hr: number, length: number): number[] {
  const data: number[] = []
  const beatInterval = length / (hr / 60 * 2.5)  // beats per segment
  for (let i = 0; i < length; i++) {
    const phase = (i % beatInterval) / beatInterval
    let v = 0
    if (phase < 0.05) v = -0.1
    else if (phase < 0.08) v = 0.9  // R wave
    else if (phase < 0.12) v = -0.2  // S wave
    else if (phase < 0.35) v = 0.15 * Math.sin((phase - 0.12) / 0.23 * Math.PI)  // T wave
    else v = 0
    v += (Math.random() - 0.5) * 0.03
    data.push(v)
  }
  return data
}

// ── SpO2 waveform ──
function generateSpO2Segment(length: number): number[] {
  const data: number[] = []
  for (let i = 0; i < length; i++) {
    const t = i / length
    const phase = (t * 6) % 1
    let v = 0
    if (phase < 0.15) v = Math.sin(phase / 0.15 * Math.PI) * 0.6
    else if (phase < 0.5) v = 0.15 * Math.exp(-(phase - 0.15) * 8)
    else v = 0
    v += (Math.random() - 0.5) * 0.02
    data.push(v)
  }
  return data
}

// ── Animated Trace ──
function AnimatedTrace({ data, color, height, width, alert, speed = 1 }: {
  data: number[]; color: string; height: number; width: number; alert?: boolean; speed?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offsetRef = useRef(0)
  const bufferRef = useRef(data)

  useEffect(() => { bufferRef.current = data }, [data])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const draw = () => {
      const buf = bufferRef.current
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      ctx.clearRect(0, 0, width, height)

      // Grid lines
      ctx.strokeStyle = 'rgba(108,124,255,0.06)'
      ctx.lineWidth = 0.5
      for (let y = 0; y < height; y += height / 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }

      // Trace
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, `${color}10`)
      gradient.addColorStop(0.3, color)
      gradient.addColorStop(1, color)

      ctx.strokeStyle = alert ? '#FF4757' : gradient
      ctx.lineWidth = alert ? 1.8 : 1.2
      ctx.shadowColor = alert ? '#FF4757' : color
      ctx.shadowBlur = alert ? 6 : 3
      ctx.beginPath()

      const step = width / buf.length
      const mid = height / 2
      const amp = height * 0.4

      for (let i = 0; i < buf.length; i++) {
        const idx = (i + Math.floor(offsetRef.current)) % buf.length
        const x = i * step
        const y = mid - buf[idx] * amp
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Sweep line
      const sweepX = (offsetRef.current % buf.length) / buf.length * width
      ctx.strokeStyle = `${color}80`
      ctx.lineWidth = 1
      ctx.shadowBlur = 8
      ctx.shadowColor = color
      ctx.beginPath(); ctx.moveTo(sweepX, 0); ctx.lineTo(sweepX, height); ctx.stroke()

      offsetRef.current += speed * 1.5
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [color, height, width, alert, speed])

  return <canvas ref={canvasRef} style={{ width, height, borderRadius: '4px' }} />
}

// ── Vital Box ──
function VitalBox({ vital, width }: { vital: VitalSign; width: number }) {
  const [data, setData] = useState<number[]>([])

  useEffect(() => {
    const hr = vital.numericValue || 120
    if (vital.waveform === 'ecg') setData(generateECGSegment(hr, 200))
    else if (vital.waveform === 'spo2') setData(generateSpO2Segment(200))
    else setData(Array.from({ length: 200 }, () => (Math.random() - 0.5) * 0.3))

    const iv = setInterval(() => {
      if (vital.waveform === 'ecg') setData(generateECGSegment(hr + (Math.random() - 0.5) * 4, 200))
      else if (vital.waveform === 'spo2') setData(generateSpO2Segment(200))
      else setData(Array.from({ length: 200 }, () => (Math.random() - 0.5) * 0.3))
    }, 3000)
    return () => clearInterval(iv)
  }, [vital.waveform, vital.numericValue])

  const borderColor = vital.severity === 2 ? '#FF4757' : vital.severity === 1 ? '#FFA502' : vital.color

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '6px 8px',
      border: `1px solid ${borderColor}30`,
      boxShadow: vital.severity === 2 ? `0 0 12px rgba(255,71,87,0.2)` : 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <span style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: vital.color, fontWeight: 700, letterSpacing: '1px' }}>{vital.label}</span>
        {vital.severity === 2 && <span style={{ fontSize: '8px', color: '#FF4757', fontWeight: 800, animation: 'pulse 1s infinite' }}>ALERTE</span>}
      </div>
      {/* Waveform */}
      {vital.waveform && data.length > 0 && <AnimatedTrace data={data} color={vital.color} height={28} width={width - 20} alert={vital.severity === 2} />}
      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '2px' }}>
        <span style={{
          fontSize: '18px', fontWeight: 900, fontFamily: 'var(--p-font-mono)',
          color: vital.severity === 2 ? '#FF4757' : vital.severity === 1 ? '#FFA502' : vital.color,
          textShadow: vital.severity === 2 ? '0 0 8px rgba(255,71,87,0.5)' : 'none',
        }}>{vital.value}</span>
        <span style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{vital.unit}</span>
      </div>
    </div>
  )
}

// ── Main Brain Monitor ──
export default function BrainMonitor({
  patientName, age, syndrome, hospDay, gcs, seizuresPerHour, vpsScore,
  vitals, eegStatus, eegBackground, ncsePossible, compact = false,
}: BrainMonitorProps) {
  const [eegData, setEEGData] = useState<EEGChannel[]>([])
  const [clockStr, setClockStr] = useState('')
  const [flashCrit, setFlashCrit] = useState(false)

  // Generate EEG channels
  useEffect(() => {
    const regenerate = () => {
      const channels: EEGChannel[] = [
        { label: 'Fp1-F7', data: generateEEGSegment(eegStatus, 300), color: '#6C7CFF', alert: eegStatus === 'seizure' },
        { label: 'F7-T3', data: generateEEGSegment(eegStatus, 300), color: '#2FD1C8', alert: eegStatus === 'seizure' },
        { label: 'T3-T5', data: generateEEGSegment(eegStatus, 300), color: '#B96BFF', alert: eegStatus === 'seizure' },
        { label: 'T5-O1', data: generateEEGSegment(eegStatus, 300), color: '#FFB347' },
        { label: 'Fp2-F8', data: generateEEGSegment(eegStatus, 300), color: '#6C7CFF' },
        { label: 'F8-T4', data: generateEEGSegment(eegStatus === 'seizure' ? 'seizure' : 'slowing', 300), color: '#FF6B8A', alert: eegStatus === 'seizure' },
      ]
      setEEGData(channels)
    }
    regenerate()
    const iv = setInterval(regenerate, 4000)
    return () => clearInterval(iv)
  }, [eegStatus])

  // Clock
  useEffect(() => {
    const tick = () => setClockStr(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  // Critical flash
  useEffect(() => {
    if (vpsScore > 65 || seizuresPerHour > 6) {
      const iv = setInterval(() => setFlashCrit(f => !f), 800)
      return () => clearInterval(iv)
    }
    setFlashCrit(false)
  }, [vpsScore, seizuresPerHour])

  const eegStatusColor = {
    normal: '#2ED573', slowing: '#FFA502', seizure: '#FF4757',
    burst_suppression: '#FF6B8A', suppressed: '#6C7CFF',
  }[eegStatus]

  const eegStatusLabel = {
    normal: 'NORMAL', slowing: 'RALENTISSEMENT', seizure: 'ACTIVITÉ CRITIQUE',
    burst_suppression: 'BURST-SUPPRESSION', suppressed: 'SUPPRIMÉ',
  }[eegStatus]

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(5,5,15,0.95), rgba(10,10,30,0.95))',
      borderRadius: 'var(--p-radius-xl)', border: '1px solid rgba(108,124,255,0.15)',
      overflow: 'hidden', position: 'relative',
      boxShadow: flashCrit ? '0 0 30px rgba(255,71,87,0.15)' : '0 4px 30px rgba(0,0,0,0.3)',
      transition: 'box-shadow 0.3s',
    }}>
      {/* ── TOP BAR: Patient + Clock ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 14px', borderBottom: '1px solid rgba(108,124,255,0.1)',
        background: flashCrit ? 'rgba(255,71,87,0.08)' : 'rgba(108,124,255,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ED573', boxShadow: '0 0 8px rgba(46,213,115,0.5)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '12px', color: 'var(--p-text)' }}>{patientName}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>{age} · {syndrome} · J+{hospDay}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
            padding: '2px 8px', borderRadius: 'var(--p-radius-sm)',
            background: `${eegStatusColor}15`, color: eegStatusColor,
            border: `1px solid ${eegStatusColor}30`,
          }}>{eegStatusLabel}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: '#6C7CFF', fontWeight: 700 }}>{clockStr}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 220px', gap: 0 }}>
        {/* ── LEFT: EEG traces ── */}
        <div style={{ padding: '8px 10px', borderRight: compact ? 'none' : '1px solid rgba(108,124,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Picto name="eeg" size={14} glow glowColor="rgba(108,124,255,0.4)" />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#6C7CFF', letterSpacing: '1px' }}>
              cEEG CONTINU
            </span>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>
              {eegBackground}
            </span>
            {ncsePossible && (
              <span style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
                padding: '1px 6px', borderRadius: 'var(--p-radius-sm)',
                background: 'rgba(255,71,87,0.15)', color: '#FF4757',
                animation: 'pulse 1s infinite',
              }}>NCSE ?</span>
            )}
            <Link href="/neurocore?tab=eeg" style={{
              marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px',
              color: '#6C7CFF', textDecoration: 'none',
            }}>NeuroCore →</Link>
          </div>

          {/* EEG Channels */}
          {eegData.map((ch, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <span style={{
                width: '40px', fontFamily: 'var(--p-font-mono)', fontSize: '7px',
                color: ch.alert ? '#FF4757' : 'var(--p-text-dim)', textAlign: 'right',
              }}>{ch.label}</span>
              <AnimatedTrace
                data={ch.data} color={ch.alert ? '#FF4757' : ch.color}
                height={compact ? 20 : 26} width={compact ? 250 : 400}
                alert={ch.alert} speed={1.2 + i * 0.1}
              />
            </div>
          ))}

          {/* Seizure counter */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px',
            padding: '4px 8px', background: seizuresPerHour > 3 ? 'rgba(255,71,87,0.08)' : 'rgba(108,124,255,0.04)',
            borderRadius: '4px',
          }}>
            <div>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>CRISES/H</span>
              <div style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900,
                color: seizuresPerHour > 6 ? '#FF4757' : seizuresPerHour > 3 ? '#FFA502' : '#2ED573',
                textShadow: seizuresPerHour > 6 ? '0 0 8px rgba(255,71,87,0.4)' : 'none',
              }}>{seizuresPerHour}</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>GCS</span>
              <div style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900,
                color: gcs <= 8 ? '#FF4757' : gcs <= 12 ? '#FFA502' : '#2ED573',
              }}>{gcs}/15</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>VPS</span>
              <div style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900,
                color: vpsScore > 65 ? '#FF4757' : vpsScore > 40 ? '#FFA502' : '#2ED573',
              }}>{vpsScore}</div>
            </div>
            <Link href="/neurocore?tab=redflags" style={{
              marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px',
              padding: '3px 10px', borderRadius: 'var(--p-radius-sm)',
              background: 'rgba(255,71,87,0.1)', color: '#FF4757', textDecoration: 'none',
              fontWeight: 700,
            }}>Red Flags →</Link>
          </div>
        </div>

        {/* ── RIGHT: Vital Signs ── */}
        {!compact && (
          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700, color: '#FF6B8A', letterSpacing: '1px', marginBottom: '2px' }}>
              CONSTANTES VITALES
            </div>
            {vitals.map((v, i) => <VitalBox key={i} vital={v} width={210} />)}
          </div>
        )}
      </div>

      {/* ── CSS animations ── */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
