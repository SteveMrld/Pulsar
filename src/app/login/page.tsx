'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LanguageContext'
import { validateInvite, setInviteCookie } from '@/lib/invites'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [demoSlide, setDemoSlide] = useState(0)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/patients')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--p-space-3) var(--p-space-4)',
    background: 'var(--p-input-bg)',
    border: 'var(--p-border)',
    borderRadius: 'var(--p-radius-md)',
    color: 'var(--p-text)',
    fontSize: 'var(--p-text-base)',
    outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--p-bg)',
      padding: 'var(--p-space-4)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--p-bg-card)',
        border: 'var(--p-border)',
        borderRadius: 'var(--p-radius-xl)',
        padding: 'var(--p-space-10)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 'var(--p-text-2xl)', fontWeight: 800,
              color: 'var(--p-vps)', letterSpacing: '0.1em',
            }}>
              PULSAR
            </span>
          </Link>
          <p style={{
            color: 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)',
            marginTop: 'var(--p-space-2)',
          }}>
            {t('Connexion à votre espace', 'Sign in to your workspace')}
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="medecin@hopital.fr"
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', display: 'block', marginBottom: 'var(--p-space-2)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--p-critical-bg)',
              color: 'var(--p-critical)',
              padding: 'var(--p-space-3)',
              borderRadius: 'var(--p-radius-md)',
              fontSize: 'var(--p-text-sm)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 'var(--p-space-3)',
              borderRadius: 'var(--p-radius-md)',
              background: loading ? 'var(--p-gray-2)' : 'var(--p-vps)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 'var(--p-text-base)',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 'var(--p-space-2)',
            }}
          >
            {loading ? t('Connexion...', 'Signing in...') : t('Se connecter', 'Sign in')}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--p-space-6)',
          fontSize: 'var(--p-text-sm)',
          color: 'var(--p-text-dim)',
        }}>
          {t('Accès sur invitation uniquement', 'Invite-only access')}
        </p>

        <div style={{ marginTop: 'var(--p-space-4)', paddingTop: 'var(--p-space-4)', borderTop: 'var(--p-border)' }}>
          {/* Invite code */}
          <div style={{ marginBottom: 'var(--p-space-3)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder={t('Code d\'invitation', 'Invite code')}
                style={{ ...inputStyle, flex: 1, fontSize: '13px', fontFamily: 'var(--p-font-mono, monospace)', letterSpacing: '0.5px' }}
              />
              <button
                onClick={() => {
                  const invite = validateInvite(inviteCode)
                  if (invite) {
                    setInviteCookie(invite.code, invite.name)
                    router.push('/patients')
                  } else {
                    setError(t('Code d\'invitation invalide', 'Invalid invite code'))
                  }
                }}
                disabled={!inviteCode}
                style={{
                  padding: '0 16px', borderRadius: 'var(--p-radius-md)',
                  background: inviteCode ? '#6C7CFF' : 'var(--p-gray-2)',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
                  cursor: inviteCode ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                }}
              >
                {t('Entrer', 'Enter')}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowDemo(true)}
            style={{
              width: '100%',
              padding: 'var(--p-space-3)',
              borderRadius: 'var(--p-radius-md)',
              background: 'transparent',
              color: 'var(--p-tde)',
              border: '1px solid var(--p-tde)',
              fontWeight: 600,
              fontSize: 'var(--p-text-sm)',
              cursor: 'pointer',
            }}
          >
            {t('Découvrir PULSAR — Démo', 'Discover PULSAR — Demo')}
          </button>
        </div>

        {/* ═══════ DEMO OVERLAY ═══════ */}
        {showDemo && <DemoOverlay t={t} slide={demoSlide} setSlide={setDemoSlide} onClose={() => { setShowDemo(false); setDemoSlide(0) }} />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// DEMO OVERLAY — Interactive walkthrough of PULSAR
// Shows key screens without entering the app
// ═══════════════════════════════════════════════════════════

const DEMO_SLIDES = [
  {
    titleFr: 'Cockpit temps réel', titleEn: 'Real-time Cockpit',
    descFr: 'Vue unifiée de l\'état du patient. Score VPS en temps réel (0-100), constantes vitales, crises, biomarqueurs. Tout sur un seul écran.',
    descEn: 'Unified patient status view. Real-time VPS score (0-100), vitals, seizures, biomarkers. Everything on one screen.',
    color: '#6C7CFF',
    mockup: 'cockpit',
  },
  {
    titleFr: 'PULSAR Oracle — Simulation clinique', titleEn: 'PULSAR Oracle — Clinical Simulation',
    descFr: 'Simulez le futur du patient. Comparez 3-4 scénarios thérapeutiques à H+6, H+12, H+24, H+72. Voyez les courbes VPS diverger selon les décisions.',
    descEn: 'Simulate the patient\'s future. Compare 3-4 therapeutic scenarios at H+6, H+12, H+24, H+72. Watch VPS curves diverge based on decisions.',
    color: '#E879F9',
    mockup: 'oracle',
  },
  {
    titleFr: 'Alerte retard diagnostique', titleEn: 'Diagnostic Delay Alert',
    descFr: 'Le système détecte quand vous êtes en retard. "64% des cas similaires reçoivent une immunothérapie avant 48h." Le garde-fou contre l\'inertie clinique.',
    descEn: 'The system detects when you\'re falling behind. "64% of similar cases receive immunotherapy within 48h." The safeguard against clinical inertia.',
    color: '#DC2626',
    mockup: 'ddd',
  },
  {
    titleFr: 'Discovery Engine — 4 niveaux', titleEn: 'Discovery Engine — 4 levels',
    descFr: 'PatternMiner → LiteratureScanner → HypothesisEngine → TreatmentPathfinder. PubMed et ClinicalTrials.gov en temps réel. Chaque patient génère des hypothèses de recherche.',
    descEn: 'PatternMiner → LiteratureScanner → HypothesisEngine → TreatmentPathfinder. PubMed & ClinicalTrials.gov in real time. Each patient generates research hypotheses.',
    color: '#10B981',
    mockup: 'discovery',
  },
  {
    titleFr: 'PULSAR Consult — Brief expert', titleEn: 'PULSAR Consult — Expert brief',
    descFr: 'En 10 secondes, un dossier complet pour l\'expert. Timeline, biomarqueurs, traitements, analyse des 10 moteurs, et questions auto-générées. Prêt à envoyer.',
    descEn: 'In 10 seconds, a complete expert brief. Timeline, biomarkers, treatments, 10-engine analysis, and auto-generated questions. Ready to send.',
    color: '#3B82F6',
    mockup: 'consult',
  },
]

function MockupCockpit() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: '#6C7CFF12', border: '1px solid #6C7CFF25', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#6C7CFF', fontFamily: 'var(--p-font-mono)', fontWeight: 700 }}>VPS SCORE</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#EF4444', fontFamily: 'var(--p-font-mono)' }}>78</div>
          <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700 }}>CRITIQUE</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[{ l: 'GCS', v: '7/15', c: '#EF4444' }, { l: 'Crises/24h', v: '12', c: '#F59E0B' }, { l: 'CRP', v: '145 mg/L', c: '#EF4444' }, { l: 'Ferritine', v: '2400', c: '#EF4444' }].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: `${r.c}08`, borderRadius: 6, border: `1px solid ${r.c}15` }}>
              <span style={{ fontSize: 9, color: '#9CA3AF' }}>{r.l}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: r.c, fontFamily: 'var(--p-font-mono)' }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['VPS', 'TDE', 'PVE', 'EWE', 'TPE', 'DISC'].map((e, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px 0', background: i < 5 ? '#6C7CFF10' : '#10B98110', borderRadius: 6, fontSize: 8, fontWeight: 700, color: i < 5 ? '#6C7CFF' : '#10B981', fontFamily: 'var(--p-font-mono)' }}>{e}</div>
        ))}
      </div>
    </div>
  )
}

