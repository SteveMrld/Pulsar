'use client'
import { useState, useMemo } from 'react'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import {
  NEUROCORE_KB, getSyndromePhase, getPhaseProfile, getRedFlagsAndTraps,
  SOURCED_DATA, type SyndromeKey, type PhaseKey,
} from '@/lib/neurocore/knowledgeBase'

type Tab = 'eeg' | 'irm' | 'biomarkers' | 'redflags' | 'knowledge'

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'eeg', label: 'EEG', icon: 'eeg', color: '#6C7CFF' },
  { id: 'irm', label: 'IRM', icon: 'brain', color: '#B96BFF' },
  { id: 'biomarkers', label: 'Biomarqueurs', icon: 'dna', color: '#2FD1C8' },
  { id: 'redflags', label: 'Red Flags', icon: 'warning', color: '#FF4757' },
  { id: 'knowledge', label: 'Base de Connaissances', icon: 'books', color: '#FFB347' },
]

const SYNDROMES: { key: SyndromeKey; label: string; color: string }[] = [
  { key: 'FIRES', label: 'FIRES', color: '#FF4757' },
  { key: 'NMDAR', label: 'Anti-NMDAR', color: '#6C7CFF' },
  { key: 'MOGAD', label: 'MOGAD', color: '#2FD1C8' },
  { key: 'NORSE', label: 'NORSE', color: '#FFB347' },
  { key: 'PIMS', label: 'PIMS', color: '#B96BFF' },
]

const PHASE_LABELS: Record<PhaseKey, { label: string; color: string }> = {
  acute: { label: 'Aiguë (J0-J3)', color: '#FF4757' },
  intermediate: { label: 'Intermédiaire (J4-J14)', color: '#FFA502' },
  chronic: { label: 'Chronique (>J14)', color: '#2ED573' },
}

function Card({ children, style, border }: { children: React.ReactNode; style?: React.CSSProperties; border?: string }) {
  return (
    <div className="glass-card" style={{
      borderRadius: 'var(--p-radius-lg)', padding: '14px',
      borderLeft: border ? `4px solid ${border}` : undefined,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: color || 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '10px', fontWeight: 700 }}>
      {children}
    </div>
  )
}

function Pill({ children, color, active, onClick }: { children: React.ReactNode; color: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 'var(--p-radius-full)', cursor: onClick ? 'pointer' : 'default',
      background: active ? `${color}20` : 'var(--p-bg-elevated)',
      border: active ? `2px solid ${color}` : 'var(--p-border)',
      color: active ? color : 'var(--p-text-muted)',
      fontSize: '11px', fontWeight: 700, fontFamily: 'var(--p-font-mono)',
      transition: 'all 150ms',
      boxShadow: active ? `0 0 12px ${color}20` : 'none',
    }}>
      {children}
    </button>
  )
}

