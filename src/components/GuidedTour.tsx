'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'

// ══════════════════════════════════════════════════════════════
// PULSAR GUIDED TOUR v2.0
// Style: Linear × Vercel × Loom
// Sidebar 10 chapitres · Narration bas · Navigation clavier
// ══════════════════════════════════════════════════════════════

interface TourStep {
  id: string
  chapter: number
  route: string
  color: string
  icon: string
  title: string
  eyebrow: string
  narrative: string
  detail: string
  cta: string
  ctaRoute?: string
  titleEn: string
  eyebrowEn: string
  narrativeEn: string
  detailEn: string
  ctaEn: string
}

const STEPS: TourStep[] = [
  {
    id: 'dashboard', chapter: 1, route: '/dashboard', color: '#6C7CFF', icon: '◈',
    title: 'Dashboard chef de service',
    eyebrow: "Vue d'ensemble · Temps réel",
    narrative: "Le tableau de bord centralise l'état de l'unité en un coup d'œil — patients actifs, alertes critiques, scores VPS, moteurs en cours d'exécution.",
    detail: "Depuis ici, le chef de service voit en temps réel la criticité de chaque dossier sans ouvrir un seul fichier.",
    cta: 'Ouvrir le dossier Inès →', ctaRoute: '/patient/ines/cockpit',
    titleEn: 'Service dashboard', eyebrowEn: 'Overview · Real time',
    narrativeEn: "The dashboard centralizes the unit's status at a glance — active patients, critical alerts, VPS scores, running engines.",
    detailEn: "From here, the department head sees the criticality of every case in real time without opening a single file.",
    ctaEn: 'Open Inès patient file →',
  },
  {
    id: 'cockpit', chapter: 2, route: '/patient/ines/cockpit', color: '#EF4444', icon: '⬡',
    title: 'Cockpit patient — Inès, 4 ans',
    eyebrow: 'VPS 95 · FIRES suspecté · Critique',
    narrative: "Le Cockpit est la première page ouverte à l'admission. VPS 95 — situation P1 immédiate. 12 moteurs ont analysé les données en parallèle avant l'arrivée du médecin.",
    detail: "Le score VPS en rouge vif recalcule en temps réel à chaque nouvelle constante ou biomarqueur saisi.",
    cta: "Voir les alertes d'urgence →", ctaRoute: '/patient/ines/urgence',
    titleEn: 'Patient cockpit — Inès, 4 years old', eyebrowEn: 'VPS 95 · Suspected FIRES · Critical',
    narrativeEn: "The Cockpit is the first page opened at admission. VPS 95 — immediate P1 situation. 12 engines analyzed the data in parallel before the physician arrived.",
    detailEn: "The bright red VPS score recalculates in real time with every new vital sign or biomarker entered.",
    ctaEn: 'View emergency alerts →',
  },
  {
    id: 'urgence', chapter: 3, route: '/patient/ines/urgence', color: '#F59E0B', icon: '⚡',
    title: 'Mode Urgence — 14 alertes actives',
    eyebrow: 'CAE · Cascade Alert Engine',
    narrative: "2 Cascade Alert Events détectés avant qu'ils ne surviennent. MEOPA + midazolam → dépression respiratoire estimée dans 18 minutes. PULSAR intervient avant la dégradation.",
    detail: "Rouge = urgence vitale immédiate. Orange = attention dans l'heure. Chaque alerte est sourcée et traçable pour l'audit.",
    cta: 'Voir le diagnostic →', ctaRoute: '/patient/ines/diagnostic',
    titleEn: 'Emergency mode — 14 active alerts', eyebrowEn: 'CAE · Cascade Alert Engine',
    narrativeEn: "2 Cascade Alert Events detected before they occur. MEOPA + midazolam → estimated respiratory depression in 18 minutes. PULSAR intervenes before deterioration.",
    detailEn: "Red = immediate life-threatening. Orange = attention within the hour. Every alert is sourced and traceable for audit.",
    ctaEn: 'View diagnosis →',
  },
  {
    id: 'diagnostic', chapter: 4, route: '/patient/ines/diagnostic', color: '#8B5CF6', icon: '◉',
    title: 'Diagnostic différentiel — TDE',
    eyebrow: 'FIRES 87% · 34 paramètres croisés',
    narrative: "Le Therapeutic Decision Engine croise 34 paramètres cliniques, biologiques et EEG. FIRES : 87%. Anti-NMDAR : 11%. 4 délais diagnostiques évitables identifiés.",
    detail: "Chaque hypothèse est sourcée. Cliquez sur une référence pour accéder à la publication PubMed originale.",
    cta: 'Voir le protocole de traitement →', ctaRoute: '/patient/ines/traitement',
    titleEn: 'Differential diagnosis — TDE', eyebrowEn: 'FIRES 87% · 34 parameters cross-referenced',
    narrativeEn: "The TDE engine cross-references 34 clinical, biological and EEG parameters. FIRES: 87%. Anti-NMDAR: 11%. 4 avoidable diagnostic delays identified.",
    detailEn: "Every hypothesis is sourced. Click a reference to access the original PubMed publication.",
    ctaEn: 'View treatment protocol →',
  },
  {
    id: 'traitement', chapter: 5, route: '/patient/ines/traitement', color: '#10B981', icon: '◎',
    title: 'Protocoles thérapeutiques',
    eyebrow: 'Anakinra · Score 94 · Éligibilité validée',
    narrative: "Anakinra recommandé. Score d'éligibilité 94/100 basé sur le profil inflammatoire d'Inès. Interactions médicamenteuses vérifiées. Posologie calculée. Traçable.",
    detail: "TPE compare 5 options — anakinra, tocilizumab, kétogène, rituximab, combo — selon les comorbidités, le poids et les contre-indications.",
    cta: 'Voir la simulation ORACLE →', ctaRoute: '/patient/ines/oracle',
    titleEn: 'Treatment protocols', eyebrowEn: 'Anakinra · Score 94 · Eligibility validated',
    narrativeEn: "Anakinra recommended. Eligibility score 94/100 based on Inès's inflammatory profile. Drug interactions checked. Dosage calculated. Fully traceable.",
    detailEn: "TPE compares 5 options — anakinra, tocilizumab, ketogenic, rituximab, combo — based on comorbidities, weight and contraindications.",
    ctaEn: 'View ORACLE simulation →',
  },
  {
    id: 'oracle', chapter: 6, route: '/patient/ines/oracle', color: '#E879F9', icon: '◌',
    title: 'ORACLE — Simulation de trajectoires',
    eyebrow: '5 scénarios · Probabiliste · J+7 / J+30',
    narrative: "ORACLE projette 5 trajectoires selon chaque décision thérapeutique. Le médecin voit l'impact de chaque choix avant de le faire — récupération neurologique, risque de séquelles, mortalité.",
    detail: "Simulation probabiliste calibrée sur 100+ publications FIRES/NORSE. Pas de la prédiction — de la modélisation.",
    cta: 'Voir le suivi EEG →', ctaRoute: '/patient/ines/suivi',
    titleEn: 'ORACLE — Trajectory simulation', eyebrowEn: '5 scenarios · Probabilistic · D+7 / D+30',
    narrativeEn: "ORACLE projects 5 trajectories based on each therapeutic decision. The physician sees the impact of each choice before making it — neurological recovery, sequelae risk, mortality.",
    detailEn: "Probabilistic simulation calibrated on 100+ FIRES/NORSE publications. Not prediction — modeling.",
    ctaEn: 'View EEG monitoring →',
  },
  {
    id: 'suivi', chapter: 7, route: '/patient/ines/suivi', color: '#2FD1C8', icon: '◫',
    title: 'Suivi & Monitoring temps réel',
    eyebrow: 'EEG · Vitaux · Biomarqueurs · EWE',
    narrative: "Surveillance continue des 5 constantes vitales, du tracé EEG et des biomarqueurs inflammatoires. Le moteur EWE détecte les tendances avant le basculement clinique.",
    detail: "Chaque dérive par rapport à la baseline d'admission déclenche une alerte graduée. La dégradation silencieuse n'existe plus.",
    cta: 'Voir le brief de consultation →', ctaRoute: '/patient/ines/consult',
    titleEn: 'Real-time monitoring', eyebrowEn: 'EEG · Vitals · Biomarkers · EWE',
    narrativeEn: "Continuous monitoring of 5 vital signs, EEG trace and inflammatory biomarkers. The EWE engine detects trends before the clinical tipping point.",
    detailEn: "Every deviation from admission baseline triggers a graduated alert. Silent deterioration no longer exists.",
    ctaEn: 'View consultation brief →',
  },
  {
    id: 'consult', chapter: 8, route: '/patient/ines/consult', color: '#F59E0B', icon: '◧',
    title: 'PULSAR Consult — Brief en 10 secondes',
    eyebrow: 'Export · FR/EN · PDF · JSON · BibTeX',
    narrative: "Un brief expert généré en 10 secondes : diagnostic principal, score de sévérité, recommandations thérapeutiques, fenêtre d'intervention. Prêt pour le staff ou le transfert.",
    detail: "4 formats : brief narratif FR/EN, JSON structuré, PDF, BibTeX. Chaque export est horodaté et signé pour la traçabilité médico-légale.",
    cta: 'Voir Discovery Engine →', ctaRoute: '/research',
    titleEn: 'PULSAR Consult — Brief in 10 seconds', eyebrowEn: 'Export · FR/EN · PDF · JSON · BibTeX',
    narrativeEn: "An expert brief generated in 10 seconds: primary diagnosis, severity score, therapeutic recommendations, intervention window. Ready for staff meeting or transfer.",
    detailEn: "4 formats: FR/EN narrative brief, structured JSON, PDF, BibTeX. Every export is timestamped and signed for medico-legal traceability.",
    ctaEn: 'View Discovery Engine →',
  },
  {
    id: 'research', chapter: 9, route: '/research', color: '#10B981', icon: '◈',
    title: 'Discovery Engine — La recherche vivante',
    eyebrow: 'PubMed live · ClinicalTrials · IA',
    narrative: "Chaque patient alimente la recherche. Le cas d'Inès génère 3 hypothèses validables. L1 PatternMiner détecte une corrélation gut-brain-FIRES que la littérature n'a pas encore formalisée.",
    detail: "4 niveaux en cascade : PatternMiner → LiteratureScanner (25 publications) → HypothesisEngine (Claude API) → TreatmentPathfinder.",
    cta: 'Voir le cas fondateur →', ctaRoute: '/usecase/alejandro',
    titleEn: 'Discovery Engine — Living research', eyebrowEn: 'Live PubMed · ClinicalTrials · AI',
    narrativeEn: "Every patient feeds research. Inès's case generates 3 validatable hypotheses. L1 PatternMiner detects a gut-brain-FIRES correlation not yet formalized in literature.",
    detailEn: "4 cascading levels: PatternMiner → LiteratureScanner (25 publications) → HypothesisEngine (Claude API) → TreatmentPathfinder.",
    ctaEn: 'View the founding case →',
  },
  {
    id: 'alejandro', chapter: 10, route: '/usecase/alejandro', color: '#F5A623', icon: '✦',
    title: 'Le cas fondateur — Alejandro R.',
    eyebrow: '2019–2025 · In memoriam',
    narrative: "Alejandro R., 2019–2025. C'est pour lui que PULSAR existe. 15 jours où tout s'est joué. Cette page retrace heure par heure ce que PULSAR aurait vu — et ce qui aurait pu changer.",
    detail: "Le diagnostic de FIRES est posé 12 jours après les premiers symptômes. PULSAR l'aurait identifié à J+2. Cette différence, c'est l'histoire de PULSAR.",
    cta: '✓ Fin de la démo',
    titleEn: 'The founding case — Alejandro R.', eyebrowEn: '2019–2025 · In memoriam',
    narrativeEn: "Alejandro R., 2019–2025. PULSAR exists because of him. 15 days when everything was at stake. This page traces hour by hour what PULSAR would have seen — and what might have changed.",
    detailEn: "The FIRES diagnosis was made 12 days after the first symptoms. PULSAR would have identified it at D+2. That difference is the story of PULSAR.",
    ctaEn: '✓ End of demo',
  },
]

