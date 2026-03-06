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


const DEMO_STYLE = `
  .demo-root { position:fixed; inset:0; z-index:999; background:#060A14; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
  .demo-app { position:absolute; inset:0; background:#0C1424; overflow-y:auto; }
  .demo-cursor { position:absolute; z-index:100; pointer-events:none; transition: left 0.8s cubic-bezier(0.25,0.1,0.25,1), top 0.8s cubic-bezier(0.25,0.1,0.25,1); }
  .demo-cursor-dot { width:20px; height:20px; border-radius:50%; border:2px solid #F5A623; background:rgba(245,166,35,0.15); }
  .demo-cursor-click { position:absolute; inset:-4px; border-radius:50%; border:2px solid #F5A623; opacity:0; }
  .demo-cursor.clicking .demo-cursor-click { animation: demo-click 0.4s ease; }
  .demo-topbar { height:36px; background:#111827; border-bottom:1px solid #1F2A40; display:flex; align-items:center; padding:0 16px; gap:8px; }
  .demo-sidebar { position:absolute; left:0; top:36px; bottom:0; width:48px; background:#0F1520; border-right:1px solid #1F2A40; display:flex; flex-direction:column; align-items:center; padding:8px 0; gap:6px; }
  .demo-content { position:absolute; left:48px; top:36px; bottom:0; right:0; overflow-y:auto; padding:16px; }
  .demo-typing { border-right:2px solid #6C7CFF; animation: demo-blink 0.6s step-end infinite; }
  .demo-badge-pulse { animation: demo-badge-pop 0.5s ease; }
  .demo-close { position:absolute; top:8px; right:12px; z-index:101; background:none; border:1px solid rgba(255,255,255,0.15); color:#6B7280; font-size:11px; padding:4px 12px; border-radius:16px; cursor:pointer; }
  .demo-close:hover { color:#fff; }
  .demo-narration { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); z-index:101; background:rgba(12,20,36,0.92); backdrop-filter:blur(12px); border:1px solid #6C7CFF20; border-radius:12px; padding:10px 20px; max-width:500px; text-align:center; }
  .demo-narration-text { font-size:12px; color:#E8EAF0; line-height:1.5; }
  .demo-engine-badge { display:inline-flex; padding:3px 8px; border-radius:6px; font-size:8px; font-weight:800; font-family:monospace; }
  @keyframes demo-click { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
  @keyframes demo-blink { 0%,100%{border-color:#6C7CFF} 50%{border-color:transparent} }
  @keyframes demo-badge-pop { 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes demo-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .demo-fadein { animation: demo-fadein 0.4s ease; }
`

// ── Scene definitions ──
interface Scene {
  id: string
  duration: number // ms
  narrationFr: string
  narrationEn: string
  cursorX: number // % 
  cursorY: number // %
  click?: boolean
}