// ── EEG Tab ──
function EEGTab({ syndrome, phase }: { syndrome: SyndromeKey; phase: PhaseKey }) {
  const profile = NEUROCORE_KB[syndrome].phases[phase]
  const eeg = profile.expectedEEG
  const signatures = NEUROCORE_KB[syndrome].eegSignatures

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card border="#6C7CFF">
        <SectionLabel color="#6C7CFF">EEG ATTENDU — {PHASE_LABELS[phase].label.toUpperCase()}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>FOND</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {eeg.background.map(b => (
                <span key={b} style={{ padding: '2px 8px', borderRadius: 'var(--p-radius-sm)', background: 'rgba(108,124,255,0.1)', color: '#6C7CFF', fontSize: '10px', fontFamily: 'var(--p-font-mono)' }}>{b.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>MONITORING</div>
            <div style={{ fontSize: '11px', color: 'var(--p-text)', marginTop: '4px' }}>{eeg.monitoringFrequency}</div>
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '4px' }}>PATTERNS TYPIQUES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {eeg.typicalPatterns.map(p => (
              <span key={p} style={{
                padding: '3px 10px', borderRadius: 'var(--p-radius-sm)',
                background: p === eeg.signaturePattern ? 'rgba(108,124,255,0.2)' : 'var(--p-bg-elevated)',
                color: p === eeg.signaturePattern ? '#6C7CFF' : 'var(--p-text-muted)',
                fontSize: '10px', fontFamily: 'var(--p-font-mono)', fontWeight: p === eeg.signaturePattern ? 800 : 500,
                border: p === eeg.signaturePattern ? '1px solid rgba(108,124,255,0.4)' : 'var(--p-border)',
                boxShadow: p === eeg.signaturePattern ? '0 0 8px rgba(108,124,255,0.2)' : 'none',
              }}>
                {p === eeg.signaturePattern && '★ '}{p.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {eeg.alertPatterns.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '9px', color: '#FF4757', fontFamily: 'var(--p-font-mono)', marginBottom: '4px' }}>PATTERNS D&apos;ALERTE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {eeg.alertPatterns.map(p => (
                <span key={p} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-sm)', background: 'rgba(255,71,87,0.1)', color: '#FF4757', fontSize: '10px', fontFamily: 'var(--p-font-mono)', border: '1px solid rgba(255,71,87,0.2)' }}>
                  ⚠ {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {signatures.length > 0 && (
        <Card border="#B96BFF">
          <SectionLabel color="#B96BFF">SIGNATURES EEG — {syndrome}</SectionLabel>
          {signatures.map((s, i) => (
            <div key={i} style={{ marginBottom: i < signatures.length - 1 ? '10px' : 0, padding: '8px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px', color: '#B96BFF' }}>{s.pattern.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Sp {(s.specificity * 100).toFixed(0)}% · Se {(s.sensitivity * 100).toFixed(0)}%</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.4' }}>{s.description}</div>
            </div>
          ))}
        </Card>
      )}

      <Card border="var(--p-text-dim)">
        <SectionLabel>DONNÉES SOURCÉES — EEG</SectionLabel>
        {syndrome === 'NMDAR' && (
          <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.5' }}>
            <div>EEG anormal dans <strong style={{ color: '#6C7CFF' }}>63.6%</strong> des cas pédiatriques <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Wu 2023, n=11)</span></div>
            <div style={{ marginTop: '4px' }}>Extreme Delta Brush associé à formes <strong style={{ color: '#FF4757' }}>plus sévères/prolongées</strong> <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Schmitt 2012; Nathoo 2021)</span></div>
          </div>
        )}
        {syndrome === 'FIRES' && (
          <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.5' }}>
            <div>Charge critique ne suit <strong style={{ color: '#FF4757' }}>PAS les rythmes circadiens</strong> classiques <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Champsas 2024)</span></div>
            <div style={{ marginTop: '4px' }}>AUC <strong style={{ color: '#6C7CFF' }}>0.72</strong> pour prédiction pronostic par patterns EEG à J3 <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Shakeshaft 2023)</span></div>
          </div>
        )}
        {!['NMDAR', 'FIRES'].includes(syndrome) && (
          <div style={{ fontSize: '11px', color: 'var(--p-text-dim)' }}>EEG intégré aux critères diagnostiques (Cellucci 2020, Wickström 2022)</div>
        )}
      </Card>
    </div>
  )
}

// ── IRM Tab ──
function IRMTab({ syndrome, phase }: { syndrome: SyndromeKey; phase: PhaseKey }) {
  const profile = NEUROCORE_KB[syndrome].phases[phase]
  const irm = profile.expectedMRI
  const signatures = NEUROCORE_KB[syndrome].mriSignatures

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card border="#B96BFF">
        <SectionLabel color="#B96BFF">IRM ATTENDUE — {PHASE_LABELS[phase].label.toUpperCase()}</SectionLabel>
        <div style={{ fontSize: '11px', color: 'var(--p-text)', marginBottom: '8px' }}>
          <strong>Timing recommandé :</strong> {irm.recommendedTiming}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '4px' }}>FINDINGS TYPIQUES</div>
            {irm.typicalFindings.map(f => (
              <div key={f} style={{ padding: '3px 8px', background: 'rgba(185,107,255,0.1)', borderRadius: 'var(--p-radius-sm)', color: '#B96BFF', fontSize: '10px', fontFamily: 'var(--p-font-mono)', marginBottom: '3px' }}>
                {f.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#FFA502', fontFamily: 'var(--p-font-mono)', marginBottom: '4px' }}>DIAGNOSTICS DIFFÉRENTIELS</div>
            {irm.differentialFindings.map(f => (
              <div key={f} style={{ padding: '3px 8px', background: 'rgba(255,165,2,0.1)', borderRadius: 'var(--p-radius-sm)', color: '#FFA502', fontSize: '10px', fontFamily: 'var(--p-font-mono)', marginBottom: '3px' }}>
                ⚠ {f.replace(/_/g, ' ')}
              </div>
            ))}
            {irm.differentialFindings.length === 0 && <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>—</div>}
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '4px' }}>SÉQUENCES RECOMMANDÉES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {irm.sequences.map(s => (
              <span key={s} style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-sm)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', border: 'var(--p-border)' }}>{s}</span>
            ))}
          </div>
        </div>
      </Card>

      {signatures.length > 0 && (
        <Card border="#2FD1C8">
          <SectionLabel color="#2FD1C8">SIGNATURES IRM — {syndrome}</SectionLabel>
          {signatures.map((s, i) => (
            <div key={i} style={{ marginBottom: i < signatures.length - 1 ? '10px' : 0, padding: '8px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px', color: '#2FD1C8' }}>{s.pattern.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Sp {(s.specificity * 100).toFixed(0)}% · Se {(s.sensitivity * 100).toFixed(0)}%</span>
                <span style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{s.timing}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.4' }}>{s.description}</div>
            </div>
          ))}
        </Card>
      )}

      <Card border="var(--p-text-dim)">
        <SectionLabel>DONNÉES SOURCÉES — IRM</SectionLabel>
        <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.6' }}>
          {syndrome === 'FIRES' && <>
            <div>IRM normale en phase aiguë : <strong style={{ color: '#B96BFF' }}>~61%</strong> pédiatrique <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Culleton 2019)</span> · <strong style={{ color: '#B96BFF' }}>~73%</strong> adulte <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Shi 2023)</span></div>
            <div>Atteinte temporale : <strong>~25%</strong> des cas <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Culleton 2019)</span></div>
            <div>Claustrum sign : timing moyen <strong style={{ color: '#FF4757' }}>~10 jours</strong> après début SE <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Shi 2023)</span></div>
            <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(255,165,2,0.08)', borderRadius: 'var(--p-radius-sm)', border: '1px solid rgba(255,165,2,0.15)' }}>
              <strong style={{ color: '#FFA502' }}>Imagerie avancée :</strong> DTI — FA réduite corps calleux corrèle avec déclin cognitif. PET — hypométabolisme thalamique bilatéral = biomarqueur pharmacorésistance
            </div>
          </>}
          {syndrome === 'NMDAR' && <>
            <div>IRM normale : <strong style={{ color: '#B96BFF' }}>63.6%</strong> pédiatrique <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Wu 2023, n=11)</span></div>
            <div>IRM initiale anormale chez enfants : <strong>~40%</strong> <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Hou 2024)</span></div>
          </>}
          {syndrome === 'MOGAD' && <div>Larges lésions T2/FLAIR bilatérales « fluffy » caractéristiques. Anti-MOG peut mimer FIRES dans 12% des cas <span style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>(Bilodeau 2024)</span></div>}
          {!['FIRES', 'NMDAR', 'MOGAD'].includes(syndrome) && <div>Données IRM intégrées selon le syndrome</div>}
        </div>
      </Card>
    </div>
  )
}

