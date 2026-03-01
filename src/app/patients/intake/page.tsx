'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Picto from '@/components/Picto'
import { analyzeIntake, type IntakeData, type IntakeAnalysis } from '@/lib/engines/IntakeAnalyzer'

/* ══════════════════════════════════════════════════════════════
   INTAKE V17 — Module d'Analyse Intelligente de Dossier
   Split-screen : Saisie clinique ← | → Analyse IA live
   ══════════════════════════════════════════════════════════════ */

const SEIZURE_TYPES = [
  { value: '', label: 'Aucune crise' },
  { value: 'focal_aware', label: 'Focale simple' },
  { value: 'focal_impaired', label: 'Focale avec altération conscience' },
  { value: 'generalized_tonic_clonic', label: 'TC généralisée' },
  { value: 'status', label: 'Status epilepticus' },
  { value: 'refractory_status', label: 'Status réfractaire' },
  { value: 'super_refractory', label: 'Status super-réfractaire' },
]

const FOCAL_SIGNS = [
  { value: 'hemiparesis', label: 'Hémiparésie' },
  { value: 'aphasia', label: 'Aphasie' },
  { value: 'dyskinesia', label: 'Dyskinésie / Mouvements anormaux' },
  { value: 'chorea', label: 'Chorée' },
  { value: 'optic_neuritis', label: 'Névrite optique' },
  { value: 'cranial_nerve', label: 'Atteinte paire crânienne' },
]

const MRI_FINDINGS = [
  { value: 'normal', label: 'Normal' },
  { value: 'limbic_temporal', label: 'Hypersignal limbique/temporal' },
  { value: 'cortical_diffusion', label: 'Restriction diffusion corticale' },
  { value: 'demyelination_large', label: 'Démyélinisation étendue (ADEM)' },
  { value: 'demyelination_periventricular', label: 'Démyélinisation périventriculaire' },
  { value: 'basal_ganglia', label: 'Atteinte noyaux gris' },
  { value: 'meningeal_enhancement', label: 'Rehaussement méningé' },
  { value: 'vasculitis_pattern', label: 'Pattern vasculitique' },
]

const CSF_ANTIBODIES = [
  { value: 'negative', label: 'Négatif' },
  { value: 'pending', label: 'En attente' },
  { value: 'nmdar', label: 'Anti-NMDAR +' },
  { value: 'mog', label: 'Anti-MOG +' },
  { value: 'lgi1', label: 'Anti-LGI1 +' },
  { value: 'caspr2', label: 'Anti-CASPR2 +' },
  { value: 'other_positive', label: 'Autre positif' },
]

/* ── Field ── */
function F({ label, children, tip, span }: { label: string; children: React.ReactNode; tip?: string; span?: number }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{ display: 'block', fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </label>
      {children}
      {tip && <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '2px', opacity: 0.6 }}>{tip}</div>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--p-radius-md)',
  background: 'var(--p-bg-elevated)', border: '1px solid rgba(108,124,255,0.1)',
  color: 'var(--p-text)', fontFamily: 'var(--p-font-mono)', fontSize: '12px',
  outline: 'none', boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'auto' as React.CSSProperties['appearance'] }

/* ── Confidence Bar ── */
function ConfBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s ease', boxShadow: `0 0 8px ${color}40` }} />
    </div>
  )
}

