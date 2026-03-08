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
      router.push('/dashboard')
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
            {t('Connexion Ã  votre espace', 'Sign in to your workspace')}
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
              placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
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
          {t('AccÃ¨s sur invitation uniquement', 'Invite-only access')}
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
                    router.push('/dashboard')
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
            {t('DÃ©couvrir PULSAR â DÃ©mo', 'Discover PULSAR â Demo')}
          </button>
        </div>

        {/* âââââââ DEMO OVERLAY âââââââ */}
        {showDemo && <DemoOverlay t={t} onClose={() => setShowDemo(false)} />}
        {showCase && <CaseOverlay t={t} onClose={() => setShowCase(false)} />}
      </div>
    </div>
  )
}


// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// DEMO IMMERSIVE â Simulation interactive PULSAR
// L'utilisateur vit l'expÃ©rience comme s'il Ã©tait dans l'app
// Curseur animÃ©, saisie de donnÃ©es, pipeline en temps rÃ©el
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ



// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// DEMO IMMERSIVE V2 â Tour guidÃ© pÃ©dagogique
// Sidebar rÃ©elle + curseur + bulles explicatives
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const DEMO_V2_CSS = `
  .dv2-root { position:fixed; inset:0; z-index:999; background:#0C1424; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif; }
  .dv2-sidebar { position:absolute; left:0; top:0; bottom:0; width:188px; background:#080C18; border-right:1px solid #1A2540; display:flex; flex-direction:column; padding:10px 0; overflow-y:auto; z-index:2; }
  .dv2-logo { padding:10px 14px 12px; display:flex; align-items:center; gap:8px; border-bottom:1px solid #1A2540; margin-bottom:6px; }
  .dv2-patient-chip { padding:6px 14px 8px; border-bottom:1px solid #1A2540; margin-bottom:4px; }
  .dv2-tab { display:flex; align-items:center; gap:8px; padding:7px 14px; cursor:default; transition:all 0.35s ease; border-left:2px solid transparent; font-size:10.5px; color:#4B5563; }
  .dv2-tab.active { background:rgba(108,124,255,0.07); border-left-color:var(--tc, #6C7CFF); color:#E8EAF0; }
  .dv2-content { position:absolute; left:188px; top:0; bottom:0; right:0; overflow-y:auto; padding:22px 24px; }
  .dv2-content-header { font-size:9px; fontFamily:'JetBrains Mono',monospace; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:14px; }
  .dv2-cursor { position:absolute; z-index:50; pointer-events:none; transition: left 0.85s cubic-bezier(0.25,0.1,0.25,1), top 0.85s cubic-bezier(0.25,0.1,0.25,1); }
  .dv2-cursor-dot { width:10px; height:10px; border-radius:50%; background:#F5A623; position:absolute; top:-5px; left:-5px; }
  .dv2-cursor-ring { width:26px; height:26px; border-radius:50%; border:1.5px solid #F5A623; position:absolute; top:-13px; left:-13px; background:rgba(245,166,35,0.06); }
  .dv2-cursor.click .dv2-cursor-ring { animation: dv2click 0.4s ease; }
  .dv2-bubble { position:absolute; z-index:60; pointer-events:none; background:rgba(8,12,24,0.97); backdrop-filter:blur(16px); border:1px solid rgba(108,124,255,0.2); border-radius:12px; padding:12px 16px; max-width:290px; animation:dv2fadein 0.45s cubic-bezier(0.34,1.56,0.64,1); }
  .dv2-bubble-act { font-size:8px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:4px; opacity:0.6; }
  .dv2-bubble-title { font-size:12px; font-weight:800; color:#E8EAF0; margin-bottom:6px; }
  .dv2-bubble-text { font-size:10.5px; color:#9CA3AF; line-height:1.55; }
  .dv2-bubble-step { margin-top:8px; font-size:8.5px; color:#374151; display:flex; align-items:center; gap:6px; }
  .dv2-progress { position:absolute; top:0; left:188px; right:0; height:2px; background:#0A0E1A; z-index:10; }
  .dv2-progress-bar { height:100%; transition: width 0.6s ease; }
  .dv2-acts { position:absolute; top:6px; left:200px; display:flex; gap:2px; z-index:11; }
  .dv2-act-label { font-size:7.5px; font-weight:700; letter-spacing:1px; padding:2px 8px; border-radius:10px; text-transform:uppercase; }
  .dv2-close { position:absolute; top:10px; right:14px; z-index:101; background:none; border:1px solid rgba(255,255,255,0.1); color:#4B5563; font-size:10px; padding:4px 12px; border-radius:14px; cursor:pointer; transition:all 0.2s; }
  .dv2-close:hover { color:#E8EAF0; border-color:rgba(255,255,255,0.25); }
  .dv2-nav { position:absolute; bottom:14px; left:200px; display:flex; gap:4px; z-index:10; align-items:center; }
  .dv2-dot { height:4px; border-radius:2px; cursor:pointer; transition:all 0.3s; }
  .dv2-nav-btn { background:none; border:1px solid #1F2A40; color:#6B7280; font-size:9px; padding:3px 10px; border-radius:8px; cursor:pointer; }
  .dv2-nav-btn:hover { color:#E8EAF0; border-color:#6C7CFF40; }
  .dv2-glass { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:12px; }
  .dv2-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:6px; font-size:8px; font-weight:800; font-family:monospace; }
  .dv2-metric { text-align:center; padding:8px; background:rgba(0,0,0,0.2); border-radius:8px; }
  .dv2-bar-track { height:12px; background:#0D1526; border-radius:6px; overflow:hidden; position:relative; }
  .dv2-bar-fill { height:100%; border-radius:6px; transition:width 0.8s ease; }
  @keyframes dv2click { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
  @keyframes dv2fadein { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes dv2pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes dv2scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
  @keyframes dv2count { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
`