// ── Biomarkers Tab ──
function BiomarkersTab({ syndrome }: { syndrome: SyndromeKey }) {
  const kb = NEUROCORE_KB[syndrome]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card border="#2FD1C8">
        <SectionLabel color="#2FD1C8">PROFIL LCR — {syndrome}</SectionLabel>
        <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginBottom: '8px' }}>{kb.csfProfile.typical}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div><span style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>CELLULES</span><div style={{ fontSize: '12px', color: 'var(--p-text)', fontWeight: 700 }}>{kb.csfProfile.cells}</div></div>
          <div><span style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>PROTÉINES</span><div style={{ fontSize: '12px', color: 'var(--p-text)', fontWeight: 700 }}>{kb.csfProfile.protein}</div></div>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)', marginBottom: '4px' }}>MARQUEURS SPÉCIFIQUES</div>
        {kb.csfProfile.specificMarkers.map((m, i) => (
          <div key={i} style={{ fontSize: '11px', color: 'var(--p-text)', padding: '3px 0', borderBottom: i < kb.csfProfile.specificMarkers.length - 1 ? '1px solid rgba(108,124,255,0.06)' : 'none' }}>
            {m}
          </div>
        ))}
      </Card>

      <Card border="#FFB347">
        <SectionLabel color="#FFB347">BIOMARQUEURS LÉSIONNELS</SectionLabel>
        {kb.biomarkerProfile.map((b, i) => (
          <div key={i} style={{ marginBottom: '10px', padding: '8px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px', color: '#FFB347', marginBottom: '2px' }}>{b.marker}</div>
            <div style={{ fontSize: '11px', color: 'var(--p-text-muted)' }}>Attendu : {b.expected}</div>
            <div style={{ fontSize: '10px', color: '#FF6B8A', marginTop: '2px' }}>Pronostic : {b.prognosticValue}</div>
          </div>
        ))}
      </Card>

      <Card border="#6C7CFF">
        <SectionLabel color="#6C7CFF">ANTICORPS</SectionLabel>
        {kb.csfProfile.antibodies.map((a, i) => (
          <div key={i} style={{ fontSize: '11px', color: 'var(--p-text)', padding: '4px 0' }}>{a}</div>
        ))}
      </Card>
    </div>
  )
}

