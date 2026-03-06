'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/contexts/LanguageContext'
import { validateInvite, setInviteCookie } from '@/lib/invites'
import Link from 'next/link'
import Picto from '@/components/Picto'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const AlejandroCasePage = dynamic(() => import('@/app/usecase/alejandro/page'), { ssr: false })

export default function LoginPage() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [showCase, setShowCase] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('demo=1')) setShowDemo(true)
      if (window.location.search.includes('case=alejandro')) setShowCase(true)
    }
  }, [])

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
        {showDemo && <DemoOverlay t={t} onClose={() => setShowDemo(false)} />}
        {showCase && <CaseOverlay t={t} onClose={() => setShowCase(false)} />}
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
// DEMO IMMERSIVE — Simulation interactive PULSAR
// L'utilisateur vit l'expérience comme s'il était dans l'app
// Curseur animé, saisie de données, pipeline en temps réel
// ═══════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════
// DEMO IMMERSIVE V2 — Tour guidé pédagogique
// Sidebar réelle + curseur + bulles explicatives
// ═══════════════════════════════════════════════════════════

const DEMO_V2_CSS = `
  .dv2-root { position:fixed; inset:0; z-index:999; background:#0C1424; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
  .dv2-sidebar { position:absolute; left:0; top:0; bottom:0; width:180px; background:#0A0E1A; border-right:1px solid #1F2A40; display:flex; flex-direction:column; padding:10px 0; overflow-y:auto; z-index:2; }
  .dv2-logo { padding:10px 14px 16px; display:flex; align-items:center; gap:8px; border-bottom:1px solid #1F2A40; margin-bottom:8px; }
  .dv2-tab { display:flex; align-items:center; gap:8px; padding:8px 14px; cursor:default; transition:all 0.4s ease; border-left:3px solid transparent; font-size:11px; color:#6B7280; }
  .dv2-tab.active { background:rgba(108,124,255,0.06); border-left-color:var(--tc, #6C7CFF); color:#F0F2F5; }
  .dv2-tab.highlight { background:rgba(245,166,35,0.08); border-left-color:#F5A623; }
  .dv2-content { position:absolute; left:180px; top:0; bottom:0; right:0; overflow-y:auto; padding:20px; }
  .dv2-cursor { position:absolute; z-index:50; pointer-events:none; transition: left 0.9s cubic-bezier(0.25,0.1,0.25,1), top 0.9s cubic-bezier(0.25,0.1,0.25,1); }
  .dv2-cursor-ring { width:22px; height:22px; border-radius:50%; border:2px solid #F5A623; background:rgba(245,166,35,0.12); }
  .dv2-cursor.click .dv2-cursor-ring { animation: dv2click 0.4s ease; }
  .dv2-bubble { position:absolute; z-index:60; pointer-events:none; background:rgba(12,20,36,0.95); backdrop-filter:blur(12px); border:1px solid #6C7CFF25; border-radius:10px; padding:10px 14px; max-width:280px; animation:dv2fadein 0.5s ease; }
  .dv2-bubble-title { font-size:11px; font-weight:800; color:#6C7CFF; margin-bottom:4px; }
  .dv2-bubble-text { font-size:10px; color:#E8EAF0; line-height:1.5; }
  .dv2-progress { position:absolute; bottom:0; left:180px; right:0; height:3px; background:#0A0E1A; z-index:10; }
  .dv2-progress-bar { height:100%; background:linear-gradient(90deg, #6C7CFF, #2FD1C8); transition: width 0.5s ease; }
  .dv2-close { position:absolute; top:10px; right:14px; z-index:101; background:none; border:1px solid rgba(255,255,255,0.12); color:#6B7280; font-size:10px; padding:4px 12px; border-radius:14px; cursor:pointer; }
  .dv2-close:hover { color:#fff; }
  @keyframes dv2click { 0%{transform:scale(1);box-shadow:0 0 0 0 rgba(245,166,35,0.4)} 100%{transform:scale(1.8);box-shadow:0 0 0 8px rgba(245,166,35,0)} }
  @keyframes dv2fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
`

