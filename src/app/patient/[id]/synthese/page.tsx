'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import { useTrackAction } from '@/hooks/useTrackAction'

/* Synth\u00e8se Clinique \u2014 Staff & Transmission */

export default function SynthesePage() {
  const { t } = useLang()
  const { ps, info, engineSummary, timeline } = usePatient()

  const { track } = useTrackAction()

  useEffect(() => {
    track('view_synthese', 'synthese', info?.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { vps, vpsColor, vpsLevel, criticalAlerts, warningAlerts, totalRecommendations, topRecommendation } = engineSummary

  const allAlerts = ps.alerts
  const allRecs = [
    ...(ps.vpsResult?.synthesis.recommendations || []),
    ...(ps.tdeResult?.synthesis.recommendations || []),
    ...(ps.pveResult?.synthesis.recommendations || []),
  ]

  const urgentRecs = allRecs.filter(r => r.priority === 'urgent')
  const highRecs = allRecs.filter(r => r.priority === 'high')
  const otherRecs = allRecs.filter(r => r.priority !== 'urgent' && r.priority !== 'high')

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="clipboard" size={28} glow glowColor="rgba(46,213,115,0.5)" />
        <div>
          <h1>Synth\u00e8se Clinique</h1>
          <span className="page-subtitle">
            Staff & Transmission {'\u00b7'} {info.displayName} {'\u00b7'} J+{info.hospDay}
          </span>
        </div>
      </div>

      {/* Patient Summary Card */}
      <div className="glass-card" style={{
        padding: '20px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px',
        borderLeft: `4px solid ${vpsColor}`,
        background: `linear-gradient(135deg, ${vpsColor}06, transparent)`,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>IDENTIT\u00c9 CLINIQUE</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '4px' }}>{info.displayName}</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6 }}>
              {info.age} {'\u00b7'} {info.sex === 'female' ? 'F' : 'M'} {'\u00b7'} {info.weight} {'\u00b7'} {info.room}<br />
              Diagnostic : <span style={{ color: '#6C7CFF', fontWeight: 700 }}>{info.syndrome}</span><br />
              Phase : <span style={{ color: info.phaseInfo.color, fontWeight: 700 }}>{info.phaseInfo.label}</span> ({info.phaseInfo.dayRange})<br />
              Hospitalisation : J+{info.hospDay}
              {info.allergies.length > 0 && <><br />Allergies : <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{info.allergies.join(', ')}</span></>}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: `${vpsColor}12`, border: `3px solid ${vpsColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${vpsColor}30`,
            }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '28px', fontWeight: 900, color: vpsColor, lineHeight: 1 }}>{vps}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: vpsColor, letterSpacing: '0.5px' }}>VPS</div>
            </div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: vpsColor, marginTop: '6px' }}>{vpsLevel}</div>
          </div>
        </div>
      </div>

      {/* Dashboard counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'GCS', value: ps.neuro.gcs, color: ps.neuro.gcs <= 8 ? '#8B5CF6' : 'var(--p-text)' },
          { label: 'Alertes crit.', value: criticalAlerts, color: criticalAlerts > 0 ? '#8B5CF6' : '#2ED573' },
          { label: 'Vigilance', value: warningAlerts, color: warningAlerts > 0 ? '#FFB347' : '#2ED573' },
          { label: 'Recomm.', value: totalRecommendations, color: '#6C7CFF' },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-lg)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '22px', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Critical alerts */}
      {allAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <div className="glass-card" style={{
          padding: '16px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px',
          borderLeft: '4px solid #8B5CF6', background: 'rgba(139,92,246,0.03)',
        }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#8B5CF6', marginBottom: '10px', letterSpacing: '0.5px' }}>
            ALERTES CRITIQUES
          </div>
          {allAlerts.filter(a => a.severity === 'critical').map((a, i) => (
            <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: i < allAlerts.filter(x => x.severity === 'critical').length - 1 ? '1px solid var(--p-border)' : 'none' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>{a.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '2px' }}>{a.body}</div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '3px' }}>Source : {a.source}</div>
            </div>
          ))}
        </div>
      )}

      {/* Urgent recommendations */}
      {urgentRecs.length > 0 && (
        <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px', borderLeft: '4px solid #FFB347' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#FFB347', marginBottom: '10px', letterSpacing: '0.5px' }}>
            ACTIONS URGENTES
          </div>
          {urgentRecs.map((r, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)' }}>{r.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginTop: '2px', lineHeight: 1.5 }}>{r.body}</div>
              {r.reference && <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '3px' }}>R\u00e9f : {r.reference}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Other recommendations */}
      {(highRecs.length > 0 || otherRecs.length > 0) && (
        <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px', borderLeft: '4px solid #6C7CFF' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#6C7CFF', marginBottom: '10px', letterSpacing: '0.5px' }}>
            RECOMMANDATIONS
          </div>
          {[...highRecs, ...otherRecs].map((r, i) => {
            const pc = r.priority === 'high' ? '#FFB347' : r.priority === 'medium' ? '#6C7CFF' : '#2ED573'
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'var(--p-font-mono)', fontSize: '7px', fontWeight: 800,
                  padding: '2px 6px', borderRadius: 'var(--p-radius-full)',
                  background: `${pc}15`, color: pc, flexShrink: 0, marginTop: '2px',
                }}>{r.priority.toUpperCase()}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--p-text)' }}>{r.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', marginTop: '1px' }}>{r.body}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Current medications */}
      {ps.drugs.length > 0 && (
        <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', marginBottom: '16px', borderLeft: '4px solid #2FD1C8' }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#2FD1C8', marginBottom: '10px', letterSpacing: '0.5px' }}>
            TRAITEMENTS EN COURS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ps.drugs.map((d, i) => (
              <span key={i} style={{
                padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
                background: 'rgba(47,209,200,0.08)', border: '1px solid rgba(47,209,200,0.15)',
                fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#2FD1C8', fontWeight: 600,
              }}>{d.name}{d.dose ? ` ${d.dose}` : ''}</span>
            ))}
          </div>
        </div>
      )}

      {/* Engines status */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)', borderLeft: '4px solid #B96BFF' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#B96BFF', marginBottom: '10px', letterSpacing: '0.5px' }}>
          MOTEURS ACTIFS
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { name: 'VPS', active: !!ps.vpsResult, color: '#6C7CFF' },
            { name: 'TDE', active: !!ps.tdeResult, color: '#2FD1C8' },
            { name: 'PVE', active: !!ps.pveResult, color: '#B96BFF' },
            { name: 'EWE', active: !!ps.eweResult, color: '#A78BFA' },
            { name: 'TPE', active: !!ps.tpeResult, color: '#FFB347' },
          ].map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: 'var(--p-radius-full)',
              background: e.active ? `${e.color}12` : 'var(--p-bg-elevated)',
              border: `1px solid ${e.active ? `${e.color}25` : 'var(--p-border)'}`,
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: e.active ? e.color : 'var(--p-text-dim)',
                boxShadow: e.active ? `0 0 6px ${e.color}50` : 'none',
              }} />
              <span className="page-subtitle">{e.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