function MockupOracle() {
  const bars = [
    { label: 'T0', a: 78, b: 78, c: 78, no: 78 },
    { label: 'H+6', a: 74, b: 70, c: 68, no: 82 },
    { label: 'H+24', a: 62, b: 52, c: 45, no: 85 },
    { label: 'H+72', a: 52, b: 38, c: 32, no: 88 },
  ]
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[{ l: 'Standard', c: '#6C7CFF' }, { l: 'Immunothérapie', c: '#8B5CF6' }, { l: 'Expérimental', c: '#F5A623' }, { l: 'Sans intervention', c: '#EF4444' }].map((s, i) => (
          <span key={i} style={{ fontSize: 8, padding: '2px 8px', borderRadius: 99, background: `${s.c}15`, color: s.c, fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{s.l}</span>
        ))}
      </div>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ width: 30, fontSize: 8, color: '#6B7280', fontFamily: 'var(--p-font-mono)', textAlign: 'right' }}>{b.label}</span>
          <div style={{ flex: 1, position: 'relative', height: 16, background: '#1A2035', borderRadius: 8 }}>
            <div style={{ position: 'absolute', height: '100%', width: `${b.no}%`, background: '#EF444430', borderRadius: 8 }} />
            <div style={{ position: 'absolute', height: '100%', width: `${b.a}%`, background: '#6C7CFF40', borderRadius: 8 }} />
            <div style={{ position: 'absolute', height: '100%', width: `${b.c}%`, background: '#F5A62350', borderRadius: 8 }} />
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 9, color: '#F5A623', fontWeight: 700 }}>Recommandation : Protocole expérimental — VPS 32 à H+72</div>
    </div>
  )
}