const SIDEBAR_TABS = [
  { id: 'cockpit', label: 'Cockpit', icon: 'heart', color: '#8B5CF6' },
  { id: 'urgence', label: 'Urgence', icon: 'alert', color: '#A78BFA' },
  { id: 'diagnostic', label: 'Diagnostic', icon: 'brain', color: '#6C7CFF' },
  { id: 'traitement', label: 'Traitement', icon: 'pill', color: '#2FD1C8' },
  { id: 'cascade', label: 'Cascade', icon: 'shield', color: '#FF6B35' },
  { id: 'ddd', label: 'Retard', icon: 'alert', color: '#DC2626' },
  { id: 'oracle', label: 'Oracle', icon: 'chart', color: '#E879F9' },
  { id: 'discovery', label: 'Discovery', icon: 'microscope', color: '#10B981' },
  { id: 'consult', label: 'Consult', icon: 'clipboard', color: '#3B82F6' },
  { id: 'rapport', label: 'Rapport', icon: 'export', color: '#F5A623' },
]

interface DemoStep {
  tabId: string
  duration: number
  bubbleFr: string
  bubbleEn: string
  titleFr: string
  titleEn: string
  cursorTarget: 'sidebar' | 'content'
  contentX?: number // %
  contentY?: number // %
}

const DEMO_STEPS: DemoStep[] = [
  { tabId: 'cockpit', duration: 5000,
    titleFr: 'Cockpit patient', titleEn: 'Patient Cockpit',
    bubbleFr: 'Le cockpit affiche en temps réel le score VPS, les constantes vitales, les alertes critiques et les 8 moteurs IA. Un seul écran pour tout voir.',
    bubbleEn: 'The cockpit displays real-time VPS score, vital signs, critical alerts and all 8 AI engines. One screen to see everything.',
    cursorTarget: 'sidebar' },
  { tabId: 'diagnostic', duration: 5000,
    titleFr: 'Diagnostic IA', titleEn: 'AI Diagnosis',
    bubbleFr: 'PULSAR analyse le profil clinique et calcule un score FIRES composite de 0 à 13. Il détecte automatiquement les patterns FIRES, anti-NMDAR, PIMS et MOGAD.',
    bubbleEn: 'PULSAR analyzes the clinical profile and calculates a FIRES composite score from 0 to 13. It automatically detects FIRES, anti-NMDAR, PIMS and MOGAD patterns.',
    cursorTarget: 'sidebar' },
  { tabId: 'traitement', duration: 5000,
    titleFr: 'Traitement + Vérification médicaments', titleEn: 'Treatment + Drug Safety Check',
    bubbleFr: 'Le TDE recommande l\'escalade thérapeutique en 4 lignes. Le Drug Safety Checker interroge OpenFDA en temps réel — tapez un médicament et PULSAR dit immédiatement s\'il est cardiotoxique ou neurotoxique.',
    bubbleEn: 'The TDE recommends 4-line therapeutic escalation. The Drug Safety Checker queries OpenFDA in real-time — type a drug and PULSAR immediately says if it\'s cardiotoxic or neurotoxic.',
    cursorTarget: 'sidebar' },
  { tabId: 'cascade', duration: 6000,
    titleFr: 'Cascade Alert Engine', titleEn: 'Cascade Alert Engine',
    bubbleFr: 'Le moteur né du cas Alejandro. Tapez "MEOPA" : PULSAR croise avec le profil du patient et la littérature mondiale. Si un effet en chaîne est possible, il dit STOP avant l\'administration.',
    bubbleEn: 'The engine born from Alejandro\'s case. Type "MEOPA": PULSAR cross-references the patient profile with global literature. If a chain effect is possible, it says STOP before administration.',
    cursorTarget: 'content', contentX: 55, contentY: 35 },
  { tabId: 'ddd', duration: 5000,
    titleFr: 'Détection de retards', titleEn: 'Delay Detection',
    bubbleFr: 'Le DDD compare le parcours réel au parcours optimal. "Immunothérapie non initiée à H+48 — 64% des cas favorables reçoivent les IVIG < 48h." Chaque heure perdue est comptée.',
    bubbleEn: 'The DDD compares the actual care path to the optimal one. "Immunotherapy not started at H+48 — 64% of favorable cases receive IVIG < 48h." Every lost hour is counted.',
    cursorTarget: 'sidebar' },
  { tabId: 'oracle', duration: 5000,
    titleFr: 'Oracle — Simulation', titleEn: 'Oracle — Simulation',
    bubbleFr: 'L\'Oracle simule 4 scénarios à H+72. "Avec anakinra + régime cétogène : VPS projeté 32. Sans action : VPS 95." Le médecin voit l\'impact de chaque choix.',
    bubbleEn: 'Oracle simulates 4 scenarios at H+72. "With anakinra + ketogenic diet: projected VPS 32. Without action: VPS 95." The doctor sees the impact of each choice.',
    cursorTarget: 'sidebar' },
  { tabId: 'discovery', duration: 5000,
    titleFr: 'Discovery Engine', titleEn: 'Discovery Engine',
    bubbleFr: '4 niveaux : corrélations statistiques, PubMed en temps réel, hypothèses IA, essais cliniques ClinicalTrials.gov. Tout personnalisé pour CE patient.',
    bubbleEn: '4 levels: statistical correlations, real-time PubMed, AI hypotheses, ClinicalTrials.gov clinical trials. All personalized for THIS patient.',
    cursorTarget: 'sidebar' },
  { tabId: 'consult', duration: 5000,
    titleFr: 'Brief expert en 10 secondes', titleEn: 'Expert brief in 10 seconds',
    bubbleFr: 'Un clic : le brief complet pour le spécialiste. 8 sections, questions auto-générées avec niveau d\'urgence, FR ou EN. Prêt à copier et envoyer.',
    bubbleEn: 'One click: the complete brief for the specialist. 8 sections, auto-generated questions with urgency level, FR or EN. Ready to copy and send.',
    cursorTarget: 'sidebar' },
  { tabId: 'rapport', duration: 5000,
    titleFr: 'Rapport PULSAR', titleEn: 'PULSAR Report',
    bubbleFr: '11 moteurs. 9 000+ lignes de logique clinique. 70+ publications sourées. Et un principe : la décision finale reste TOUJOURS dans la main du médecin.',
    bubbleEn: '11 engines. 9,000+ lines of clinical logic. 70+ sourced publications. And one principle: the final decision ALWAYS remains in the doctor\'s hands.',
    cursorTarget: 'sidebar' },
]

