'use client'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'

function SectionTitle({ title, color, icon }: { title: string; color: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', marginTop: '24px' }}>
      <Picto name={icon} size={16} glow glowColor={`${color}50`} />
      <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.5px' }}>{title}</span>
    </div>
  )
}

function BioValue({ label, value, unit, status }: { label: string; value: number | string; unit: string; status?: 'critical' | 'warning' | 'normal' }) {
  const color = status === 'critical' ? '#FF4757' : status === 'warning' ? '#FFB347' : 'var(--p-text)'
  return (
    <div className="glass-card" style={{ padding: '12px', borderRadius: 'var(--p-radius-lg)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '20px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{unit}</div>
    </div>
  )
}

export default function ExamensPage() {
  const { t } = useLang()
  const { ps, info } = usePatient()
  const nc = ps.neuroCoreResult

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="microscope" size={28} glow glowColor="rgba(185,107,255,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Examens &amp; Biomarqueurs</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            NeuroCore {'\u00b7'} {info.displayName} {'\u00b7'} J+{info.hospDay}
          </span>
        </div>
      </div>

      <SectionTitle title="BIOLOGIE" color="#2FD1C8" icon="heart" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
        <BioValue label="CRP" value={ps.biology.crp} unit="mg/L" status={ps.biology.crp > 50 ? 'critical' : ps.biology.crp > 10 ? 'warning' : 'normal'} />
        <BioValue label="PCT" value={ps.biology.pct} unit="ng/mL" status={ps.biology.pct > 2 ? 'critical' : ps.biology.pct > 0.5 ? 'warning' : 'normal'} />
        <BioValue label="Ferritine" value={ps.biology.ferritin} unit="ng/mL" status={ps.biology.ferritin > 500 ? 'critical' : ps.biology.ferritin > 300 ? 'warning' : 'normal'} />
        <BioValue label="GB" value={(ps.biology.wbc / 1000).toFixed(1)} unit={'\u00d710\u00b3/\u00b5L'} status={ps.biology.wbc > 15000 ? 'warning' : 'normal'} />
        <BioValue label="PLQ" value={ps.biology.platelets} unit={'\u00d710\u00b3/\u00b5L'} status={ps.biology.platelets < 100 ? 'critical' : 'normal'} />
        <BioValue label="Lactate" value={ps.biology.lactate} unit="mmol/L" status={ps.biology.lactate > 4 ? 'critical' : ps.biology.lactate > 2 ? 'warning' : 'normal'} />
      </div>

      <SectionTitle title={'LIQUIDE C\u00c9PHALO-RACHIDIEN'} color="#B96BFF" icon="microscope" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
        <BioValue label={'Cellularit\u00e9'} value={ps.csf.cells} unit={'cellules/mm\u00b3'} status={ps.csf.cells > 10 ? 'warning' : 'normal'} />
        <BioValue label={'Prot\u00e9ines'} value={ps.csf.protein} unit="g/L" status={ps.csf.protein > 0.5 ? 'warning' : 'normal'} />
        <BioValue label="Anticorps" value={ps.csf.antibodies === 'negative' ? 'N\u00e9g.' : ps.csf.antibodies.toUpperCase()} unit="" status={ps.csf.antibodies !== 'negative' ? 'critical' : 'normal'} />
      </div>

      {ps.eeg && (
        <>
          <SectionTitle title={'\u00c9LECTROENC\u00c9PHALOGRAMME'} color="#6C7CFF" icon="brain" />
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>RYTHME DE FOND</div>
                <div style={{ fontSize: '13px', color: 'var(--p-text)', fontWeight: 600 }}>{ps.eeg.background.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>{`ACTIVIT\u00c9 \u00c9PILEPTIQUE`}</div>
                <div style={{ fontSize: '13px', color: ps.eeg.ictalPatterns.length > 0 ? '#FF4757' : '#2ED573', fontWeight: 600 }}>
                  {ps.eeg.ictalPatterns.length > 0 ? `${ps.eeg.ictalPatterns.length} pattern(s)` : 'Absente'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>NCSE STATUS</div>
                <div style={{ fontSize: '13px', color: ps.eeg.NCSEstatus ? '#FF4757' : '#2ED573', fontWeight: 600 }}>
                  {ps.eeg.NCSEstatus ? 'Oui' : 'Non'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>CRISES/HEURE</div>
                <div style={{ fontSize: '13px', color: ps.eeg.seizuresPerHour > 3 ? '#FF4757' : 'var(--p-text)', fontWeight: 600 }}>
                  {ps.eeg.seizuresPerHour}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {ps.mri && (
        <>
          <SectionTitle title={'IRM C\u00c9R\u00c9BRALE'} color="#FF6B8A" icon="brain" />
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--p-radius-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>HYPERSIGNAL T2/FLAIR</div>
                <div style={{ fontSize: '13px', color: ps.mri.t2FlairAbnormal ? '#FFB347' : '#2ED573', fontWeight: 600 }}>
                  {ps.mri.t2FlairAbnormal ? 'Anormal' : 'Normal'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>RESTRICTION DIFFUSION</div>
                <div style={{ fontSize: '13px', color: ps.mri.diffusionRestriction ? '#FF4757' : '#2ED573', fontWeight: 600 }}>
                  {ps.mri.diffusionRestriction ? 'Pr\u00e9sente' : 'Absente'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>REHAUSSEMENT GADOLINIUM</div>
                <div style={{ fontSize: '13px', color: ps.mri.gadoliniumEnhancement ? '#FFB347' : '#2ED573', fontWeight: 600 }}>
                  {ps.mri.gadoliniumEnhancement ? 'Oui' : 'Non'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>{'\u0152D\u00c8ME'}</div>
                <div style={{ fontSize: '13px', color: ps.mri.edemaType !== 'none' ? '#FFB347' : '#2ED573', fontWeight: 600 }}>
                  {ps.mri.edemaType === 'none' ? 'Aucun' : ps.mri.edemaType}
                </div>
              </div>
              {ps.mri.t2FlairLocations.length > 0 && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '6px' }}>{`R\u00c9GIONS ATTEINTES`}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {ps.mri.t2FlairLocations.map((r: string, i: number) => (
                      <span key={i} style={{
                        padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                        background: 'rgba(255,107,138,0.1)', color: '#FF6B8A',
                        fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 600,
                      }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {nc && (
        <>
          <SectionTitle title="ANALYSE NEUROCORE" color="#FF4757" icon="alert" />
          {nc.redFlags.length > 0 && (
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-lg)', borderLeft: '3px solid #FF4757', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#FF4757', marginBottom: '6px' }}>RED FLAGS</div>
              {nc.redFlags.map((f: string, i: number) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginBottom: '3px' }}>{'\u2022'} {f}</div>
              ))}
            </div>
          )}
          {nc.traps.length > 0 && (
            <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-lg)', borderLeft: '3px solid #FFB347', marginBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 800, color: '#FFB347', marginBottom: '6px' }}>{`PI\u00c8GES DIAGNOSTIQUES`}</div>
              {nc.traps.map((t: string, i: number) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginBottom: '3px' }}>{'\u2022'} {t}</div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <BioValue label="Score NeuroCore" value={nc.score} unit="/100" status={nc.score >= 70 ? 'critical' : nc.score >= 40 ? 'warning' : 'normal'} />
            <BioValue label="Urgence" value={nc.urgency} unit="" status={nc.urgency === 'critical' ? 'critical' : 'normal'} />
            <BioValue label="Brain Damage" value={nc.brainDamageIndex.toFixed(1)} unit="index" status={nc.brainDamageIndex > 0.5 ? 'critical' : 'normal'} />
          </div>
        </>
      )}

      <SectionTitle title={'EXAMENS RECOMMAND\u00c9S'} color="#FFB347" icon="shield" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {!ps.eeg && <span style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#FFB347', fontWeight: 600 }}>EEG urgent</span>}
        {!ps.mri && <span style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-full)', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.15)', fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#FFB347', fontWeight: 600 }}>{`IRM c\u00e9r\u00e9brale`}</span>}
        {ps.eeg && ps.mri && <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: '#2ED573' }}>{`Examens cl\u00e9s r\u00e9alis\u00e9s`}</span>}
      </div>
    </div>
  )
}