const SIDEBAR_TABS = [
  { id: 'intake',    label: 'Admission',   icon: 'clipboard', color: '#6C7CFF' },
  { id: 'cockpit',   label: 'Cockpit',     icon: 'heart',     color: '#8B5CF6' },
  { id: 'dashboard', label: 'Observatory', icon: 'chart',     color: '#3B82F6' },
  { id: 'diagnostic',label: 'Diagnostic',  icon: 'brain',     color: '#6C7CFF' },
  { id: 'traitement',label: 'Traitement',  icon: 'pill',      color: '#2FD1C8' },
  { id: 'pve',       label: 'MÃ©dicaments', icon: 'shield',    color: '#B96BFF' },
  { id: 'ewe',       label: 'Ãvolution',   icon: 'chart',     color: '#A78BFA' },
  { id: 'discovery', label: 'Discovery',   icon: 'microscope',color: '#10B981' },
  { id: 'lab',       label: 'Research Lab',icon: 'microscope',color: '#0EA5E9' },
  { id: 'cascade',   label: 'Cascade',     icon: 'alert',     color: '#FF6B35' },
  { id: 'oracle',    label: 'Oracle',      icon: 'chart',     color: '#E879F9' },
  { id: 'rapport',   label: 'Export',      icon: 'export',    color: '#F5A623' },
]

const ACTS = [
  { label: 'Acte I â Admission',  steps: [0,1,2],       color: '#6C7CFF' },
  { label: 'Acte II â Moteurs',   steps: [3,4,5,6,7,8], color: '#10B981' },
  { label: 'Acte III â Puissance',steps: [9,10,11],     color: '#E879F9' },
]

interface DemoStep {
  tabId: string
  duration: number
  bubbleFr: string
  titleFr: string
  act: number
  cursorTarget: 'sidebar' | 'content'
  contentX?: number
  contentY?: number
}

