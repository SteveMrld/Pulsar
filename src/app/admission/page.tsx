'use client'
import { useState, useMemo } from 'react'
import Picto from '@/components/Picto'

type FormData = {
  nom: string; prenom: string; sexe: 'M' | 'F' | ''; ageAns: string; ageMois: string
  poids: string; taille: string; groupeSanguin: string
  allergies: string; traitements: string
  terrainAutoImmun: boolean; terrainHemato: boolean; terrainPIMS: boolean; terrainPostCovid: boolean
  antecedents: string; motifAdmission: string
  gcs: string; crises: boolean; typeCrises: string; fievre: string
  debutSymptomes: string; commentaire: string
}

const INIT: FormData = {
  nom: '', prenom: '', sexe: '', ageAns: '', ageMois: '',
  poids: '', taille: '', groupeSanguin: '',
  allergies: '', traitements: '',
  terrainAutoImmun: false, terrainHemato: false, terrainPIMS: false, terrainPostCovid: false,
  antecedents: '', motifAdmission: '',
  gcs: '15', crises: false, typeCrises: '', fievre: '',
  debutSymptomes: '', commentaire: '',
}

const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function getAgeGroup(ageMonths: number): string {
  if (ageMonths < 12) return 'Nourrisson (<1 an)'
  if (ageMonths < 60) return 'Petit enfant (1-4 ans)'
  if (ageMonths < 144) return 'Enfant (5-11 ans)'
  return 'Adolescent (12+ ans)'
}

function getNormalRanges(ageMonths: number) {
  if (ageMonths < 12) return { fc: '110-160', ta: '70-100/50-65', fr: '30-60', spo2: '≥95%' }
  if (ageMonths < 60) return { fc: '90-140', ta: '80-110/50-70', fr: '24-40', spo2: '≥95%' }
  if (ageMonths < 144) return { fc: '70-120', ta: '90-120/60-80', fr: '18-30', spo2: '≥95%' }
  return { fc: '60-100', ta: '100-130/65-85', fr: '12-20', spo2: '≥95%' }
}

const card: React.CSSProperties = { borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-4)' }
const label: React.CSSProperties = { display: 'block', fontSize: 'var(--p-text-xs)', fontWeight: 600, color: 'var(--p-text-muted)', marginBottom: '4px' }
const input: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', fontSize: 'var(--p-text-sm)', outline: 'none' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-space-3)' }
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--p-space-3)' }

