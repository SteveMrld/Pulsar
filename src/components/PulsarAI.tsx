'use client'
import { useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'
import { computeDiagnosticContext } from '@/lib/data/epidemioContext'
import Picto from './Picto'

interface Insight {
  icon: string
  text: string
  detail: string
  link: string
  linkLabel: string
  severity: 'critical' | 'warning' | 'info'
  color: string
}

function generateInsights(pathname: string, ps: PatientState): Insight[] {
  const insights: Insight[] = []
  const vps = ps.vpsResult?.synthesis.score ?? 0
  const tde = ps.tdeResult?.synthesis.score ?? 0
  const ewe = ps.eweResult?.synthesis.score ?? 0
  const critAlerts = ps.alerts.filter(a => a.severity === 'critical')
  const epiContext = computeDiagnosticContext('FIRES', 'Île-de-France')

  // Global insights — always relevant
  if (critAlerts.length > 0) {
    insights.push({
      icon: 'alert', text: `${critAlerts.length} alerte${critAlerts.length > 1 ? 's' : ''} critique${critAlerts.length > 1 ? 's' : ''}`,
      detail: critAlerts[0].title,
      link: '/cockpit', linkLabel: 'Cockpit Vital',
      severity: 'critical', color: '#FF4757',
    })
  }

  // Page-specific insights
  switch (pathname) {
    case '/dashboard':
      if (vps >= 60) insights.push({
        icon: 'pill', text: `VPS élevé (${vps}/100)`,
        detail: 'Vérifier les recommandations thérapeutiques adaptées au score',
        link: '/recommandations', linkLabel: 'Recommandations',
        severity: 'warning', color: '#2ED573',
      })
      break

    case '/diagnostic':
      if (epiContext.alerts.length > 0) insights.push({
        icon: 'virus', text: 'Contexte épidémio actif',
        detail: `${epiContext.alerts.length} signal(aux) épidémiologique(s) pertinent(s) pour le diagnostic`,
        link: '/observatory', linkLabel: 'Observatory',
        severity: 'warning', color: '#FFA502',
      })
      insights.push({
        icon: 'cycle', text: 'Cas similaires disponibles',
        detail: '4 cas documentés avec profil comparable — Cross-validation possible',
        link: '/case-matching', linkLabel: 'Case-Matching',
        severity: 'info', color: '#6C7CFF',
      })
      break

    case '/recommandations':
      if (tde >= 50) insights.push({
        icon: 'shield', text: 'Vérifier interactions',
        detail: `Score TDE ${tde}/100 — Pharmacovigilance recommandée avant escalade`,
        link: '/pharmacovigilance', linkLabel: 'Pharmacovigilance',
        severity: 'warning', color: '#B96BFF',
      })
      insights.push({
        icon: 'chart', text: 'Suivi post-traitement',
        detail: 'Points de contrôle J+2, J+5, J+7 disponibles',
        link: '/suivi', linkLabel: 'Suivi J+2/5/7',
        severity: 'info', color: '#2FD1C8',
      })
      break

    case '/cockpit':
      if (ewe >= 50) insights.push({
        icon: 'thermo', text: `Alerte EWE active (${ewe})`,
        detail: 'Détérioration détectée — Consulter le moteur Early Warning',
        link: '/engines?tab=ewe', linkLabel: 'EWE Engine',
        severity: 'warning', color: '#FF6B8A',
      })
      insights.push({
        icon: 'chart', text: 'Voir la timeline complète',
        detail: 'Chronologie du séjour avec événements et interventions',
        link: '/timeline', linkLabel: 'Timeline',
        severity: 'info', color: '#2FD1C8',
      })
      break

    case '/engines':
      insights.push({
        icon: 'clipboard', text: 'Synthèse multi-moteurs',
        detail: 'Vue consolidée des 5 scores avec recommandations croisées',
        link: '/synthese', linkLabel: 'Synthèse',
        severity: 'info', color: '#B96BFF',
      })
      break

    case '/pharmacovigilance':
      insights.push({
        icon: 'pill', text: 'Lignes thérapeutiques',
        detail: 'Consulter les 4 lignes de recommandation pour ajuster le traitement',
        link: '/recommandations', linkLabel: 'Recommandations',
        severity: 'info', color: '#2ED573',
      })
      break

    case '/bilan':
      insights.push({
        icon: 'dna', text: 'Lancer le scoring IA',
        detail: 'Les 26 examens du bilan alimentent le diagnostic multi-pathologique',
        link: '/diagnostic', linkLabel: 'Diagnostic IA',
        severity: 'info', color: '#6C7CFF',
      })
      break

    case '/observatory':
      insights.push({
        icon: 'dna', text: 'Impact sur le diagnostic',
        detail: 'Les signaux épidémiologiques influencent le scoring FIRES/EAIS/PIMS',
        link: '/diagnostic', linkLabel: 'Diagnostic IA',
        severity: 'info', color: '#6C7CFF',
      })
      break

    default:
      // Generic insights for other pages
      if (vps >= 70) insights.push({
        icon: 'brain', text: `VPS à ${vps} — Sévérité élevée`,
        detail: 'Le profil pronostique nécessite une attention renforcée',
        link: '/engines?tab=vps', linkLabel: 'VPS Engine',
        severity: 'warning', color: '#6C7CFF',
      })
      break
  }

  // Always suggest export if not on export page
  if (pathname !== '/export' && pathname !== '/synthese') {
    insights.push({
      icon: 'export', text: 'Exporter le dossier',
      detail: 'Générer le rapport PDF complet pour le dossier médical',
      link: '/export', linkLabel: 'Export PDF',
      severity: 'info', color: '#2FD1C8',
    })
  }

  return insights.slice(0, 4)
}

export default function PulsarAI() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  // Delay appearance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS['FIRES'].data)
    runPipeline(p)
    return p
  }, [])

  const insights = useMemo(() => generateInsights(pathname, ps), [pathname, ps])
  const critCount = insights.filter(i => i.severity === 'critical').length
  const warnCount = insights.filter(i => i.severity === 'warning').length

  if (!visible) return null

  const badgeColor = critCount > 0 ? '#FF4757' : warnCount > 0 ? '#FFA502' : '#6C7CFF'
  const totalBadge = critCount + warnCount

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
          animation: 'fadeInSlow 0.2s ease both',
        }} />
      )}

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '16px', zIndex: 999,
          width: '320px', maxWidth: 'calc(100vw - 32px)',
          maxHeight: '70vh', overflowY: 'auto',
          borderRadius: 'var(--p-radius-2xl)',
          border: '1px solid rgba(108,124,255,0.15)',
          background: 'rgba(14,14,22,0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,124,255,0.1)',
          animation: 'slideInLeft 0.25s var(--p-ease) both',
          padding: 'var(--p-space-4)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--p-space-3)', paddingBottom: 'var(--p-space-3)', borderBottom: '1px solid rgba(108,124,255,0.1)' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C7CFF, #2FD1C8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>🧠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--p-text)' }}>PulsarAI</div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Assistant contextuel</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'var(--p-text-muted)',
              cursor: 'pointer', fontSize: '16px', padding: '4px',
            }}>✕</button>
          </div>

          {/* Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {insights.map((insight, i) => (
              <Link key={i} href={insight.link} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <div className="card-interactive" style={{
                  padding: '10px 12px', borderRadius: 'var(--p-radius-lg)',
                  borderLeft: `3px solid ${insight.color}`,
                  background: insight.severity === 'critical' ? 'rgba(255,71,87,0.08)' : 'var(--p-bg-elevated)',
                  transition: 'all 150ms',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Picto name={insight.icon} size={18} glow glowColor={`${insight.color}50`} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)', marginBottom: '2px' }}>
                        {insight.text}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', lineHeight: 1.4 }}>
                        {insight.detail}
                      </div>
                      <span style={{
                        fontSize: '9px', fontWeight: 700, color: insight.color,
                        fontFamily: 'var(--p-font-mono)', marginTop: '4px', display: 'inline-block',
                      }}>
                        → {insight.linkLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 'var(--p-space-3)', paddingTop: 'var(--p-space-2)',
            borderTop: '1px solid rgba(108,124,255,0.08)',
            fontSize: '9px', color: 'var(--p-text-dim)', textAlign: 'center',
            fontFamily: 'var(--p-font-mono)',
          }}>
            PulsarAI · Aide contextuelle · Ne remplace pas le jugement clinique
          </div>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: '20px', right: '16px', zIndex: 999,
        width: '52px', height: '52px', borderRadius: '50%',
        background: open ? 'var(--p-bg-elevated)' : 'linear-gradient(135deg, #6C7CFF, #2FD1C8)',
        border: open ? '2px solid rgba(108,124,255,0.3)' : 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: open ? 'none' : '0 4px 20px rgba(108,124,255,0.4)',
        transition: 'all 200ms',
        animation: !open ? 'breathe 3s ease-in-out infinite' : 'none',
      }}>
        <span style={{ fontSize: '22px' }}>{open ? '✕' : '🧠'}</span>
        {/* Badge */}
        {!open && totalBadge > 0 && (
          <div style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 800, color: '#fff',
            boxShadow: `0 0 8px ${badgeColor}80`,
          }}>
            {totalBadge}
          </div>
        )}
      </button>
    </>
  )
}