const DEMO_STEPS: DemoStep[] = [
  { tabId: 'intake', duration: 5500, act: 0,
    titleFr: 'IntakeAnalyzer â Admission',
    bubbleFr: 'Lucas, 8 ans. 5 paramÃ¨tres saisis en 20 secondes. PULSAR calcule le niveau de triage : P1 Critique. FiÃ¨vre J-3, convulsions, GCS 9.',
    cursorTarget: 'content', contentX: 50, contentY: 30 },
  { tabId: 'cockpit', duration: 5500, act: 0,
    titleFr: 'VPS Score â SÃ©vÃ©ritÃ© globale',
    bubbleFr: 'Score VPS 81/100. 13 critÃ¨res analysÃ©s en temps rÃ©el : neurologique, inflammatoire, vital. FIRES suspect Ã  87%. Un seul Ã©cran, toute la sÃ©vÃ©ritÃ©.',
    cursorTarget: 'sidebar' },
  { tabId: 'dashboard', duration: 5000, act: 0,
    titleFr: 'Observatory â Vue chef de service',
    bubbleFr: '8 patients actifs. Lucas apparaÃ®t en rouge P1. Vue multi-patients en temps rÃ©el : le chef de service pilote depuis un seul Ã©cran.',
    cursorTarget: 'content', contentX: 40, contentY: 35 },
  { tabId: 'diagnostic', duration: 5500, act: 1,
    titleFr: 'Diagnostic IA â Pattern FIRES',
    bubbleFr: 'PULSAR identifie le pattern FIRES sur 13 critÃ¨res. Score composite 9/13. HypothÃ¨se principale : FIRES. DiffÃ©rentiel : anti-NMDAR, PIMS-TS neuro.',
    cursorTarget: 'sidebar' },
  { tabId: 'traitement', duration: 5500, act: 1,
    titleFr: 'TDE â Escalade thÃ©rapeutique',
    bubbleFr: 'Le TDE gÃ©nÃ¨re le protocole en 4 lignes. Ligne 1 dÃ©jÃ  administrÃ©e. Ligne 2 : Midazolam IV recommandÃ©. DÃ©lai optimal : prochaines 2h.',
    cursorTarget: 'sidebar' },
  { tabId: 'pve', duration: 5500, act: 1,
    titleFr: 'PVE â Alerte interaction mÃ©dicamenteuse',
    bubbleFr: 'Flash rouge : KÃ©tamine + Midazolam Ã profil FIRES. Le PVE interroge OpenFDA en temps rÃ©el et signale le risque de dÃ©pression respiratoire.',
    cursorTarget: 'content', contentX: 55, contentY: 25 },
  { tabId: 'ewe', duration: 5000, act: 1,
    titleFr: 'EWE â Signal dÃ©gradation J+2',
    bubbleFr: "Tendance vitale : SpOâ en baisse sur 18h. EWE projette une dÃ©gradation Ã  J+2 avec 74% de probabilitÃ©. FenÃªtre d'action : 6h.",
    cursorTarget: 'content', contentX: 60, contentY: 40 },
  { tabId: 'discovery', duration: 5500, act: 1,
    titleFr: 'Discovery â PubMed en temps rÃ©el',
    bubbleFr: 'Scan PubMed : 3 articles remontÃ©s sur FIRES pÃ©diatrique 2023â2024. PatternMiner dÃ©tecte une corrÃ©lation GCS Ã dÃ©lai IVIG non documentÃ©e.',
    cursorTarget: 'sidebar' },
  { tabId: 'lab', duration: 5000, act: 1,
    titleFr: 'Research Lab â HypothÃ¨ses IA',
    bubbleFr: '3 hypothÃ¨ses gÃ©nÃ©rÃ©es par IA. H1 : FIRES idiopathique 87%. H2 : FIRES infectieux 11%. H3 : PIMS-TS neuro 2%. Essais NCT actifs identifiÃ©s.',
    cursorTarget: 'sidebar' },
  { tabId: 'cascade', duration: 5500, act: 2,
    titleFr: 'Cascade Alert Engine',
    bubbleFr: "MÃ©dicament saisi : MEOPA. PULSAR croise avec le profil Lucas. STOP : 4 Ã©tapes de cascade identifiÃ©es. Alternative proposÃ©e en 1 clic.",
    cursorTarget: 'content', contentX: 55, contentY: 30 },
  { tabId: 'oracle', duration: 5500, act: 2,
    titleFr: 'Oracle â 4 scÃ©narios Ã  H+72',
    bubbleFr: 'Simulation complÃ¨te. Anakinra + RÃ©gime CÃ©togÃ¨ne â VPS projetÃ© 28. Sans action â VPS 95. Le mÃ©decin voit l\'impact de chaque dÃ©cision.',
    cursorTarget: 'sidebar' },
  { tabId: 'rapport', duration: 5500, act: 2,
    titleFr: 'Export â Brief clinique en 1 clic',
    bubbleFr: 'PDF clinique gÃ©nÃ©rÃ© : 12 moteurs, 70+ sources, traductions FR/EN. MD Â· JSON Â· BibTeX. PrÃªt pour le spÃ©cialiste en moins de 3 secondes.',
    cursorTarget: 'content', contentX: 50, contentY: 40 },
]