const KEY_ACTIVE = 'pulsar-tour-active'
const KEY_STEP   = 'pulsar-tour-step'

if (typeof window !== 'undefined') {
  ;(window as any).__startPulsarTour = () => {
    sessionStorage.setItem(KEY_ACTIVE, '1')
    sessionStorage.setItem(KEY_STEP, '0')
    window.location.href = '/dashboard'
  }
}

export function startTour() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(KEY_ACTIVE, '1')
    sessionStorage.setItem(KEY_STEP, '0')
    window.location.href = '/dashboard'
  }
}

export default function GuidedTour() {
  const router   = useRouter()
  const pathname = usePathname()
  const { lang } = useLang()
  const fr = lang === 'fr'

  const [active,    setActive]    = useState(false)
  const [stepIdx,   setStepIdx]   = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [animKey,   setAnimKey]   = useState(0)

  useEffect(() => {
    const on    = sessionStorage.getItem(KEY_ACTIVE) === '1'
    const saved = parseInt(sessionStorage.getItem(KEY_STEP) || '0', 10)
    if (!on) return
    // Ne pas afficher le tour sur la landing
    if (pathname === '/') return
    setActive(true)
    const match = STEPS.findIndex(s =>
      s.route !== '/dashboard'
        ? pathname.startsWith(s.route)
        : pathname === '/dashboard'
    )
    const idx = match >= 0 ? match : saved
    setStepIdx(idx)
    sessionStorage.setItem(KEY_STEP, String(idx))
  }, [pathname])

  const goTo = useCallback((idx: number) => {
    setStepIdx(idx)
    setAnimKey((k: number) => k + 1)
    sessionStorage.setItem(KEY_STEP, String(idx))
    router.push(STEPS[idx].route)
  }, [router])

  const handleNext = useCallback(() => {
    if (stepIdx < STEPS.length - 1) goTo(stepIdx + 1)
    else handleExit()
  }, [stepIdx, goTo]) // eslint-disable-line

  const handlePrev = useCallback(() => {
    if (stepIdx > 0) goTo(stepIdx - 1)
  }, [stepIdx, goTo])

  const handleCta = useCallback(() => {
    if (stepIdx < STEPS.length - 1) goTo(stepIdx + 1)
    else handleExit()
  }, [stepIdx, goTo]) // eslint-disable-line

  const handleExit = useCallback(() => {
    sessionStorage.removeItem(KEY_ACTIVE)
    sessionStorage.removeItem(KEY_STEP)
    setActive(false)
  }, [])

  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleExit(); return }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); handleNext() }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); handlePrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, handleNext, handlePrev, handleExit])

  if (!active) return null

  const step      = STEPS[stepIdx]
  const title     = fr ? step.title     : step.titleEn
  const eyebrow   = fr ? step.eyebrow   : step.eyebrowEn
  const narrative = fr ? step.narrative : step.narrativeEn
  const detail    = fr ? step.detail    : step.detailEn
  const cta       = fr ? step.cta       : step.ctaEn
  const isLast    = stepIdx === STEPS.length - 1
  const pct       = ((stepIdx + 1) / STEPS.length) * 100

  const sidebarW = collapsed ? 52 : 240

  return (
    <>
      <style>{CSS}</style>

      {/* ───── SIDEBAR ───── */}
      <aside className={`pt-sidebar${collapsed ? ' pt-sidebar--collapsed' : ''}`}>

        <div className="pt-sidebar-head">
          <div className="pt-sidebar-brand">
            <span className="pt-sidebar-logo" style={{ color: step.color }}>◈</span>
            {!collapsed && <span className="pt-sidebar-name">PULSAR DEMO</span>}
          </div>
          <button className="pt-sidebar-toggle" onClick={() => setCollapsed((c: boolean) => !c)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {!collapsed && (
          <div className="pt-sidebar-progress">
            <div className="pt-sidebar-pbar-bg">
              <div className="pt-sidebar-pbar-fill" style={{ width: `${pct}%`, background: step.color }} />
            </div>
            <span className="pt-sidebar-plabel">{stepIdx + 1}/{STEPS.length}</span>
          </div>
        )}

        <nav className="pt-sidebar-nav">
          {STEPS.map((s, i) => {
            const done    = i < stepIdx
            const current = i === stepIdx
            return (
              <button
                key={s.id}
                className={`pt-chapter${current ? ' pt-chapter--active' : ''}${done ? ' pt-chapter--done' : ''}`}
                style={{ '--cc': s.color } as any}
                onClick={() => goTo(i)}
                title={fr ? s.title : s.titleEn}
              >
                <span className="pt-chapter-num">
                  {done ? '✓' : String(i + 1).padStart(2, '0')}
                </span>
                {!collapsed && (
                  <span className="pt-chapter-label">{fr ? s.title : s.titleEn}</span>
                )}
                {current && <span className="pt-chapter-dot" style={{ background: s.color }} />}
              </button>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="pt-sidebar-footer">
            <button className="pt-exit-btn" onClick={handleExit}>
              ✕ {fr ? 'Quitter la démo' : 'Exit demo'}
            </button>
            <div className="pt-kbd-hint">
              <kbd>←</kbd><kbd>→</kbd> {fr ? 'naviguer' : 'navigate'} &nbsp;
              <kbd>Esc</kbd> {fr ? 'quitter' : 'quit'}
            </div>
          </div>
        )}
      </aside>

      {/* ───── BOTTOM PANEL ───── */}
      <div
        className="pt-panel"
        style={{
          left: `calc(${sidebarW}px + 16px)`,
          borderColor: `${step.color}28`,
        }}
      >
        <div className="pt-panel-stripe" style={{ width: `${pct}%`, background: step.color }} />

        <div className="pt-panel-inner" key={animKey}>
          {/* LEFT */}
          <div className="pt-panel-text">
            <div className="pt-panel-eyebrow" style={{ color: step.color }}>
              <span>{step.icon}</span>
              <span>{fr ? `Chapitre ${step.chapter}` : `Chapter ${step.chapter}`}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>{eyebrow}</span>
            </div>
            <h3 className="pt-panel-title">{title}</h3>
            <p className="pt-panel-narrative">{narrative}</p>
            <p className="pt-panel-detail">{detail}</p>
          </div>

          {/* RIGHT */}
          <div className="pt-panel-actions">
            <button className="pt-close" onClick={handleExit}>✕</button>

            <div className="pt-nav-dots">
              {STEPS.map((s, i) => (
                <button
                  key={i}
                  className={`pt-dot${i === stepIdx ? ' pt-dot--active' : i < stepIdx ? ' pt-dot--done' : ''}`}
                  style={i === stepIdx ? { background: step.color, width: 20 }
                       : i < stepIdx  ? { background: `${step.color}55` }
                       : {}}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            <div className="pt-nav-btns">
              {stepIdx > 0 && (
                <button className="pt-btn-prev" onClick={handlePrev}>
                  ← {fr ? 'Préc.' : 'Prev'}
                </button>
              )}
              <button
                className="pt-btn-cta"
                style={{ background: step.color, boxShadow: `0 4px 16px ${step.color}45` }}
                onClick={handleCta}
              >
                {isLast ? (fr ? '✓ Terminer' : '✓ Finish') : cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════
const CSS = `
.pt-sidebar {
  position: fixed; left:0; top:0; bottom:0; width:240px; z-index:9990;
  background:#070B18; border-right:1px solid rgba(108,124,255,0.1);
  display:flex; flex-direction:column;
  transition:width 0.25s cubic-bezier(.22,1,.36,1);
  box-shadow:4px 0 32px rgba(0,0,0,0.55);
  overflow:hidden;
}
.pt-sidebar--collapsed { width:52px; }

.pt-sidebar-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 12px 12px; border-bottom:1px solid rgba(255,255,255,0.04);
  flex-shrink:0;
}
.pt-sidebar-brand { display:flex; align-items:center; gap:8px; overflow:hidden; min-width:0; }
.pt-sidebar-logo { font-size:16px; flex-shrink:0; transition:color 0.3s; }
.pt-sidebar-name {
  font-family:var(--p-font-mono); font-size:9px; font-weight:800;
  letter-spacing:0.18em; color:rgba(255,255,255,0.4); white-space:nowrap;
}
.pt-sidebar-toggle {
  background:none; border:1px solid rgba(255,255,255,0.07); border-radius:4px;
  color:rgba(255,255,255,0.25); cursor:pointer; font-size:14px; line-height:1;
  width:22px; height:22px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
  transition:all 0.15s;
}
.pt-sidebar-toggle:hover { color:#fff; border-color:rgba(255,255,255,0.18); }

.pt-sidebar-progress {
  padding:10px 14px; display:flex; align-items:center; gap:8px; flex-shrink:0;
}
.pt-sidebar-pbar-bg { flex:1; height:2px; background:rgba(255,255,255,0.06); border-radius:1px; }
.pt-sidebar-pbar-fill { height:100%; border-radius:1px; transition:width 0.4s ease, background 0.3s; }
.pt-sidebar-plabel {
  font-family:var(--p-font-mono); font-size:9px; color:rgba(255,255,255,0.2); white-space:nowrap;
}

.pt-sidebar-nav { flex:1; overflow-y:auto; overflow-x:hidden; padding:6px 0; scrollbar-width:none; }
.pt-sidebar-nav::-webkit-scrollbar { display:none; }

.pt-chapter {
  width:100%; display:flex; align-items:center; gap:10px;
  padding:8px 14px; background:none; border:none; cursor:pointer;
  text-align:left; transition:background 0.15s; position:relative; overflow:hidden;
}
.pt-chapter:hover { background:rgba(255,255,255,0.025); }
.pt-chapter--active {
  background:rgba(108,124,255,0.05);
}
.pt-chapter--active::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
  background:var(--cc);
}
.pt-chapter-num {
  font-family:var(--p-font-mono); font-size:9px; font-weight:700;
  color:rgba(255,255,255,0.18); min-width:22px; transition:color 0.15s; flex-shrink:0;
}
.pt-chapter--active .pt-chapter-num { color:var(--cc); }
.pt-chapter--done .pt-chapter-num { color:rgba(16,185,129,0.6); }

.pt-chapter-label {
  font-size:10.5px; font-weight:500; color:rgba(255,255,255,0.28); line-height:1.3;
  flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  transition:color 0.15s;
}
.pt-chapter--active .pt-chapter-label { color:rgba(255,255,255,0.88); font-weight:600; }
.pt-chapter--done .pt-chapter-label { color:rgba(255,255,255,0.35); }

.pt-chapter-dot {
  width:5px; height:5px; border-radius:50%; flex-shrink:0;
  animation:ptPulse 2s ease-in-out infinite;
}
@keyframes ptPulse {
  0%,100%{ opacity:1; transform:scale(1); }
  50%{ opacity:0.35; transform:scale(0.65); }
}

.pt-sidebar-footer { padding:12px 14px; border-top:1px solid rgba(255,255,255,0.04); flex-shrink:0; }
.pt-exit-btn {
  width:100%; padding:7px 12px; background:none;
  border:1px solid rgba(255,255,255,0.07); border-radius:7px;
  color:rgba(255,255,255,0.28); font-size:11px; font-family:var(--p-font-mono);
  cursor:pointer; transition:all 0.15s; margin-bottom:8px;
}
.pt-exit-btn:hover { border-color:rgba(239,68,68,0.4); color:rgba(239,68,68,0.65); }
.pt-kbd-hint { font-family:var(--p-font-mono); font-size:9px; color:rgba(255,255,255,0.13); text-align:center; }
.pt-kbd-hint kbd {
  background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09);
  border-radius:3px; padding:1px 4px; font-size:9px;
}

/* ── PANEL ── */
.pt-panel {
  position:fixed; bottom:18px; right:18px; z-index:9991;
  background:#080C1B; border:1px solid rgba(108,124,255,0.2);
  border-radius:14px; overflow:hidden;
  box-shadow:0 20px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(108,124,255,0.04);
  transition:left 0.25s cubic-bezier(.22,1,.36,1);
  animation:ptPanelIn 0.35s cubic-bezier(.22,1,.36,1) both;
  max-width:860px;
}
@keyframes ptPanelIn {
  from { opacity:0; transform:translateY(18px) scale(0.97); }
  to   { opacity:1; transform:none; }
}

.pt-panel-stripe { height:2px; transition:width 0.4s ease, background 0.3s; }

.pt-panel-inner {
  display:flex; align-items:flex-start; gap:20px; padding:16px 18px 14px;
  animation:ptSlide 0.28s cubic-bezier(.22,1,.36,1) both;
}
@keyframes ptSlide {
  from { opacity:0; transform:translateX(-6px); }
  to   { opacity:1; transform:none; }
}

.pt-panel-text { flex:1; min-width:0; }

.pt-panel-eyebrow {
  display:flex; align-items:center; gap:6px; margin-bottom:6px;
  font-family:var(--p-font-mono); font-size:9px; font-weight:700;
  letter-spacing:0.12em; text-transform:uppercase;
}

.pt-panel-title {
  font-size:14px; font-weight:800; color:#fff; margin:0 0 7px; line-height:1.25;
}

.pt-panel-narrative {
  font-size:12px; color:rgba(255,255,255,0.62); line-height:1.65; margin:0 0 5px;
}

.pt-panel-detail {
  font-size:10.5px; color:rgba(255,255,255,0.3); line-height:1.6;
  margin:0; font-family:var(--p-font-mono);
}

.pt-panel-actions {
  display:flex; flex-direction:column; align-items:flex-end;
  gap:9px; flex-shrink:0; width:190px; position:relative;
}

.pt-close {
  position:absolute; top:0; right:0; background:none; border:none;
  color:rgba(255,255,255,0.18); font-size:12px; cursor:pointer;
  padding:2px 4px; transition:color 0.15s; line-height:1;
}
.pt-close:hover { color:rgba(255,255,255,0.55); }

.pt-nav-dots { display:flex; align-items:center; gap:4px; flex-wrap:wrap; max-width:170px; }
.pt-dot {
  height:5px; width:5px; border-radius:3px; background:rgba(255,255,255,0.09);
  border:none; cursor:pointer; padding:0; transition:all 0.2s;
}
.pt-dot--active { width:20px; }
.pt-dot--done { }
.pt-dot:hover { background:rgba(255,255,255,0.22); }

.pt-nav-btns { display:flex; gap:7px; align-items:center; width:100%; justify-content:flex-end; }

.pt-btn-prev {
  padding:8px 12px; background:none; border:1px solid rgba(255,255,255,0.09);
  border-radius:8px; color:rgba(255,255,255,0.38); font-size:11px;
  font-family:var(--p-font-mono); cursor:pointer; white-space:nowrap; transition:all 0.15s;
  flex-shrink:0;
}
.pt-btn-prev:hover { border-color:rgba(255,255,255,0.22); color:rgba(255,255,255,0.65); }

.pt-btn-cta {
  flex:1; padding:9px 14px; border:none; border-radius:9px; color:#fff;
  font-size:11px; font-weight:700; font-family:var(--p-font-mono);
  cursor:pointer; white-space:nowrap; transition:all 0.2s; text-align:center;
}
.pt-btn-cta:hover { transform:translateY(-1px); filter:brightness(1.1); }
.pt-btn-cta:active { transform:none; }

@media (max-width:640px) {
  .pt-sidebar { display:none; }
  .pt-panel { left:10px !important; right:10px; bottom:10px; }
  .pt-panel-inner { flex-direction:column; gap:10px; }
  .pt-panel-actions { align-items:flex-start; width:100%; }
  .pt-nav-btns { width:100%; }
  .pt-btn-cta { flex:1; }
  .pt-nav-dots { max-width:100%; }
}
`
