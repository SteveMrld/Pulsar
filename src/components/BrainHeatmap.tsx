'use client'
import { useEffect, useRef } from 'react'

/* ══════════════════════════════════════════════════════════════
   BRAIN HEATMAP — EEG activity visualization
   Shows brain outline with colored zones based on channel activity
   ══════════════════════════════════════════════════════════════ */

interface BrainHeatmapProps {
  /** EEG status drives the overall color scheme */
  eegStatus: 'normal' | 'slowing' | 'seizure' | 'burst_suppression' | 'suppressed'
  /** Per-channel intensity 0-1 (6 channels: Fp1-F7, F7-T3, T3-T5, T5-O1, Fp2-F8, F8-T4) */
  channelIntensity?: number[]
  /** VPS score 0-100 */
  vpsScore: number
  /** Size in pixels */
  size?: number
}

/* Brain region centroids (normalized 0-1 coords on a top-down brain view) */
const REGIONS = [
  { label: 'Frontal L',   cx: 0.35, cy: 0.25, r: 0.15, channels: [0] },      // Fp1-F7
  { label: 'Temporal L',  cx: 0.18, cy: 0.50, r: 0.12, channels: [1, 2] },    // F7-T3, T3-T5
  { label: 'Occipital L', cx: 0.35, cy: 0.78, r: 0.12, channels: [3] },       // T5-O1
  { label: 'Frontal R',   cx: 0.65, cy: 0.25, r: 0.15, channels: [4] },       // Fp2-F8
  { label: 'Temporal R',  cx: 0.82, cy: 0.50, r: 0.12, channels: [5] },       // F8-T4
  { label: 'Occipital R', cx: 0.65, cy: 0.78, r: 0.12, channels: [] },        // inferred
  { label: 'Central',     cx: 0.50, cy: 0.48, r: 0.18, channels: [] },        // global
]

const STATUS_COLORS: Record<string, { base: string; hot: string }> = {
  normal:             { base: 'rgba(46,213,115,0.15)',  hot: 'rgba(46,213,115,0.5)' },
  slowing:            { base: 'rgba(255,165,2,0.15)',   hot: 'rgba(255,165,2,0.6)' },
  seizure:            { base: 'rgba(255,71,87,0.15)',   hot: 'rgba(255,71,87,0.7)' },
  burst_suppression:  { base: 'rgba(255,107,138,0.12)', hot: 'rgba(255,107,138,0.5)' },
  suppressed:         { base: 'rgba(108,124,255,0.1)',  hot: 'rgba(108,124,255,0.3)' },
}

