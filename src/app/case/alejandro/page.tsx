'use client'
import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'
import Link from 'next/link'

// ══════════════════════════════════════════════════════════════
// USE CASE ALEJANDRO R. — Patient 0
// Parcours complet Eaubonne → Robert-Debré
// Courbes animées, alertes PULSAR, conclusion
// ══════════════════════════════════════════════════════════════

const TIMELINE = [
  { day: -3, date: '31/03', place: 'Eaubonne', title: 'Admission — Fièvre', vps: 30, gcs: 15, crises: 0, cardiacRisk: 5, color: '#F59E0B',
    facts: ['Fièvre mal tolérée, T° max 40°C', 'Céphalées, douleurs abdominales, toux, rhinite', 'Hospitalisation pour surveillance'],
    pulsar: ['VPS 30 — modéré', 'Profil prodromique à monitorer', 'Si crises → penser FIRES immédiatement'] },
  { day: -1, date: '02-03/04', place: 'Eaubonne', title: 'MEOPA → Arrêt respiratoire', vps: 75, gcs: 8, crises: 3, cardiacRisk: 15, color: '#EF4444',
    facts: ['Amélioration, T° en baisse', 'MEOPA pour examen', 'ARRÊT RESPIRATOIRE immédiat', 'Premières convulsions', 'Glasgow chute à 8', 'Transfert SAMU → Robert-Debré'],
    pulsar: ['CASCADE CRITIQUE : MEOPA × Prodrome FIRES', 'N2O abaisse seuil convulsif (Zier 2010)', 'ALTERNATIVE : Emla + Paracétamol'] },
  { day: 0, date: '03/04', place: 'Robert-Debré', title: 'Admission Réa — Intubation', vps: 85, gcs: 8, crises: 5, cardiacRisk: 20, color: '#EF4444',
    facts: ['Glasgow 8 — intubation', 'Convulsions >20min, susp. méningite', 'Rivotril x3 échec', 'Cefotaxime + Aciclovir', 'Dilantin + Keppra + Midazolam continu'],
    pulsar: ['VPS 85 CRITIQUE', 'Panel anticorps URGENT', 'IVIG empirique (Titulaer 2013)', 'DILANTIN → monitoring cardiaque'] },
  { day: 1, date: '04/04', place: 'Robert-Debré', title: '6 convulsions — Œdème cérébral', vps: 90, gcs: 6, crises: 6, cardiacRisk: 30, color: '#EF4444',
    facts: ['6 convulsions dans la nuit', 'Doppler transcrânien "passe mal"', 'Œdème cérébral', 'HypoTA, NAD', 'Kétamine x2'],
    pulsar: ['ANAKINRA URGENT (Kenney-Jung 2016)', 'IVIG 2g/kg', 'Régime cétogène', 'PVE : phénytoïne + midazolam = cœur'] },
  { day: 2, date: '05/04', place: 'Robert-Debré', title: 'SE continue — Infraclinique', vps: 95, gcs: 5, crises: 8, cardiacRisk: 40, color: '#EF4444',
    facts: ['EEG : convulsions infracliniques', 'Kétamine augmentée', 'Glycémie 55', 'Bolus corticoïdes'],
    pulsar: ['DDD +48h retard immuno = CRITIQUE', 'Infraclinique = PLUS grave', 'ANAKINRA fenêtre 72h se ferme'] },
  { day: 3, date: '06/04', place: 'Robert-Debré', title: 'Convulsion 1h30 — EEG très pauvre', vps: 98, gcs: 3, crises: 12, cardiacRisk: 55, color: '#EF4444',
    facts: ['Convulsion 1h30 + continue', 'EEG "très pauvre"', '5 bolus Kéta', 'PL refaite'],
    pulsar: ['VPS 98 MAXIMUM', 'ANAKINRA + TOCILIZUMAB urgence', 'Régime cétogène 4:1', 'PVE : cardiotoxicité cumulée'] },
  { day: 4, date: '07/04', place: 'Robert-Debré', title: '5 conv. dont 1 de 8 min', vps: 100, gcs: 3, crises: 9, cardiacRisk: 65, color: '#EF4444',
    facts: ['5 convulsions dont 1 de 8 min', 'Bolus Kéta → arrêt → reprise', 'EEG continu 72h'],
    pulsar: ['VPS 100/100 maximum', 'ORACLE : VPS 28 avec protocole FIRES vs 89 sans', 'Durée phénytoïne = risque arythmie'] },
  { day: 14, date: '17/04', place: 'Robert-Debré', title: 'Décès — Arrêt cardiaque', vps: 100, gcs: 3, crises: 0, cardiacRisk: 100, color: '#EF4444',
    facts: ['Arrêt cardiaque', 'Derniers examens cérébraux sans lésion irréversible', 'Décès attribué à défaillance cardiaque'],
    pulsar: ['5 facteurs cardiaques convergents identifiés par PULSAR', 'Phénytoïne + cocktail 5 molécules + inflammation 14j', 'Troponine et écho non documentés'] },
]