export default function AdmissionPage() {
  const [form, setForm] = useState<FormData>(INIT)
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof FormData, val: string | boolean) => setForm(prev => ({ ...prev, [key]: val }))

  const ageMonths = useMemo(() => {
    const a = parseInt(form.ageAns) || 0
    const m = parseInt(form.ageMois) || 0
    return a * 12 + m
  }, [form.ageAns, form.ageMois])

  const ageGroup = useMemo(() => ageMonths > 0 ? getAgeGroup(ageMonths) : '', [ageMonths])
  const normals = useMemo(() => ageMonths > 0 ? getNormalRanges(ageMonths) : null, [ageMonths])

  const filled = form.nom && form.prenom && form.sexe && ageMonths > 0 && form.poids
  const terrainCount = [form.terrainAutoImmun, form.terrainHemato, form.terrainPIMS, form.terrainPostCovid].filter(Boolean).length

  const handleSubmit = () => {
    if (!filled) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="page-enter" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', paddingTop: 'var(--p-space-8)' }}>
        <div className="glass-card" style={{ padding: 'var(--p-space-8)' }}>
          <Picto name="clipboard" size={48} glow glowColor="rgba(46,213,115,0.5)" />
          <h2 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-success)', marginTop: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>Patient enregistré</h2>
          <div style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-2)' }}>{form.prenom} {form.nom}</div>
          <div style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-4)' }}>
            {form.sexe === 'M' ? 'Garçon' : 'Fille'} · {form.ageAns || 0} ans {form.ageMois ? `${form.ageMois} mois` : ''} · {form.poids} kg · {ageGroup}
          </div>
          {terrainCount > 0 && (
            <div style={{ fontSize: 'var(--p-text-xs)', padding: '6px 16px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.15)', color: 'var(--p-warning)', fontWeight: 600, display: 'inline-block', marginBottom: 'var(--p-space-4)' }}>
              {terrainCount} terrain{terrainCount > 1 ? 's' : ''} à risque identifié{terrainCount > 1 ? 's' : ''}
            </div>
          )}
          {normals && (
            <div style={{ ...grid2, maxWidth: '400px', margin: '0 auto var(--p-space-5)', textAlign: 'left' }}>
              {[{ l: 'FC', v: normals.fc }, { l: 'TA', v: normals.ta }, { l: 'FR', v: normals.fr }, { l: 'SpO₂', v: normals.spo2 }].map((n, i) => (
                <div key={i} style={{ padding: '6px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{n.l} </span>
                  <span style={{ fontSize: 'var(--p-text-xs)', fontWeight: 700, fontFamily: 'var(--p-font-mono)', color: 'var(--p-vps)' }}>{n.v}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--p-space-3)', justifyContent: 'center' }}>
            <button onClick={() => setSubmitted(false)} style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-md)', border: 'var(--p-border)', background: 'var(--p-bg-elevated)', color: 'var(--p-text)', cursor: 'pointer', fontSize: 'var(--p-text-sm)' }}>Modifier</button>
            <a href="/cockpit" style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-md)', border: 'none', background: 'var(--p-vps)', color: '#fff', cursor: 'pointer', fontSize: 'var(--p-text-sm)', fontWeight: 700, textDecoration: 'none' }}>Cockpit vital →</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="clipboard" size={36} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Admission patient</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Formulaire complet · Création du PatientState</span>
        </div>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-5)' }}>Renseignez les informations du patient. Les normes vitales sont calculées automatiquement selon l&apos;âge.</p>

      {/* IDENTITÉ */}
      <div className="glass-card" style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-4)' }}>
          <Picto name="family" size={20} />
          <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-vps)' }}>Identité</span>
        </div>
        <div style={grid2}>
          <div><label style={label}>Nom *</label><input style={input} value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Nom de famille" /></div>
          <div><label style={label}>Prénom *</label><input style={input} value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Prénom" /></div>
        </div>
        <div style={{ ...grid3, marginTop: 'var(--p-space-3)' }}>
          <div>
            <label style={label}>Sexe *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['M', 'F'] as const).map(s => (
                <button key={s} onClick={() => set('sexe', s)} style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--p-radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--p-text-sm)',
                  border: form.sexe === s ? '2px solid var(--p-vps)' : 'var(--p-border)',
                  background: form.sexe === s ? 'rgba(108,124,255,0.15)' : 'var(--p-bg-elevated)',
                  color: form.sexe === s ? 'var(--p-vps)' : 'var(--p-text-muted)',
                }}>{s === 'M' ? 'Garçon' : 'Fille'}</button>
              ))}
            </div>
          </div>
          <div><label style={label}>Âge (ans) *</label><input style={input} type="number" min="0" max="18" value={form.ageAns} onChange={e => set('ageAns', e.target.value)} placeholder="0" /></div>
          <div><label style={label}>Mois complémentaires</label><input style={input} type="number" min="0" max="11" value={form.ageMois} onChange={e => set('ageMois', e.target.value)} placeholder="0" /></div>
        </div>
        {ageGroup && (
          <div style={{ marginTop: 'var(--p-space-3)', padding: '6px 14px', borderRadius: 'var(--p-radius-md)', background: 'rgba(108,124,255,0.08)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--p-vps)', fontWeight: 600 }}>{ageGroup}</span>
            <span style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{ageMonths} mois</span>
          </div>
        )}
      </div>

      {/* MORPHOLOGIE */}
      <div className="glass-card" style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-4)' }}>
          <Picto name="heart" size={20} />
          <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-tde)' }}>Morphologie</span>
        </div>
        <div style={grid3}>
          <div><label style={label}>Poids (kg) *</label><input style={input} type="number" step="0.1" value={form.poids} onChange={e => set('poids', e.target.value)} placeholder="kg" /></div>
          <div><label style={label}>Taille (cm)</label><input style={input} type="number" value={form.taille} onChange={e => set('taille', e.target.value)} placeholder="cm" /></div>
          <div>
            <label style={label}>Groupe sanguin</label>
            <select style={input} value={form.groupeSanguin} onChange={e => set('groupeSanguin', e.target.value)}>
              <option value="">—</option>
              {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TERRAIN */}
      <div className="glass-card" style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-4)' }}>
          <Picto name="warning" size={20} />
          <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-ewe)' }}>Terrain à risque</span>
          {terrainCount > 0 && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.15)', color: 'var(--p-warning)', fontWeight: 700 }}>{terrainCount}</span>}
        </div>
        <div style={{ ...grid2, marginBottom: 'var(--p-space-3)' }}>
          {[
            { key: 'terrainAutoImmun' as const, label: 'Auto-immun', hint: 'Lupus, thyroïdite, ADEM...' },
            { key: 'terrainHemato' as const, label: 'Hématologique', hint: 'Drépanocytose, leucémie...' },
            { key: 'terrainPIMS' as const, label: 'PIMS / MIS-C', hint: 'Post-COVID, Kawasaki-like' },
            { key: 'terrainPostCovid' as const, label: 'Post-COVID', hint: 'Infection récente SARS-CoV-2' },
          ].map(t => (
            <button key={t.key} onClick={() => set(t.key, !form[t.key])} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
              borderRadius: 'var(--p-radius-md)', cursor: 'pointer', textAlign: 'left',
              border: form[t.key] ? '2px solid var(--p-warning)' : 'var(--p-border)',
              background: form[t.key] ? 'rgba(255,179,71,0.1)' : 'var(--p-bg-elevated)',
            }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: form[t.key] ? '2px solid var(--p-warning)' : '2px solid var(--p-gray-3)', background: form[t.key] ? 'var(--p-warning)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', flexShrink: 0 }}>{form[t.key] ? '✓' : ''}</div>
              <div>
                <div style={{ fontSize: 'var(--p-text-xs)', fontWeight: 600, color: form[t.key] ? 'var(--p-warning)' : 'var(--p-text)' }}>{t.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{t.hint}</div>
              </div>
            </button>
          ))}
        </div>
        <div>
          <label style={label}>Allergies connues</label>
          <input style={input} value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="Pénicilline, iode, latex..." />
        </div>
        <div style={{ marginTop: 'var(--p-space-3)' }}>
          <label style={label}>Traitements chroniques</label>
          <input style={input} value={form.traitements} onChange={e => set('traitements', e.target.value)} placeholder="Lévétiracétam, corticoïdes..." />
        </div>
        <div style={{ marginTop: 'var(--p-space-3)' }}>
          <label style={label}>Antécédents</label>
          <textarea style={{ ...input, minHeight: '60px', resize: 'vertical' }} value={form.antecedents} onChange={e => set('antecedents', e.target.value)} placeholder="Crises fébriles, hospitalisation antérieure, chirurgie..." />
        </div>
      </div>

      {/* PRÉSENTATION CLINIQUE */}
      <div className="glass-card" style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-4)' }}>
          <Picto name="alert" size={20} />
          <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-critical)' }}>Présentation clinique initiale</span>
        </div>
        <div>
          <label style={label}>Motif d&apos;admission</label>
          <input style={input} value={form.motifAdmission} onChange={e => set('motifAdmission', e.target.value)} placeholder="Crises convulsives fébriles récurrentes..." />
        </div>
        <div style={{ ...grid3, marginTop: 'var(--p-space-3)' }}>
          <div><label style={label}>GCS initial</label><input style={input} type="number" min="3" max="15" value={form.gcs} onChange={e => set('gcs', e.target.value)} /></div>
          <div><label style={label}>Température (°C)</label><input style={input} type="number" step="0.1" value={form.fievre} onChange={e => set('fievre', e.target.value)} placeholder="38.5" /></div>
          <div><label style={label}>Début symptômes</label><input style={input} type="date" value={form.debutSymptomes} onChange={e => set('debutSymptomes', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 'var(--p-space-3)' }}>
          <label style={label}>Crises épileptiques</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: form.crises ? 'var(--p-space-3)' : 0 }}>
            {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(o => (
              <button key={String(o.v)} onClick={() => set('crises', o.v)} style={{
                padding: '8px 20px', borderRadius: 'var(--p-radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--p-text-sm)',
                border: form.crises === o.v ? `2px solid ${o.v ? 'var(--p-critical)' : 'var(--p-success)'}` : 'var(--p-border)',
                background: form.crises === o.v ? (o.v ? 'rgba(255,71,87,0.1)' : 'rgba(46,213,115,0.1)') : 'var(--p-bg-elevated)',
                color: form.crises === o.v ? (o.v ? 'var(--p-critical)' : 'var(--p-success)') : 'var(--p-text-muted)',
              }}>{o.l}</button>
            ))}
          </div>
          {form.crises && (
            <select style={input} value={form.typeCrises} onChange={e => set('typeCrises', e.target.value)}>
              <option value="">Type de crises...</option>
              <option value="focal">Focales</option>
              <option value="generalized">Tonico-cloniques généralisées</option>
              <option value="refractory">Réfractaires</option>
              <option value="super_refractory">Super-réfractaires</option>
              <option value="status">État de mal épileptique</option>
            </select>
          )}
        </div>
        <div style={{ marginTop: 'var(--p-space-3)' }}>
          <label style={label}>Commentaire libre</label>
          <textarea style={{ ...input, minHeight: '60px', resize: 'vertical' }} value={form.commentaire} onChange={e => set('commentaire', e.target.value)} placeholder="Contexte clinique, observations..." />
        </div>
      </div>

      {/* NORMES AUTOMATIQUES */}
      {normals && (
        <div className="glass-card" style={{ padding: 'var(--p-space-4)', marginBottom: 'var(--p-space-4)' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--p-text-dim)', marginBottom: 'var(--p-space-3)' }}>Normes vitales calculées — {ageGroup}</div>
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--p-space-3)' }}>
            {[
              { l: 'FC', v: normals.fc, u: 'bpm', icon: 'heart' },
              { l: 'TA', v: normals.ta, u: 'mmHg', icon: 'blood' },
              { l: 'FR', v: normals.fr, u: '/min', icon: 'lungs' },
              { l: 'SpO₂', v: normals.spo2, u: '', icon: 'lungs' },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)' }}>
                <Picto name={n.icon} size={16} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{n.l}</div>
                  <div style={{ fontSize: 'var(--p-text-xs)', fontWeight: 700, fontFamily: 'var(--p-font-mono)', color: 'var(--p-vps)' }}>{n.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT */}
      <button onClick={handleSubmit} disabled={!filled} style={{
        width: '100%', padding: '14px', borderRadius: 'var(--p-radius-lg)', border: 'none', cursor: filled ? 'pointer' : 'not-allowed',
        background: filled ? 'linear-gradient(135deg, var(--p-vps), var(--p-tde))' : 'var(--p-gray-2)',
        color: filled ? '#fff' : 'var(--p-text-dim)', fontSize: 'var(--p-text-base)', fontWeight: 800,
        boxShadow: filled ? 'var(--p-shadow-glow-vps)' : 'none', transition: 'all 200ms',
      }}>
        Créer le dossier patient
      </button>
    </div>
  )
}
