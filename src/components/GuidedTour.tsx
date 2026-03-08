'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'

// ══════════════════════════════════════════════════════════════
// GUIDED TOUR — Parcours démo pas-à-pas
// Style Linear / Vercel onboarding
// Accessible via bouton landing "Voir la démo" ou Ctrl+Shift+D
// ══════════════════════════════════════════════════════════════

interface TourStep {
  id: string
  route: string
  title: string
  titleEn: string
  narrative: string
  narrativeEn: string
  highlight?: string   // what to look at
  highlightEn?: string
  duration: number     // seconds to auto-advance (0 = manual only)
  cta?: string
  ctaEn?: string
  ctaRoute?: string
  color: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    route: '/patients',
    title: 'Bienvenue dans PULSAR',
    titleEn: 'Welcome to PULSAR',
    narrative: 'Vous êtes sur la file active. Ces 4 patients sont des cas de démonstration. Chacun représente une pathologie neuro-inflammatoire pédiatrique différente.',
    narrativeEn: "You're on the active caseload. These 4 patients are demo cases. Each represents a different pediatric neuroinflammatory condition.",
    highlight: 'Repérez les badges VPS — plus le score est élevé, plus la situation est critique.',
    highlightEn: 'Look for VPS badges — the higher the score, the more critical the situation.',
    duration: 0,
    cta: 'Ouvrir Inès →',
    ctaEn: 'Open Inès →',
    ctaRoute: '/patient/ines/cockpit',
    color: '#6C7CFF',
  },
  {
    id: 'cockpit',
    route: '/patient/ines/cockpit',
    title: 'Le Cockpit patient',
    titleEn: 'Patient Cockpit',
    narrative: "Inès, 4 ans. FIRES suspecté. VPS 95 — situation critique. Le Cockpit rassemble tout : constantes vitales, activité EEG, score de gravité, alertes actives.",
    narrativeEn: "Inès, 4 years old. Suspected FIRES. VPS 95 — critical situation. The Cockpit centralizes everything: vital signs, EEG activity, severity score, active alerts.",
    highlight: 'Observez le VPS en haut à gauche. Il recalcule en temps réel à chaque nouvelle donnée.',
    highlightEn: 'Watch the VPS score top left. It recalculates in real time with each new data point.',
    duration: 0,
    cta: 'Voir les alertes →',
    ctaEn: 'View alerts →',
    ctaRoute: '/patient/ines/urgence',
    color: '#EF4444',
  },
  {
    id: 'urgence',
    route: '/patient/ines/urgence',
    title: 'Module Urgence',
    titleEn: 'Emergency Module',
    narrative: "14 alertes actives. 2 Cascade Alert Events détectés par le moteur CAE. C'est ici que PULSAR intervient avant la dégradation — et non après.",
    narrativeEn: "14 active alerts. 2 Cascade Alert Events detected by the CAE engine. This is where PULSAR intervenes before deterioration — not after.",
    highlight: 'Les alertes rouges sont des urgences vitales immédiates. Les orange demandent une attention dans l\'heure.',
    highlightEn: 'Red alerts are immediate life-threatening emergencies. Orange ones require attention within the hour.',
    duration: 0,
    cta: 'Voir le diagnostic →',
    ctaEn: 'View diagnosis →',
    ctaRoute: '/patient/ines/diagnostic',
    color: '#F59E0B',
  },
  {
    id: 'diagnostic',
    route: '/patient/ines/diagnostic',
    title: 'Diagnostic différentiel',
    titleEn: 'Differential Diagnosis',
    narrative: "Le moteur TDE croise 34 paramètres cliniques. FIRES : 87% de probabilité. Anti-NMDAR : 11%. Le système a identifié 4 délais diagnostiques évitables.",
    narrativeEn: "The TDE engine cross-references 34 clinical parameters. FIRES: 87% probability. Anti-NMDAR: 11%. The system identified 4 avoidable diagnostic delays.",
    highlight: 'Chaque hypothèse est sourcée. Cliquez sur une référence pour accéder à la publication originale.',
    highlightEn: 'Each hypothesis is sourced. Click a reference to access the original publication.',
    duration: 0,
    cta: 'Voir le traitement →',
    ctaEn: 'View treatment →',
    ctaRoute: '/patient/ines/traitement',
    color: '#8B5CF6',
  },
  {
    id: 'traitement',
    route: '/patient/ines/traitement',
    title: 'Protocoles thérapeutiques',
    titleEn: 'Treatment Protocols',
    narrative: "Protocoles adaptés au profil d'Inès. Anakinra, tocilizumab, kétogène — éligibilité scorée. Interactions médicamenteuses vérifiées. Chaque ligne est traçable.",
    narrativeEn: "Protocols adapted to Inès's profile. Anakinra, tocilizumab, ketogenic — scored eligibility. Drug interactions checked. Every line is traceable.",
    highlight: 'Le moteur TPE calcule le score d\'éligibilité pour chaque traitement selon les comorbidités du patient.',
    highlightEn: 'The TPE engine calculates eligibility scores for each treatment based on patient comorbidities.',
    duration: 0,
    cta: 'Voir ORACLE →',
    ctaEn: 'View ORACLE →',
    ctaRoute: '/patient/ines/oracle',
    color: '#10B981',
  },
  {
    id: 'oracle',
    route: '/patient/ines/oracle',
    title: 'ORACLE — Simulation',
    titleEn: 'ORACLE — Simulation',
    narrative: "ORACLE projette le futur du patient selon les décisions thérapeutiques. 5 scénarios comparés. Le médecin voit l'impact de chaque choix avant de le faire.",
    narrativeEn: "ORACLE projects the patient's future based on therapeutic decisions. 5 scenarios compared. The physician sees the impact of each choice before making it.",
    highlight: 'Ce n\'est pas de la prédiction — c\'est de la simulation probabiliste basée sur la littérature.',
    highlightEn: "This isn't prediction — it's probabilistic simulation based on published literature.",
    duration: 0,
    cta: 'Voir Discovery Engine →',
    ctaEn: 'View Discovery Engine →',
    ctaRoute: '/research',
    color: '#E879F9',
  },
  {
    id: 'research',
    route: '/research',
    title: 'Discovery Engine',
    titleEn: 'Discovery Engine',
    narrative: "Chaque patient alimente la recherche. PubMed live, ClinicalTrials.gov, génération d'hypothèses par IA. Le cas d'Inès génère des pistes que son médecin n'aurait peut-être pas explorées.",
    narrativeEn: "Every patient feeds research. Live PubMed, ClinicalTrials.gov, AI hypothesis generation. Inès's case generates leads her physician might not have explored.",
    highlight: '4 niveaux d\'analyse en cascade : PatternMiner → LiteratureScanner → HypothesisEngine → TreatmentPathfinder.',
    highlightEn: '4 cascading analysis levels: PatternMiner → LiteratureScanner → HypothesisEngine → TreatmentPathfinder.',
    duration: 0,
    cta: 'Voir le cas Alejandro →',
    ctaEn: 'View Alejandro case →',
    ctaRoute: '/usecase/alejandro',
    color: '#10B981',
  },
  {
    id: 'alejandro',
    route: '/usecase/alejandro',
    title: 'Le cas fondateur',
    titleEn: 'The founding case',
    narrative: "Alejandro R., 2019–2025. C'est pour lui que PULSAR existe. Cette page retrace les 15 jours où tout s'est joué — et ce que PULSAR aurait vu, heure par heure.",
    narrativeEn: "Alejandro R., 2019–2025. PULSAR exists because of him. This page traces the 15 days when everything was decided — and what PULSAR would have seen, hour by hour.",
    highlight: 'Faites défiler pour voir la reconstitution cinématique complète.',
    highlightEn: 'Scroll down to see the full cinematic reconstruction.',
    duration: 0,
    color: '#F5A623',
  },
]

