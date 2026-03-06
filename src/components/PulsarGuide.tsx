'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

// ══════════════════════════════════════════════════════════════
// PULSAR Guide — Assistant IA contextuel
// Comprend le parcours clinique et guide l'utilisateur
// ══════════════════════════════════════════════════════════════

interface GuideStep {
  message: string
  messageEn: string
  action?: { label: string; labelEn: string; href: string }
  tip?: string
  tipEn?: string
}

// ── Contextual intelligence: what to say based on current page + state ──
function getContextualGuide(pathname: string, lang: 'fr' | 'en'): GuideStep {

  // ── PATIENTS LIST (File active) ──
  if (pathname === '/patients') {
    return {
      message: "Voici la file active — vos patients en cours. Cliquez sur un patient pour voir son dossier complet, ou admettez un nouveau patient.",
      messageEn: "This is your active caseload — your current patients. Click on a patient to see their full record, or admit a new patient.",
      action: { label: 'Nouvelle admission', labelEn: 'New admission', href: '/patients/intake' },
      tip: "Le score VPS (Vulnerability-Priority Score) indique la gravité : plus il est élevé, plus le patient est prioritaire.",
      tipEn: "The VPS (Vulnerability-Priority Score) indicates severity: the higher it is, the more urgent the patient.",
    }
  }

  // ── INTAKE ──
  if (pathname === '/patients/intake') {
    return {
      message: "Commencez par choisir comment renseigner le patient. Si vous avez un document d'un autre hôpital, importez-le — l'IA extraira les données automatiquement.",
      messageEn: "Start by choosing how to enter patient data. If you have a document from another hospital, import it — AI will extract the data automatically.",
      tip: "La saisie manuelle prend environ 5 minutes pour un dossier complet. Chaque étape est validée avant de passer à la suivante.",
      tipEn: "Manual entry takes about 5 minutes for a complete record. Each step is validated before moving to the next.",
    }
  }

  // ── PATIENT COCKPIT ──
  if (pathname.match(/\/patient\/[^/]+\/cockpit/) || pathname.match(/\/patient\/[^/]+$/)) {
    return {
      message: "Le Cockpit est le tableau de bord principal du patient. Vous voyez en temps réel l'EEG, les constantes vitales, le score VPS et les crises.",
      messageEn: "The Cockpit is the patient's main dashboard. You see real-time EEG, vital signs, VPS score and seizure activity.",
      tip: "Surveillez le VPS : au-dessus de 70, la situation est critique. Le GCS et la fréquence des crises influencent directement le score.",
      tipEn: "Watch the VPS: above 70, the situation is critical. GCS and seizure frequency directly impact the score.",
      action: { label: 'Voir les Red Flags', labelEn: 'View Red Flags', href: '#redflags' },
    }
  }

  // ── URGENCE ──
  if (pathname.match(/\/patient\/[^/]+\/urgence/)) {
    return {
      message: "Module Urgence — les alertes critiques qui nécessitent une action immédiate. Chaque alerte est classée par gravité et accompagnée d'une recommandation.",
      messageEn: "Emergency module — critical alerts requiring immediate action. Each alert is classified by severity with a recommended action.",
      tip: "Les alertes rouges sont des urgences vitales. Ne les ignorez jamais sans les avoir validées.",
      tipEn: "Red alerts are life-threatening emergencies. Never dismiss them without reviewing.",
    }
  }

  // ── DIAGNOSTIC ──
  if (pathname.match(/\/patient\/[^/]+\/diagnostic/)) {
    return {
      message: "Le module Diagnostic croise toutes les données pour proposer un diagnostic différentiel. Plus vous renseignez de données, plus il est précis.",
      messageEn: "The Diagnostic module cross-references all data to propose a differential diagnosis. The more data you enter, the more precise it becomes.",
      tip: "Le Discovery Engine peut identifier des diagnostics rares. Consultez l'onglet si le tableau clinique est atypique.",
      tipEn: "The Discovery Engine can identify rare diagnoses. Check it if the clinical picture is atypical.",
    }
  }

  // ── TRAITEMENT ──
  if (pathname.match(/\/patient\/[^/]+\/traitement/)) {
    return {
      message: "Protocoles thérapeutiques adaptés au diagnostic et au profil du patient. Les interactions médicamenteuses sont vérifiées automatiquement.",
      messageEn: "Treatment protocols adapted to the diagnosis and patient profile. Drug interactions are automatically checked.",
      tip: "Chaque recommandation est sourcée. Cliquez sur la référence pour accéder à la publication.",
      tipEn: "Each recommendation is sourced. Click the reference to access the publication.",
    }
  }

  // ── ORACLE ──
  if (pathname.match(/\/patient\/[^/]+\/oracle/)) {
    return {
      message: "ORACLE simule le futur du patient selon les décisions thérapeutiques. Comparez les scénarios et visualisez les trajectoires VPS projetées.",
      messageEn: "ORACLE simulates the patient's future based on therapeutic decisions. Compare scenarios and visualize projected VPS trajectories.",
      tip: "Cliquez sur un scénario pour isoler sa courbe. ORACLE est un outil de simulation — le médecin reste maître de la décision.",
      tipEn: "Click a scenario to isolate its curve. ORACLE is a simulation tool — the physician remains the decision-maker.",
    }
  }

  // ── EXAMENS ──
  if (pathname.match(/\/patient\/[^/]+\/examens/)) {
    return {
      message: "Résultats d'examens : biologie, imagerie, EEG. Renseignez les résultats ici pour alimenter le moteur d'analyse.",
      messageEn: "Exam results: biology, imaging, EEG. Enter results here to feed the analysis engine.",
      tip: "Les valeurs anormales sont signalées automatiquement en couleur. Le moteur recalcule le VPS à chaque nouvelle donnée.",
      tipEn: "Abnormal values are automatically flagged in color. The engine recalculates VPS with each new data point.",
    }
  }

  // ── SYNTHÈSE ──
  if (pathname.match(/\/patient\/[^/]+\/synthese/)) {
    return {
      message: "Synthèse complète du dossier patient — un résumé exportable pour les transmissions, les staffs ou les transferts.",
      messageEn: "Complete patient summary — an exportable overview for handoffs, team meetings or transfers.",
      action: { label: 'Exporter en PDF', labelEn: 'Export as PDF', href: '#export' },
      tip: "Vous pouvez générer un brief médical en français ou en anglais pour les échanges internationaux.",
      tipEn: "You can generate a medical brief in French or English for international exchanges.",
    }
  }

  // ── RESSOURCES ──
  if (pathname.match(/\/patient\/[^/]+\/ressources/)) {
    return {
      message: "Littérature médicale, protocoles de référence et publications liées au diagnostic de ce patient.",
      messageEn: "Medical literature, reference protocols and publications related to this patient's diagnosis.",
      tip: "Les sources sont classées par pertinence. Les plus récentes apparaissent en premier.",
      tipEn: "Sources are ranked by relevance. The most recent appear first.",
    }
  }

  // ── HISTORIQUE ──
  if (pathname.match(/\/patient\/[^/]+\/historique/)) {
    return {
      message: "Chronologie complète : chaque événement clinique, examen, traitement et évolution du VPS dans le temps.",
      messageEn: "Complete timeline: every clinical event, exam, treatment and VPS evolution over time.",
      tip: "Cliquez sur un événement pour voir son impact sur le score VPS.",
      tipEn: "Click an event to see its impact on the VPS score.",
    }
  }

  // ── SAISIE ──
  if (pathname.match(/\/patient\/[^/]+\/saisie/)) {
    return {
      message: "Saisie de nouvelles données cliniques. Chaque entrée met à jour le score VPS en temps réel.",
      messageEn: "Enter new clinical data. Each entry updates the VPS score in real time.",
      tip: "Renseignez le GCS, les crises, la biologie et l'imagerie pour un score VPS fiable.",
      tipEn: "Enter GCS, seizures, biology and imaging for a reliable VPS score.",
    }
  }

  // ── EXPORT ──
  if (pathname.match(/\/patient\/[^/]+\/export/)) {
    return {
      message: "Exportez le dossier en PDF, JSON ou brief médical. Utile pour les transferts, les staffs et les publications.",
      messageEn: "Export the record as PDF, JSON or medical brief. Useful for transfers, team meetings and publications.",
    }
  }

  // ── AUDIT ──
  if (pathname.match(/\/patient\/[^/]+\/audit/)) {
    return {
      message: "Journal d'audit — toutes les actions effectuées sur ce dossier, par qui et quand. Traçabilité complète.",
      messageEn: "Audit log — all actions performed on this record, by whom and when. Full traceability.",
    }
  }

  // ── SUIVI ──
  if (pathname.match(/\/patient\/[^/]+\/suivi/)) {
    return {
      message: "Suivi longitudinal du patient. Courbes d'évolution, comparaison des scores et tendances.",
      messageEn: "Longitudinal patient follow-up. Evolution curves, score comparisons and trends.",
    }
  }

  // ── DASHBOARD ──
  if (pathname === '/dashboard') {
    return {
      message: "Le Dashboard vous donne une vue d'ensemble de tous vos patients. Les alertes critiques apparaissent en haut.",
      messageEn: "The Dashboard gives you an overview of all your patients. Critical alerts appear at the top.",
      action: { label: 'Voir la file active', labelEn: 'View active caseload', href: '/patients' },
      tip: "Les graphiques VPS montrent l'évolution de chaque patient sur les dernières heures.",
      tipEn: "VPS charts show each patient's progression over the past hours.",
    }
  }

  // ── NEUROCORE ──
  if (pathname.startsWith('/neurocore')) {
    return {
      message: "NeuroCore est le moteur d'analyse principal. Il croise les données cliniques, biologiques et d'imagerie pour générer un diagnostic différentiel.",
      messageEn: "NeuroCore is the main analysis engine. It cross-references clinical, biological and imaging data to generate a differential diagnosis.",
      tip: "L'onglet Red Flags signale les situations d'urgence vitale qui nécessitent une action immédiate.",
      tipEn: "The Red Flags tab highlights life-threatening situations requiring immediate action.",
    }
  }

  // ── DEFAULT ──
  return {
    message: "Je suis votre guide PULSAR. Je vous accompagne dans le parcours clinique. Cliquez sur moi à tout moment pour comprendre où vous êtes et quoi faire ensuite.",
    messageEn: "I'm your PULSAR guide. I accompany you through the clinical pathway. Click me anytime to understand where you are and what to do next.",
    action: { label: 'File active', labelEn: 'Active caseload', href: '/patients' },
  }
}