const SCENES: Scene[] = [
  { id: 'registry', duration: 3500, narrationFr: 'Le médecin ouvre le registre patients. 3 enfants sont suivis en réanimation.', narrationEn: 'The doctor opens the patient registry. 3 children are in the ICU.', cursorX: 20, cursorY: 30 },
  { id: 'new-patient', duration: 2500, narrationFr: 'Nouveau patient admis. Il clique sur "Nouvelle admission".', narrationEn: 'New patient admitted. He clicks "New admission".', cursorX: 80, cursorY: 12, click: true },
  { id: 'intake-name', duration: 3000, narrationFr: 'Léa M., 7 ans, admise pour convulsions fébriles réfractaires depuis 48h.', narrationEn: 'Léa M., 7 years old, admitted for refractory febrile seizures for 48h.', cursorX: 50, cursorY: 30, click: true },
  { id: 'intake-vitals', duration: 3500, narrationFr: 'Saisie des constantes : GCS 8, FC 158, T° 39.8°C, SpO2 93%, 6 crises/24h.', narrationEn: 'Entering vitals: GCS 8, HR 158, T° 39.8°C, SpO2 93%, 6 seizures/24h.', cursorX: 55, cursorY: 55, click: true },
  { id: 'intake-bio', duration: 3000, narrationFr: 'Biologie : CRP 95, Ferritine 1200, Lactate 4.2. LCR : 20 cellules.', narrationEn: 'Labs: CRP 95, Ferritin 1200, Lactate 4.2. CSF: 20 cells.', cursorX: 55, cursorY: 70, click: true },
  { id: 'pipeline', duration: 4000, narrationFr: 'PULSAR lance le pipeline. 11 moteurs s\'activent en séquence. VPS calculé : 88/100 — CRITIQUE.', narrationEn: 'PULSAR launches the pipeline. 11 engines activate in sequence. VPS calculated: 88/100 — CRITICAL.', cursorX: 50, cursorY: 40 },
  { id: 'cockpit', duration: 4000, narrationFr: 'Le cockpit affiche tout : VPS 88, constantes, alertes, 8 badges moteurs. La bannière cascade s\'allume.', narrationEn: 'The cockpit shows everything: VPS 88, vitals, alerts, 8 engine badges. The cascade banner lights up.', cursorX: 30, cursorY: 25 },
  { id: 'ddd-alert', duration: 4000, narrationFr: 'ALERTE DDD : immunothérapie non initiée à H+48. Retard critique. "64% des cas similaires : IVIG < 48h."', narrationEn: 'DDD ALERT: immunotherapy not started at H+48. Critical delay. "64% of similar cases: IVIG < 48h."', cursorX: 50, cursorY: 35, click: true },
  { id: 'cascade', duration: 4500, narrationFr: 'Le médecin teste "MEOPA" dans le Cascade Alert Engine. PULSAR dit : CASCADE CRITIQUE — contre-indication.', narrationEn: 'The doctor tests "MEOPA" in the Cascade Alert Engine. PULSAR says: CRITICAL CASCADE — contraindicated.', cursorX: 60, cursorY: 40, click: true },
  { id: 'discovery', duration: 3500, narrationFr: 'Discovery Engine : PubMed trouve 7 articles récents sur le FIRES. ClinicalTrials : 2 essais Anakinra recrutent.', narrationEn: 'Discovery Engine: PubMed finds 7 recent FIRES articles. ClinicalTrials: 2 Anakinra trials recruiting.', cursorX: 45, cursorY: 50 },
  { id: 'oracle', duration: 4000, narrationFr: 'Oracle simule 4 scénarios à H+72. Avec Anakinra + régime cétogène : VPS projeté 32. Sans action : VPS 95.', narrationEn: 'Oracle simulates 4 scenarios at H+72. With Anakinra + ketogenic diet: projected VPS 32. Without action: VPS 95.', cursorX: 50, cursorY: 45 },
  { id: 'consult', duration: 3500, narrationFr: 'En 10 secondes, PULSAR génère le brief expert. 3 questions urgentes. Prêt à envoyer au spécialiste.', narrationEn: 'In 10 seconds, PULSAR generates the expert brief. 3 urgent questions. Ready to send to the specialist.', cursorX: 70, cursorY: 30, click: true },
  { id: 'end', duration: 5000, narrationFr: 'PULSAR a posé les bonnes questions au bon moment. Chaque minute gagnée peut sauver une vie.', narrationEn: 'PULSAR asked the right questions at the right time. Every minute saved can save a life.', cursorX: 50, cursorY: 50 },
]