function DemoContent({ step }: { step: DemoStep }) {
  if (step.tabId === 'cockpit') return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <div style={{ flex:'0 0 80px', background:'#EF444412', borderRadius:10, padding:10, textAlign:'center' }}>
          <div style={{ fontSize:8, color:'#EF4444', fontFamily:'monospace', fontWeight:700 }}>VPS</div>
          <div style={{ fontSize:28, fontWeight:900, color:'#EF4444', fontFamily:'monospace' }}>88</div>
          <div style={{ fontSize:7, color:'#EF4444' }}>CRITIQUE</div>
        </div>
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {[{ l:'GCS', v:'8/15', c:'#EF4444' }, { l:'Crises/24h', v:'6', c:'#EF4444' }, { l:'FC', v:'158', c:'#F59E0B' }, { l:'SpO2', v:'93%', c:'#F59E0B' }, { l:'T°', v:'39.8°C', c:'#EF4444' }, { l:'CRP', v:'95', c:'#EF4444' }].map((v,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'3px 8px', background:'#111827', borderRadius:4, borderLeft:`2px solid ${v.c}15` }}>
              <span style={{ fontSize:8, color:'#6B7280' }}>{v.l}</span>
              <span style={{ fontSize:9, fontWeight:700, color:v.c, fontFamily:'monospace' }}>{v.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'6px 10px', background:'#FF6B3508', borderRadius:6, border:'1px solid #FF6B3520', fontSize:9, color:'#FF6B35', fontWeight:700, marginBottom:8 }}>
        <Picto name="alert" size={10} /> CASCADE ALERT — MEOPA × Prodrome FIRES
      </div>
      <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
        {['VPS 88','TDE','PVE','EWE','TPE','NCE','DDD !','CAE !'].map((e,i) => {
          const cols = ['#EF4444','#2FD1C8','#B96BFF','#A78BFA','#FFB347','#2ED573','#DC2626','#FF6B35']
          return <span key={i} style={{ padding:'2px 6px', borderRadius:4, background:`${cols[i]}12`, fontSize:7, fontWeight:800, color:cols[i], fontFamily:'monospace' }}>{e}</span>
        })}
      </div>
    </div>
  )
  if (step.tabId === 'cascade') return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:8 }}>
        <div style={{ flex:1, padding:'4px 8px', background:'#111827', borderRadius:6, border:'1px solid #6C7CFF20' }}>
          <span style={{ fontSize:10, color:'#F0F2F5' }}>MEOPA</span>
        </div>
        <div style={{ padding:'4px 12px', borderRadius:6, background:'#FF6B35', color:'#fff', fontSize:9, fontWeight:700 }}>Analyser</div>
      </div>
      <div style={{ padding:'10px', background:'#EF444408', borderRadius:8, border:'1px solid #EF444418', marginBottom:6 }}>
        <div style={{ fontSize:9, fontWeight:800, color:'#EF4444', marginBottom:4 }}><Picto name="warning" size={10} /> CASCADE CRITIQUE : MEOPA × Prodrome FIRES</div>
        {['Infection fébrile → neuroinflammation latente','MEOPA → hypoxie cérébrale transitoire','Seuil convulsif abaissé → 1ère crise','Cascade auto-entretenue → FIRES'].map((s,i) => (
          <div key={i} style={{ display:'flex', gap:6, marginBottom:2, alignItems:'center' }}>
            <span style={{ fontSize:7, fontWeight:900, color:'#EF4444', fontFamily:'monospace', minWidth:12 }}>{i+1}</span>
            <span style={{ fontSize:8, color:'#E8EAF0' }}>{s}</span>
          </div>
        ))}
        <div style={{ marginTop:4, fontSize:8, color:'#FF6B35' }}>→ Alternative : Emla + Paracétamol</div>
      </div>
    </div>
  )
  if (step.tabId === 'oracle') return (
    <div>
      {[{ l:'Standard', v:62, c:'#6C7CFF' }, { l:'Anakinra + KD', v:32, c:'#10B981' }, { l:'Expérimental', v:28, c:'#F5A623' }, { l:'Sans action', v:95, c:'#EF4444' }].map((s,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <span style={{ width:70, fontSize:8, color:'#6B7280', textAlign:'right' }}>{s.l}</span>
          <div style={{ flex:1, height:16, background:'#111827', borderRadius:8, overflow:'hidden', position:'relative' }}>
            <div style={{ height:'100%', width:`${s.v}%`, background:`${s.c}25`, borderRadius:8, transition:'width 1s ease' }} />
            <span style={{ position:'absolute', right:6, top:2, fontSize:8, fontWeight:700, color:s.c, fontFamily:'monospace' }}>{s.v}</span>
          </div>
        </div>
      ))}
      <div style={{ textAlign:'center', padding:'4px 8px', background:'#10B98108', borderRadius:6, fontSize:8, fontWeight:700, color:'#10B981' }}>Recommandation : Anakinra + KD → VPS 32 à H+72</div>
    </div>
  )
  // Generic content for other tabs
  return (
    <div style={{ padding:8, textAlign:'center', color:'#6B7280', fontSize:10 }}>
      <Picto name={SIDEBAR_TABS.find(t => t.id === step.tabId)?.icon || 'brain'} size={32} glow />
      <div style={{ marginTop:8, fontSize:12, fontWeight:700, color:'#F0F2F5' }}>{step.titleFr}</div>
    </div>
  )
}