/* ── Urgency Gauge ── */
function UrgencyGauge({ score, level }: { score: number; level: string }) {
  const color = level === 'critical' ? '#FF4757' : level === 'high' ? '#FFA502' : level === 'moderate' ? '#FFB347' : '#2ED573'
  const r = 38, c = 2 * Math.PI * r, pct = Math.min(score, 100) / 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${c * pct * 0.75} ${c}`}
          strokeLinecap="round" transform="rotate(-225 45 45)"
          style={{ transition: 'stroke-dasharray 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
        <text x="45" y="42" textAnchor="middle" fill={color} fontFamily="var(--p-font-mono)" fontWeight="900" fontSize="22">{score}</text>
        <text x="45" y="56" textAnchor="middle" fill="var(--p-text-dim)" fontFamily="var(--p-font-mono)" fontSize="8" letterSpacing="0.5">URGENCE</text>
      </svg>
      <div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '1px' }}>{level}</div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
          {level === 'critical' ? 'Prise en charge immédiate' : level === 'high' ? 'Bilan urgent < 1h' : level === 'moderate' ? 'Bilan programmé' : 'Surveillance standard'}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */

export default function IntakePage() {
  const router = useRouter()
  const [data, setData] = useState<Partial<IntakeData>>({
    gcs: 15, temp: 37, hr: 80, spo2: 98, rr: 18, seizures24h: 0,
    wbc: 8, platelets: 250, lactate: 1, crp: 0,
    csfDone: false, eegDone: false, mriDone: false,
    feverBefore: false, covidRecent: false, recentInfection: false, vaccinationRecent: false,
    focalSigns: [], mriFindings: [], currentDrugs: [],
    sex: '', seizureType: '', consciousness: 'alert', pupils: 'reactive',
    csfAntibodies: 'negative', eegStatus: '',
  })

  const analysis = useMemo(() => analyzeIntake(data), [data])

  const set = (key: keyof IntakeData, value: unknown) => setData(prev => ({ ...prev, [key]: value }))
  const num = (key: keyof IntakeData, v: string) => set(key, v === '' ? 0 : parseFloat(v))
  const toggleArr = (key: 'focalSigns' | 'mriFindings', val: string) => {
    const arr = (data[key] as string[]) || []
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const [section, setSection] = useState<'identity' | 'neuro' | 'context' | 'bio' | 'imaging'>('identity')

  const SECTIONS = [
    { id: 'identity' as const, label: 'Identité', icon: 'heart', color: '#6C7CFF' },
    { id: 'neuro' as const, label: 'Neurologie', icon: 'brain', color: '#FF4757' },
    { id: 'context' as const, label: 'Contexte', icon: 'virus', color: '#FFB347' },
    { id: 'bio' as const, label: 'Biologie / LCR', icon: 'blood', color: '#B96BFF' },
    { id: 'imaging' as const, label: 'EEG / IRM', icon: 'eeg', color: '#2FD1C8' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* ── TOP BAR ── */}
      <div style={{
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/patients" style={{ display: 'flex', alignItems: 'center', padding: '6px', borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-dim)', textDecoration: 'none' }}>
            <span style={{ fontSize: '16px' }}>←</span>
          </Link>
          <Picto name="brain" size={24} glow glowColor="rgba(108,124,255,0.5)" />
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Analyse Intelligente</h1>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>MODULE D&apos;ADMISSION · 5 MOTEURS · ANALYSE PROGRESSIVE</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: `${analysis.urgencyLevel === 'critical' ? 'rgba(255,71,87,0.1)' : 'rgba(108,124,255,0.06)'}`,
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
            color: analysis.urgencyLevel === 'critical' ? '#FF4757' : '#6C7CFF',
          }}>Complétude {analysis.completeness}%</div>
        </div>
      </div>

      {/* ── SPLIT SCREEN ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', minHeight: 'calc(100vh - 52px)' }} className="intake-split">
        <style>{`@media(max-width:900px){.intake-split{grid-template-columns:1fr !important}}`}</style>

        {/* ════════ LEFT: FORM ════════ */}
        <div style={{ borderRight: '1px solid var(--p-border)', overflow: 'auto' }}>
          {/* Section tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--p-border)', padding: '0 16px', overflowX: 'auto' }}>
            {SECTIONS.map(s => {
              const active = section === s.id
              return (
                <button key={s.id} onClick={() => setSection(s.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 14px',
                  background: 'transparent', border: 'none',
                  borderBottom: active ? `2px solid ${s.color}` : '2px solid transparent',
                  cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '10px',
                  fontWeight: active ? 800 : 600, color: active ? s.color : 'var(--p-text-dim)',
                  whiteSpace: 'nowrap',
                }}>
                  <Picto name={s.icon} size={14} glow={active} glowColor={`${s.color}40`} />
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* Form content */}
          <div style={{ padding: '20px 24px', maxWidth: '700px' }}>

            {section === 'identity' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <F label="ÂGE (mois)"><input type="number" style={inputStyle} value={data.ageMonths || ''} onChange={e => num('ageMonths', e.target.value)} placeholder="ex: 48" /></F>
                <F label="SEXE">
                  <select style={selectStyle} value={data.sex} onChange={e => set('sex', e.target.value)}>
                    <option value="">—</option><option value="female">Fille</option><option value="male">Garçon</option>
                  </select>
                </F>
                <F label="POIDS (kg)"><input type="number" style={inputStyle} value={data.weight || ''} onChange={e => num('weight', e.target.value)} placeholder="ex: 16" /></F>
                <F label="CONSCIENCE">
                  <select style={selectStyle} value={data.consciousness} onChange={e => set('consciousness', e.target.value)}>
                    <option value="alert">Alerte</option><option value="drowsy">Somnolent</option>
                    <option value="confused">Confus / Agité</option><option value="stupor">Stupeur</option><option value="coma">Coma</option>
                  </select>
                </F>
              </div>
            )}

            {section === 'neuro' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <F label="GCS" tip="3-15"><input type="number" min={3} max={15} style={inputStyle} value={data.gcs} onChange={e => num('gcs', e.target.value)} /></F>
                <F label="PUPILLES">
                  <select style={selectStyle} value={data.pupils} onChange={e => set('pupils', e.target.value)}>
                    <option value="reactive">Réactives</option><option value="sluggish">Paresseuses</option>
                    <option value="fixed_one">Fixée unilatérale</option><option value="fixed_both">Fixes bilatérales</option>
                  </select>
                </F>
                <F label="CRISES / 24H"><input type="number" style={inputStyle} value={data.seizures24h} onChange={e => num('seizures24h', e.target.value)} /></F>
                <F label="TYPE DE CRISE">
                  <select style={selectStyle} value={data.seizureType} onChange={e => set('seizureType', e.target.value)}>
                    {SEIZURE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </F>
                <F label="SIGNES FOCAUX" span={2} tip="Cliquez pour sélectionner">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {FOCAL_SIGNS.map(f => {
                      const active = (data.focalSigns || []).includes(f.value)
                      return (
                        <button key={f.value} onClick={() => toggleArr('focalSigns', f.value)} style={{
                          padding: '5px 12px', borderRadius: 'var(--p-radius-full)',
                          background: active ? 'rgba(255,71,87,0.12)' : 'var(--p-bg-elevated)',
                          border: active ? '1px solid rgba(255,71,87,0.3)' : '1px solid rgba(108,124,255,0.1)',
                          color: active ? '#FF4757' : 'var(--p-text-dim)',
                          fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: active ? 700 : 500, cursor: 'pointer',
                        }}>{f.label}</button>
                      )
                    })}
                  </div>
                </F>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--p-border)', paddingTop: '14px' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '10px' }}>CONSTANTES VITALES</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    <F label="T°C"><input type="number" step="0.1" style={inputStyle} value={data.temp} onChange={e => num('temp', e.target.value)} /></F>
                    <F label="FC"><input type="number" style={inputStyle} value={data.hr} onChange={e => num('hr', e.target.value)} /></F>
                    <F label="SpO₂"><input type="number" style={inputStyle} value={data.spo2} onChange={e => num('spo2', e.target.value)} /></F>
                    <F label="FR"><input type="number" style={inputStyle} value={data.rr} onChange={e => num('rr', e.target.value)} /></F>
                    <F label="Lactate"><input type="number" step="0.1" style={inputStyle} value={data.lactate} onChange={e => num('lactate', e.target.value)} /></F>
                  </div>
                </div>
              </div>
            )}

            {section === 'context' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { key: 'feverBefore' as const, label: 'Fièvre prodromique', sub: 'Avant les symptômes neuro' },
                  { key: 'recentInfection' as const, label: 'Infection récente', sub: 'Virale / bactérienne' },
                  { key: 'covidRecent' as const, label: 'COVID récent', sub: '< 6 semaines' },
                  { key: 'vaccinationRecent' as const, label: 'Vaccination récente', sub: '< 4 semaines' },
                ].map(item => (
                  <button key={item.key} onClick={() => set(item.key, !data[item.key])} style={{
                    padding: '12px 16px', borderRadius: 'var(--p-radius-lg)', cursor: 'pointer',
                    background: data[item.key] ? 'rgba(255,179,71,0.1)' : 'var(--p-bg-elevated)',
                    border: data[item.key] ? '1px solid rgba(255,179,71,0.25)' : '1px solid rgba(108,124,255,0.1)',
                    textAlign: 'left',
                  }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: data[item.key] ? '#FFB347' : 'var(--p-text)' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{item.sub}</div>
                  </button>
                ))}
                {data.feverBefore && (
                  <F label="JOURS DE FIÈVRE"><input type="number" style={inputStyle} value={data.feverDays || ''} onChange={e => num('feverDays', e.target.value)} /></F>
                )}
              </div>
            )}

            {section === 'bio' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <F label="CRP (mg/L)"><input type="number" style={inputStyle} value={data.crp || ''} onChange={e => num('crp', e.target.value)} placeholder="0" /></F>
                <F label="GB (G/L)"><input type="number" step="0.1" style={inputStyle} value={data.wbc} onChange={e => num('wbc', e.target.value)} /></F>
                <F label="PLAQUETTES (G/L)"><input type="number" style={inputStyle} value={data.platelets} onChange={e => num('platelets', e.target.value)} /></F>
                <F label="LACTATE (mmol/L)"><input type="number" step="0.1" style={inputStyle} value={data.lactate} onChange={e => num('lactate', e.target.value)} /></F>

                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--p-border)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px' }}>PONCTION LOMBAIRE</div>
                    <button onClick={() => set('csfDone', !data.csfDone)} style={{
                      padding: '4px 12px', borderRadius: 'var(--p-radius-full)', cursor: 'pointer',
                      background: data.csfDone ? 'rgba(185,107,255,0.12)' : 'var(--p-bg-elevated)',
                      border: data.csfDone ? '1px solid rgba(185,107,255,0.3)' : '1px solid rgba(108,124,255,0.1)',
                      fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                      color: data.csfDone ? '#B96BFF' : 'var(--p-text-dim)',
                    }}>{data.csfDone ? 'Réalisée ✓' : 'Non réalisée'}</button>
                  </div>
                  {data.csfDone && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <F label="CELLULARITÉ (/mm³)"><input type="number" style={inputStyle} value={data.csfCells || ''} onChange={e => num('csfCells', e.target.value)} /></F>
                      <F label="PROTÉINES (g/L)"><input type="number" step="0.01" style={inputStyle} value={data.csfProtein || ''} onChange={e => num('csfProtein', e.target.value)} /></F>
                      <F label="ANTICORPS">
                        <select style={selectStyle} value={data.csfAntibodies} onChange={e => set('csfAntibodies', e.target.value)}>
                          {CSF_ANTIBODIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </F>
                    </div>
                  )}
                </div>
              </div>
            )}

            {section === 'imaging' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* EEG */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px' }}>EEG</div>
                    <button onClick={() => set('eegDone', !data.eegDone)} style={{
                      padding: '4px 12px', borderRadius: 'var(--p-radius-full)', cursor: 'pointer',
                      background: data.eegDone ? 'rgba(47,209,200,0.12)' : 'var(--p-bg-elevated)',
                      border: data.eegDone ? '1px solid rgba(47,209,200,0.3)' : '1px solid rgba(108,124,255,0.1)',
                      fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                      color: data.eegDone ? '#2FD1C8' : 'var(--p-text-dim)',
                    }}>{data.eegDone ? 'Réalisé ✓' : 'Non réalisé'}</button>
                  </div>
                  {data.eegDone && (
                    <F label="RÉSULTAT EEG">
                      <select style={selectStyle} value={data.eegStatus} onChange={e => set('eegStatus', e.target.value)}>
                        <option value="">—</option><option value="normal">Normal</option>
                        <option value="slow">Ralentissement diffus</option><option value="epileptiform">Activité épileptiforme</option>
                        <option value="status">Status electrographicus</option><option value="ncse">NCSE suspecté</option>
                      </select>
                    </F>
                  )}
                </div>

                {/* IRM */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px' }}>IRM CÉRÉBRALE</div>
                    <button onClick={() => set('mriDone', !data.mriDone)} style={{
                      padding: '4px 12px', borderRadius: 'var(--p-radius-full)', cursor: 'pointer',
                      background: data.mriDone ? 'rgba(47,209,200,0.12)' : 'var(--p-bg-elevated)',
                      border: data.mriDone ? '1px solid rgba(47,209,200,0.3)' : '1px solid rgba(108,124,255,0.1)',
                      fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                      color: data.mriDone ? '#2FD1C8' : 'var(--p-text-dim)',
                    }}>{data.mriDone ? 'Réalisée ✓' : 'Non réalisée'}</button>
                  </div>
                  {data.mriDone && (
                    <F label="RÉSULTATS IRM" tip="Cliquez pour sélectionner">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {MRI_FINDINGS.map(f => {
                          const active = (data.mriFindings || []).includes(f.value)
                          return (
                            <button key={f.value} onClick={() => toggleArr('mriFindings', f.value)} style={{
                              padding: '5px 12px', borderRadius: 'var(--p-radius-full)',
                              background: active ? 'rgba(47,209,200,0.12)' : 'var(--p-bg-elevated)',
                              border: active ? '1px solid rgba(47,209,200,0.3)' : '1px solid rgba(108,124,255,0.1)',
                              color: active ? '#2FD1C8' : 'var(--p-text-dim)',
                              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: active ? 700 : 500, cursor: 'pointer',
                            }}>{f.label}</button>
                          )
                        })}
                      </div>
                    </F>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════ RIGHT: AI ANALYSIS ════════ */}
        <div style={{ background: 'var(--p-bg-card)', overflow: 'auto', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Urgency */}
            <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
              <UrgencyGauge score={analysis.urgencyScore} level={analysis.urgencyLevel} />
            </div>

            {/* Clinical summary */}
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--p-radius-lg)',
              background: 'rgba(108,124,255,0.04)', border: '1px solid rgba(108,124,255,0.1)',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-muted)', lineHeight: 1.6,
            }}>
              <Picto name="brain" size={12} /> {analysis.clinicalSummary}
            </div>

            {/* Differential Diagnosis */}
            <div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>DIAGNOSTIC DIFFÉRENTIEL</div>
              {analysis.differentials.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', background: 'var(--p-bg-elevated)', borderRadius: 'var(--p-radius-lg)' }}>
                  Données insuffisantes — renseignez les données cliniques
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {analysis.differentials.slice(0, 5).map((dd, i) => (
                    <div key={dd.syndrome} style={{
                      padding: '10px 14px', borderRadius: 'var(--p-radius-lg)',
                      background: i === 0 ? `${dd.color}08` : 'var(--p-bg-elevated)',
                      border: i === 0 ? `1px solid ${dd.color}20` : '1px solid rgba(108,124,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: dd.color }}>{dd.syndrome}</span>
                        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900, color: dd.color }}>{dd.confidence}%</span>
                      </div>
                      <ConfBar value={dd.confidence} color={dd.color} />
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '4px' }}>
                        {dd.matchedMajor}/{dd.totalMajor} majeurs · {dd.matchedCriteria.filter(c => c.weight === 'minor' && c.matched).length} mineurs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Red Flags */}
            {analysis.redFlags.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: '#FF4757', letterSpacing: '1px', marginBottom: '8px' }}>
                  <Picto name="alert" size={11} /> RED FLAGS ({analysis.redFlags.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {analysis.redFlags.map((rf, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: 'var(--p-radius-md)',
                      background: rf.severity === 'critical' ? 'rgba(255,71,87,0.06)' : 'rgba(255,179,71,0.06)',
                      border: `1px solid ${rf.severity === 'critical' ? 'rgba(255,71,87,0.15)' : 'rgba(255,179,71,0.15)'}`,
                      fontFamily: 'var(--p-font-mono)', fontSize: '10px',
                      color: rf.severity === 'critical' ? '#FF4757' : '#FFB347',
                    }}>{rf.flag}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Exams */}
            {analysis.recommendedExams.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>EXAMENS RECOMMANDÉS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {analysis.recommendedExams.map((ex, i) => {
                    const col = ex.urgency === 'immediate' ? '#FF4757' : ex.urgency === 'urgent' ? '#FFA502' : '#6C7CFF'
                    return (
                      <div key={i} style={{
                        padding: '8px 12px', borderRadius: 'var(--p-radius-md)',
                        background: 'var(--p-bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text)' }}>{ex.name}</div>
                          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{ex.rationale}</div>
                        </div>
                        <span style={{
                          fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800,
                          padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                          background: `${col}12`, color: col, border: `1px solid ${col}25`,
                          textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                        }}>{ex.urgency === 'immediate' ? 'Immédiat' : ex.urgency === 'urgent' ? 'Urgent' : 'Standard'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Engine Readiness */}
            <div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>MOTEURS PULSAR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.engineReadiness.map(eng => (
                  <div key={eng.engine} title={eng.reason} style={{
                    padding: '6px 12px', borderRadius: 'var(--p-radius-full)',
                    background: eng.ready ? 'rgba(46,213,115,0.08)' : 'var(--p-bg-elevated)',
                    border: eng.ready ? '1px solid rgba(46,213,115,0.2)' : '1px solid rgba(108,124,255,0.06)',
                    fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
                    color: eng.ready ? '#2ED573' : 'var(--p-text-dim)',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: eng.ready ? '#2ED573' : 'var(--p-text-dim)', boxShadow: eng.ready ? '0 0 4px #2ED573' : 'none' }} />
                    {eng.engine}
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Cases */}
            {analysis.similarCases.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>CAS SIMILAIRES (Registre)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {analysis.similarCases.map(c => (
                    <div key={c.caseId} style={{
                      padding: '8px 12px', borderRadius: 'var(--p-radius-md)',
                      background: 'var(--p-bg-elevated)', display: 'flex', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--p-text)' }}>{c.caseId}</div>
                        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>{c.family} · {c.region}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: c.outcome.includes('Rémission') ? '#2ED573' : '#FFB347' }}>{c.outcome}</div>
                        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>Sév. {c.severity}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            <button onClick={() => router.push('/patients')} style={{
              marginTop: '8px', padding: '14px', borderRadius: 'var(--p-radius-lg)', border: 'none',
              background: analysis.completeness >= 30 ? 'linear-gradient(135deg, #6C7CFF, #B96BFF)' : 'var(--p-bg-elevated)',
              color: analysis.completeness >= 30 ? '#fff' : 'var(--p-text-dim)',
              fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
              letterSpacing: '0.5px', boxShadow: analysis.completeness >= 30 ? '0 4px 20px rgba(108,124,255,0.3)' : 'none',
            }}>
              Admettre et lancer les moteurs →
            </button>

            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', textAlign: 'center', padding: '8px 0' }}>
              PULSAR V17 · Analyse intelligente · Ne se substitue pas au jugement clinique
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