function MockupDDD() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ background: '#DC262615', border: '1px solid #DC262630', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', marginBottom: 4 }}>🚨 RETARD DIAGNOSTIQUE CRITIQUE</div>
        <div style={{ fontSize: 9, color: '#F0F2F5', lineHeight: 1.6 }}>
          Le profil clinique présente 6 signaux compatibles avec une encéphalite auto-immune ou FIRES. 
          Dans 64% des cas similaires, une immunothérapie est initiée avant 48h.
          Le délai actuel (J4) dépasse significativement la fenêtre optimale.
        </div>
      </div>
      {[{ a: 'Immunothérapie 1ère ligne', d: '+48h retard', c: '#DC2626' }, { a: 'Panel anticorps', d: '+24h retard', c: '#F59E0B' }, { a: 'Anakinra (anti-IL-1)', d: 'Fenêtre en cours', c: '#F59E0B' }].map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: `${r.c}08`, borderRadius: 6, borderLeft: `3px solid ${r.c}` }}>
          <span style={{ fontSize: 9, color: '#E8EAF0', fontWeight: 600 }}>{r.a}</span>
          <span style={{ fontSize: 9, color: r.c, fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{r.d}</span>
        </div>
      ))}
    </div>
  )
}

function MockupDiscovery() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { n: 'N1', l: 'PatternMiner', c: '#10B981', d: '3 corrélations significatives détectées (Pearson > 0.7)' },
        { n: 'N2', l: 'LiteratureScanner', c: '#3B82F6', d: '7 articles PubMed pertinents · 2 essais NCT actifs' },
        { n: 'N3', l: 'HypothesisEngine', c: '#8B5CF6', d: '2 hypothèses générées — "IL-1β/Ferritine pathway in FIRES"' },
        { n: 'N4', l: 'TreatmentPathfinder', c: '#EC4899', d: 'Anakinra éligible · Ketogenic diet recommandé · Tocilizumab à évaluer' },
      ].map((lv, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: `${lv.c}08`, borderRadius: 8, borderLeft: `3px solid ${lv.c}` }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: lv.c, fontFamily: 'var(--p-font-mono)', minWidth: 22 }}>{lv.n}</span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#E8EAF0' }}>{lv.l}</div>
            <div style={{ fontSize: 8, color: '#9CA3AF', marginTop: 2 }}>{lv.d}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MockupConsult() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 8, fontFamily: 'var(--p-font-mono)', color: '#3B82F6', letterSpacing: 1, fontWeight: 700 }}>PULSAR CONSULT — BRIEF EXPERT</div>
      {['Résumé clinique', 'Chronologie J0→J4', 'Examen neurologique', 'Biomarqueurs clés', 'Traitements en cours', 'Analyse PULSAR (10 moteurs)', '⚠️ Alerte retard diagnostique'].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: i === 6 ? '#DC262610' : '#1A2035', borderRadius: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: i === 6 ? '#DC2626' : '#3B82F6' }} />
          <span style={{ fontSize: 8.5, color: i === 6 ? '#DC2626' : '#9CA3AF', fontWeight: i === 6 ? 700 : 400 }}>{s}</span>
        </div>
      ))}
      <div style={{ marginTop: 4, padding: '8px 10px', background: '#3B82F610', borderRadius: 8, borderLeft: '3px solid #3B82F6' }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: '#3B82F6', marginBottom: 4 }}>QUESTIONS AUTO-GÉNÉRÉES</div>
        <div style={{ fontSize: 8, color: '#E8EAF0', lineHeight: 1.5 }}>
          1. [URGENT] Faut-il initier une immunothérapie en urgence ?<br/>
          2. [URGENT] Anakinra justifié dans ce contexte FIRES ?<br/>
          3. [24H] Transfert centre de référence nécessaire ?
        </div>
      </div>
    </div>
  )
}