const PULSAR_VPS = [30, 30, 85, 82, 72, 60, 50, 38, 22]
const REAL_VPS = [30, 75, 85, 90, 95, 98, 100, 100, 100]
const CARDIAC_REAL = [5, 15, 20, 30, 40, 55, 65, 85, 100]
const CARDIAC_PULSAR = [5, 5, 20, 22, 20, 18, 15, 12, 8]
const CHART_LABELS = ['J-3','J-1','J0','J1','J2','J3','J4','J7','J14']

function AnimatedChart({ title, labels, datasets, icon }: { title: string; labels: string[]; datasets: { name: string; values: number[]; color: string }[]; icon: string }) {
  const [progress, setProgress] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let p = 0
        const interval = setInterval(() => {
          p += 0.02
          if (p >= 1) { p = 1; clearInterval(interval) }
          setProgress(p)
        }, 20)
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const cw = 100 // % based
  const ch = 140

  return (
    <div ref={ref} style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', padding: 16, border: '1px solid var(--p-border)', marginBottom: 'var(--p-space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Picto name={icon} size={16} glow />
        <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{title}</span>
      </div>
      <svg viewBox={`0 0 400 ${ch + 20}`} style={{ width: '100%', height: ch + 20 }}>
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={40} y1={ch - (v / 100) * ch + 5} x2={390} y2={ch - (v / 100) * ch + 5} stroke="#1F2A40" strokeWidth={0.5} />
            <text x={35} y={ch - (v / 100) * ch + 9} fontSize={8} fill="#6B7280" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* X labels */}
        {labels.map((l, i) => (
          <text key={i} x={40 + (i / (labels.length - 1)) * 350} y={ch + 18} fontSize={8} fill="#6B7280" textAnchor="middle">{l}</text>
        ))}
        {/* Lines */}
        {datasets.map((ds, di) => {
          const visibleCount = Math.floor(progress * ds.values.length)
          const points = ds.values.slice(0, visibleCount + 1).map((v, i) => {
            const x = 40 + (i / (ds.values.length - 1)) * 350
            const y = ch - (v / 100) * ch + 5
            return `${x},${y}`
          }).join(' ')
          return (
            <g key={di}>
              <polyline points={points} fill="none" stroke={ds.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {ds.values.slice(0, visibleCount + 1).map((v, i) => {
                const x = 40 + (i / (ds.values.length - 1)) * 350
                const y = ch - (v / 100) * ch + 5
                return <circle key={i} cx={x} cy={y} r={3} fill={ds.color} />
              })}
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
        {datasets.map((ds, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 3, borderRadius: 2, background: ds.color }} />
            <span style={{ fontSize: 10, color: 'var(--p-text-muted)' }}>{ds.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineCard({ event, index, isActive, onClick }: { event: typeof TIMELINE[0]; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: isActive ? `${event.color}08` : 'var(--p-bg-card)',
      borderRadius: 'var(--p-radius-lg)',
      border: `1px solid ${isActive ? event.color + '25' : 'var(--p-border)'}`,
      padding: '12px 14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `${event.color}15`, border: `1px solid ${event.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: event.color, fontFamily: 'var(--p-font-mono)' }}>J{event.day}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)' }}>{event.title}</div>
            <div style={{ fontSize: 9, color: 'var(--p-text-dim)' }}>{event.date} · {event.place}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: event.color, fontFamily: 'var(--p-font-mono)' }}>{event.vps}</div>
          <div style={{ fontSize: 7, color: event.color, fontWeight: 700 }}>VPS</div>
        </div>
      </div>

      {isActive && (
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {/* Facts */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Picto name="clipboard" size={10} /> Ce qui s'est passé
            </div>
            {event.facts.map((f, i) => (
              <div key={i} style={{ fontSize: 9, color: 'var(--p-text-muted)', paddingLeft: 8, borderLeft: '2px solid #EF444415', marginBottom: 2, lineHeight: 1.4 }}>{f}</div>
            ))}
          </div>
          {/* PULSAR */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2FD1C8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Picto name="brain" size={10} /> PULSAR aurait dit
            </div>
            {event.pulsar.map((p, i) => (
              <div key={i} style={{ fontSize: 9, color: '#E8EAF0', paddingLeft: 8, borderLeft: '2px solid #2FD1C820', marginBottom: 2, lineHeight: 1.4 }}>{p}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AlejandroCasePage() {
  const { t } = useLang()
  const [activeDay, setActiveDay] = useState(0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: '#F5A623', letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>PULSAR USE CASE</div>
        <h1 style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 800, color: 'var(--p-text)', margin: '0 0 8px' }}>
          {t('Patient 0 — Alejandro R.', 'Patient 0 — Alejandro R.')}
        </h1>
        <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          {t(
            'FIRES · 6 ans · Eaubonne → Robert-Debré · 03/04 → 17/04/2025. Le cas fondateur de PULSAR. Ce que les moteurs voient. Ce qu\'ils auraient changé.',
            'FIRES · 6 years old · Eaubonne → Robert-Debré · 03/04 → 17/04/2025. The founding case of PULSAR. What the engines see. What they would have changed.'
          )}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          {[
            { l: 'VPS', v: '100', c: '#EF4444' },
            { l: t('Alertes', 'Alerts'), v: '14', c: '#EF4444' },
            { l: 'DDD', v: '4', c: '#DC2626' },
            { l: 'CAE', v: '2', c: '#FF6B35' },
            { l: t('Moteurs', 'Engines'), v: '11', c: '#6C7CFF' },
          ].map((b, i) => (
            <div key={i} style={{ padding: '8px 14px', borderRadius: 'var(--p-radius-lg)', background: `${b.c}08`, border: `1px solid ${b.c}12` }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: b.c, fontFamily: 'var(--p-font-mono)' }}>{b.v}</div>
              <div style={{ fontSize: 8, color: 'var(--p-text-dim)' }}>{b.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#F5A623' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
            {t('Chronologie jour par jour', 'Day by day timeline')}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TIMELINE.map((event, i) => (
            <TimelineCard key={i} event={event} index={i} isActive={activeDay === i} onClick={() => setActiveDay(activeDay === i ? -1 : i)} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#6C7CFF' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
            {t('Courbes comparatives', 'Comparative curves')}
          </h2>
        </div>

        <AnimatedChart
          title={t('VPS — Parcours réel vs Protocole PULSAR', 'VPS — Actual path vs PULSAR Protocol')}
          labels={CHART_LABELS}
          datasets={[
            { name: t('Parcours réel', 'Actual path'), values: REAL_VPS, color: '#EF4444' },
            { name: t('Protocole PULSAR', 'PULSAR Protocol'), values: PULSAR_VPS, color: '#2FD1C8' },
          ]}
          icon="chart"
        />

        <AnimatedChart
          title={t('Risque cardiaque cumulé (%)', 'Cumulative cardiac risk (%)')}
          labels={CHART_LABELS}
          datasets={[
            { name: t('Réel (phénytoïne + cocktail)', 'Actual (phenytoin + cocktail)'), values: CARDIAC_REAL, color: '#EF4444' },
            { name: t('PULSAR (switch Keppra)', 'PULSAR (switch Keppra)'), values: CARDIAC_PULSAR, color: '#10B981' },
          ]}
          icon="heart"
        />
      </div>

      {/* CAE — MEOPA */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#FF6B35' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: '#FF6B35', margin: 0 }}>
            Cascade Alert Engine — MEOPA
          </h2>
        </div>
        <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: '1px solid #FF6B3515', padding: 16 }}>
          <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 800, color: '#EF4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Picto name="warning" size={14} glow /> CASCADE CRITIQUE : MEOPA × Prodrome FIRES
          </div>
          {[
            'Infection fébrile → inflammation systémique → neuroinflammation latente',
            'Administration MEOPA → hypoxie cérébrale transitoire + dépression SNC',
            'Seuil convulsif abaissé → première crise',
            'Crise → libération cytokines → amplification neuroinflammation',
            'Cascade auto-entretenue → status epilepticus → FIRES',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: `#EF444415`, border: '1px solid #EF444425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#EF4444', fontFamily: 'var(--p-font-mono)', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 11, color: 'var(--p-text)', lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#FF6B3508', borderRadius: 'var(--p-radius-md)', borderLeft: '3px solid #FF6B35' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#FF6B35' }}>{t('Alternative PULSAR', 'PULSAR Alternative')}</div>
            <div style={{ fontSize: 11, color: 'var(--p-text-muted)', marginTop: 2 }}>Emla (anesthésie locale) + Paracétamol. Pas de N2O sur un cerveau en neuroinflammation.</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {['Zier 2010', 'ANSM 2016', 'Babl 2010', 'van Baalen 2023'].map((r, i) => (
              <span key={i} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: '#FF6B3508', color: '#FF6B35' }}>{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 5 facteurs cardiaques */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#EF4444' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: '#EF4444', margin: 0 }}>
            {t('5 facteurs cardiaques convergents', '5 converging cardiac factors')}
          </h2>
        </div>
        {[
          { icon: 'pill', title: 'Phénytoïne (Dilantin)', desc: 'Cardiotoxicité directe : arythmie, bradycardie, fibrillation ventriculaire. Perfusion prolongée 14 jours.', color: '#EF4444' },
          { icon: 'shield', title: 'Cocktail 5 molécules', desc: 'Midazolam + Sufentanil + Phénytoïne + Phénobarbital + Kétamine. Synergie dépressive cardiaque.', color: '#F59E0B' },
          { icon: 'virus', title: 'Inflammation 14 jours', desc: 'Myocardite infraclinique potentielle. Pas de troponine de suivi, pas d\'écho répétée.', color: '#8B5CF6' },
          { icon: 'heart', title: 'Hypotension chronique', desc: 'PAM objectif 65-70 souvent non atteint. NAD nécessaire. Extrémités fraiches.', color: '#EC4899' },
          { icon: 'eeg', title: 'Convulsions prolongées', desc: 'Conv. 1h30, multiples épisodes 14 jours. Stress catécholaminergique cumulatif.', color: '#6C7CFF' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${f.color}30`, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Picto name={f.icon} size={12} />
              <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{f.title}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* DDD */}
      <div style={{ marginBottom: 'var(--p-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#DC2626' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: '#DC2626', margin: 0 }}>
            {t('4 retards détectés par le DDD', '4 delays detected by DDD')}
          </h2>
        </div>
        {[
          { title: 'Immunothérapie (IVIG)', window: '< 48h', delay: '+48h', ref: 'Gaspard 2015, Titulaer 2013', col: '#EF4444' },
          { title: 'Panel anticorps', window: '< 48h', delay: 'Pending J4+', ref: 'Graus 2016', col: '#EF4444' },
          { title: 'Anakinra (anti-IL-1)', window: '< 72h', delay: 'Jamais', ref: 'Kenney-Jung 2016, Dilena 2019', col: '#F59E0B' },
          { title: 'Diagnostic FIRES', window: 'J0', delay: 'Absent du dossier', ref: 'van Baalen 2023', col: '#EF4444' },
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${d.col}`, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{d.title}</div>
              <div style={{ fontSize: 9, color: 'var(--p-text-dim)', marginTop: 2 }}>{d.ref}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#10B981' }}>{t('Fenêtre', 'Window')} {d.window}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: d.col, fontFamily: 'var(--p-font-mono)' }}>{d.delay}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion */}
      <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8)', border: '1px solid #F5A62315', textAlign: 'center' }}>
        <div style={{ width: 2, height: 40, background: 'linear-gradient(180deg, #6C7CFF, #F5A623)', margin: '0 auto var(--p-space-4)', borderRadius: 1 }} />
        <p style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          {t(
            "PULSAR n'aurait peut-être pas sauvé Alejandro. Mais il aurait posé les bonnes questions au bon moment, levé les bonnes alertes, et ouvert les bonnes fenêtres thérapeutiques.",
            "PULSAR might not have saved Alejandro. But it would have asked the right questions at the right time, raised the right alerts, and opened the right therapeutic windows."
          )}
        </p>
        <p style={{ fontSize: 'var(--p-text-sm)', color: '#F5A623', fontStyle: 'italic', marginTop: 'var(--p-space-4)' }}>
          {t("Et c'est pour ça qu'il existe.", "And that's why it exists.")}
        </p>
        <p style={{ fontSize: 11, color: 'var(--p-text-dim)', marginTop: 'var(--p-space-4)', fontFamily: 'var(--p-font-mono)', letterSpacing: 1 }}>
          {t('À la mémoire d\'Alejandro R. (2019-2025)', 'In memory of Alejandro R. (2019-2025)')}
        </p>
      </div>

      {/* Back */}
      <div style={{ textAlign: 'center', marginTop: 'var(--p-space-6)' }}>
        <Link href="/" style={{ fontSize: 'var(--p-text-sm)', color: '#6C7CFF', textDecoration: 'none' }}>
          ← {t('Retour', 'Back')}
        </Link>
      </div>
    </div>
  )
}
// deploy trigger Fri Mar  6 21:21:43 UTC 2026