function DemoApp({ scene, typedText }: { scene: string; typedText: string }) {
  const engines = ['VPS','TDE','PVE','EWE','TPE','NCE','DDD','CAE','DISC','ORACLE','CONSULT']
  const activeEngines = scene === 'pipeline' ? engines : []

  return (
    <div className="demo-app">
      {/* Top bar */}
      <div className="demo-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:4, background:'#6C7CFF' }} />
          <span style={{ fontSize:10, fontWeight:800, color:'#6C7CFF', letterSpacing:1 }}>PULSAR</span>
        </div>
        <div style={{ flex:1 }} />
        <span style={{ fontSize:9, color:'#6B7280' }}>Léa M. · 7 ans · FIRES suspecté</span>
      </div>

      {/* Sidebar */}
      <div className="demo-sidebar">
        {['heart','alert','brain','pill','chart','microscope','shield','clipboard'].map((ic, i) => {
          const active = (scene === 'cockpit' && i === 0) || (scene === 'ddd-alert' && i === 1) || (scene === 'cascade' && i === 6) || (scene === 'discovery' && i === 5) || (scene === 'oracle' && i === 4) || (scene === 'consult' && i === 7)
          return (
            <div key={i} style={{ width:28, height:28, borderRadius:6, background: active ? '#6C7CFF15' : 'transparent', border: active ? '1px solid #6C7CFF30' : '1px solid transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Picto name={ic} size={14} glow={active} />
            </div>
          )
        })}
      </div>

      {/* Content area */}
      <div className="demo-content">
        {/* Registry */}
        {scene === 'registry' && (
          <div className="demo-fadein">
            <div style={{ fontSize:13, fontWeight:800, color:'#F0F2F5', marginBottom:12 }}>Registre patients</div>
            {[{ n:'Noah B.', a:'6 ans', s:'Épil. focale', v:23, c:'#10B981' }, { n:'Amara T.', a:'8 ans', s:'MOGAD', v:41, c:'#F5A623' }, { n:'Lucas R.', a:'14 ans', s:'Anti-NMDAR', v:62, c:'#F59E0B' }].map((p,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'8px 12px', background:'#111827', borderRadius:8, marginBottom:4, borderLeft:`3px solid ${p.c}` }}>
                <div style={{ flex:1 }}><span style={{ fontSize:11, fontWeight:700, color:'#F0F2F5' }}>{p.n}</span> <span style={{ fontSize:9, color:'#6B7280' }}>{p.a} · {p.s}</span></div>
                <span style={{ fontSize:16, fontWeight:900, color:p.c, fontFamily:'monospace' }}>{p.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* New patient button */}
        {scene === 'new-patient' && (
          <div className="demo-fadein">
            <div style={{ fontSize:13, fontWeight:800, color:'#F0F2F5', marginBottom:12 }}>Registre patients</div>
            <div style={{ padding:'10px 16px', background:'#6C7CFF15', border:'1px solid #6C7CFF30', borderRadius:8, textAlign:'center', color:'#6C7CFF', fontSize:11, fontWeight:700 }}>+ Nouvelle admission</div>
          </div>
        )}

        {/* Intake - Name */}
        {scene === 'intake-name' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#6C7CFF', letterSpacing:1, marginBottom:12 }}>ADMISSION — IDENTITÉ</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:9, color:'#6B7280', marginBottom:3 }}>Nom du patient</div>
              <div style={{ padding:'6px 10px', background:'#111827', borderRadius:6, border:'1px solid #6C7CFF30', color:'#F0F2F5', fontSize:12 }}>
                {typedText}<span className="demo-typing"> </span>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1 }}><div style={{ fontSize:9, color:'#6B7280', marginBottom:3 }}>Âge</div><div style={{ padding:'6px 10px', background:'#111827', borderRadius:6, border:'1px solid #1F2A40', color:'#F0F2F5', fontSize:12 }}>7 ans</div></div>
              <div style={{ flex:1 }}><div style={{ fontSize:9, color:'#6B7280', marginBottom:3 }}>Sexe</div><div style={{ padding:'6px 10px', background:'#111827', borderRadius:6, border:'1px solid #1F2A40', color:'#F0F2F5', fontSize:12 }}>F</div></div>
              <div style={{ flex:1 }}><div style={{ fontSize:9, color:'#6B7280', marginBottom:3 }}>Poids</div><div style={{ padding:'6px 10px', background:'#111827', borderRadius:6, border:'1px solid #1F2A40', color:'#F0F2F5', fontSize:12 }}>22 kg</div></div>
            </div>
          </div>
        )}

        {/* Intake - Vitals */}
        {scene === 'intake-vitals' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#EF4444', letterSpacing:1, marginBottom:12 }}>ADMISSION — NEUROLOGIE + VITALES</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[{ l:'GCS', v:'8/15', c:'#EF4444' }, { l:'Crises/24h', v:'6', c:'#EF4444' }, { l:'FC', v:'158 bpm', c:'#F59E0B' }, { l:'T°', v:'39.8°C', c:'#EF4444' }, { l:'SpO2', v:'93%', c:'#F59E0B' }, { l:'Pupilles', v:'Sluggish', c:'#F59E0B' }].map((v,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 8px', background:'#111827', borderRadius:4, borderLeft:`2px solid ${v.c}20` }}>
                  <span style={{ fontSize:9, color:'#6B7280' }}>{v.l}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:v.c, fontFamily:'monospace' }}>{v.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intake - Bio */}
        {scene === 'intake-bio' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#8B5CF6', letterSpacing:1, marginBottom:12 }}>ADMISSION — BIOLOGIE + LCR</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[{ l:'CRP', v:'95 mg/L', c:'#EF4444' }, { l:'Ferritine', v:'1200 µg/L', c:'#EF4444' }, { l:'WBC', v:'16 000', c:'#F59E0B' }, { l:'Lactate', v:'4.2', c:'#EF4444' }, { l:'LCR cellules', v:'20', c:'#F59E0B' }, { l:'LCR protéines', v:'0.9 g/L', c:'#F59E0B' }].map((v,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 8px', background:'#111827', borderRadius:4, borderLeft:`2px solid ${v.c}20` }}>
                  <span style={{ fontSize:9, color:'#6B7280' }}>{v.l}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:v.c, fontFamily:'monospace' }}>{v.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline running */}
        {scene === 'pipeline' && (
          <div className="demo-fadein" style={{ textAlign:'center', paddingTop:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#2FD1C8', letterSpacing:1, marginBottom:16 }}>PIPELINE EN COURS — 11 MOTEURS</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center', marginBottom:16 }}>
              {engines.map((e,i) => {
                const cols = ['#6C7CFF','#2FD1C8','#B96BFF','#A78BFA','#FFB347','#2ED573','#DC2626','#FF6B35','#10B981','#E879F9','#3B82F6']
                return <div key={i} className="demo-badge-pulse" style={{ animationDelay:`${i*200}ms`, padding:'4px 10px', borderRadius:6, background:`${cols[i]}15`, border:`1px solid ${cols[i]}25`, fontSize:8, fontWeight:800, color:cols[i], fontFamily:'monospace' }}>{e}</div>
              })}
            </div>
            <div style={{ fontSize:32, fontWeight:900, color:'#EF4444', fontFamily:'monospace' }}>VPS 88</div>
            <div style={{ fontSize:10, color:'#EF4444', fontWeight:700 }}>CRITIQUE</div>
          </div>
        )}

        {/* Cockpit */}
        {scene === 'cockpit' && (
          <div className="demo-fadein">
            <div style={{ padding:'8px 12px', background:'#FF6B3510', borderRadius:8, border:'1px solid #FF6B3525', marginBottom:10, fontSize:10, color:'#FF6B35', fontWeight:700 }}>
              <Picto name="alert" size={12} /> CASCADE ALERT — 1 risque critique
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <div style={{ flex:'0 0 70px', background:'#EF444415', borderRadius:10, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:8, color:'#EF4444', fontFamily:'monospace', fontWeight:700 }}>VPS</div>
                <div style={{ fontSize:24, fontWeight:900, color:'#EF4444', fontFamily:'monospace' }}>88</div>
              </div>
              <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
                {[{ l:'GCS', v:'8', c:'#EF4444' }, { l:'Crises', v:'6', c:'#EF4444' }, { l:'FC', v:'158', c:'#F59E0B' }, { l:'SpO2', v:'93%', c:'#F59E0B' }].map((r,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'2px 6px', background:'#111827', borderRadius:3, fontSize:8 }}>
                    <span style={{ color:'#6B7280' }}>{r.l}</span><span style={{ color:r.c, fontWeight:700, fontFamily:'monospace' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
              {['VPS','TDE','PVE','EWE','TPE','NCE','DDD','CAE'].map((e,i) => {
                const cols = ['#6C7CFF','#2FD1C8','#B96BFF','#A78BFA','#FFB347','#2ED573','#DC2626','#FF6B35']
                return <span key={i} style={{ padding:'2px 6px', borderRadius:4, background:`${cols[i]}12`, fontSize:7, fontWeight:800, color:cols[i], fontFamily:'monospace' }}>{e}</span>
              })}
            </div>
          </div>
        )}

        {/* DDD Alert */}
        {scene === 'ddd-alert' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#DC2626', letterSpacing:1, marginBottom:10 }}>DIAGNOSTIC DELAY DETECTOR</div>
            <div style={{ padding:'12px', background:'#DC262610', borderRadius:8, border:'1px solid #DC262620', marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#DC2626' }}><Picto name="warning" size={12} /> RETARD CRITIQUE — Immunothérapie</div>
              <div style={{ fontSize:9, color:'#E8EAF0', marginTop:4 }}>Fenêtre optimale {'<'} 48h. Délai actuel : 48h. 64% des cas : IVIG {'<'} 48h.</div>
            </div>
            <div style={{ padding:'8px', background:'#F59E0B08', borderRadius:6, borderLeft:'3px solid #F59E0B', fontSize:9, color:'#E8EAF0' }}>
              Anakinra (anti-IL-1) : fenêtre {'<'} 72h. Kenney-Jung 2016.
            </div>
          </div>
        )}

        {/* Cascade */}
        {scene === 'cascade' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#FF6B35', letterSpacing:1, marginBottom:10 }}>CASCADE ALERT ENGINE</div>
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              <div style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #6C7CFF20', background:'#111827', flex:1 }}>
                <input value="MEOPA" readOnly style={{ background:'transparent', border:'none', color:'#F0F2F5', fontSize:11, width:'100%' }} />
              </div>
              <div style={{ padding:'4px 12px', borderRadius:6, background:'#FF6B35', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center' }}>Analyser</div>
            </div>
            <div style={{ padding:'10px', background:'#EF444408', borderRadius:8, border:'1px solid #EF444420' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#EF4444' }}><Picto name="warning" size={12} /> CASCADE CRITIQUE : MEOPA × Prodrome FIRES</div>
              <div style={{ fontSize:8, color:'#9CA3AF', marginTop:4, lineHeight:1.5 }}>N2O abaisse le seuil convulsif. Enfant fébrile en neuroinflammation latente.</div>
              <div style={{ fontSize:8, color:'#FF6B35', marginTop:3 }}>→ Alternative : Emla + Paracétamol</div>
            </div>
          </div>
        )}

        {/* Discovery */}
        {scene === 'discovery' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#10B981', letterSpacing:1, marginBottom:10 }}>DISCOVERY ENGINE — PubMed</div>
            {['Anakinra for FIRES: early initiation in pediatric SE (2024)', 'Ketogenic diet as neuroprotector in FIRES (van Baalen 2023)', 'IL-1β pathway in febrile infection-related epilepsy (Lin 2021)'].map((a,i) => (
              <div key={i} style={{ padding:'6px 10px', background:'#111827', borderRadius:6, marginBottom:4, borderLeft:'2px solid #10B98120', fontSize:9, color:'#E8EAF0' }}>{a}</div>
            ))}
            <div style={{ marginTop:8, fontSize:11, fontWeight:700, color:'#EC4899', letterSpacing:1 }}>ClinicalTrials.gov</div>
            {['NCT05432109 — Anakinra in FIRES (Recruiting)', 'NCT06218430 — Tocilizumab pediatric SE (Phase 2)'].map((t2,i) => (
              <div key={i} style={{ padding:'6px 10px', background:'#111827', borderRadius:6, marginBottom:4, borderLeft:'2px solid #EC489920', fontSize:9, color:'#E8EAF0' }}>{t2}</div>
            ))}
          </div>
        )}

        {/* Oracle */}
        {scene === 'oracle' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#E879F9', letterSpacing:1, marginBottom:10 }}>ORACLE — SIMULATION H+72</div>
            {[{ l:'Standard', v:62, c:'#6C7CFF' }, { l:'Anakinra + KD', v:32, c:'#10B981' }, { l:'Expérimental', v:28, c:'#F5A623' }, { l:'Sans action', v:95, c:'#EF4444' }].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ width:80, fontSize:8, color:'#6B7280', textAlign:'right' }}>{s.l}</span>
                <div style={{ flex:1, height:14, background:'#111827', borderRadius:7, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${s.v}%`, background:`${s.c}30`, borderRadius:7 }} />
                </div>
                <span style={{ width:24, fontSize:9, fontWeight:700, color:s.c, fontFamily:'monospace' }}>{s.v}</span>
              </div>
            ))}
            <div style={{ textAlign:'center', marginTop:8, padding:'4px 8px', background:'#10B98108', borderRadius:6, fontSize:9, fontWeight:700, color:'#10B981' }}>Recommandation : Anakinra + Régime cétogène → VPS 32 à H+72</div>
          </div>
        )}

        {/* Consult */}
        {scene === 'consult' && (
          <div className="demo-fadein">
            <div style={{ fontSize:11, fontWeight:700, color:'#3B82F6', letterSpacing:1, marginBottom:10 }}>PULSAR CONSULT — BRIEF EXPERT</div>
            {['Résumé clinique', 'Chronologie', 'Biomarqueurs', 'Analyse 11 moteurs', 'Alerte retard', 'Projection Oracle'].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 6px', background:'#111827', borderRadius:3, marginBottom:2 }}>
                <div style={{ width:3, height:3, borderRadius:2, background:'#3B82F6' }} />
                <span style={{ fontSize:8, color:'#9CA3AF' }}>{s}</span>
              </div>
            ))}
            <div style={{ marginTop:8, padding:'6px 10px', background:'#3B82F608', borderRadius:6, borderLeft:'2px solid #3B82F6' }}>
              <div style={{ fontSize:8, fontWeight:700, color:'#3B82F6', marginBottom:3 }}>QUESTIONS URGENTES</div>
              <div style={{ fontSize:8, color:'#E8EAF0', lineHeight:1.5 }}>1. Immunothérapie malgré absence anticorps ?<br/>2. Anakinra pour FIRES suspecté ?</div>
            </div>
            <div style={{ marginTop:6, textAlign:'center' }}>
              <span style={{ padding:'4px 12px', borderRadius:4, background:'#3B82F6', color:'#fff', fontSize:9, fontWeight:700 }}>Copier le brief</span>
            </div>
          </div>
        )}

        {/* End */}
        {scene === 'end' && (
          <div className="demo-fadein" style={{ textAlign:'center', paddingTop:30 }}>
            <div style={{ fontSize:24, fontWeight:900, color:'#F0F2F5', marginBottom:8 }}>PULSAR</div>
            <div style={{ fontSize:11, color:'#6C7CFF', marginBottom:16 }}>11 moteurs · 30 000+ lignes · OpenFDA · PubMed · ClinicalTrials</div>
            <div style={{ fontSize:13, color:'#E8EAF0', fontStyle:'italic', maxWidth:350, margin:'0 auto', lineHeight:1.6 }}>
              Chaque minute gagnée peut sauver une vie.
            </div>
            <div style={{ marginTop:16, fontSize:10, color:'rgba(245,166,35,0.6)' }}>À la mémoire d'Alejandro</div>
          </div>
        )}
      </div>
    </div>
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

function DemoOverlay({ t, onClose }: { t: (fr: string, en: string) => string; onClose: () => void }) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [clicking, setClicking] = useState(false)

  const scene = SCENES[sceneIdx]
  const name = 'Léa M.'

  // Auto-advance scenes
  useEffect(() => {
    if (sceneIdx >= SCENES.length) return
    const timer = setTimeout(() => {
      if (sceneIdx < SCENES.length - 1) setSceneIdx(s => s + 1)
    }, scene.duration)
    return () => clearTimeout(timer)
  }, [sceneIdx, scene])

  // Typing animation for intake-name
  useEffect(() => {
    if (scene.id !== 'intake-name') { setTypedText(''); return }
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedText(name.substring(0, i))
      if (i >= name.length) clearInterval(interval)
    }, 150)
    return () => clearInterval(interval)
  }, [scene.id])

  // Click animation
  useEffect(() => {
    if (!scene.click) return
    const timer = setTimeout(() => {
      setClicking(true)
      setTimeout(() => setClicking(false), 400)
    }, scene.duration * 0.4)
    return () => clearTimeout(timer)
  }, [sceneIdx, scene])

  return (
    <>
      <style>{DEMO_STYLE}</style>
      <div className="demo-root">
        {/* App simulation */}
        <DemoApp scene={scene.id} typedText={typedText} />

        {/* Animated cursor */}
        <div className={`demo-cursor ${clicking ? 'clicking' : ''}`} style={{ left: `${scene.cursorX}%`, top: `${scene.cursorY}%` }}>
          <div className="demo-cursor-dot" />
          <div className="demo-cursor-click" />
        </div>

        {/* Narration bar */}
        <div className="demo-narration">
          <div className="demo-narration-text" key={sceneIdx}>{t(scene.narrationFr, scene.narrationEn)}</div>
          {/* Progress dots */}
          <div style={{ display:'flex', gap:3, justifyContent:'center', marginTop:6 }}>
            {SCENES.map((_, i) => (
              <div key={i} onClick={() => setSceneIdx(i)} style={{ width: i === sceneIdx ? 12 : 4, height:4, borderRadius:2, background: i <= sceneIdx ? '#6C7CFF' : '#1F2A40', cursor:'pointer', transition:'all 0.3s' }} />
            ))}
          </div>
        </div>

        {/* Close */}
        <button className="demo-close" onClick={onClose}>{t('Fermer', 'Close')} ✕</button>
      </div>
    </>
  )
}
