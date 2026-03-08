'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'
import Link from 'next/link'

// ══════════════════════════════════════════════════════════════
// USE CASE ALEJANDRO R. — Patient 0
// Parcours complet Eaubonne → Robert-Debré
// Courbes animées, alertes PULSAR, conclusion
// ══════════════════════════════════════════════════════════════

const TIMELINE = [
  { day: -30, date: 'Semaines avant', place: 'Domicile', title: 'Antécédents — Profil inflammatoire récurrent', vps: 10, gcs: 15, crises: 0, cardiacRisk: 0, color: '#6C7CFF',
    facts: [
      'Rhinite plusieurs semaines avant l\'hospitalisation (signalée par la mère)',
      'Constipation chronique sévère — pleurait aux toilettes, symptôme récurrent depuis longtemps',
      'Antécédent récurrent documenté : à chaque épisode fébrile, douleurs intenses aux membres inférieurs (surtout les jambes, parfois les bras)',
      'Impossibilité de marcher lors des montées de température — la mère devait le porter',
      'Ce pattern fièvre → myalgies des membres inférieurs s\'était reproduit plusieurs fois avant l\'épisode fatal',
    ],
    pulsar: [
      'Myalgie listée comme symptôme officiel FIRES (NIH/HPO)',
      'Pattern récurrent fièvre→myalgies = hyper-réponse inflammatoire répétée aux infections virales',
      'Compatible avec BACM (Benign Acute Childhood Myositis) récurrente sur terrain FIRES',
      'Constipation chronique → signal dysautonomie / axe gut-brain neuroinflammation',
      'Rhinite précédente = primo-activation immunitaire (voies respiratoires supérieures, profil FIRES classique)',
      'PULSAR : ce profil antécédent aurait déclenché un score de vulnérabilité préalable',
    ]
  },
  { day: -3, date: '31/03', place: 'Eaubonne', title: 'Admission — Fièvre persistante', vps: 30, gcs: 15, crises: 0, cardiacRisk: 5, color: '#F59E0B',
    facts: [
      'Fièvre mal tolérée, T° max 40°C depuis J-3, n\'arrivait pas à baisser',
      'Céphalées, douleurs abdominales, toux, rhinite',
      'Douleurs aux jambes — ne pouvait presque plus marcher (pattern récurrent activé)',
      'Hospitalisation pour surveillance',
    ],
    pulsar: ['VPS 30 — modéré', 'Profil prodromique à monitorer — antécédents myalgies récurrentes critiques', 'Si crises → penser FIRES immédiatement'] },
  { day: -1, date: '02-03/04', place: 'Eaubonne', title: 'Kalinox + Sévoflurane → Effondrement', vps: 75, gcs: 8, crises: 3, cardiacRisk: 15, color: '#EF4444',
    facts: ['Amélioration, T° en baisse', 'Kalinox + Sévoflurane pour prélèvement sanguin', 'Effondrement brutal : désaturation, perte de conscience', 'Premières convulsions', 'Glasgow chute à 8', 'Transfert SAMU → Robert-Debré'],
    pulsar: ['CASCADE CRITIQUE : Kalinox+Sévoflurane × Prodrome FIRES', '2 dépresseurs SNC sur cerveau en neuroinflammation latente', 'ALTERNATIVE : Emla + Paracétamol'] },
  { day: 0, date: '03/04', place: 'Robert-Debré', title: 'Admission Réa — Intubation', vps: 85, gcs: 8, crises: 5, cardiacRisk: 20, color: '#EF4444',
    facts: ['Glasgow 8 — intubation', 'Convulsions >20min, susp. méningite', 'Rivotril x3 échec', 'Cefotaxime + Aciclovir', 'Dilantin + Keppra + Midazolam continu'],
    pulsar: ['VPS 85 CRITIQUE', 'Panel anticorps URGENT', 'IVIG empirique (Titulaer 2013)', 'DILANTIN → monitoring cardiaque'] },
  { day: 1, date: '04/04', place: 'Robert-Debré', title: '6 convulsions — Œdème cérébral', vps: 90, gcs: 6, crises: 6, cardiacRisk: 30, color: '#EF4444',
    facts: ['6 convulsions dans la nuit', 'Œdème cérébral', 'PAM 61 (objectif 65-70 non atteint)', 'CORTICOÏDES débutés (méthylprednisolone)', 'FC 82, SpO2 95%'],
    pulsar: ['PULSAR aurait déjà lancé IVIG + cortico depuis J0', 'Retard +24h corticoïdes', 'ANAKINRA recommandé dès J+1 (Kenney-Jung 2016)'] },
  { day: 2, date: '05/04', place: 'Robert-Debré', title: 'SE continue — Infraclinique', vps: 95, gcs: 5, crises: 8, cardiacRisk: 40, color: '#EF4444',
    facts: ['EEG : convulsions infracliniques', 'IVIG ADMINISTRÉES', 'Kétamine augmentée', 'PAM 67, FC 99, SpO2 94%', 'Nutrition Sondalis Junior (standard)'],
    pulsar: ['IVIG à J+3 — retard +24h vs 48h recommandées', 'KD recommandé dès J+2 (van Baalen 2023)', 'ANAKINRA fenêtre 72h se ferme'] },
  { day: 3, date: '06/04', place: 'Robert-Debré', title: 'Convulsion 1h30 — EEG très pauvre', vps: 98, gcs: 3, crises: 12, cardiacRisk: 55, color: '#EF4444',
    facts: ['Crises continues, EEG non réactif', 'Dr Giles évoque encéphalite auto-immune et PIMS', 'Midazolam 3ml/h, Kétamine 1.6ml/h, Sufentanil 0.2ml/h', 'Débat entre 3 hypothèses : FIRES / EAIS / PIMS neuro'],
    pulsar: ['PULSAR aurait posé FIRES dès J0 (score 8/13)', '3 hypothèses concurrentes = 5 jours perdus', 'PVE : cardiotoxicité cumulée déjà critique'] },
  { day: 4, date: '07/04', place: 'Robert-Debré', title: '5 conv. dont 1 de 8 min', vps: 100, gcs: 3, crises: 9, cardiacRisk: 65, color: '#EF4444',
    facts: ['HYPOTHÈSE FIRES POSÉE (90%)', 'DÉBUT RÉGIME CÉTOGÈNE', 'EEG : peu de changement', 'Discussions anakinra commencent', 'Virage stratégique à Robert-Debré'],
    pulsar: ['FIRES posé à J+5 — retard +120h vs J0 PULSAR', 'KD à J+5 — retard +72h vs J+2 PULSAR', 'Anakinra : encore 5 jours avant administration...'] },
  { day: 14, date: '17/04', place: 'Robert-Debré', title: 'Décès — Arrêt cardiaque', vps: 100, gcs: 3, crises: 0, cardiacRisk: 100, color: '#EF4444',
    facts: ['Arrêt cardiaque', 'Derniers examens cérébraux : pas de lésion irréversible', 'Anakinra administré J+10 — signes amélioration J+11', 'Mais 7 jours de retard sur la fenêtre de 72h'],
    pulsar: ['10+ molécules cardio-actives pendant 15 jours', 'PAM oscillante : 61 → 67 → 114', 'Troponine et écho ne figurent pas dans les documents disponibles', 'PULSAR aurait recommandé monitoring cardiaque dès J+3'] },
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

// ══════════════════════════════════════════════════════════════
// PRÉLUDE NARRATIF
// Voix humaine avant les données — chapitres I→V de la Genèse
// ══════════════════════════════════════════════════════════════

const FRAGMENTS = [
  {
    chapter: 'I',
    title: 'La fièvre',
    text: 'Tout commence par une fièvre. Une fièvre d\'enfant, comme il y en a des milliers chaque jour. Alejandro a six ans. Sa température monte, ne redescend pas.',
    coda: 'Et puis quelque chose de lumineux survient : Alejandro va mieux. Suffisamment pour enregistrer une petite vidéo à sa grand-mère. Sa voix d\'enfant, un sourire peut-être, quelques mots simples — je vais mieux, je vais bientôt sortir.',
    color: '#6C7CFF',
  },
  {
    chapter: 'II',
    title: 'La chute',
    text: 'Le lendemain, avant la sortie, on lui fait de derniers examens de sang. Des examens de routine. Et à partir de là, tout bascule.',
    coda: 'Quand on entre dans sa chambre de réanimation, on voit le nombre de lignes de perfusion intraveineuse, les poches de médicaments suspendues les unes à côté des autres, les écrans qui clignotent, les tuyaux partout. On est abasourdis. Sidérés par la violence de ce qu\'on voit.',
    color: '#F59E0B',
  },
  {
    chapter: 'III–IV',
    title: 'Le diagnostic',
    text: 'Un mot que personne autour d\'Alejandro n\'avait jamais entendu : syndrome FIRES. Febrile Infection-Related Epilepsy Syndrome. L\'une des pathologies les plus dévastatrices qui puisse frapper un enfant.',
    coda: 'La nuit, je suis sur Internet. Je cherche tout. Boston. Chicago. New York. Mumbai. Zurich. Plus d\'une vingtaine d\'emails aux plus grands spécialistes de la planète. Et le miracle — parce que c\'en est un — c\'est qu\'ils répondent. Tous.',
    color: '#EF4444',
  },
  {
    chapter: 'V',
    title: 'La promesse',
    text: 'Quinze jours. C\'est le temps qu\'il aura fallu entre une fièvre d\'enfant et un enterrement d\'enfant.',
    coda: 'Quand je suis entré dans cette chambre et que je l\'ai vu, j\'ai su que je ne pouvais pas laisser ça sans réponse. Je lui ai fait une promesse. Les mêmes mots, toujours les mêmes :',
    quote: 'Je ferai quelque chose. Je ferai quelque chose pour que ta mort ne soit pas en vain. Pour les prochains enfants qui seront frappés par cette pathologie. Je te le jure.',
    color: '#F5A623',
  },
]

function PréludeNarratif() {
  const [revealed, setRevealed] = useState<number[]>([])
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true)
        FRAGMENTS.forEach((_, i) => {
          setTimeout(() => setRevealed(r => [...r, i]), i * 600)
        })
      }
    }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])

  return (
    <div ref={ref} style={{ marginBottom: 'var(--p-space-8)' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: '#F5A623' }} />
        <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
          Ce qui s'est passé
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FRAGMENTS.map((f, i) => (
          <div key={i} style={{
            opacity: revealed.includes(i) ? 1 : 0,
            transform: revealed.includes(i) ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            background: 'var(--p-bg-card)',
            borderRadius: 14,
            border: `1px solid ${f.color}15`,
            borderLeft: `4px solid ${f.color}`,
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Chapter watermark */}
            <div style={{
              position: 'absolute', top: 10, right: 16,
              fontSize: 40, fontWeight: 900, color: `${f.color}06`,
              fontFamily: 'var(--p-font-mono)', lineHeight: 1, userSelect: 'none',
            }}>{f.chapter}</div>

            <div style={{ fontSize: 9, fontWeight: 700, color: f.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--p-font-mono)' }}>
              {f.title}
            </div>
            <p style={{ fontSize: 13, color: 'var(--p-text)', lineHeight: 1.8, marginBottom: 10, fontStyle: 'italic' }}>
              {f.text}
            </p>
            <p style={{ fontSize: 12, color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: f.quote ? 12 : 0 }}>
              {f.coda}
            </p>
            {f.quote && (
              <div style={{
                borderLeft: `3px solid ${f.color}`,
                paddingLeft: 16, marginTop: 4,
                background: `${f.color}08`, borderRadius: '0 8px 8px 0',
                padding: '10px 16px',
              }}>
                <p style={{ fontSize: 13, color: f.color, fontStyle: 'italic', lineHeight: 1.9, margin: 0 }}>
                  « {f.quote} »
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bridge vers la reconstitution */}
      <div style={{ textAlign: 'center', margin: '28px 0 8px', padding: '0 20px' }}>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, transparent, #6C7CFF40)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 12, color: 'var(--p-text-dim)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto', fontStyle: 'italic' }}>
          Voici ce que les moteurs PULSAR auraient vu, jour après jour, si la plateforme avait existé en avril 2025.
        </p>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(180deg, #6C7CFF40, transparent)', margin: '12px auto 0' }} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// RECONSTITUTION CINÉMATIQUE
// Play auto + scroll libre — 9 jours — J+15 écran mémorial
// ══════════════════════════════════════════════════════════════

const VITALS: Record<number, { pam?: string; fc?: string; spo2?: string; crises?: string }> = {
  0: {},
  1: {},
  2: { pam: '—', fc: '—', spo2: '—', crises: '3' },
  3: { pam: '—', fc: '—', spo2: '—', crises: '5' },
  4: { pam: '61', fc: '82', spo2: '95%', crises: '6' },
  5: { pam: '67', fc: '99', spo2: '94%', crises: '8' },
  6: { pam: '—', fc: '—', spo2: '—', crises: '12' },
  7: { pam: '—', fc: '—', spo2: '—', crises: '9' },
  8: { pam: '114 (!)', fc: '108', spo2: '97%', crises: '—' },
}

function VitalChip({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: alert ? '#EF444412' : '#6C7CFF08',
      border: `1px solid ${alert ? '#EF444425' : '#6C7CFF18'}`,
      borderRadius: 8, padding: '6px 10px', minWidth: 52,
    }}>
      <span style={{ fontSize: 14, fontWeight: 900, color: alert ? '#EF4444' : '#6C7CFF', fontFamily: 'var(--p-font-mono)' }}>{value}</span>
      <span style={{ fontSize: 8, color: 'var(--p-text-dim)', marginTop: 2, fontWeight: 700 }}>{label}</span>
    </div>
  )
}

function ReconstitutionCinematique() {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [entered, setEntered] = useState(false)
  const [factVisible, setFactVisible] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const total = TIMELINE.length

  const isDeath = current === total - 1

  // Scroll-into-view reveals section
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true) }, { threshold: 0.15 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Animate facts one by one when day changes
  useEffect(() => {
    setFactVisible(0)
    const ev = TIMELINE[current]
    if (!ev) return
    const total = ev.facts.length + ev.pulsar.length
    let i = 0
    const t = setInterval(() => {
      i++
      setFactVisible(i)
      if (i >= total) clearInterval(t)
    }, 220)
    return () => clearInterval(t)
  }, [current])

  // Auto-play
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrent(c => {
          if (c >= total - 1) { setPlaying(false); return c }
          return c + 1
        })
      }, 4200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, total])

  const goTo = useCallback((i: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, i)))
  }, [total])

  const ev = TIMELINE[current]
  const vitals = VITALS[current] || {}
  const progress = (current / (total - 1)) * 100

  return (
    <div ref={sectionRef} style={{ marginBottom: 'var(--p-space-8)', opacity: entered ? 1 : 0, transition: 'opacity 0.8s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #6C7CFF, #EF4444)' }} />
          <h2 style={{ fontSize: 'var(--p-text-base)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
            Reconstitution — 15 jours
          </h2>
        </div>
        <button
          onClick={() => { setPlaying(p => !p) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            background: playing ? '#EF444415' : '#6C7CFF15',
            border: `1px solid ${playing ? '#EF444430' : '#6C7CFF30'}`,
            color: playing ? '#EF4444' : '#6C7CFF',
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--p-font-mono)',
            transition: 'all 0.2s',
          }}
        >
          {playing ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <button onClick={() => goTo(current - 1)} disabled={current === 0}
          style={{ background: 'none', border: 'none', cursor: current === 0 ? 'default' : 'pointer', color: current === 0 ? '#2A3040' : '#6C7CFF', fontSize: 14, padding: '0 4px' }}>‹</button>
        <div style={{ flex: 1, position: 'relative', height: 6, background: '#1A2235', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: isDeath ? '#DC2626' : 'linear-gradient(90deg, #6C7CFF, #EF4444)', borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
        <button onClick={() => goTo(current + 1)} disabled={current === total - 1}
          style={{ background: 'none', border: 'none', cursor: current === total - 1 ? 'default' : 'pointer', color: current === total - 1 ? '#2A3040' : '#6C7CFF', fontSize: 14, padding: '0 4px' }}>›</button>
      </div>

      {/* Day dots */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
        {TIMELINE.map((e, i) => (
          <button key={i} onClick={() => goTo(i)} title={e.title} style={{
            width: i === current ? 20 : 8, height: 8,
            borderRadius: 4, border: 'none', cursor: 'pointer',
            background: i === current ? e.color : i < current ? e.color + '60' : '#1A2235',
            transition: 'all 0.3s ease', padding: 0,
          }} />
        ))}
      </div>

      {/* Main cinematic card */}
      {isDeath ? (
        // Death screen
        <div style={{
          background: '#000', borderRadius: 16, padding: '60px 32px',
          textAlign: 'center', border: '1px solid #222',
          animation: 'fadeIn 1s ease',
        }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: '#444', letterSpacing: 4, marginBottom: 24 }}>
            17 AVRIL 2025 · J+15
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>
            Arrêt cardiaque.
          </div>
          <div style={{ fontSize: 13, color: '#666', maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Pas de lésion cérébrale irréversible aux derniers examens. Anakinra administré à J+10 — des signes d'amélioration à J+11. Mais la fenêtre des 72 premières heures s'était fermée 9 jours plus tôt.
          </div>
          <div style={{ width: 1, height: 40, background: '#F5A623', margin: '0 auto 24px', opacity: 0.6 }} />
          <div style={{ fontSize: 16, color: '#F5A623', fontStyle: 'italic', lineHeight: 1.8 }}>
            À la mémoire d'Alejandro R.<br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>2019 — 2025</span>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--p-bg-card)', borderRadius: 16,
          border: `1px solid ${ev.color}20`,
          overflow: 'hidden',
          boxShadow: `0 0 40px ${ev.color}08`,
        }}>
          {/* Top band */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${ev.color}, ${ev.color}40)` }} />

          <div style={{ padding: '20px 20px 16px' }}>
            {/* Day header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    padding: '4px 12px', borderRadius: 6,
                    background: `${ev.color}15`, border: `1px solid ${ev.color}25`,
                    fontSize: 12, fontWeight: 900, color: ev.color, fontFamily: 'var(--p-font-mono)',
                  }}>
                    {ev.day < 0 ? `J${ev.day}` : ev.day === 0 ? 'J0' : `J+${ev.day}`}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>{ev.date}</span>
                  <span style={{ fontSize: 10, color: 'var(--p-text-dim)' }}>· {ev.place}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--p-text)', lineHeight: 1.3 }}>{ev.title}</div>
              </div>
              {/* VPS gauge */}
              <div style={{ textAlign: 'center', minWidth: 52 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: ev.color, fontFamily: 'var(--p-font-mono)', lineHeight: 1 }}>{ev.vps}</div>
                <div style={{ fontSize: 8, color: ev.color, fontWeight: 700 }}>VPS</div>
                <div style={{ marginTop: 4, width: 48, height: 4, background: '#1A2235', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ev.vps}%`, background: ev.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>

            {/* Vitals row */}
            {(vitals.pam || vitals.fc || vitals.spo2 || vitals.crises) && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {vitals.pam && <VitalChip label="PAM" value={vitals.pam} alert={vitals.pam.includes('!')} />}
                {vitals.fc && <VitalChip label="FC" value={vitals.fc} />}
                {vitals.spo2 && <VitalChip label="SpO2" value={vitals.spo2} />}
                {vitals.crises && <VitalChip label="Crises" value={vitals.crises} alert={parseInt(vitals.crises) >= 6} />}
              </div>
            )}

            {/* Facts + PULSAR two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} /> Événements
                </div>
                {ev.facts.map((f, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: 'var(--p-text-muted)', paddingLeft: 8,
                    borderLeft: `2px solid ${i < factVisible ? '#EF444425' : 'transparent'}`,
                    marginBottom: 4, lineHeight: 1.5,
                    opacity: i < factVisible ? 1 : 0,
                    transform: i < factVisible ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}>{f}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#2FD1C8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2FD1C8', display: 'inline-block' }} /> PULSAR aurait dit
                </div>
                {ev.pulsar.map((p, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: '#A0AEC0', paddingLeft: 8,
                    borderLeft: `2px solid ${i < (factVisible - ev.facts.length) ? '#2FD1C825' : 'transparent'}`,
                    marginBottom: 4, lineHeight: 1.5,
                    opacity: i < (factVisible - ev.facts.length) ? 1 : 0,
                    transform: i < (factVisible - ev.facts.length) ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
        {TIMELINE.map((e, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 9, color: i === current ? e.color : 'var(--p-text-dim)',
            fontFamily: 'var(--p-font-mono)', fontWeight: i === current ? 800 : 400,
            padding: 0, transition: 'color 0.2s',
            display: i === 0 || i === total - 1 || i === current || i === current - 1 || i === current + 1 ? 'block' : 'none',
          }}>
            {e.day < 0 ? `J${e.day}` : e.day === 0 ? 'J0' : `J+${e.day}`}
          </button>
        ))}
      </div>
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

      {/* Prélude narratif */}
      <PréludeNarratif />

      {/* Reconstitution cinématique */}
      <ReconstitutionCinematique />

      {/* Conclusion */}
      <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-2xl)', padding: 'var(--p-space-8)', border: '1px solid #F5A62315', textAlign: 'center' }}>
        <div style={{ width: 2, height: 40, background: 'linear-gradient(180deg, #6C7CFF, #F5A623)', margin: '0 auto var(--p-space-4)', borderRadius: 1 }} />
        <p style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          {t(
            "Personne ne peut dire si PULSAR aurait sauvé Alejandro. Personne ne peut dire qu'il ne l'aurait pas sauvé non plus. Ce qui est certain, c'est qu'il aurait posé les bonnes questions au bon moment. Levé les bonnes alertes. Ouvert les bonnes fenêtres thérapeutiques avant qu'elles ne se ferment. Dans les syndromes où chaque heure compte, une aide à la décision qui comprime le temps — entre le signal et l'action, entre le doute et la certitude — n'est pas un luxe. C'est peut-être la différence.",
            "No one can say whether PULSAR would have saved Alejandro. No one can say it wouldn't have either. What is certain is that it would have asked the right questions at the right time. Raised the right alerts. Opened the right therapeutic windows before they closed. In syndromes where every hour matters, a decision-support tool that compresses time — between signal and action, between doubt and certainty — is not a luxury. It may be the difference."
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

// redeploy trigger Sun Mar  8 07:45:19 UTC 2026
