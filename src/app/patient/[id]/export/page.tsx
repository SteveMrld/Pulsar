'use client'
import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import { vitalsService, labService, medicationService, alertService } from '@/lib/services'
import { noteService, examService } from '@/lib/services/noteExamService'
import { historyService } from '@/lib/services/historyService'
import Picto from '@/components/Picto'
import type { Vitals, LabResult, Medication, Alert, ClinicalNote, NeuroExam } from '@/lib/types/database'

/* ══════════════════════════════════════════════════════════════
   EXPORT — Dossier patient imprimable
   Synthèse complète pour transmissions, transferts, archives
   ══════════════════════════════════════════════════════════════ */

interface ExportData {
  vitals: Vitals[]
  latestVitals: Vitals | null
  labs: LabResult[]
  latestLab: LabResult | null
  meds: Medication[]
  activeMeds: Medication[]
  alerts: Alert[]
  notes: ClinicalNote[]
  exams: NeuroExam[]
  scores: { engine: string; points: { score: number; day: number }[] }[]
}

export default function ExportPage() {
  const { t } = useLang()
  const { info, ps, engineSummary } = usePatient()
  const [data, setData] = useState<ExportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState({
    identity: true, vitals: true, labs: true, meds: true,
    alerts: true, engines: true, notes: true, exams: true,
  })
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const [vitals, latestVitals, labs, latestLab, meds, activeMeds, alerts, notes, exams, scores] = await Promise.all([
          vitalsService.getHistory(info.id, 20),
          vitalsService.getLatest(info.id),
          labService.getHistory(info.id, 10),
          labService.getLatest(info.id),
          medicationService.getAll(info.id),
          medicationService.getActive(info.id),
          alertService.getActive(info.id),
          noteService.getByPatient(info.id, 30),
          examService.getByPatient(info.id),
          historyService.getScoreEvolution(info.id),
        ])
        setData({ vitals, latestVitals, labs, latestLab, meds, activeMeds, alerts, notes, exams, scores })
      } catch (err) {
        console.error('[Export] Erreur:', err)
      }
      setLoading(false)
    }
    load()
  }, [info.id])

  const handlePrint = () => window.print()

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const fmt = (v: number | null | undefined, unit?: string) => v != null ? `${v}${unit || ''}` : '—'

  const vps = engineSummary.vps
  const vpsLevel = engineSummary.vpsLevel

  // Print styles injected
  const printStyles = `
    @media print {
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
      .print-page { break-inside: avoid; }
      .glass-card, .glass { background: white !important; border: 1px solid #ddd !important; }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Controls (no-print) */}
      <div className="no-print" style={{ padding: '16px 20px', borderBottom: '1px solid var(--p-dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Picto name="clipboard" size={22} glow glowColor="rgba(108,124,255,0.5)" />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--p-text)' }}>
            Export dossier — {info.displayName}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(sections).map(([k, v]) => (
            <button key={k} onClick={() => setSections(prev => ({ ...prev, [k]: !v }))} style={{
              padding: '3px 8px', borderRadius: 'var(--p-radius-sm)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
              background: v ? '#6C7CFF20' : 'transparent', color: v ? '#6C7CFF' : 'var(--p-text-dim)',
            }}>{k}</button>
          ))}
        </div>

        <button onClick={handlePrint} style={{
          padding: '8px 20px', borderRadius: 'var(--p-radius-md)', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
          fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color: '#fff',
          boxShadow: '0 4px 16px rgba(108,124,255,0.3)',
        }}>
          🖨 Imprimer / PDF
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
          Préparation du dossier...
        </div>
      ) : (
        <div ref={printRef} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'var(--p-font-mono)' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid var(--p-text)', paddingBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.1em' }}>PULSAR</div>
              <div style={{ fontSize: '9px', color: 'var(--p-text-dim)' }}>Système d'aide à la décision — Neuropédiatrie</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--p-text-dim)' }}>
              <div>Généré le {dateStr} à {timeStr}</div>
              <div>Document confidentiel — Données de santé</div>
            </div>
          </div>

          {/* Identity */}
          {sections.identity && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #6C7CFF40', paddingBottom: '4px' }}>
                IDENTITÉ PATIENT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: '10px' }}>
                <div><strong>Nom :</strong> {info.displayName}</div>
                <div><strong>Âge :</strong> {info.age}</div>
                <div><strong>Sexe :</strong> {info.sex === 'female' ? 'Féminin' : 'Masculin'}</div>
                <div><strong>Poids :</strong> {info.weight}</div>
                <div><strong>Chambre :</strong> {info.room}</div>
                <div><strong>J+ :</strong> {info.hospDay}</div>
                <div><strong>Phase :</strong> {info.phaseInfo.label}</div>
                <div><strong>Syndrome :</strong> {info.syndrome}</div>
                <div><strong>Allergies :</strong> {info.allergies.length > 0 ? info.allergies.join(', ') : 'Aucune'}</div>
                <div><strong>VPS :</strong> {vps}/100 ({vpsLevel})</div>
              </div>
            </div>
          )}

          {/* Engines summary */}
          {sections.engines && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFB347', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #FFB34740', paddingBottom: '4px' }}>
                SCORES MOTEURS IA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '10px' }}>
                {['VPS', 'TDE', 'PVE', 'EWE', 'TPE'].map(engine => {
                  const r = data?.scores.find(s => s.engine === engine)
                  const latest = r?.points[r.points.length - 1]
                  return (
                    <div key={engine} style={{ textAlign: 'center', padding: '8px', border: '1px solid var(--p-dark-4)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--p-text-dim)' }}>{engine}</div>
                      <div style={{ fontSize: '16px', fontWeight: 900 }}>{latest?.score ?? '—'}</div>
                      <div style={{ fontSize: '8px', color: 'var(--p-text-dim)' }}>J{latest?.day ?? '—'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Latest vitals */}
          {sections.vitals && data?.latestVitals && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#A78BFA', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #A78BFA40', paddingBottom: '4px' }}>
                DERNIÈRES CONSTANTES
                <span style={{ fontWeight: 400, marginLeft: '8px', fontSize: '9px' }}>
                  ({new Date(data.latestVitals.recorded_at).toLocaleString('fr-FR')})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 16px', fontSize: '10px' }}>
                <div><strong>GCS :</strong> {fmt(data.latestVitals.gcs)}</div>
                <div><strong>Pupilles :</strong> {data.latestVitals.pupils || '—'}</div>
                <div><strong>Crises /24h :</strong> {data.latestVitals.seizures_24h}</div>
                <div><strong>Type :</strong> {data.latestVitals.seizure_type || '—'}</div>
                <div><strong>FC :</strong> {fmt(data.latestVitals.heart_rate, ' bpm')}</div>
                <div><strong>PA :</strong> {data.latestVitals.sbp && data.latestVitals.dbp ? `${data.latestVitals.sbp}/${data.latestVitals.dbp}` : '—'}</div>
                <div><strong>SpO₂ :</strong> {fmt(data.latestVitals.spo2, '%')}</div>
                <div><strong>T° :</strong> {data.latestVitals.temp != null ? `${data.latestVitals.temp.toFixed(1)}°C` : '—'}</div>
              </div>
            </div>
          )}

          {/* Latest labs */}
          {sections.labs && data?.latestLab && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#B96BFF', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #B96BFF40', paddingBottom: '4px' }}>
                DERNIÈRE BIOLOGIE
                <span style={{ fontWeight: 400, marginLeft: '8px', fontSize: '9px' }}>
                  ({new Date(data.latestLab.recorded_at).toLocaleString('fr-FR')})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 16px', fontSize: '10px' }}>
                {data.latestLab.crp != null && <div><strong>CRP :</strong> {data.latestLab.crp} mg/L</div>}
                {data.latestLab.pct != null && <div><strong>PCT :</strong> {data.latestLab.pct} ng/mL</div>}
                {data.latestLab.wbc != null && <div><strong>GB :</strong> {data.latestLab.wbc} G/L</div>}
                {data.latestLab.platelets != null && <div><strong>Plaquettes :</strong> {data.latestLab.platelets} G/L</div>}
                {data.latestLab.lactate != null && <div><strong>Lactate :</strong> {data.latestLab.lactate} mmol/L</div>}
                {data.latestLab.ferritin != null && <div><strong>Ferritine :</strong> {data.latestLab.ferritin} ng/mL</div>}
                {data.latestLab.csf_cells != null && <div><strong>LCR cellules :</strong> {data.latestLab.csf_cells}/mm³</div>}
                {data.latestLab.csf_protein != null && <div><strong>LCR protéines :</strong> {data.latestLab.csf_protein} g/L</div>}
                {data.latestLab.csf_antibodies && <div><strong>LCR anticorps :</strong> {data.latestLab.csf_antibodies}</div>}
              </div>
            </div>
          )}

          {/* Active medications */}
          {sections.meds && data && data.activeMeds.length > 0 && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#2FD1C8', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #2FD1C840', paddingBottom: '4px' }}>
                TRAITEMENTS ACTIFS ({data.activeMeds.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--p-dark-4)' }}>
                    <th style={{ textAlign: 'left', padding: '3px 4px', fontWeight: 700 }}>Médicament</th>
                    <th style={{ textAlign: 'left', padding: '3px 4px' }}>Dose</th>
                    <th style={{ textAlign: 'left', padding: '3px 4px' }}>Voie</th>
                    <th style={{ textAlign: 'left', padding: '3px 4px' }}>Fréquence</th>
                    <th style={{ textAlign: 'left', padding: '3px 4px' }}>Depuis</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activeMeds.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--p-dark-4)' }}>
                      <td style={{ padding: '3px 4px', fontWeight: 700 }}>{m.drug_name}</td>
                      <td style={{ padding: '3px 4px' }}>{m.dose || '—'}</td>
                      <td style={{ padding: '3px 4px' }}>{m.route || '—'}</td>
                      <td style={{ padding: '3px 4px' }}>{m.frequency || '—'}</td>
                      <td style={{ padding: '3px 4px' }}>{new Date(m.start_date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Active alerts */}
          {sections.alerts && data && data.alerts.length > 0 && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #8B5CF640', paddingBottom: '4px' }}>
                ALERTES ACTIVES ({data.alerts.length})
              </div>
              {data.alerts.map(a => (
                <div key={a.id} style={{ fontSize: '10px', padding: '3px 0', borderBottom: '1px solid var(--p-dark-4)' }}>
                  <strong style={{ color: a.severity === 'critical' ? '#8B5CF6' : '#FFB347' }}>
                    [{a.severity.toUpperCase()}]
                  </strong> {a.title} {a.body ? `— ${a.body}` : ''}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {sections.notes && data && data.notes.length > 0 && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #6C7CFF40', paddingBottom: '4px' }}>
                NOTES CLINIQUES ({data.notes.length})
              </div>
              {data.notes.slice(0, 10).map(n => (
                <div key={n.id} style={{ fontSize: '10px', padding: '4px 0', borderBottom: '1px solid var(--p-dark-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{n.note_type.toUpperCase()}</strong>
                    <span style={{ color: 'var(--p-text-dim)', fontSize: '9px' }}>
                      {new Date(n.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div style={{ marginTop: '2px', color: 'var(--p-text-dim)' }}>{n.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Neuro exams */}
          {sections.exams && data && data.exams.length > 0 && (
            <div className="print-page" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#B96BFF', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #B96BFF40', paddingBottom: '4px' }}>
                EXAMENS NEUROPHYSIOLOGIQUES ({data.exams.length})
              </div>
              {data.exams.map(ex => (
                <div key={ex.id} style={{ fontSize: '10px', padding: '3px 0', borderBottom: '1px solid var(--p-dark-4)' }}>
                  <strong>{ex.exam_type}</strong> — {ex.status || '—'}
                  <span style={{ color: 'var(--p-text-dim)', marginLeft: '8px', fontSize: '9px' }}>
                    {new Date(ex.performed_at).toLocaleDateString('fr-FR')}
                  </span>
                  {ex.raw_report && <div style={{ color: 'var(--p-text-dim)', marginTop: '2px' }}>{ex.raw_report}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '24px', paddingTop: '8px', borderTop: '1px solid var(--p-dark-4)', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--p-text-dim)' }}>
            <span>PULSAR — CH Bray-sur-Seine — Neuropédiatrie</span>
            <span>{dateStr} {timeStr} — Document confidentiel</span>
          </div>
        </div>
      )}
    </>
  )
}
