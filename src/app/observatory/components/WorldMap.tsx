'use client'
import { useState } from 'react'
import type { RegistryRow } from '@/lib/data/observatoryTypes'
import Picto from '@/components/Picto'

const COLORS: Record<string, string> = {
  FIRES: '#FF4757', EAIS: '#6C7CFF', NORSE: '#FF6B8A', PIMS: '#2FD1C8', MOGAD: '#FFB347',
}

// Mercator projection: lat/lon → SVG x/y
function project(lat: number, lon: number, w: number, h: number): [number, number] {
  const x = ((lon + 180) / 360) * w
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const y = h / 2 - (mercN * h) / (2 * Math.PI)
  return [x, Math.max(10, Math.min(h - 10, y))]
}

export default function WorldMap({ rows }: { rows: RegistryRow[] }) {
  const [hover, setHover] = useState<string | null>(null)
  const [familyFilter, setFamilyFilter] = useState<string>('ALL')
  const W = 800, H = 400

  const filtered = familyFilter === 'ALL' ? rows : rows.filter(r => r.family === familyFilter)
  const families = ['ALL', 'FIRES', 'EAIS', 'NORSE', 'PIMS', 'MOGAD']

  return (
    <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--p-space-4)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Picto name="lungs" size={22} glow glowColor="var(--p-tde)" />
          <div>
            <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>Registre mondial</span>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{filtered.length} cas · données anonymisées</div>
          </div>
        </div>
      </div>

      {/* Family filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--p-space-3)' }}>
        {families.map(f => (
          <button key={f} onClick={() => setFamilyFilter(f)} style={{
            padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
            background: familyFilter === f ? `${COLORS[f] || 'var(--p-vps)'}20` : 'var(--p-dark-4)',
            border: familyFilter === f ? `1px solid ${COLORS[f] || 'var(--p-vps)'}` : '1px solid transparent',
            color: familyFilter === f ? COLORS[f] || 'var(--p-vps)' : 'var(--p-text-dim)',
            fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: 600, cursor: 'pointer',
          }}>{f === 'ALL' ? 'TOUS' : f}</button>
        ))}
      </div>

      {/* SVG Map */}
      <div style={{ width: '100%', aspectRatio: '2/1', position: 'relative', background: 'rgba(10,10,20,0.4)', borderRadius: 'var(--p-radius-lg)', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
          {/* Grid lines */}
          {[-60, -30, 0, 30, 60].map(lat => {
            const [, y] = project(lat, 0, W, H)
            return <line key={`lat${lat}`} x1={0} y1={y} x2={W} y2={y} stroke="rgba(108,124,255,0.06)" strokeDasharray="4 4" />
          })}
          {[-120, -60, 0, 60, 120].map(lon => {
            const x = ((lon + 180) / 360) * W
            return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={H} stroke="rgba(108,124,255,0.06)" strokeDasharray="4 4" />
          })}

          {/* Case dots */}
          {filtered.map(r => {
            const [x, y] = project(r.lat, r.lon, W, H)
            const c = COLORS[r.family] || '#888'
            const isHover = hover === r.case_id
            return (
              <g key={r.case_id}
                onMouseEnter={() => setHover(r.case_id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring */}
                <circle cx={x} cy={y} r={isHover ? 14 : 8} fill={c} opacity={isHover ? 0.15 : 0.08} />
                {/* Dot */}
                <circle cx={x} cy={y} r={isHover ? 6 : 4} fill={c} stroke={c} strokeWidth={1} opacity={0.9}>
                  {!isHover && <animate attributeName="r" values="3.5;4.5;3.5" dur="3s" repeatCount="indefinite" />}
                </circle>

                {/* Tooltip */}
                {isHover && (
                  <foreignObject x={x + 10} y={y - 60} width={180} height={80} style={{ overflow: 'visible' }}>
                    <div style={{
                      background: 'rgba(14,14,22,0.95)', border: `1px solid ${c}40`,
                      borderRadius: 8, padding: '8px 10px', fontSize: '10px', color: 'var(--p-text)',
                      boxShadow: `0 4px 20px ${c}20`,
                    }}>
                      <div style={{ fontWeight: 700, color: c, marginBottom: '4px' }}>{r.case_id}</div>
                      <div style={{ color: 'var(--p-text-muted)' }}>
                        {r.family} · {r.region} · {r.sex === 'F' ? '♀' : '♂'} {Math.round(r.age_months / 12)} ans
                      </div>
                      <div style={{ color: 'var(--p-text-dim)', marginTop: '2px' }}>
                        Sév. {r.severity_1to5}/5 · {r.outcome_12m}
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--p-space-3)' }}>
        {Object.entries(COLORS).map(([name, color]) => {
          const count = rows.filter(r => r.family === name).length
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>{name} ({count})</span>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '8px', fontStyle: 'italic' }}>
        Données illustratives anonymisées · Aucune donnée patient réelle
      </div>
    </div>
  )
}