export default function BrainHeatmap({ eegStatus, channelIntensity, vpsScore, size = 200 }: BrainHeatmapProps) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const frame = useRef(0)
  const chInt = channelIntensity || [0.5, 0.5, 0.3, 0.2, 0.5, 0.5]

  useEffect(() => {
    const c = cvs.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let id: number
    const colors = STATUS_COLORS[eegStatus] || STATUS_COLORS.normal

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      c.width = size * dpr; c.height = size * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, size, size)
      frame.current++
      const t = frame.current * 0.02

      const cx = size / 2, cy = size / 2
      const bw = size * 0.42, bh = size * 0.46

      /* ── Brain outline (ellipse) ── */
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, bw, bh, 0, 0, Math.PI * 2)
      ctx.clip()

      /* Background fill */
      ctx.fillStyle = 'rgba(10,10,20,0.8)'
      ctx.fill()

      /* ── Heatmap zones ── */
      for (const reg of REGIONS) {
        // Compute intensity from channels
        let intensity = 0.2
        if (reg.channels.length > 0) {
          intensity = reg.channels.reduce((sum, ch) => sum + (chInt[ch] || 0), 0) / reg.channels.length
        } else {
          // Global average
          intensity = chInt.reduce((s, v) => s + v, 0) / chInt.length * 0.7
        }

        // Animate: pulse with time
        const pulse = eegStatus === 'seizure'
          ? Math.sin(t * 3 + reg.cx * 10) * 0.2 + 0.8
          : Math.sin(t + reg.cx * 5) * 0.1 + 0.9
        intensity *= pulse

        const rx = reg.cx * size, ry = reg.cy * size
        const rr = reg.r * size

        // Radial gradient for each zone
        const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rr)
        const alpha = Math.min(intensity, 1)

        if (eegStatus === 'seizure' && reg.channels.some(ch => chInt[ch] > 0.7)) {
          // Hot seizure zone
          grad.addColorStop(0, `rgba(255,71,87,${0.4 + alpha * 0.4})`)
          grad.addColorStop(0.5, `rgba(255,71,87,${0.15 + alpha * 0.2})`)
          grad.addColorStop(1, 'transparent')
        } else if (eegStatus === 'slowing') {
          grad.addColorStop(0, `rgba(255,165,2,${0.2 + alpha * 0.3})`)
          grad.addColorStop(0.6, `rgba(255,165,2,${0.05 + alpha * 0.1})`)
          grad.addColorStop(1, 'transparent')
        } else {
          grad.addColorStop(0, `rgba(108,124,255,${0.1 + alpha * 0.2})`)
          grad.addColorStop(0.6, `rgba(108,124,255,${0.03 + alpha * 0.05})`)
          grad.addColorStop(1, 'transparent')
        }

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
      }

      /* ── Seizure wave propagation ── */
      if (eegStatus === 'seizure') {
        const waveR = ((t * 30) % (size * 0.5))
        ctx.strokeStyle = `rgba(255,71,87,${0.3 * (1 - waveR / (size * 0.5))})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(cx, cy * 0.85, waveR, waveR * 0.8, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      /* ── Midline ── */
      ctx.strokeStyle = 'rgba(108,124,255,0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(cx, cy - bh + 10)
      ctx.lineTo(cx, cy + bh - 10)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.restore()

      /* ── Brain outline stroke ── */
      ctx.strokeStyle = eegStatus === 'seizure' ? `rgba(255,71,87,${0.3 + Math.sin(t * 4) * 0.15})`
        : 'rgba(108,124,255,0.15)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(cx, cy, bw, bh, 0, 0, Math.PI * 2)
      ctx.stroke()

      /* ── Sulci lines (brain folds) ── */
      ctx.strokeStyle = 'rgba(108,124,255,0.06)'
      ctx.lineWidth = 0.8
      // Central sulcus
      ctx.beginPath()
      ctx.moveTo(cx - 5, cy - bh * 0.6)
      ctx.quadraticCurveTo(cx - 15, cy, cx - 5, cy + bh * 0.4)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + 5, cy - bh * 0.6)
      ctx.quadraticCurveTo(cx + 15, cy, cx + 5, cy + bh * 0.4)
      ctx.stroke()
      // Sylvian fissure L
      ctx.beginPath()
      ctx.moveTo(cx - bw * 0.3, cy - bh * 0.1)
      ctx.quadraticCurveTo(cx - bw * 0.6, cy + bh * 0.1, cx - bw * 0.8, cy + bh * 0.15)
      ctx.stroke()
      // Sylvian fissure R
      ctx.beginPath()
      ctx.moveTo(cx + bw * 0.3, cy - bh * 0.1)
      ctx.quadraticCurveTo(cx + bw * 0.6, cy + bh * 0.1, cx + bw * 0.8, cy + bh * 0.15)
      ctx.stroke()

      /* ── Region labels (tiny) ── */
      ctx.font = '7px var(--p-font-mono, monospace)'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(180,180,200,0.2)'
      ctx.fillText('F', cx, cy - bh * 0.55)
      ctx.fillText('O', cx, cy + bh * 0.65)
      ctx.fillText('T', cx - bw * 0.7, cy + bh * 0.05)
      ctx.fillText('T', cx + bw * 0.7, cy + bh * 0.05)

      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [size, eegStatus, chInt, vpsScore])

  const statusLabel = {
    normal: 'Normal', slowing: 'Ralenti', seizure: 'Crises actives',
    burst_suppression: 'Burst-Supp.', suppressed: 'Supprimé',
  }[eegStatus] || eegStatus

  const statusColor = {
    normal: '#2ED573', slowing: '#FFA502', seizure: '#FF4757',
    burst_suppression: '#FF6B8A', suppressed: '#6C7CFF',
  }[eegStatus] || '#6C7CFF'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    }}>
      <canvas ref={cvs} style={{ width: size, height: size, display: 'block', borderRadius: '50%' }} />
      <div style={{
        fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
        color: statusColor, letterSpacing: '1px',
        padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
        background: `${statusColor}12`, border: `1px solid ${statusColor}20`,
      }}>
        {statusLabel.toUpperCase()}
      </div>
    </div>
  )
}