function DemoContent({ step, stepIdx }: { step: DemoStep; stepIdx: number }) {
  const s = step.tabId

  if (s === 'intake') return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
        {[
          { l:'Patient', v:'Lucas M., 8 ans', c:'#6C7CFF' },
          { l:'Triage', v:'P1 â CRITIQUE', c:'#EF4444' },
          { l:'SymptÃ´mes', v:'Convulsions J-3', c:'#F59E0B' },
          { l:'GCS initial', v:'9 / 15', c:'#EF4444' },
          { l:'TempÃ©rature', v:'39.2Â°C', c:'#F59E0B' },
          { l:'Service', v:'NeuropÃ©diatrie', c:'#6B7280' },
        ].map((m,i) => (
          <div key={i} style={{ padding:'7px 10px', background:'#0D1526', borderRadius:7, borderLeft:`2px solid ${m.c}30` }}>
            <div style={{ fontSize:7.5, color:'#4B5563', marginBottom:2 }}>{m.l}</div>
            <div style={{ fontSize:9.5, fontWeight:700, color:m.c, fontFamily:'monospace' }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'8px 12px', background:'#6C7CFF08', borderRadius:8, border:'1px solid #6C7CFF18', fontSize:8.5, color:'#6C7CFF', fontWeight:700 }}>
        â Analyse IntakeAnalyzer â Triage automatique P1 en 18 secondes
      </div>
    </div>
  )

  if (s === 'cockpit') return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <div style={{ flex:'0 0 76px', background:'#EF444410', borderRadius:10, padding:'10px 8px', textAlign:'center', border:'1px solid #EF444420' }}>
          <div style={{ fontSize:7.5, color:'#EF4444', fontFamily:'monospace', fontWeight:700 }}>VPS</div>
          <div style={{ fontSize:30, fontWeight:900, color:'#EF4444', fontFamily:'monospace', lineHeight:1 }}>81</div>
          <div style={{ fontSize:7, color:'#EF4444', marginTop:2 }}>CRITIQUE</div>
        </div>
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {[{ l:'GCS', v:'9/15', c:'#EF4444' }, { l:'Crises/24h', v:'4', c:'#EF4444' }, { l:'FC', v:'142', c:'#F59E0B' }, { l:'SpO2', v:'94%', c:'#F59E0B' }, { l:'TÂ°', v:'39.2Â°C', c:'#F59E0B' }, { l:'CRP', v:'78', c:'#EF4444' }].map((v,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 8px', background:'#0D1526', borderRadius:5 }}>
              <span style={{ fontSize:7.5, color:'#4B5563' }}>{v.l}</span>
              <span style={{ fontSize:9, fontWeight:700, color:v.c, fontFamily:'monospace' }}>{v.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
        {[['VPS 81','#EF4444'],['TDE','#2FD1C8'],['PVE','#B96BFF'],['EWE','#A78BFA'],['TPE','#FFB347'],['NCE','#EC4899'],['CAE','#FF6B35'],['Discovery','#10B981']].map(([e,c],i) => (
          <span key={i} style={{ padding:'2px 7px', borderRadius:4, background:`${c}12`, fontSize:7.5, fontWeight:800, color:c as string, fontFamily:'monospace' }}>{e}</span>
        ))}
      </div>
    </div>
  )

  if (s === 'dashboard') return (
    <div>
      <div style={{ fontSize:8, color:'#4B5563', marginBottom:6 }}>8 patients actifs â Service NeuropÃ©diatrie</div>
      {[
        { n:'Lucas M.',   a:'8a', vps:81, p:'P1', c:'#EF4444', dx:'FIRES suspect' },
        { n:'Emma R.',    a:'6a', vps:52, p:'P2', c:'#F59E0B', dx:'EncÃ©phalite' },
        { n:'Noah B.',    a:'11a',vps:38, p:'P2', c:'#F59E0B', dx:'Ãpilepsie rÃ©fractaire' },
        { n:'LÃ©a K.',     a:'4a', vps:21, p:'P3', c:'#10B981', dx:'Bilan neurologique' },
      ].map((pt,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background: i===0 ? '#EF444406' : '#0D1526', borderRadius:7, marginBottom:4, border: i===0 ? '1px solid #EF444418' : '1px solid transparent' }}>
          <span style={{ width:5, height:5, borderRadius:3, background:pt.c, flexShrink:0 }} />
          <span style={{ fontSize:9, fontWeight:600, color: i===0 ? '#F0F2F5' : '#6B7280', flex:1 }}>{pt.n} <span style={{ color:'#374151' }}>{pt.a}</span></span>
          <span style={{ fontSize:7.5, color:pt.c, fontFamily:'monospace', fontWeight:700 }}>{pt.p}</span>
          <span style={{ fontSize:7.5, color:'#374151' }}>{pt.dx}</span>
          <span style={{ fontSize:9, fontWeight:800, color:pt.c, fontFamily:'monospace', minWidth:24, textAlign:'right' }}>{pt.vps}</span>
        </div>
      ))}
    </div>
  )

  if (s === 'diagnostic') return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <div style={{ padding:'10px 14px', background:'#6C7CFF10', borderRadius:10, border:'1px solid #6C7CFF18', textAlign:'center', flex:'0 0 80px' }}>
          <div style={{ fontSize:7.5, color:'#6C7CFF', fontWeight:700 }}>FIRES</div>
          <div style={{ fontSize:26, fontWeight:900, color:'#6C7CFF', fontFamily:'monospace' }}>9/13</div>
          <div style={{ fontSize:7, color:'#6C7CFF' }}>87% prob.</div>
        </div>
        <div style={{ flex:1 }}>
          {[['FiÃ¨vre prÃ©-ictale','â','#10B981'],['Crise >24h','â','#10B981'],['EEG continu','â','#10B981'],['IRM normale','â','#10B981'],['LCS normal','?','#F59E0B']].map(([l,v,c],i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'3px 8px', background:'#0D1526', borderRadius:4, marginBottom:3 }}>
              <span style={{ fontSize:8, color:'#6B7280' }}>{l}</span>
              <span style={{ fontSize:9, fontWeight:700, color:c as string }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {[['FIRES','#6C7CFF','87%'],['Anti-NMDAR','#B96BFF','8%'],['PIMS-TS','#10B981','3%'],['MOGAD','#2FD1C8','2%']].map(([l,c,p],i) => (
          <div key={i} style={{ flex:1, padding:'5px 4px', background:`${c}10`, borderRadius:7, textAlign:'center', border:`1px solid ${c}20` }}>
            <div style={{ fontSize:7, color:c as string, fontWeight:700 }}>{l}</div>
            <div style={{ fontSize:11, fontWeight:800, color:c as string, fontFamily:'monospace' }}>{p}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (s === 'traitement') return (
    <div>
      {[
        { n:'Ligne 1', tx:'Benzos + PhÃ©nobarbital', s:'â AdministrÃ©e', c:'#10B981' },
        { n:'Ligne 2', tx:'Midazolam IV continu', s:'â RecommandÃ©e', c:'#6C7CFF' },
        { n:'Ligne 3', tx:'KÃ©tamine + Propofol', s:'En attente', c:'#4B5563' },
        { n:'Ligne 4', tx:'AnesthÃ©sie gÃ©nÃ©rale', s:'Si Ã©chec L3', c:'#374151' },
      ].map((l,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background: i===1 ? '#6C7CFF08' : '#0D1526', borderRadius:7, marginBottom:4, border: i===1 ? '1px solid #6C7CFF20' : '1px solid transparent' }}>
          <div style={{ width:4, height:4, borderRadius:2, background:l.c, flexShrink:0 }} />
          <span style={{ fontSize:7.5, color:'#4B5563', minWidth:38 }}>{l.n}</span>
          <span style={{ fontSize:9, color: i<=1 ? '#E8EAF0' : '#6B7280', flex:1 }}>{l.tx}</span>
          <span style={{ fontSize:8, fontWeight:700, color:l.c }}>{l.s}</span>
        </div>
      ))}
      <div style={{ marginTop:6, padding:'5px 10px', background:'#F59E0B08', borderRadius:6, fontSize:8, color:'#F59E0B' }}>
        â¡ DÃ©lai optimal ligne 2 : &lt; 2h (H+6 actuel)
      </div>
    </div>
  )

  if (s === 'pve') return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        <div style={{ flex:1, padding:'6px 10px', background:'#0D1526', borderRadius:7, border:'1px solid #EF444420', fontSize:9.5, color:'#F0F2F5' }}>KÃ©tamine</div>
        <div style={{ padding:'6px 14px', borderRadius:7, background:'#EF4444', color:'#fff', fontSize:8.5, fontWeight:700 }}>Analyser PVE</div>
      </div>
      <div style={{ padding:'10px 12px', background:'#EF444408', borderRadius:9, border:'1px solid #EF444418' }}>
        <div style={{ fontSize:9, fontWeight:800, color:'#EF4444', marginBottom:6 }}>â  INTERACTION CRITIQUE</div>
        {['KÃ©tamine Ã Midazolam IV â dÃ©pression respiratoire','Profil FIRES : sensibilitÃ© EEG augmentÃ©e','Dose cumulÃ©e : seuil dÃ©jÃ  Ã  78%'].map((s,i) => (
          <div key={i} style={{ display:'flex', gap:6, marginBottom:3 }}>
            <span style={{ fontSize:7, color:'#EF4444', fontWeight:900 }}>â</span>
            <span style={{ fontSize:8, color:'#E8EAF0' }}>{s}</span>
          </div>
        ))}
        <div style={{ marginTop:6, fontSize:8, color:'#10B981', fontWeight:600 }}>Alternative : PhÃ©nobarbital + monitoring EEG renforcÃ©</div>
      </div>
    </div>
  )

  if (s === 'ewe') return (
    <div>
      <div style={{ fontSize:8, color:'#4B5563', marginBottom:8 }}>Tendance SpOâ â 18 derniÃ¨res heures</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:60, marginBottom:10 }}>
        {[96,95,95,94,94,93,93,93,92,91,91,90,90,89,88,87,87,86].map((v,i) => (
          <div key={i} style={{ flex:1, height:`${(v-82)*6}px`, background: v<90 ? '#EF444430' : '#A78BFA30', borderRadius:'2px 2px 0 0', borderTop:`2px solid ${v<90?'#EF4444':'#A78BFA'}`, transition:'height 0.5s' }} />
        ))}
      </div>
      <div style={{ padding:'8px 12px', background:'#EF444408', borderRadius:8, border:'1px solid #EF444418', fontSize:8.5 }}>
        <span style={{ color:'#EF4444', fontWeight:700 }}>EWE Alert â </span>
        <span style={{ color:'#9CA3AF' }}>DÃ©gradation projetÃ©e J+2 Â· ProbabilitÃ© 74% Â· FenÃªtre d'action : 6h</span>
      </div>
    </div>
  )

  if (s === 'discovery') return (
    <div>
      <div style={{ display:'flex', gap:4, marginBottom:8 }}>
        {[['L1 Pattern','#10B981'],['L2 PubMed','#10B981'],['L3 HypothÃ¨ses','#F59E0B'],['L4 Essais','#4B5563']].map(([l,c],i) => (
          <div key={i} style={{ flex:1, padding:'4px 4px', background:`${c}10`, borderRadius:5, textAlign:'center', border:`1px solid ${c}20` }}>
            <div style={{ fontSize:7, color:c as string, fontWeight:700, lineHeight:1.3 }}>{l}</div>
            {i < 2 && <div style={{ width:6, height:6, borderRadius:3, background:c, margin:'2px auto 0' }} />}
        <img src="/assets/illustrations/avatar-boy.png" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} alt=""/>
          </div>
        ))}
      </div>
      {[
        { src:'Nat. Neurology 2023', t:'FIRES + GCS < 10 â IVIG J+2 amÃ©liore pronostic Ã2.3', c:'#10B981' },
        { src:'Epilepsia 2024', t:'CorrÃ©lation CRP > 60 + pattern EEG = FIRES dans 89% des cas', c:'#10B981' },
        { src:'Brain 2023', t:'Anakinra prÃ©coce (< 72h) rÃ©duit durÃ©e status epilepticus', c:'#0EA5E9' },
      ].map((a,i) => (
        <div key={i} style={{ padding:'6px 10px', background:'#0D1526', borderRadius:6, marginBottom:4 }}>
          <div style={{ fontSize:7, color:a.c, fontWeight:700, marginBottom:2 }}>{a.src}</div>
          <div style={{ fontSize:8, color:'#9CA3AF', lineHeight:1.4 }}>{a.t}</div>
        </div>
      ))}
    </div>
  )

  if (s === 'lab') return (
    <div>
      <div style={{ marginBottom:8 }}>
        {[
          { h:'H1', l:'FIRES idiopathique', p:87, c:'#6C7CFF' },
          { h:'H2', l:'FIRES infectieux', p:11, c:'#10B981' },
          { h:'H3', l:'PIMS-TS neurologique', p:2, c:'#B96BFF' },
        ].map((h,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:8, fontWeight:800, color:h.c, fontFamily:'monospace', minWidth:20 }}>{h.h}</span>
            <span style={{ fontSize:8.5, color:'#9CA3AF', flex:1 }}>{h.l}</span>
            <div className="dv2-bar-track" style={{ width:80 }}>
              <div className="dv2-bar-fill" style={{ width:`${h.p}%`, background:h.c }} />
            </div>
            <span style={{ fontSize:8.5, fontWeight:700, color:h.c, fontFamily:'monospace', minWidth:28 }}>{h.p}%</span>
          </div>
        ))}
      </div>
      <div style={{ padding:'6px 10px', background:'#0EA5E908', borderRadius:7, border:'1px solid #0EA5E918', fontSize:8, color:'#0EA5E9' }}>
        ð¬ NCT05847205 â Anakinra pÃ©diatrique FIRES Â· Recrutement actif Â· 4 centres FR
      </div>
    </div>
  )

  if (s === 'cascade') return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:8 }}>
        <div style={{ flex:1, padding:'6px 10px', background:'#0D1526', borderRadius:7, border:'1px solid #FF6B3520', fontSize:9.5, color:'#F0F2F5' }}>MEOPA</div>
        <div style={{ padding:'6px 14px', borderRadius:7, background:'#FF6B35', color:'#fff', fontSize:8.5, fontWeight:700 }}>Analyser</div>
      </div>
      <div style={{ padding:'10px 12px', background:'#EF444408', borderRadius:9, border:'1px solid #EF444418' }}>
        <div style={{ fontSize:9, fontWeight:800, color:'#EF4444', marginBottom:6 }}>â CASCADE CRITIQUE â 4 Ã©tapes identifiÃ©es</div>
        {['Neuroinflammation latente active','MEOPA â hypoxie cÃ©rÃ©brale transitoire','Seuil convulsif dÃ©jÃ  abaissÃ© (GCS 9)','Cascade auto-entretenue irrÃ©versible'].map((s,i) => (
          <div key={i} style={{ display:'flex', gap:6, marginBottom:3, alignItems:'center' }}>
            <span style={{ fontSize:8, fontWeight:900, color:'#EF4444', fontFamily:'monospace', minWidth:12 }}>{i+1}</span>
            <span style={{ fontSize:8, color:'#E8EAF0' }}>{s}</span>
          </div>
        ))}
        <div style={{ marginTop:6, fontSize:8, color:'#10B981', fontWeight:600 }}>â Alternative : Emla topique + ParacÃ©tamol IV</div>
      </div>
    </div>
  )

  if (s === 'oracle') return (
    <div>
      <div style={{ fontSize:8, color:'#4B5563', marginBottom:8 }}>Simulation pronostique H+72 â VPS projetÃ©</div>
      {[
        { l:'Anakinra + RÃ©gime CÃ©togÃ¨ne', v:28, c:'#10B981', tag:'â RecommandÃ©' },
        { l:'Standard (CorticoÃ¯des + IVIG)', v:44, c:'#6C7CFF', tag:'' },
        { l:'Rituximab expÃ©rimental', v:35, c:'#F5A623', tag:'Essai NCT' },
        { l:'Sans action supplÃ©mentaire', v:95, c:'#EF4444', tag:'â  Critique' },
      ].map((s,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <span style={{ width:130, fontSize:8, color:'#6B7280', textAlign:'right', flexShrink:0 }}>{s.l}</span>
          <div className="dv2-bar-track" style={{ flex:1 }}>
            <div className="dv2-bar-fill" style={{ width:`${s.v}%`, background:`${s.c}40` }} />
            <span style={{ position:'absolute', right:6, top:1, fontSize:8, fontWeight:700, color:s.c, fontFamily:'monospace' }}>{s.v}</span>
          </div>
          {s.tag && <span style={{ fontSize:7.5, color:s.c, fontWeight:700, minWidth:60 }}>{s.tag}</span>}
        </div>
      ))}
    </div>
  )

  if (s === 'rapport') return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        {[['MD Brief','#6C7CFF'],['JSON','#10B981'],['BibTeX','#F5A623']].map(([f,c],i) => (
          <div key={i} style={{ flex:1, padding:'8px 6px', background:`${c}10`, borderRadius:8, border:`1px solid ${c}20`, textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontSize:8, fontWeight:700, color:c as string }}>{f}</div>
          </div>
        ))}
      </div>
      {['Analyse VPS Â· 12 moteurs IA','70+ publications sourÃ©es','Traduction FR / EN auto','HypothÃ¨ses + Essais NCT actifs','Signature mÃ©decin + Timestamp'].map((l,i) => (
        <div key={i} style={{ display:'flex', gap:6, padding:'4px 0', borderBottom:'1px solid #1A2540', alignItems:'center' }}>
          <span style={{ fontSize:8, color:'#10B981' }}>â</span>
          <span style={{ fontSize:8.5, color:'#9CA3AF' }}>{l}</span>
        </div>
      ))}
      <div style={{ marginTop:8, padding:'6px 10px', background:'#10B98108', borderRadius:7, fontSize:8.5, color:'#10B981', fontWeight:700 }}>
        PDF gÃ©nÃ©rÃ© en 2.3 secondes Â· PrÃªt Ã  envoyer
      </div>
    </div>
  )

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
  const [paused, setPaused] = useState(false)

  const step = DEMO_STEPS[stepIdx]
  const tabIndex = SIDEBAR_TABS.findIndex(tab => tab.id === step.tabId)
  const act = ACTS[step.act]
  const W = typeof window !== 'undefined' ? window.innerWidth : 900
  const H = typeof window !== 'undefined' ? window.innerHeight : 700

  // Auto-advance
  useEffect(() => {
    if (paused || stepIdx >= DEMO_STEPS.length) return
    const timer = setTimeout(() => {
      if (stepIdx < DEMO_STEPS.length - 1) setStepIdx(s => s + 1)
      else onClose()
    }, step.duration)
    return () => clearTimeout(timer)
  }, [stepIdx, step, onClose, paused])

  // Click animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setClicking(true)
      setTimeout(() => setClicking(false), 400)
    }, 700)
    return () => clearTimeout(timer)
  }, [stepIdx])

  const cursorLeft = step.cursorTarget === 'sidebar' ? 94 : 188 + ((step.contentX || 50) / 100) * (W - 188)
  const cursorTop  = step.cursorTarget === 'sidebar' ? 130 + tabIndex * 31 : ((step.contentY || 40) / 100) * H

  const bubbleLeft = step.cursorTarget === 'sidebar' ? 198 : Math.min(cursorLeft + 26, W - 310)
  const bubbleTop  = Math.max(30, cursorTop - 16)

  const actProgress = ((stepIdx + 1) / DEMO_STEPS.length) * 100

  return (
    <>
      <style>{DEMO_V2_CSS}</style>
      <div className="dv2-root">

        {/* Sidebar */}
        <div className="dv2-sidebar">
          <div className="dv2-logo">
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#6C7CFF', boxShadow:'0 0 6px #6C7CFF' }} />
            <span style={{ fontSize:10.5, fontWeight:900, color:'#6C7CFF', letterSpacing:1.5 }}>PULSAR</span>
          </div>
          <div className="dv2-patient-chip">
            <div style={{ fontSize:8.5, fontWeight:700, color:'#E8EAF0' }}>Lucas M. Â· 8 ans</div>
            <div style={{ fontSize:7.5, color:'#EF4444', fontWeight:600 }}>P1 Â· FIRES suspect</div>
          </div>
          {SIDEBAR_TABS.map((tab, i) => (
            <div key={tab.id}
              className={`dv2-tab ${tab.id === step.tabId ? 'active' : ''}`}
              style={{ '--tc': tab.color } as React.CSSProperties}
              onClick={() => setStepIdx(DEMO_STEPS.findIndex(s => s.tabId === tab.id))}
            >
              <Picto name={tab.icon} size={12} glow={tab.id === step.tabId} />
              <span>{tab.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="dv2-content" key={stepIdx}>
          <div className="dv2-content-header" style={{ color: SIDEBAR_TABS.find(t => t.id === step.tabId)?.color || '#6C7CFF' }}>
            {step.titleFr}
          </div>
          <DemoContent step={step} stepIdx={stepIdx} />
        </div>

        {/* Cursor */}
        <div className={`dv2-cursor ${clicking ? 'click' : ''}`} style={{ left: cursorLeft, top: cursorTop }}>
          <div className="dv2-cursor-ring" />
          <div className="dv2-cursor-dot" />
        </div>

        {/* Bubble */}
        <div className="dv2-bubble" key={`b-${stepIdx}`} style={{ left: bubbleLeft, top: bubbleTop }}>
          <div className="dv2-bubble-act" style={{ color: act.color }}>{act.label}</div>
          <div className="dv2-bubble-title">{step.titleFr}</div>
          <div className="dv2-bubble-text">{step.bubbleFr}</div>
          <div className="dv2-bubble-step">
            <div style={{ flex:1, height:3, background:'#1A2540', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${((stepIdx+1)/DEMO_STEPS.length)*100}%`, background: act.color, borderRadius:2, transition:'width 0.5s' }} />
            </div>
            <span style={{ color:'#4B5563' }}>{stepIdx + 1} / {DEMO_STEPS.length}</span>
          </div>
        </div>

        {/* Top progress */}
        <div className="dv2-progress">
          <div className="dv2-progress-bar" style={{ width:`${actProgress}%`, background:`linear-gradient(90deg, #6C7CFF, ${act.color})` }} />
        </div>

        {/* Act labels */}
        <div className="dv2-acts">
          {ACTS.map((a, i) => {
            const isActive = step.act === i
            return (
              <div key={i} className="dv2-act-label"
                style={{ color: isActive ? a.color : '#374151', background: isActive ? `${a.color}12` : 'transparent', border: `1px solid ${isActive ? a.color+'30' : 'transparent'}` }}
                onClick={() => setStepIdx(a.steps[0])}
              >
                {a.label}
              </div>
            )
          })}
        </div>

        {/* Nav dots */}
        <div className="dv2-nav">
          <button className="dv2-nav-btn" onClick={() => setStepIdx(s => Math.max(0, s-1))}>â</button>
          {DEMO_STEPS.map((_, i) => (
            <div key={i} className="dv2-dot"
              onClick={() => setStepIdx(i)}
              style={{ width: i === stepIdx ? 16 : 4, background: i <= stepIdx ? ACTS[DEMO_STEPS[i].act].color : '#1F2A40' }}
            />
          ))}
          <button className="dv2-nav-btn" onClick={() => setStepIdx(s => Math.min(DEMO_STEPS.length-1, s+1))}>â</button>
          <button className="dv2-nav-btn" onClick={() => setPaused(p => !p)}>{paused ? 'â¶' : 'â¸'}</button>
        </div>

        <button className="dv2-close" onClick={onClose}>{t('Fermer', 'Close')} â</button>
      </div>
    </>
  )
}

function CaseOverlay({ t, onClose }: { t: (fr: string, en: string) => string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'var(--p-bg, #0C1424)', overflowY: 'auto' }}>
      <button onClick={onClose} style={{ position: 'fixed', top: 12, right: 16, zIndex: 1000, background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#6B7280', fontSize: 11, padding: '4px 14px', borderRadius: 16, cursor: 'pointer' }}>
        {t('Fermer', 'Close')} â
      </button>
      <AlejandroCasePage />
    </div>
  )
}