function DemoOverlay({ t, onClose }: { t: (fr: string, en: string) => string; onClose: () => void }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [clicking, setClicking] = useState(false)
  const isFr = true // simplified

  const step = DEMO_STEPS[stepIdx]
  const tabIndex = SIDEBAR_TABS.findIndex(tab => tab.id === step.tabId)

  // Auto-advance
  useEffect(() => {
    if (stepIdx >= DEMO_STEPS.length) return
    const timer = setTimeout(() => {
      if (stepIdx < DEMO_STEPS.length - 1) setStepIdx(s => s + 1)
      else onClose()
    }, step.duration)
    return () => clearTimeout(timer)
  }, [stepIdx, step, onClose])

  // Click animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setClicking(true)
      setTimeout(() => setClicking(false), 400)
    }, 600)
    return () => clearTimeout(timer)
  }, [stepIdx])

  // Cursor position
  const cursorLeft = step.cursorTarget === 'sidebar' ? 100 : 180 + ((step.contentX || 50) / 100) * (typeof window !== 'undefined' ? window.innerWidth - 180 : 600)
  const cursorTop = step.cursorTarget === 'sidebar' ? 60 + tabIndex * 36 : ((step.contentY || 40) / 100) * (typeof window !== 'undefined' ? window.innerHeight : 600)

  // Bubble position
  const bubbleLeft = step.cursorTarget === 'sidebar' ? 190 : Math.min(cursorLeft + 30, (typeof window !== 'undefined' ? window.innerWidth - 300 : 400))
  const bubbleTop = Math.max(40, cursorTop - 20)

  return (
    <>
      <style>{DEMO_V2_CSS}</style>
      <div className="dv2-root">
        {/* Sidebar — real PULSAR tabs */}
        <div className="dv2-sidebar">
          <div className="dv2-logo">
            <div style={{ width:8, height:8, borderRadius:4, background:'#6C7CFF' }} />
            <span style={{ fontSize:11, fontWeight:800, color:'#6C7CFF', letterSpacing:1 }}>PULSAR</span>
          </div>
          <div style={{ fontSize:8, color:'#6B7280', padding:'0 14px 8px', borderBottom:'1px solid #1F2A40', marginBottom:4 }}>Léa M. · 7 ans · FIRES</div>
          {SIDEBAR_TABS.map((tab, i) => (
            <div key={tab.id} className={`dv2-tab ${tab.id === step.tabId ? 'active' : ''}`} style={{ '--tc': tab.color } as any}>
              <Picto name={tab.icon} size={13} glow={tab.id === step.tabId} />
              <span>{tab.label}</span>
              {(tab.id === 'ddd' || tab.id === 'cascade') && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:3, background:'#EF4444' }} />}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="dv2-content" key={stepIdx}>
          <div style={{ fontSize:9, fontFamily:'monospace', color:SIDEBAR_TABS.find(t => t.id === step.tabId)?.color || '#6C7CFF', letterSpacing:1, fontWeight:700, marginBottom:10 }}>
            {step.titleFr.toUpperCase()}
          </div>
          <DemoContent step={step} />
        </div>

        {/* Animated cursor */}
        <div className={`dv2-cursor ${clicking ? 'click' : ''}`} style={{ left: cursorLeft, top: cursorTop }}>
          <div className="dv2-cursor-ring" />
        </div>

        {/* Explanatory bubble */}
        <div className="dv2-bubble" key={`b-${stepIdx}`} style={{ left: bubbleLeft, top: bubbleTop }}>
          <div className="dv2-bubble-title">{step.titleFr}</div>
          <div className="dv2-bubble-text">{isFr ? step.bubbleFr : step.bubbleEn}</div>
          <div style={{ marginTop:6, fontSize:8, color:'#6B7280' }}>{stepIdx + 1} / {DEMO_STEPS.length}</div>
        </div>

        {/* Progress bar */}
        <div className="dv2-progress">
          <div className="dv2-progress-bar" style={{ width: `${((stepIdx + 1) / DEMO_STEPS.length) * 100}%` }} />
        </div>

        {/* Navigation */}
        <div style={{ position:'absolute', bottom:12, left:190, display:'flex', gap:3, zIndex:10 }}>
          {DEMO_STEPS.map((_, i) => (
            <div key={i} onClick={() => setStepIdx(i)} style={{ width: i === stepIdx ? 14 : 5, height:5, borderRadius:3, background: i <= stepIdx ? '#6C7CFF' : '#1F2A40', cursor:'pointer', transition:'all 0.3s' }} />
          ))}
        </div>

        <button className="dv2-close" onClick={onClose}>{t('Fermer', 'Close')} ✕</button>
      </div>
    </>
  )
}

function CaseOverlay({ t, onClose }: { t: (fr: string, en: string) => string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'var(--p-bg, #0C1424)', overflowY: 'auto' }}>
      <button onClick={onClose} style={{ position: 'fixed', top: 12, right: 16, zIndex: 1000, background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#6B7280', fontSize: 11, padding: '4px 14px', borderRadius: 16, cursor: 'pointer' }}>
        {t('Fermer', 'Close')} ✕
      </button>
      <AlejandroCasePage />
    </div>
  )
}