// ── Storage key ──
const TOUR_KEY = 'pulsar-tour-active'
const TOUR_STEP_KEY = 'pulsar-tour-step'

// ── Expose trigger globally ──
if (typeof window !== 'undefined') {
  (window as any).__startPulsarTour = () => {
    sessionStorage.setItem(TOUR_KEY, '1')
    sessionStorage.setItem(TOUR_STEP_KEY, '0')
    window.location.href = '/patients'
  }
}

export function startTour() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOUR_KEY, '1')
    sessionStorage.setItem(TOUR_STEP_KEY, '0')
    window.location.href = '/patients'
  }
}

export default function GuidedTour() {
  const router = useRouter()
  const pathname = usePathname()
  const { lang } = useLang()
  const isFr = lang === 'fr'

  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [minimized, setMinimized] = useState(false)

  // Hydrate from sessionStorage
  useEffect(() => {
    const isActive = sessionStorage.getItem(TOUR_KEY) === '1'
    const savedStep = parseInt(sessionStorage.getItem(TOUR_STEP_KEY) || '0', 10)
    if (isActive) {
      setActive(true)
      // Find step matching current route
      const matchIdx = TOUR_STEPS.findIndex(s => pathname.startsWith(s.route))
      if (matchIdx >= 0) {
        setStepIdx(matchIdx)
        sessionStorage.setItem(TOUR_STEP_KEY, String(matchIdx))
      } else {
        setStepIdx(savedStep)
      }
    }
  }, [pathname])

  const step = TOUR_STEPS[stepIdx]

  const handleNext = useCallback(() => {
    if (stepIdx < TOUR_STEPS.length - 1) {
      const next = stepIdx + 1
      setStepIdx(next)
      sessionStorage.setItem(TOUR_STEP_KEY, String(next))
      if (TOUR_STEPS[next].ctaRoute || TOUR_STEPS[next].route) {
        router.push(TOUR_STEPS[next].route)
      }
    } else {
      // End tour
      sessionStorage.removeItem(TOUR_KEY)
      sessionStorage.removeItem(TOUR_STEP_KEY)
      setActive(false)
    }
  }, [stepIdx, router])

  const handleCta = useCallback(() => {
    if (step.ctaRoute) {
      const next = stepIdx + 1
      setStepIdx(next)
      sessionStorage.setItem(TOUR_STEP_KEY, String(next))
      router.push(step.ctaRoute)
    }
  }, [step, stepIdx, router])

  const handleExit = useCallback(() => {
    sessionStorage.removeItem(TOUR_KEY)
    sessionStorage.removeItem(TOUR_STEP_KEY)
    setActive(false)
  }, [])

  if (!active || !step) return null

  const title = isFr ? step.title : step.titleEn
  const narrative = isFr ? step.narrative : step.narrativeEn
  const highlight = isFr ? step.highlight : step.highlightEn
  const ctaLabel = isFr ? (step.cta || 'Suivant →') : (step.ctaEn || 'Next →')
  const isLast = stepIdx === TOUR_STEPS.length - 1

  if (minimized) return (
    <button
      onClick={() => setMinimized(false)}
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9998,
        background: step.color, border: 'none', borderRadius: 24,
        padding: '10px 24px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: `0 4px 20px ${step.color}60`,
        color: '#fff', fontSize: 12, fontFamily: 'var(--p-font-mono)', fontWeight: 700,
      }}
    >
      <span>▶</span>
      <span>PULSAR TOUR · Étape {stepIdx + 1}/{TOUR_STEPS.length}</span>
    </button>
  )

  return (
    <>
    {/* Backdrop highlight */}
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9997,
      height: 220,
      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998,
      width: '92%', maxWidth: 560,
      background: '#0C1020',
      border: `1px solid ${step.color}35`,
      borderRadius: 16,
      boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${step.color}15`,
      overflow: 'hidden',
      animation: 'tourIn 0.3s cubic-bezier(.22,1,.36,1)',
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          height: '100%',
          width: `${((stepIdx + 1) / TOUR_STEPS.length) * 100}%`,
          background: `linear-gradient(90deg, ${step.color}, ${step.color}aa)`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: step.color,
            boxShadow: `0 0 8px ${step.color}`,
          }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: step.color, fontFamily: 'var(--p-font-mono)', letterSpacing: 2, textTransform: 'uppercase' }}>
            TOUR · {stepIdx + 1}/{TOUR_STEPS.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setMinimized(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>−</button>
          <button onClick={handleExit} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>×</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 14px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 10px' }}>
          {narrative}
        </p>

        {highlight && (
          <div style={{
            padding: '8px 10px', borderRadius: 8, marginBottom: 12,
            background: `${step.color}0D`,
            border: `1px solid ${step.color}20`,
          }}>
            <p style={{ fontSize: 10, color: `${step.color}CC`, lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: step.color }}>👁 </strong>{highlight}
            </p>
          </div>
        )}

        {/* Dot navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {TOUR_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === stepIdx ? 16 : 6,
              height: 6, borderRadius: 3,
              background: i === stepIdx ? step.color : i < stepIdx ? `${step.color}50` : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {stepIdx > 0 && (
            <button onClick={() => { setStepIdx(s => s - 1); router.push(TOUR_STEPS[stepIdx - 1].route) }}
              style={{
                padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                background: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                fontSize: 11, fontFamily: 'var(--p-font-mono)',
              }}>← {isFr ? 'Retour' : 'Back'}</button>
          )}
          <button
            onClick={isLast ? handleExit : (step.ctaRoute ? handleCta : handleNext)}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 8, border: 'none',
              background: step.color, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'var(--p-font-mono)',
              boxShadow: `0 4px 12px ${step.color}40`,
            }}>
            {isLast ? (isFr ? '✓ Fin du tour' : '✓ End tour') : ctaLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tourIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
    </>
  )
}