// ── Pulsing Star SVG ──
function PulsarStar({ size = 28, bright = false }: { size?: number; bright?: boolean }) {
  const color = bright ? '#fff' : '#6C7CFF'
  const glow = bright ? 'rgba(255,255,255,0.6)' : 'rgba(108,124,255,0.6)'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.8" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer glow */}
      <circle cx="50" cy="50" r="40" fill="url(#starGlow)" opacity="0.4">
        <animate attributeName="r" values="35;45;35" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* Star shape - 4 pointed */}
      <path d={`M50 12 L56 40 L88 50 L56 60 L50 88 L44 60 L12 50 L44 40 Z`} fill={color} opacity="0.9">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </path>
      {/* Inner cross - thin rays */}
      <line x1="50" y1="5" x2="50" y2="95" stroke={color} strokeWidth="1.5" opacity="0.3">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="3s" repeatCount="indefinite" />
      </line>
      <line x1="5" y1="50" x2="95" y2="50" stroke={color} strokeWidth="1.5" opacity="0.3">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="3s" repeatCount="indefinite" />
      </line>
      {/* Center bright dot */}
      <circle cx="50" cy="50" r="4" fill="#fff" opacity="0.9">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export default function PulsarGuide() {
  const { t, lang } = useLang()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [hasSeenPage, setHasSeenPage] = useState<Set<string>>(new Set())

  // Don't show on landing/login/invite
  const hiddenPages = ['/', '/login', '/signup', '/invite']
  const isHidden = hiddenPages.some(p => pathname === p || pathname.startsWith('/invite'))

  // Auto-open on first visit to a new page
  useEffect(() => {
    if (isHidden) return
    if (!hasSeenPage.has(pathname)) {
      setOpen(true)
      setDismissed(false)
      setHasSeenPage(prev => new Set([...prev, pathname]))
      // Auto-close after 8 seconds
      const timer = setTimeout(() => setOpen(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [pathname, isHidden, hasSeenPage])

  const toggle = useCallback(() => {
    setOpen(o => !o)
    setDismissed(false)
  }, [])

  if (isHidden) return null

  const guide = getContextualGuide(pathname, lang as 'fr' | 'en')
  const isFr = lang === 'fr'
  const message = isFr ? guide.message : guide.messageEn
  const tip = isFr ? guide.tip : guide.tipEn
  const actionLabel = guide.action ? (isFr ? guide.action.label : guide.action.labelEn) : null

  return (
    <>
      {/* ── Bubble ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999,
          width: '320px', maxWidth: 'calc(100vw - 40px)',
          background: 'var(--p-bg-card, #171722)', border: '1px solid rgba(108,124,255,0.2)',
          borderRadius: '16px', padding: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 20px rgba(108,124,255,0.1)',
          animation: 'fadeInUp 0.3s ease',
        }}>
          {/* Close */}
          <button onClick={() => setOpen(false)} style={{
            position: 'absolute', top: '8px', right: '12px',
            background: 'none', border: 'none', color: 'var(--p-text-dim)',
            cursor: 'pointer', fontSize: '16px', padding: '4px',
          }}>×</button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <PulsarStar size={28} />
            </div>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '1px' }}>
              PULSAR GUIDE
            </span>
          </div>

          {/* Message */}
          <p style={{ fontSize: '13px', color: 'var(--p-text)', lineHeight: 1.7, margin: '0 0 12px' }}>
            {message}
          </p>

          {/* Tip */}
          {tip && (
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(108,124,255,0.06)', border: '1px solid rgba(108,124,255,0.1)', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: '#6C7CFF' }}>TIP —</strong> {tip}
              </p>
            </div>
          )}

          {/* Action button */}
          {guide.action && (
            <Link href={guide.action.href} onClick={() => setOpen(false)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px',
              background: '#6C7CFF', color: '#fff',
              fontSize: '12px', fontWeight: 700, textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              {actionLabel} →
            </Link>
          )}
        </div>
      )}

      {/* ── Avatar button ── */}
      <button onClick={toggle} style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
        width: '52px', height: '52px', borderRadius: '50%',
        background: open ? 'rgba(108,124,255,0.2)' : 'var(--p-bg-card, #171722)',
        border: open ? '2px solid #6C7CFF' : '2px solid rgba(108,124,255,0.25)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(108,124,255,0.15)',
        transition: 'all 0.3s',
      }}>
        <PulsarStar size={30} bright={open} />
      </button>

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
