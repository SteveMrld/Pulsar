'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'

const LAB_COLOR = '#0EA5E9'
const LAB_GLOW = '0 0 30px rgba(14,165,233,0.15)'

type LabSession = {
  sessionId: string
  startedAt: string
  completedAt: string | null
  durationMs: number
  summary: { patientsAnalyzed: number; hypothesesTotal: number; crossReferencesTotal: number; pubmedArticlesFound: number; insightsTotal: number }
  patients: { name: string; syndrome: string; questionsGenerated: number; hypothesesGenerated: number }[]
  hypotheses: { id: string; title: string; description: string; confidence: number; evidenceFor: string[]; evidenceAgainst: string[]; status: string; implications: string }[]
  crossReferences: { factorA: string; factorB: string; relationship: string; strength: string; source: string; implication: string }[]
  pubmedFindings: { pmid: string; title: string; authors: string; journal: string; date: string; searchTerm: string }[]
  insights: string[]
}

function Pulse({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span style={{ display: 'inline-block', position: 'relative', width: size, height: size }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'labPulse 2s infinite' }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
    </span>
  )
}

function HypothesisCard({ h }: { h: LabSession['hypotheses'][0] }) {
  const [open, setOpen] = useState(false)
  const confColor = h.confidence >= 60 ? '#10B981' : h.confidence >= 40 ? '#F59E0B' : '#6C7CFF'
  return (
    <div style={{ background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${confColor}15`, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{h.title}</div>
          <div style={{ fontSize: 10, color: 'var(--p-text-muted)', marginTop: 2 }}>{h.status === 'investigating' ? 'En investigation' : h.status === 'supported' ? 'Supportée' : 'Générée'}</div>
        </div>
        <div style={{ textAlign: 'right', marginLeft: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: confColor, fontFamily: 'var(--p-font-mono)' }}>{h.confidence}%</div>
          <div style={{ fontSize: 8, color: confColor }}>confiance</div>
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid var(--p-border)` }}>
          <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.6, marginTop: 8 }}>{h.description}</div>
          {h.evidenceFor.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>
                <Picto name="shield" size={10} /> Preuves POUR ({h.evidenceFor.length})
              </div>
              {h.evidenceFor.map((e, i) => (
                <div key={i} style={{ fontSize: 9, color: 'var(--p-text-muted)', paddingLeft: 10, borderLeft: '2px solid #10B98120', marginBottom: 2 }}>{e}</div>
              ))}
            </div>
          )}
          {h.evidenceAgainst.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>
                <Picto name="alert" size={10} /> Preuves CONTRE ({h.evidenceAgainst.length})
              </div>
              {h.evidenceAgainst.map((e, i) => (
                <div key={i} style={{ fontSize: 9, color: 'var(--p-text-muted)', paddingLeft: 10, borderLeft: '2px solid #EF444420', marginBottom: 2 }}>{e}</div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10, padding: '8px 10px', background: `${LAB_COLOR}06`, borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${LAB_COLOR}40` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: LAB_COLOR }}>Implications si confirmée</div>
            <div style={{ fontSize: 10, color: 'var(--p-text)', lineHeight: 1.5, marginTop: 2 }}>{h.implications}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LabPage() {
  const { t } = useLang()
  const [session, setSession] = useState<LabSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [runningPhase, setRunningPhase] = useState('')
  const [tab, setTab] = useState<'hypotheses' | 'crossref' | 'pubmed' | 'insights'>('hypotheses')

  const runLab = useCallback(async () => {
    setLoading(true)
    setRunningPhase('Initialisation des moteurs...')
    
    const phases = [
      'Chargement de la cohorte (9 patients)...',
      'Analyse des profils de vulnérabilité...',
      'Génération des questions de recherche...',
      'Croisement des facteurs inter-patients...',
      'Interrogation PubMed (9 requêtes)...',
      'Formulation des hypothèses...',
      'Évaluation des niveaux de confiance...',
      'Compilation des insights...',
    ]
    
    let phaseIdx = 0
    const phaseInterval = setInterval(() => {
      if (phaseIdx < phases.length) {
        setRunningPhase(phases[phaseIdx])
        phaseIdx++
      }
    }, 1500)

    try {
      const res = await fetch('/api/research-lab?manual=true')
      if (res.ok) {
        const data = await res.json()
        setSession(data)
      }
    } catch { /* noop */ }
    
    clearInterval(phaseInterval)
    setRunningPhase('')
    setLoading(false)
  }, [])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      <style>{`
        @keyframes labPulse { 0%{transform:scale(1);opacity:0.7} 50%{transform:scale(2.5);opacity:0} 100%{transform:scale(1);opacity:0} }
        @keyframes labScan { 0%{left:0} 100%{left:100%} }
        @keyframes labFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .lab-card { animation: labFadeIn 0.5s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--p-space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${LAB_COLOR}12`, border: `2px solid ${LAB_COLOR}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: LAB_GLOW }}>
            <Picto name="microscope" size={22} glow />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Research Lab</h1>
            <div style={{ fontSize: 'var(--p-text-sm)', color: LAB_COLOR, fontFamily: 'var(--p-font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pulse color={LAB_COLOR} />
              {t('Le laboratoire qui ne dort jamais', 'The lab that never sleeps')}
            </div>
          </div>
        </div>
        <button onClick={runLab} disabled={loading}
          style={{ padding: '10px 24px', borderRadius: 'var(--p-radius-lg)', background: loading ? '#1F2A40' : LAB_COLOR, color: '#fff', border: 'none', fontWeight: 700, fontSize: 'var(--p-text-sm)', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: loading ? 'none' : LAB_GLOW }}>
          <Picto name="play" size={14} />
          {loading ? t('En cours...', 'Running...') : t('Lancer le Lab', 'Run Lab')}
        </button>
      </div>

      {/* Running animation */}
      {loading && (
        <div style={{ marginBottom: 'var(--p-space-6)', padding: '16px 20px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${LAB_COLOR}15` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Pulse color={LAB_COLOR} size={10} />
            <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: LAB_COLOR }}>{t('Recherche en cours', 'Research in progress')}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--p-text-muted)', fontFamily: 'var(--p-font-mono)' }}>{runningPhase}</div>
          <div style={{ marginTop: 10, height: 3, background: 'var(--p-bg-surface)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', height: '100%', width: '30%', background: `linear-gradient(90deg, transparent, ${LAB_COLOR}, transparent)`, animation: 'labScan 1.5s infinite linear' }} />
          </div>
        </div>
      )}

      {/* Session results */}
      {session && !loading && (
        <>
          {/* Summary badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--p-space-6)', flexWrap: 'wrap' }}>
            {[
              { icon: 'heart', label: t('Patients', 'Patients'), value: session.summary.patientsAnalyzed, color: '#8B5CF6' },
              { icon: 'brain', label: t('Hypothèses', 'Hypotheses'), value: session.summary.hypothesesTotal, color: LAB_COLOR },
              { icon: 'dna', label: t('Croisements', 'Cross-refs'), value: session.summary.crossReferencesTotal, color: '#EC4899' },
              { icon: 'books', label: 'PubMed', value: session.summary.pubmedArticlesFound, color: '#3B82F6' },
              { icon: 'shield', label: 'Insights', value: session.summary.insightsTotal, color: '#10B981' },
            ].map((b, i) => (
              <div key={i} className="lab-card" style={{ animationDelay: `${i * 100}ms`, flex: '1 1 100px', padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-lg)', border: `1px solid ${b.color}12`, textAlign: 'center' }}>
                <Picto name={b.icon} size={16} glow />
                <div style={{ fontSize: 22, fontWeight: 900, color: b.color, fontFamily: 'var(--p-font-mono)', margin: '4px 0' }}>{b.value}</div>
                <div style={{ fontSize: 9, color: 'var(--p-text-dim)' }}>{b.label}</div>
              </div>
            ))}
          </div>

          {/* Session info */}
          <div style={{ fontSize: 9, color: 'var(--p-text-dim)', marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>Session : {session.sessionId}</span>
            <span>{new Date(session.startedAt).toLocaleString('fr-FR')}</span>
            <span>{session.durationMs}ms</span>
          </div>

          {/* Tab selector */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--p-space-4)', borderBottom: '1px solid var(--p-border)', paddingBottom: 8 }}>
            {[
              { id: 'hypotheses' as const, label: t('Hypothèses', 'Hypotheses'), icon: 'brain', count: session.hypotheses.length },
              { id: 'crossref' as const, label: t('Croisements', 'Cross-refs'), icon: 'dna', count: session.crossReferences.length },
              { id: 'pubmed' as const, label: 'PubMed', icon: 'books', count: session.pubmedFindings.length },
              { id: 'insights' as const, label: 'Insights', icon: 'shield', count: session.insights.length },
            ].map(t2 => (
              <button key={t2.id} onClick={() => setTab(t2.id)}
                style={{ padding: '6px 14px', borderRadius: 'var(--p-radius-md)', background: tab === t2.id ? `${LAB_COLOR}12` : 'transparent', border: `1px solid ${tab === t2.id ? LAB_COLOR + '25' : 'transparent'}`, color: tab === t2.id ? 'var(--p-text)' : 'var(--p-text-dim)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Picto name={t2.icon} size={12} />
                {t2.label}
                <span style={{ fontSize: 9, fontFamily: 'var(--p-font-mono)', color: LAB_COLOR, background: `${LAB_COLOR}10`, padding: '0 5px', borderRadius: 4 }}>{t2.count}</span>
              </button>
            ))}
          </div>

          {/* Hypotheses tab */}
          {tab === 'hypotheses' && (
            <div>
              {session.hypotheses.map((h, i) => <HypothesisCard key={i} h={h} />)}
            </div>
          )}

          {/* Cross-references tab */}
          {tab === 'crossref' && (
            <div>
              {session.crossReferences.map((cr, i) => (
                <div key={i} className="lab-card" style={{ animationDelay: `${i * 80}ms`, padding: '12px 16px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', marginBottom: 6, borderLeft: `3px solid ${cr.strength === 'strong' ? '#10B981' : cr.strength === 'moderate' ? '#F59E0B' : '#6C7CFF'}30` }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#EC4899', background: '#EC489910', padding: '2px 8px', borderRadius: 4 }}>{cr.factorA}</span>
                    <span style={{ fontSize: 10, color: 'var(--p-text-dim)' }}>×</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: LAB_COLOR, background: `${LAB_COLOR}10`, padding: '2px 8px', borderRadius: 4 }}>{cr.factorB}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 8, fontWeight: 700, color: cr.strength === 'strong' ? '#10B981' : cr.strength === 'moderate' ? '#F59E0B' : '#6C7CFF', fontFamily: 'var(--p-font-mono)' }}>{cr.strength.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--p-text-muted)', lineHeight: 1.5 }}>{cr.relationship}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 8 }}>
                    <span style={{ color: 'var(--p-text-dim)' }}>{cr.source}</span>
                    <span style={{ color: LAB_COLOR, fontStyle: 'italic' }}>{cr.implication}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PubMed tab */}
          {tab === 'pubmed' && (
            <div>
              {session.pubmedFindings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--p-space-8)', color: 'var(--p-text-dim)' }}>
                  {t('Aucun article trouvé dans cette session', 'No articles found in this session')}
                </div>
              ) : session.pubmedFindings.map((f, i) => (
                <div key={i} className="lab-card" style={{ animationDelay: `${i * 60}ms`, padding: '10px 14px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: '2px solid #3B82F620', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)', lineHeight: 1.4 }}>{f.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9 }}>
                    <span style={{ color: 'var(--p-text-muted)' }}>{f.authors} · {f.journal} · {f.date}</span>
                    <span style={{ color: '#3B82F6', fontFamily: 'var(--p-font-mono)' }}>PMID:{f.pmid}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insights tab */}
          {tab === 'insights' && (
            <div>
              {session.insights.map((insight, i) => (
                <div key={i} className="lab-card" style={{ animationDelay: `${i * 100}ms`, padding: '12px 16px', background: 'var(--p-bg-card)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${LAB_COLOR}30`, marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Picto name="shield" size={14} glow />
                    <div style={{ fontSize: 11, color: 'var(--p-text)', lineHeight: 1.6 }}>{insight}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!session && !loading && (
        <div style={{ textAlign: 'center', padding: 'var(--p-space-10)' }}>
          <Picto name="microscope" size={48} glow />
          <h2 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginTop: 16 }}>
            {t('Le laboratoire est prêt', 'The lab is ready')}
          </h2>
          <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', maxWidth: 400, margin: '8px auto 0', lineHeight: 1.6 }}>
            {t(
              'Cliquez "Lancer le Lab" pour croiser les données de 9 patients avec la littérature mondiale. Le Lab formule des hypothèses, cherche dans PubMed, et identifie des pistes que personne ne cherche.',
              'Click "Run Lab" to cross-reference 9 patients with global literature. The Lab formulates hypotheses, searches PubMed, and identifies leads no one is looking for.'
            )}
          </p>
          <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 'var(--p-space-4)', fontFamily: 'var(--p-font-mono)' }}>
            CRON : {t('chaque dimanche 3h00', 'every Sunday 3:00 AM')} · ~5 centimes/session
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'var(--p-space-8)', padding: 12, background: 'var(--p-bg-surface)', borderRadius: 'var(--p-radius-md)', borderLeft: `3px solid ${LAB_COLOR}30` }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: LAB_COLOR, fontWeight: 700 }}>RESEARCH LAB ENGINE v1.0</div>
        <div style={{ fontSize: 10, color: 'var(--p-text-dim)', marginTop: 2 }}>
          {t(
            '12ème moteur · 312 lignes · 9 questions auto-générées · 3 hypothèses · 6 cross-références · PubMed live · CRON hebdomadaire',
            '12th engine · 312 lines · 9 auto-generated questions · 3 hypotheses · 6 cross-references · PubMed live · Weekly CRON'
          )}
        </div>
      </div>
    </div>
  )
}
