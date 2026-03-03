'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'

/* ══════════════════════════════════════════════════════════════
   ADMISSION — Nouveau patient
   Formulaire 4 étapes : Identité → Neuro/Constantes → Bio/Imagerie → Validation
   ══════════════════════════════════════════════════════════════ */

const STEPS = [
  { id: 1, label: 'Identité', icon: 'heart', color: '#6C7CFF' },
  { id: 2, label: 'Clinique', icon: 'brain', color: '#FF6B8A' },
  { id: 3, label: 'Examens', icon: 'microscope', color: '#B96BFF' },
  { id: 4, label: 'Validation', icon: 'shield', color: '#2ED573' },
]

interface FormData {
  /* Step 1 — Identité */
  lastName: string; firstName: string; birthDate: string
  sex: 'male' | 'female' | ''; weight: string; allergies: string
  room: string; admissionDate: string; referringDoctor: string
  /* Step 2 — Clinique */
  chiefComplaint: string; gcs: string; seizures24h: string
  seizureType: string; focalSigns: string
  temp: string; hr: string; bp: string; spo2: string; rr: string
  consciousness: string
  /* Step 3 — Examens */
  labResults: string; csfDone: boolean; csfResults: string
  eegDone: boolean; eegResults: string
  mriDone: boolean; mriResults: string
  currentMeds: string
  /* Step 4 — computed */
}

const INITIAL: FormData = {
  lastName: '', firstName: '', birthDate: '', sex: '', weight: '',
  allergies: '', room: '', admissionDate: new Date().toISOString().slice(0, 10),
  referringDoctor: '',
  chiefComplaint: '', gcs: '15', seizures24h: '0', seizureType: '',
  focalSigns: '', temp: '', hr: '', bp: '', spo2: '', rr: '',
  consciousness: 'alert',
  labResults: '', csfDone: false, csfResults: '', eegDone: false,
  eegResults: '', mriDone: false, mriResults: '', currentMeds: '',
}

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{
        display: 'block', fontFamily: 'var(--p-font-mono)', fontSize: '10px',
        fontWeight: 700, color: 'var(--p-text-dim)', letterSpacing: '0.5px',
        marginBottom: '6px', textTransform: 'uppercase',
      }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 'var(--p-radius-md)',
  background: 'var(--p-bg-elevated)', border: '1px solid var(--p-border)',
  fontFamily: 'var(--p-font-body)', fontSize: '13px', color: 'var(--p-text)',
  outline: 'none', transition: 'border-color 0.2s',
}

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