function DemoOverlay({ t, slide, setSlide, onClose }: { t: (fr: string, en: string) => string; slide: number; setSlide: (n: number) => void; onClose: () => void }) {
  const s = DEMO_SLIDES[slide]
  const total = DEMO_SLIDES.length
  const Mockups = [MockupCockpit, MockupOracle, MockupDDD, MockupDiscovery, MockupConsult]
  const MockupComponent = Mockups[slide]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ maxWidth: 480, width: '100%', background: '#0C1424', borderRadius: 16, border: `1px solid ${s.color}30`, overflow: 'hidden', boxShadow: `0 0 40px ${s.color}15` }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${s.color}15`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 8, fontFamily: 'var(--p-font-mono)', color: s.color, letterSpacing: 1.5, fontWeight: 700 }}>PULSAR DEMO — {slide + 1}/{total}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#F0F2F5', marginTop: 4 }}>{t(s.titleFr, s.titleEn)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Mockup */}
        <div style={{ background: '#111827', minHeight: 180 }}>
          <MockupComponent />
        </div>

        {/* Description */}
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${s.color}10` }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.7, margin: 0 }}>{t(s.descFr, s.descEn)}</p>
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setSlide(Math.max(0, slide - 1))}
            disabled={slide === 0}
            style={{ padding: '6px 16px', borderRadius: 8, background: slide > 0 ? '#1A2035' : 'transparent', color: slide > 0 ? '#E8EAF0' : '#3A3A50', border: 'none', fontSize: 11, fontWeight: 600, cursor: slide > 0 ? 'pointer' : 'default' }}
          >
            ← {t('Précédent', 'Previous')}
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {DEMO_SLIDES.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 16 : 6, height: 6, borderRadius: 3, background: i === slide ? s.color : '#3A3A50', cursor: 'pointer', transition: 'all 0.3s ease' }} />
            ))}
          </div>

          {slide < total - 1 ? (
            <button
              onClick={() => setSlide(slide + 1)}
              style={{ padding: '6px 16px', borderRadius: 8, background: s.color, color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              {t('Suivant', 'Next')} →
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{ padding: '6px 16px', borderRadius: 8, background: '#F5A623', color: '#000', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              {t('Fermer', 'Close')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
