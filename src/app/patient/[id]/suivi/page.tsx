'use client'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

/* Suivi & Monitoring — EWE predictions + VPS trajectory + GCS history */

export default function SuiviPage() {
  const { t } = useLang()
  const { ps, info, timeline, engineSummary } = usePatient()
  const ewe = ps.eweResult
  const vpsData = ps.vpsResult?.curve
  const gcsHistory = ps.neuro.gcsHistory

  const riskColor = (r: number) => r > 0.7 ? '#FF4757' : r > 0.4 ? '#FFB347' : '#2ED573'

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="chart" size={28} glow glowColor="rgba(255,179,71,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Suivi & Monitoring</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            EWE {'\u00b7'} {info.displayName} {'\u00b7'} J+{info.hospDay} {'\u00b7'} {info.phaseInfo.label}
          </span>
        </div>
      </div>

      {/* VPS Trajectory */}
      {vpsData && vpsData.curveData.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#6C7CFF', marginBottom: '12px', letterSpacing: '0.5px' }}>
            TRAJECTOIRE VPS
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
            {vpsData.curveData.map((v: number, i: number) => {
              const h = Math.max(4, (v / 100) * 90)
              const c = v >= 70 ? '#FF4757' : v >= 50 ? '#FFA502' : v >= 30 ? '#FFB347' : '#2ED573'
              const isNow = i === vpsData.currentPosition
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: isNow ? c : 'var(--p-text-dim)' }}>{v}</span>
                  <div style={{
                    width: '100%', height: `${h}px`, borderRadius: '3px 3px 0 0',
                    background: isNow ? c : `${c}40`,
                    boxShadow: isNow ? `0 0 8px ${c}40` : 'none',
                    transition: 'all 0.3s',
                  }} />
                  {vpsData.labels[i] && (
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>{vpsData.labels[i]}</span>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '8px', textAlign: 'center' }}>
            Tendance : <span style={{ color: vpsData.trend === 'worsening' ? '#FF4757' : vpsData.trend === 'improving' ? '#2ED573' : '#FFB347', fontWeight: 700 }}>
              {vpsData.trend === 'worsening' ? 'Aggravation' : vpsData.trend === 'improving' ? 'Am\u00e9lioration' : 'Stable'}
            </span>
          </div>
        </div>
      )}

      {/* GCS History */}
      {gcsHistory.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#B96BFF', marginBottom: '12px', letterSpacing: '0.5px' }}>
            HISTORIQUE GCS
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {gcsHistory.map((g: number, i: number) => {
              const h = Math.max(4, ((g - 3) / 12) * 70)
              const c = g <= 8 ? '#FF4757' : g <= 12 ? '#FFB347' : '#2ED573'
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: c }}>{g}</span>
                  <div style={{ width: '100%', height: `${h}px`, borderRadius: '3px 3px 0 0', background: c, opacity: i === gcsHistory.length - 1 ? 1 : 0.4 }} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* EWE Risk Windows */}
      {ewe?.synthesis.riskWindows && ewe.synthesis.riskWindows.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#FF6B8A', marginBottom: '12px', letterSpacing: '0.5px' }}>
            FEN\u00caTRES DE RISQUE (EWE)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ewe.synthesis.riskWindows.map((w, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--p-radius-md)',
                background: `${riskColor(w.risk)}08`,
                borderLeft: `3px solid ${riskColor(w.risk)}`,
              }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '20px', fontWeight: 900, color: riskColor(w.risk), minWidth: '50px', textAlign: 'center' }}>
                  {Math.round(w.risk * 100)}%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)' }}>{w.window}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-muted)', marginTop: '2px' }}>
                    {w.factors.join(' \u00b7 ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EWE Predicted Trajectory */}
      {ewe?.synthesis.predictedTrajectory && ewe.synthesis.predictedTrajectory.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#2FD1C8', marginBottom: '12px', letterSpacing: '0.5px' }}>
            PROJECTION VPS
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {ewe.synthesis.predictedTrajectory.map((p, i) => {
              const h = Math.max(4, (p.estimatedVPS / 100) * 70)
              const c = p.estimatedVPS >= 70 ? '#FF4757' : p.estimatedVPS >= 40 ? '#FFB347' : '#2ED573'
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: c }}>{p.estimatedVPS}</span>
                  <div style={{ width: '100%', height: `${h}px`, borderRadius: '3px 3px 0 0', background: `${c}60`, border: `1px dashed ${c}` }} />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>+{p.hours}h</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vitals snapshot */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#2ED573', marginBottom: '12px', letterSpacing: '0.5px' }}>
          CONSTANTES ACTUELLES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
          {[
            { l: 'FC', v: ps.hemodynamics.heartRate, u: 'bpm', s: ps.hemodynamics.heartRate > 150 ? 'critical' as const : 'normal' as const },
            { l: 'PA', v: `${ps.hemodynamics.sbp}/${ps.hemodynamics.dbp}`, u: 'mmHg', s: 'normal' as const },
            { l: 'SpO\u2082', v: ps.hemodynamics.spo2, u: '%', s: ps.hemodynamics.spo2 < 92 ? 'critical' as const : 'normal' as const },
            { l: 'Temp', v: ps.hemodynamics.temp.toFixed(1), u: '\u00b0C', s: ps.hemodynamics.temp > 38.5 ? 'warning' as const : 'normal' as const },
            { l: 'FR', v: ps.hemodynamics.respRate, u: '/min', s: 'normal' as const },
            { l: 'PAM', v: ps.hemodynamics.map, u: 'mmHg', s: ps.hemodynamics.map < 60 ? 'critical' as const : 'normal' as const },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: '10px', borderRadius: 'var(--p-radius-lg)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>{item.l}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900, color: item.s === 'critical' ? '#FF4757' : item.s === 'warning' ? '#FFB347' : 'var(--p-text)', lineHeight: 1, marginTop: '3px' }}>{item.v}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{item.u}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline events */}
      {timeline.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--p-radius-xl)' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#6C7CFF', marginBottom: '12px', letterSpacing: '0.5px' }}>
            \u00c9V\u00c9NEMENTS R\u00c9CENTS
          </div>
          {timeline.slice(0, 6).map((ev, i) => {
            const c = ev.severity === 'critical' ? '#FF4757' : ev.severity === 'warning' ? '#FFB347' : ev.severity === 'success' ? '#2ED573' : '#6C7CFF'
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, boxShadow: `0 0 4px ${c}50`, flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{ev.title}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '1px' }}>J+{ev.day} {'\u00b7'} {ev.detail}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