export default function AdmissionPage() {
  const { t } = useLang()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [analyzing, setAnalyzing] = useState(false)

  const set = (key: keyof FormData, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const canNext = () => {
    if (step === 1) return form.lastName && form.firstName && form.sex
    if (step === 2) return form.gcs
    if (step === 3) return true
    return true
  }

  const handleValidate = () => {
    setAnalyzing(true)
    // Simulate analysis — in prod this would run the 5 engines
    setTimeout(() => {
      // For now redirect to demo patient cockpit
      router.push('/patient/ines/cockpit')
    }, 2500)
  }

  const ageFromBirthDate = () => {
    if (!form.birthDate) return ''
    const birth = new Date(form.birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    if (years === 0) return `${months} mois`
    if (years < 2) return `${years * 12 + months} mois`
    return `${years} ans`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>
      {/* ── TOP BAR ── */}
      <div style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg-card)',
      }}>
        <button onClick={() => router.push('/patients')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--p-text-dim)', fontSize: '16px', padding: '4px',
        }}>←</button>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Nouveau patient</h1>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '1px' }}>ADMISSION</span>
        </div>
      </div>

      {/* ── STEPPER ── */}
      <div style={{
        display: 'flex', gap: '4px', padding: '16px 24px', maxWidth: '700px', margin: '0 auto',
      }}>
        {STEPS.map(s => (
          <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: '3px', borderRadius: '2px', marginBottom: '8px',
              background: step >= s.id ? s.color : 'var(--p-border)',
              boxShadow: step >= s.id ? `0 0 8px ${s.color}40` : 'none',
              transition: 'all 0.3s',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Picto name={s.icon} size={12} glow={step === s.id} glowColor={step === s.id ? `${s.color}60` : undefined} />
              <span style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: step === s.id ? 800 : 600,
                color: step >= s.id ? s.color : 'var(--p-text-dim)',
              }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FORM CONTENT ── */}
      <div style={{ padding: '8px 24px 40px', maxWidth: '700px', margin: '0 auto' }}>
        <div className="glass-card" style={{
          padding: '28px', borderRadius: 'var(--p-radius-xl)',
          borderTop: `3px solid ${STEPS[step - 1].color}`,
        }}>

          {/* ── STEP 1 : IDENTITÉ ── */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Nom"><input style={inputStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Dupont" /></Field>
              <Field label="Prénom"><input style={inputStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Emma" /></Field>
              <Field label="Date de naissance">
                <input type="date" style={inputStyle} value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
                {ageFromBirthDate() && <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#6C7CFF', marginTop: '4px', display: 'block' }}>{ageFromBirthDate()}</span>}
              </Field>
              <Field label="Sexe">
                <select style={selectStyle} value={form.sex} onChange={e => set('sex', e.target.value)}>
                  <option value="">—</option>
                  <option value="female">Fille</option>
                  <option value="male">Garçon</option>
                </select>
              </Field>
              <Field label="Poids (kg)"><input style={inputStyle} value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="16" type="number" /></Field>
              <Field label="Allergies connues"><input style={inputStyle} value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="Aucune" /></Field>
              <Field label="Chambre / Lit"><input style={inputStyle} value={form.room} onChange={e => set('room', e.target.value)} placeholder="Réa Neuro — Lit 3" /></Field>
              <Field label="Date d'admission"><input type="date" style={inputStyle} value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} /></Field>
              <Field label="Médecin référent" span={2}><input style={inputStyle} value={form.referringDoctor} onChange={e => set('referringDoctor', e.target.value)} placeholder="Dr. Martin" /></Field>
            </div>
          )}

          {/* ── STEP 2 : CLINIQUE ── */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Motif d'admission" span={2}>
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.chiefComplaint} onChange={e => set('chiefComplaint', e.target.value)} placeholder="Crises convulsives répétées, fièvre 39.2°C, altération de la conscience..." />
              </Field>

              <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--p-border)', paddingBottom: '4px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#FF6B8A', letterSpacing: '1px' }}>NEUROLOGIQUE</span>
              </div>

              <Field label="Glasgow (GCS)">
                <input type="number" min="3" max="15" style={inputStyle} value={form.gcs} onChange={e => set('gcs', e.target.value)} />
                {parseInt(form.gcs) <= 8 && <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#FF4757', marginTop: '4px', display: 'block', fontWeight: 700 }}>GCS CRITIQUE</span>}
              </Field>
              <Field label="Crises / 24h">
                <input type="number" min="0" style={inputStyle} value={form.seizures24h} onChange={e => set('seizures24h', e.target.value)} />
              </Field>
              <Field label="Type de crise">
                <select style={selectStyle} value={form.seizureType} onChange={e => set('seizureType', e.target.value)}>
                  <option value="">—</option>
                  <option value="focal">Focale</option>
                  <option value="generalized">Généralisée</option>
                  <option value="refractory">Réfractaire</option>
                  <option value="super-refractory">Super-réfractaire</option>
                  <option value="status">Etat de mal</option>
                </select>
              </Field>
              <Field label="Conscience">
                <select style={selectStyle} value={form.consciousness} onChange={e => set('consciousness', e.target.value)}>
                  <option value="alert">Alerte</option>
                  <option value="drowsy">Somnolent</option>
                  <option value="stupor">Stupeur</option>
                  <option value="coma">Coma</option>
                </select>
              </Field>
              <Field label="Signes focaux" span={2}><input style={inputStyle} value={form.focalSigns} onChange={e => set('focalSigns', e.target.value)} placeholder="Hémiparésie droite, aphasie..." /></Field>

              <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--p-border)', paddingBottom: '4px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#2FD1C8', letterSpacing: '1px' }}>CONSTANTES VITALES</span>
              </div>

              <Field label="Temp. (°C)"><input type="number" step="0.1" style={inputStyle} value={form.temp} onChange={e => set('temp', e.target.value)} placeholder="38.5" /></Field>
              <Field label="FC (bpm)"><input type="number" style={inputStyle} value={form.hr} onChange={e => set('hr', e.target.value)} placeholder="120" /></Field>
              <Field label="PA (mmHg)"><input style={inputStyle} value={form.bp} onChange={e => set('bp', e.target.value)} placeholder="95/60" /></Field>
              <Field label="SpO2 (%)"><input type="number" style={inputStyle} value={form.spo2} onChange={e => set('spo2', e.target.value)} placeholder="97" /></Field>
              <Field label="FR (/min)"><input type="number" style={inputStyle} value={form.rr} onChange={e => set('rr', e.target.value)} placeholder="22" /></Field>
            </div>
          )}

          {/* ── STEP 3 : EXAMENS ── */}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <Field label="Résultats biologiques disponibles">
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.labResults} onChange={e => set('labResults', e.target.value)} placeholder="CRP 45, GB 12000, Na 138, K 3.8, glycémie 0.95..." />
              </Field>

              {/* PL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.csfDone} onChange={e => set('csfDone', e.target.checked)} />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text)', fontWeight: 600 }}>PL réalisée</span>
                </label>
              </div>
              {form.csfDone && (
                <Field label="Résultats LCR">
                  <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.csfResults} onChange={e => set('csfResults', e.target.value)} placeholder="Cellularité, protéines, glucose, bandes oligoclonales..." />
                </Field>
              )}

              {/* EEG */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.eegDone} onChange={e => set('eegDone', e.target.checked)} />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text)', fontWeight: 600 }}>EEG réalisé</span>
                </label>
              </div>
              {form.eegDone && (
                <Field label="Résultats EEG">
                  <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.eegResults} onChange={e => set('eegResults', e.target.value)} placeholder="Activité épileptique, localisation, pattern..." />
                </Field>
              )}

              {/* IRM */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.mriDone} onChange={e => set('mriDone', e.target.checked)} />
                  <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text)', fontWeight: 600 }}>IRM cérébrale réalisée</span>
                </label>
              </div>
              {form.mriDone && (
                <Field label="Résultats IRM">
                  <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.mriResults} onChange={e => set('mriResults', e.target.value)} placeholder="Hypersignaux T2/FLAIR, topographie, rehaussement..." />
                </Field>
              )}

              <Field label="Traitements en cours">
                <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.currentMeds} onChange={e => set('currentMeds', e.target.value)} placeholder="Lévétiracétam 500mg x2, Dexaméthasone 4mg x4..." />
              </Field>
            </div>
          )}

          {/* ── STEP 4 : VALIDATION ── */}
          {step === 4 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Picto name="shield" size={40} glow glowColor="rgba(46,213,115,0.4)" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-text)', marginTop: '12px' }}>Vérification du dossier</h3>
                <p style={{ fontSize: '12px', color: 'var(--p-text-muted)', marginTop: '4px' }}>PULSAR va analyser les données et activer les 5 moteurs.</p>
              </div>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-lg)', borderLeft: '3px solid #6C7CFF' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '6px' }}>PATIENT</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--p-text)' }}>{form.firstName} {form.lastName}</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                    {ageFromBirthDate()} · {form.sex === 'female' ? '♀' : form.sex === 'male' ? '♂' : '?'} · {form.weight || '?'} kg
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-lg)', borderLeft: '3px solid #FF6B8A' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '6px' }}>NEURO</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: parseInt(form.gcs) <= 8 ? '#FF4757' : 'var(--p-text)' }}>GCS {form.gcs}/15</div>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '2px' }}>
                    {form.seizures24h} crise{parseInt(form.seizures24h) > 1 ? 's' : ''}/24h · {form.seizureType || 'non précisé'}
                  </div>
                </div>
              </div>

              {/* Missing data alerts */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#FFB347', letterSpacing: '1px', marginBottom: '8px' }}>DONNÉES MANQUANTES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {!form.temp && <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#FFB347' }}>Température</span>}
                  {!form.csfDone && <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#FFB347' }}>PL non faite</span>}
                  {!form.eegDone && <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#FFB347' }}>EEG non fait</span>}
                  {!form.mriDone && <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#FFB347' }}>IRM non faite</span>}
                  {!form.labResults && <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#FFB347' }}>Biologie</span>}
                  {!form.weight && <span style={{ padding: '3px 10px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#FFB347' }}>Poids</span>}
                </div>
                <p style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '8px' }}>
                  PULSAR peut fonctionner avec des données partielles. Les examens manquants seront priorisés.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── NAVIGATION BUTTONS ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} style={{
              padding: '12px 24px', borderRadius: 'var(--p-radius-lg)',
              background: 'var(--p-bg-elevated)', border: '1px solid var(--p-border)',
              cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '12px',
              fontWeight: 600, color: 'var(--p-text-muted)',
            }}>← Précédent</button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} style={{
              padding: '12px 32px', borderRadius: 'var(--p-radius-lg)',
              background: canNext() ? STEPS[step - 1].color : 'var(--p-bg-elevated)',
              border: 'none', cursor: canNext() ? 'pointer' : 'default',
              fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 700,
              color: canNext() ? 'white' : 'var(--p-text-dim)',
              boxShadow: canNext() ? `0 4px 16px ${STEPS[step - 1].color}40` : 'none',
              opacity: canNext() ? 1 : 0.5,
            }}>Suivant →</button>
          ) : (
            <button onClick={handleValidate} disabled={analyzing} style={{
              padding: '12px 32px', borderRadius: 'var(--p-radius-lg)',
              background: analyzing ? 'var(--p-bg-elevated)' : 'linear-gradient(135deg, #2ED573, #2FD1C8)',
              border: 'none', cursor: analyzing ? 'default' : 'pointer',
              fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 700,
              color: 'white',
              boxShadow: analyzing ? 'none' : '0 4px 16px rgba(46,213,115,0.4)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {analyzing ? (
                <>
                  <span className="animate-breathe" style={{ display: 'inline-block' }}>●</span>
                  Analyse en cours...
                </>
              ) : (
                <>Lancer l&apos;analyse PULSAR</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