// ── Red Flags Tab ──
function RedFlagsTab({ syndrome, phase, hospDay }: { syndrome: SyndromeKey; phase: PhaseKey; hospDay: number }) {
  const { redFlags, traps } = getRedFlagsAndTraps(syndrome, hospDay)
  const kb = NEUROCORE_KB[syndrome]
  const diffDiag = kb.differentialDiagnosis

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card border="#FF4757">
        <SectionLabel color="#FF4757">RED FLAGS — {syndrome} · {PHASE_LABELS[phase].label}</SectionLabel>
        {redFlags.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 8px',
            background: 'rgba(255,71,87,0.06)', borderRadius: 'var(--p-radius-sm)',
            marginBottom: '4px', borderLeft: '3px solid #FF4757',
          }}>
            <span style={{ color: '#FF4757', fontSize: '12px', marginTop: '1px' }}>⚠</span>
            <span style={{ fontSize: '11px', color: 'var(--p-text)', lineHeight: '1.4' }}>{f}</span>
          </div>
        ))}
      </Card>

      <Card border="#FFA502">
        <SectionLabel color="#FFA502">PIÈGES DIAGNOSTIQUES</SectionLabel>
        {traps.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 8px',
            background: 'rgba(255,165,2,0.06)', borderRadius: 'var(--p-radius-sm)',
            marginBottom: '4px', borderLeft: '3px solid #FFA502',
          }}>
            <span style={{ color: '#FFA502', fontSize: '12px', marginTop: '1px' }}>⚡</span>
            <span style={{ fontSize: '11px', color: 'var(--p-text)', lineHeight: '1.4' }}>{t}</span>
          </div>
        ))}
      </Card>

      <Card border="#B96BFF">
        <SectionLabel color="#B96BFF">DIAGNOSTICS DIFFÉRENTIELS</SectionLabel>
        {diffDiag.map((d, i) => (
          <div key={i} style={{ marginBottom: '10px', padding: '8px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-md)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px', color: '#B96BFF', marginBottom: '4px' }}>{d.condition}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {d.distinguishingFeatures.map((f, j) => (
                <div key={j} style={{ fontSize: '10px', color: 'var(--p-text-muted)', paddingLeft: '8px' }}>• {f}</div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ── Knowledge Base Tab ──
function KnowledgeTab({ syndrome, phase }: { syndrome: SyndromeKey; phase: PhaseKey }) {
  const kb = NEUROCORE_KB[syndrome]
  const phaseProfile = kb.phases[phase]
  const tx = phaseProfile.therapeuticGuidance

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Card border="#2ED573">
        <SectionLabel color="#2ED573">GUIDANCE THÉRAPEUTIQUE — {PHASE_LABELS[phase].label}</SectionLabel>
        {(['firstLine', 'secondLine', 'thirdLine'] as const).map(line => {
          const items = tx[line]
          if (items.length === 0) return null
          const colors = { firstLine: '#2ED573', secondLine: '#FFA502', thirdLine: '#FF4757' }
          const labels = { firstLine: '1ère LIGNE', secondLine: '2ème LIGNE', thirdLine: '3ème LIGNE' }
          return (
            <div key={line} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: colors[line], fontWeight: 700, marginBottom: '4px' }}>{labels[line]}</div>
              {items.map((item, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--p-text)', padding: '3px 0 3px 10px', borderLeft: `2px solid ${colors[line]}30` }}>{item}</div>
              ))}
            </div>
          )
        })}
        <div style={{ marginTop: '6px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', fontWeight: 700, marginBottom: '4px' }}>MONITORING RECOMMANDÉ</div>
          {tx.monitoring.map((m, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--p-text-muted)', padding: '2px 0 2px 10px', borderLeft: '2px solid rgba(108,124,255,0.15)' }}>{m}</div>
          ))}
        </div>
      </Card>

      <Card border="var(--p-text-dim)">
        <SectionLabel>CLINIQUE COMPORTEMENTALE — {PHASE_LABELS[phase].label}</SectionLabel>
        {phaseProfile.clinicalFeatures.map((cf, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{
                padding: '1px 6px', borderRadius: 'var(--p-radius-sm)', fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 700,
                background: cf.severity === 'severe' ? 'rgba(255,71,87,0.1)' : cf.severity === 'moderate' ? 'rgba(255,165,2,0.1)' : 'rgba(46,213,115,0.1)',
                color: cf.severity === 'severe' ? '#FF4757' : cf.severity === 'moderate' ? '#FFA502' : '#2ED573',
              }}>{cf.severity}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p-text)', textTransform: 'capitalize' }}>{cf.domain}</span>
            </div>
            {cf.features.map((f, j) => (
              <div key={j} style={{ fontSize: '10px', color: 'var(--p-text-muted)', paddingLeft: '10px' }}>• {f}</div>
            ))}
          </div>
        ))}
      </Card>

      <Card border="#FFB347">
        <SectionLabel color="#FFB347">RÉFÉRENCES ({kb.references.length})</SectionLabel>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {kb.references.map((r, i) => (
            <div key={i} style={{ marginBottom: '8px', padding: '6px 8px', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-sm)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--p-text)' }}>{r.authors}</div>
              <div style={{ fontSize: '10px', color: 'var(--p-text-muted)', fontStyle: 'italic' }}>{r.title}</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{r.journal} {r.year}{r.doi ? ` · ${r.doi}` : ''}</div>
              <div style={{ fontSize: '10px', color: '#FFB347', marginTop: '2px' }}>{r.keyFinding}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>À PROPOS DE {syndrome}</SectionLabel>
        <div style={{ fontSize: '11px', color: 'var(--p-text)', lineHeight: '1.5', marginBottom: '6px' }}><strong>{kb.fullName}</strong></div>
        <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.5', marginBottom: '6px' }}>{kb.description}</div>
        <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', lineHeight: '1.5' }}><strong>Épidémiologie :</strong> {kb.epidemiology}</div>
        <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', lineHeight: '1.5', marginTop: '4px' }}><strong>Physiopathologie :</strong> {kb.pathophysiology}</div>
      </Card>
    </div>
  )
}

// ── Main Page ──
export default function NeuroCorePage() {
  const [tab, setTab] = useState<Tab>('eeg')
  const [syndrome, setSyndrome] = useState<SyndromeKey>('FIRES')
  const [hospDay, setHospDay] = useState(4)

  const phase = getSyndromePhase(syndrome, hospDay)

  const ps = useMemo(() => {
    const key = syndrome === 'NMDAR' ? 'NMDAR' : syndrome === 'MOGAD' ? 'CYTOKINE' : 'FIRES'
    const p = new PatientState(DEMO_PATIENTS[key]?.data || DEMO_PATIENTS['FIRES'].data)
    runPipeline(p)
    return p
  }, [syndrome])

  return (
    <div className="page-enter" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="brain" size={44} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 className="text-gradient-brand" style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, margin: 0 }}>NeuroCore</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
            Moteur de connaissance neuro-inflammatoire · 5 syndromes · 3 phases · {NEUROCORE_KB[syndrome].references.length} références
          </span>
        </div>
      </div>

      {/* Syndrome selector */}
      <div style={{ display: 'flex', gap: '6px', margin: 'var(--p-space-4) 0', flexWrap: 'wrap' }}>
        {SYNDROMES.map(s => (
          <Pill key={s.key} color={s.color} active={syndrome === s.key} onClick={() => setSyndrome(s.key)}>{s.label}</Pill>
        ))}
      </div>

      {/* Phase selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--p-space-4)' }}>
        <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>PHASE :</div>
        {(['acute', 'intermediate', 'chronic'] as PhaseKey[]).map(p => (
          <Pill key={p} color={PHASE_LABELS[p].color} active={phase === p}
            onClick={() => setHospDay(p === 'acute' ? 1 : p === 'intermediate' ? 7 : 21)}>
            {PHASE_LABELS[p].label}
          </Pill>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>J+</span>
          <input type="number" value={hospDay} onChange={e => setHospDay(Math.max(0, parseInt(e.target.value) || 0))}
            style={{ width: '48px', padding: '4px 6px', borderRadius: 'var(--p-radius-sm)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: '12px', fontFamily: 'var(--p-font-mono)', textAlign: 'center' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--p-space-4)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--p-radius-lg)',
            border: tab === t.id ? `2px solid ${t.color}` : 'var(--p-border)',
            background: tab === t.id ? `${t.color}15` : 'var(--p-bg-elevated)',
            color: tab === t.id ? t.color : 'var(--p-text-muted)',
            fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: tab === t.id ? `0 0 12px ${t.color}15` : 'none',
          }}>
            <Picto name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="page-enter-stagger">
        {tab === 'eeg' && <EEGTab syndrome={syndrome} phase={phase} />}
        {tab === 'irm' && <IRMTab syndrome={syndrome} phase={phase} />}
        {tab === 'biomarkers' && <BiomarkersTab syndrome={syndrome} />}
        {tab === 'redflags' && <RedFlagsTab syndrome={syndrome} phase={phase} hospDay={hospDay} />}
        {tab === 'knowledge' && <KnowledgeTab syndrome={syndrome} phase={phase} />}
      </div>
    </div>
  )
}
