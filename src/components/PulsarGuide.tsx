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

  // ── INTAKE: SOURCE ──
  if (pathname === '/patients/intake') {
    return {
      message: "Commencez par choisir comment renseigner le patient. Si vous avez un document d'un autre hôpital, importez-le — l'IA extraira les données automatiquement.",
      messageEn: "Start by choosing how to enter patient data. If you have a document from another hospital, import it — AI will extract the data automatically.",
      tip: "La saisie manuelle prend environ 5 minutes pour un dossier complet. Chaque étape est validée avant de passer à la suivante.",
      tipEn: "Manual entry takes about 5 minutes for a complete record. Each step is validated before moving to the next.",
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

  // ── DISCOVERY ENGINE ──
  if (pathname.startsWith('/discovery') || pathname.startsWith('/research')) {
    return {
      message: "Le Discovery Engine explore la littérature médicale et les cas similaires pour identifier des diagnostics rares que vous pourriez ne pas avoir envisagés.",
      messageEn: "The Discovery Engine explores medical literature and similar cases to identify rare diagnoses you might not have considered.",
      tip: "Il fonctionne en 4 niveaux : Pattern Mining → Literature Scan → Hypothesis → Treatment Pathfinder.",
      tipEn: "It works in 4 levels: Pattern Mining → Literature Scan → Hypothesis → Treatment Pathfinder.",
    }
  }

  // ── COCKPIT VPS ──
  if (pathname.startsWith('/cockpit')) {
    return {
      message: "Le Cockpit VPS calcule en temps réel le score de vulnérabilité du patient. C'est votre indicateur principal de gravité.",
      messageEn: "The VPS Cockpit calculates the patient's vulnerability score in real time. This is your main severity indicator.",
      tip: "Un VPS > 70 = situation critique. Le score intègre les données neuro, bio, imagerie et les antécédents.",
      tipEn: "A VPS > 70 = critical situation. The score integrates neuro, bio, imaging and history data.",
    }
  }

  // ── TREATMENT / PHARMA ──
  if (pathname.startsWith('/treatment') || pathname.startsWith('/pharma')) {
    return {
      message: "Ce module suggère des protocoles thérapeutiques adaptés au diagnostic et au profil du patient. Toutes les recommandations sont sourcées.",
      messageEn: "This module suggests treatment protocols tailored to the diagnosis and patient profile. All recommendations are sourced.",
      tip: "Les interactions médicamenteuses et contre-indications sont vérifiées automatiquement.",
      tipEn: "Drug interactions and contraindications are automatically checked.",
    }
  }

  // ── TIMELINE / SUIVI ──
  if (pathname.startsWith('/timeline') || pathname.startsWith('/suivi')) {
    return {
      message: "La Timeline retrace chronologiquement tous les événements du patient : crises, examens, traitements, évolution du VPS.",
      messageEn: "The Timeline chronologically traces all patient events: seizures, exams, treatments, VPS evolution.",
      tip: "Cliquez sur un événement pour voir le détail et l'impact sur le score VPS.",
      tipEn: "Click on an event to see the details and impact on the VPS score.",
    }
  }

  // ── ADMISSION PAGE ──
  if (pathname === '/patients/admission') {
    return {
      message: "Page d'admission rapide. Pour un parcours guidé complet avec validation par étape, utilisez plutôt la Nouvelle Admission.",
      messageEn: "Quick admission page. For a complete guided pathway with step validation, use New Admission instead.",
      action: { label: 'Admission guidée', labelEn: 'Guided admission', href: '/patients/intake' },
    }
  }

  // ── DEFAULT ──
  return {
    message: "Je suis votre assistant PULSAR. Je vous guide dans le parcours clinique. Cliquez sur moi à tout moment pour comprendre où vous êtes et quoi faire ensuite.",
    messageEn: "I'm your PULSAR assistant. I guide you through the clinical pathway. Click on me anytime to understand where you are and what to do next.",
    action: { label: 'File active', labelEn: 'Active caseload', href: '/patients' },
  }
}

// ── Workflow suggestions based on what's been done ──
function getWorkflowSuggestion(pathname: string, lang: 'fr' | 'en'): GuideStep | null {
  // After intake, suggest going to the patient
  if (pathname === '/patients') {
    return {
      message: "Sélectionnez un patient pour accéder à son dossier, ou cliquez sur Nouvelle Admission pour un nouveau cas.",
      messageEn: "Select a patient to access their record, or click New Admission for a new case.",
    }
  }
  return null
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
                <strong style={{ color: '#6C7CFF' }}>💡</strong> {tip}
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
