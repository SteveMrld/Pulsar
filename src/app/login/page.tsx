'use client'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) setShowDemo(true)
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
        {showDemo && <DemoOverlay t={t} slide={demoSlide} setSlide={setDemoSlide} onClose={() => { setShowDemo(false); setDemoSlide(0) }} />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// DEMO — Autoplay, rich mockups, full PULSAR showcase
// ═══════════════════════════════════════════════════════════

const DEMO_SLIDES = [
  { titleFr: 'Registre patients', titleEn: 'Patient Registry', color: '#6C7CFF' },
  { titleFr: 'Cockpit — Monitoring temps réel', titleEn: 'Cockpit — Real-time Monitoring', color: '#EF4444' },
  { titleFr: 'Profil patient — Organes & Vitales', titleEn: 'Patient Profile — Organs & Vitals', color: '#EC4899' },
  { titleFr: 'Pipeline — 10 moteurs IA', titleEn: 'Pipeline — 10 AI Engines', color: '#2FD1C8' },
  { titleFr: 'Alerte retard diagnostique', titleEn: 'Diagnostic Delay Alert', color: '#DC2626' },
  { titleFr: 'Oracle — Simulation clinique', titleEn: 'Oracle — Clinical Simulation', color: '#E879F9' },
  { titleFr: 'Cerveau — Heatmap & EEG', titleEn: 'Brain — Heatmap & EEG', color: '#EC4899' },
  { titleFr: 'Discovery Engine — 4 niveaux', titleEn: 'Discovery Engine — 4 levels', color: '#10B981' },
  { titleFr: 'Consult — Brief expert en 10s', titleEn: 'Consult — Expert Brief in 10s', color: '#3B82F6' },
  { titleFr: 'Admission & Export', titleEn: 'Admission & Export', color: '#F5A623' },
]

const DEMO_CSS = `
  .demo-overlay { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; }
  .demo-bg-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.2; z-index:0; }
  .demo-bg-overlay { position:absolute; inset:0; background:radial-gradient(ellipse at 50% 50%, rgba(6,10,20,0.85) 0%, rgba(6,10,20,0.95) 70%); z-index:1; }
  .demo-card { position:relative; z-index:2; max-width:480px; width:calc(100% - 32px); border-radius:16px; overflow:hidden; }
  .demo-header { padding:14px 18px 10px; display:flex; justify-content:space-between; align-items:center; }
  .demo-mockup { min-height:220px; padding:0; }
  .demo-desc { padding:12px 18px; font-size:10px; line-height:1.6; }
  .demo-nav { padding:10px 18px 14px; display:flex; justify-content:space-between; align-items:center; }
  .demo-progress { position:absolute; top:0; left:0; height:2px; transition:width 0.3s linear; }
  @keyframes demoSlideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  .demo-slide-enter { animation: demoSlideIn 0.4s ease; }
`

function DemoMockup({ index }: { index: number }) {
  if (index === 0) return ( // Patient Registry
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[
        { name: 'Inès M.', age: '4 ans', synd: 'FIRES', vps: 78, room: 'Réa Neuro — Lit 3', col: '#EF4444', status: 'SE super-réfractaire · J4' },
        { name: 'Lucas R.', age: '14 ans', synd: 'Anti-NMDAR', vps: 62, room: 'Réa Neuro — Lit 7', col: '#F59E0B', status: 'Immunothérapie J2' },
        { name: 'Amara T.', age: '8 ans', synd: 'MOGAD', vps: 41, room: 'Neuropéd. — Lit 12', col: '#F5A623', status: 'Stabilisation' },
        { name: 'Noah B.', age: '6 ans', synd: 'Épil. focale', vps: 23, room: 'Neuropéd. — Lit 5', col: '#10B981', status: 'Monitoring EEG' },
      ].map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${p.col}08`, borderRadius: 10, borderLeft: `3px solid ${p.col}` }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${p.col}15`, border: `2px solid ${p.col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle, ${p.col}60 0%, ${p.col}20 70%)` }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F0F2F5' }}>{p.name} <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 9 }}>{p.age} · {p.synd}</span></div>
            <div style={{ fontSize: 8, color: '#6B7280', marginTop: 1 }}>{p.room} · {p.status}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: p.col, fontFamily: 'monospace' }}>{p.vps}</div>
            <div style={{ fontSize: 7, color: p.col, fontWeight: 700 }}>VPS</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (index === 1) return ( // Cockpit
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: '0 0 100px', background: 'linear-gradient(135deg, #EF444415, #EF444408)', border: '1px solid #EF444425', borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#EF4444', fontFamily: 'monospace', fontWeight: 700 }}>VPS SCORE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#EF4444', fontFamily: 'monospace', textShadow: '0 0 20px rgba(239,68,68,0.3)' }}>78</div>
          <div style={{ fontSize: 7, color: '#EF4444', fontWeight: 700, letterSpacing: 1 }}>CRITIQUE</div>
          <div style={{ width: '100%', height: 3, background: '#1A2035', borderRadius: 2, marginTop: 6 }}>
            <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)', borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {[{ l: 'GCS', v: '7/15', c: '#EF4444' }, { l: 'Crises/24h', v: '12', c: '#EF4444' }, { l: 'CRP', v: '145', c: '#EF4444' }, { l: 'Ferritine', v: '2400', c: '#EF4444' }, { l: 'FC', v: '152 bpm', c: '#F59E0B' }, { l: 'SpO2', v: '94%', c: '#F59E0B' }, { l: 'Temp', v: '39.2°', c: '#EF4444' }, { l: 'Lactate', v: '4.8', c: '#EF4444' }].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: `${r.c}06`, borderRadius: 4, borderLeft: `2px solid ${r.c}20` }}>
              <span style={{ fontSize: 7, color: '#6B7280' }}>{r.l}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: r.c, fontFamily: 'monospace' }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[{ t: '🚨 3 alertes critiques', c: '#EF4444' }, { t: '⚠️ 5 recommandations', c: '#F59E0B' }].map((a, i) => (
          <div key={i} style={{ flex: 1, padding: '5px 8px', background: `${a.c}08`, borderRadius: 6, borderLeft: `2px solid ${a.c}`, fontSize: 7, fontWeight: 700, color: a.c }}>{a.t}</div>
        ))}
      </div>
    </div>
  )

  if (index === 2) return ( // Patient profile with body/organs
    <div style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
      {/* Body silhouette with organ indicators */}
      <div style={{ width: 100, height: 180, position: 'relative', flexShrink: 0, background: 'linear-gradient(180deg, rgba(236,72,153,0.05) 0%, transparent 100%)', borderRadius: 12, border: '1px solid rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Silhouette */}
        <div style={{ width: 40, height: 140, position: 'relative' }}>
          {/* Head */}
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(236,72,153,0.4)', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: 'radial-gradient(circle, #EF444440 0%, transparent 70%)', animation: 'splashPulse 2s infinite' }} />
          </div>
          {/* Body */}
          <div style={{ width: 20, height: 60, margin: '4px auto 0', borderRadius: 10, border: '2px solid rgba(236,72,153,0.2)' }} />
          {/* Legs */}
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 2 }}>
            <div style={{ width: 8, height: 40, borderRadius: 4, border: '2px solid rgba(236,72,153,0.15)' }} />
            <div style={{ width: 8, height: 40, borderRadius: 4, border: '2px solid rgba(236,72,153,0.15)' }} />
          </div>
        </div>
        {/* Organ indicators */}
        {[{ t: 8, l: 70, label: '🧠', c: '#EF4444' }, { t: 45, l: 75, label: '❤️', c: '#F59E0B' }, { t: 65, l: 72, label: '🫁', c: '#2FD1C8' }, { t: 85, l: 70, label: '🩸', c: '#8B5CF6' }].map((o, i) => (
          <div key={i} style={{ position: 'absolute', top: `${o.t}%`, left: o.l, display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ width: 4, height: 4, borderRadius: 2, background: o.c, boxShadow: `0 0 6px ${o.c}` }} />
            <span style={{ fontSize: 10 }}>{o.label}</span>
          </div>
        ))}
      </div>
      {/* Vitals panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#EC4899', fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>INÈS M. — FIRES — J4</div>
        {[
          { icon: '🧠', l: 'Neurologie', items: 'GCS 7 · Pupilles sluggish · 12 crises/24h', c: '#EF4444' },
          { icon: '❤️', l: 'Hémodynamique', items: 'FC 152 · PA 85/55 · SpO2 94% · T° 39.2', c: '#F59E0B' },
          { icon: '🫁', l: 'Respiratoire', items: 'FR 28 · Intubée · FiO2 40%', c: '#2FD1C8' },
          { icon: '🩸', l: 'Biologie', items: 'CRP 145 · Ferritine 2400 · Lactate 4.8', c: '#EF4444' },
          { icon: '💉', l: 'LCR', items: '85 cellules · Protéines 1.2 · Ab: pending', c: '#8B5CF6' },
          { icon: '🧬', l: 'Cytokines', items: 'IL-1β 78 · IL-6 340 · TNF-α 45', c: '#EC4899' },
        ].map((v, i) => (
          <div key={i} style={{ padding: '4px 8px', background: `${v.c}06`, borderRadius: 5, borderLeft: `2px solid ${v.c}20` }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: v.c }}>{v.icon} {v.l}</div>
            <div style={{ fontSize: 7, color: '#9CA3AF', marginTop: 1 }}>{v.items}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (index === 3) return ( // Pipeline
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginBottom: 10 }}>
        {[{ n: 'VPS', c: '#6C7CFF' }, { n: 'TDE', c: '#2FD1C8' }, { n: 'PVE', c: '#B96BFF' }, { n: 'EWE', c: '#A78BFA' }, { n: 'TPE', c: '#FFB347' }, { n: 'NEURO', c: '#EC4899' }, { n: 'DISC', c: '#10B981' }, { n: 'ORACLE', c: '#E879F9' }, { n: 'DDD', c: '#DC2626' }, { n: 'CONSULT', c: '#3B82F6' }].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ padding: '4px 8px', borderRadius: 6, background: `${e.c}12`, border: `1px solid ${e.c}20`, boxShadow: `0 0 8px ${e.c}10` }}>
              <span style={{ fontSize: 7, fontWeight: 800, color: e.c, fontFamily: 'monospace' }}>{e.n}</span>
            </div>
            {i < 9 && <span style={{ color: '#2A2A40', fontSize: 8 }}>→</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[{ l: 'Moteurs IA', v: '10', c: '#6C7CFF' }, { l: 'Lignes logique', v: '8 005', c: '#2FD1C8' }, { l: 'Tests validés', v: '95/95', c: '#10B981' }, { l: 'Alignement', v: '93%', c: '#F5A623' }, { l: 'Fichiers engines', v: '23', c: '#8B5CF6' }, { l: 'Pathologies', v: '5', c: '#EC4899' }].map((k, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '6px', background: `${k.c}08`, borderRadius: 8, border: `1px solid ${k.c}10` }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: k.c, fontFamily: 'monospace' }}>{k.v}</div>
            <div style={{ fontSize: 7, color: '#6B7280' }}>{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (index === 4) return ( // DDD
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ background: 'linear-gradient(135deg, #DC262610, #DC262605)', border: '1px solid #DC262620', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#DC2626' }}>🚨 RETARD DIAGNOSTIQUE CRITIQUE</div>
        <div style={{ fontSize: 8, color: '#E8EAF0', lineHeight: 1.6, marginTop: 4 }}>6 signaux compatibles encéphalite auto-immune/FIRES. Dans 64% des cas similaires, immunothérapie initiée {'<'} 48h. Délai actuel : J4 (+48h retard).</div>
      </div>
      {[{ a: 'Immunothérapie 1ère ligne', d: '+48h retard', c: '#DC2626', ref: 'Gaspard 2015' }, { a: 'Panel anticorps complet', d: '+24h retard', c: '#DC2626', ref: 'Graus 2016' }, { a: 'Anakinra (anti-IL-1)', d: 'Fenêtre se ferme', c: '#F59E0B', ref: 'Dilena 2019' }, { a: 'Ponction lombaire', d: 'Réalisée ✓', c: '#10B981', ref: '' }].map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: `${r.c}06`, borderRadius: 6, borderLeft: `3px solid ${r.c}` }}>
          <div>
            <span style={{ fontSize: 8.5, color: '#E8EAF0', fontWeight: 600 }}>{r.a}</span>
            {r.ref && <span style={{ fontSize: 7, color: '#6B7280', marginLeft: 6 }}>{r.ref}</span>}
          </div>
          <span style={{ fontSize: 8, color: r.c, fontWeight: 700, fontFamily: 'monospace' }}>{r.d}</span>
        </div>
      ))}
    </div>
  )

  if (index === 5) return ( // Oracle
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {[{ l: 'Standard', c: '#6C7CFF' }, { l: 'Immuno agressive', c: '#8B5CF6' }, { l: 'Expérimental', c: '#F5A623' }, { l: 'Sans action', c: '#EF4444' }].map((s, i) => (
          <span key={i} style={{ fontSize: 7, padding: '3px 8px', borderRadius: 99, background: `${s.c}12`, border: `1px solid ${s.c}20`, color: s.c, fontWeight: 700 }}>{s.l}</span>
        ))}
      </div>
      {[{ t: 'T0', a: 78, b: 78, c2: 78, no: 78 }, { t: 'H+6', a: 74, b: 68, c2: 65, no: 82 }, { t: 'H+24', a: 62, b: 48, c2: 42, no: 86 }, { t: 'H+72', a: 52, b: 35, c2: 28, no: 89 }].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ width: 28, fontSize: 7, color: '#6B7280', fontFamily: 'monospace', textAlign: 'right' }}>{r.t}</span>
          <div style={{ flex: 1, height: 14, background: '#0F1628', borderRadius: 7, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', height: '100%', width: `${r.no}%`, background: 'linear-gradient(90deg, #EF444420, #EF444430)', borderRadius: 7 }} />
            <div style={{ position: 'absolute', height: '100%', width: `${r.a}%`, background: 'linear-gradient(90deg, #6C7CFF25, #6C7CFF35)', borderRadius: 7 }} />
            <div style={{ position: 'absolute', height: '100%', width: `${r.c2}%`, background: 'linear-gradient(90deg, #F5A62330, #F5A62345)', borderRadius: 7 }} />
          </div>
          <span style={{ width: 20, fontSize: 7, color: '#6B7280', fontFamily: 'monospace' }}>{r.c2}</span>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: 8, padding: '6px 10px', background: '#F5A62308', borderRadius: 8, border: '1px solid #F5A62315' }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: '#F5A623' }}>⚡ Recommandation : Expérimental — VPS 28 à H+72 (vs 89 sans action)</span>
      </div>
    </div>
  )

  if (index === 6) return ( // Brain heatmap
    <div style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
      <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%, #EC489930 0%, #8B5CF615 35%, #6C7CFF08 60%, transparent 80%)', border: '1px solid #EC489920', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: '#EC4899', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>Activité<br/>anormale<br/><span style={{ fontSize: 7, color: '#6B7280' }}>temporal G</span></div>
        {[{ t: 20, l: 15, c: '#EF4444', s: 8 }, { t: 25, l: 65, c: '#F59E0B', s: 6 }, { t: 55, l: 10, c: '#EF4444', s: 7 }, { t: 50, l: 70, c: '#EC4899', s: 5 }, { t: 75, l: 40, c: '#8B5CF6', s: 4 }].map((d, i) => (
          <div key={i} style={{ position: 'absolute', top: `${d.t}%`, left: `${d.l}%`, width: d.s, height: d.s, borderRadius: d.s, background: d.c, boxShadow: `0 0 8px ${d.c}80` }} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#EC4899', fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>NEUROCORE</div>
        {[{ l: 'EEG', v: 'Burst-suppression', c: '#EF4444' }, { l: 'IRM', v: 'Hypersignal T2 temporal', c: '#F59E0B' }, { l: 'NSE', v: '45 ng/mL ↑↑', c: '#EF4444' }, { l: 'S100B', v: '0.8 µg/L ↑', c: '#F59E0B' }, { l: 'GFAP', v: '12 ng/mL ↑↑', c: '#EF4444' }, { l: 'NFL', v: '85 pg/mL ↑↑', c: '#DC2626' }].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', background: `${r.c}06`, borderRadius: 4, borderLeft: `2px solid ${r.c}15` }}>
            <span style={{ fontSize: 7.5, color: '#9CA3AF' }}>{r.l}</span>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: r.c, fontFamily: 'monospace' }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (index === 7) return ( // Discovery
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[
        { n: 'N1', l: 'PatternMiner', c2: '#10B981', d: '3 corrélations significatives · Pearson > 0.7 · z-score 2.5σ', icon: '📊' },
        { n: 'N2', l: 'LiteratureScanner', c2: '#3B82F6', d: '7 articles PubMed pertinents · 2 essais NCT actifs', icon: '📡' },
        { n: 'N3', l: 'HypothesisEngine', c2: '#8B5CF6', d: '"IL-1β/Ferritine pathway in FIRES" — confiance 78%', icon: '💡' },
        { n: 'N4', l: 'TreatmentPathfinder', c2: '#EC4899', d: 'Anakinra ✓ · Ketogenic diet ✓ · Tocilizumab à évaluer', icon: '🧬' },
      ].map((lv, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: `${lv.c2}06`, borderRadius: 8, borderLeft: `3px solid ${lv.c2}30` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 28 }}>
            <span style={{ fontSize: 12 }}>{lv.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 900, color: lv.c2, fontFamily: 'monospace' }}>{lv.n}</span>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#E8EAF0' }}>{lv.l}</div>
            <div style={{ fontSize: 7.5, color: '#9CA3AF', marginTop: 2 }}>{lv.d}</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (index === 8) return ( // Consult
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#3B82F6', letterSpacing: 1, fontWeight: 700, marginBottom: 2 }}>PULSAR CONSULT — BRIEF EXPERT</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {['Résumé clinique', 'Chronologie J0→J4', 'Examen neuro', 'Biomarqueurs', 'Traitements', 'Analyse 10 moteurs', '⚠️ Alerte retard', 'Projection Oracle'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: i === 6 ? '#DC262608' : '#0F1628', borderRadius: 4 }}>
            <div style={{ width: 3, height: 3, borderRadius: 2, background: i === 6 ? '#DC2626' : '#3B82F6' }} />
            <span style={{ fontSize: 7, color: i === 6 ? '#DC2626' : '#9CA3AF', fontWeight: i === 6 ? 700 : 400 }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, padding: '8px 10px', background: '#3B82F608', borderRadius: 8, borderLeft: '3px solid #3B82F630' }}>
        <div style={{ fontSize: 7, fontWeight: 700, color: '#3B82F6', marginBottom: 3 }}>QUESTIONS AUTO-GÉNÉRÉES POUR L'EXPERT</div>
        {['[URGENT] Immunothérapie malgré absence confirmation anticorps ?', '[URGENT] Anakinra justifié pour FIRES suspecté ?', '[24H] Transfert centre de référence neurologique ?'].map((q, i) => (
          <div key={i} style={{ fontSize: 7.5, color: '#E8EAF0', lineHeight: 1.5, padding: '2px 0' }}>{i+1}. {q}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        {['PDF', 'JSON', 'Email', 'FR/EN'].map((f, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '3px', background: '#3B82F608', borderRadius: 4, fontSize: 7, color: '#3B82F6', fontWeight: 600 }}>{f}</div>
        ))}
      </div>
    </div>
  )

  // index === 9 — Admission & Export
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#F5A623', letterSpacing: 1, fontWeight: 700 }}>INTAKE — 8 ÉTAPES VALIDÉES</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {['1. Source', '2. Identité', '3. Admission', '4. Antécédents', '5. Neurologie', '6. Biologie', '7. Imagerie', '8. Synthèse'].map((s, i) => (
          <div key={i} style={{ padding: '4px 6px', background: i < 6 ? '#10B98106' : '#F5A62306', borderRadius: 4, borderLeft: `2px solid ${i < 6 ? '#10B98125' : '#F5A62325'}`, fontSize: 7.5, color: i < 6 ? '#10B981' : '#F5A623' }}>
            {s} {i < 6 ? '✓' : ''}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginTop: 2 }}>
        {[{ l: 'Export PDF/JSON/BibTeX', c: '#6C7CFF' }, { l: 'Audit trail complet', c: '#F59E0B' }, { l: '5 rôles RBAC', c: '#8B5CF6' }, { l: 'Bilingue FR/EN 100%', c: '#2FD1C8' }, { l: 'Supabase + RLS', c: '#10B981' }, { l: '95/95 tests passés', c: '#10B981' }].map((k, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '4px', background: `${k.c}06`, borderRadius: 4, border: `1px solid ${k.c}10`, fontSize: 7, color: k.c, fontWeight: 600 }}>{k.l}</div>
        ))}
      </div>
    </div>
  )
}

function DemoOverlay({ t, slide, setSlide, onClose }: { t: (fr: string, en: string) => string; slide: number; setSlide: (n: number) => void; onClose: () => void }) {
  const s = DEMO_SLIDES[slide]
  const total = DEMO_SLIDES.length

  // Autoplay — advance every 5s
  useEffect(() => {
    if (slide >= total - 1) return
    const timer = setTimeout(() => {
      setSlide(slide + 1)
    }, 5000)
    return () => clearTimeout(timer)
  }, [slide, total, setSlide])

  return (
    <>
      <style>{DEMO_CSS}</style>
      <div className="demo-overlay" onClick={onClose}>
        {/* Background video */}
        <video className="demo-bg-video" autoPlay muted loop playsInline src="/assets/videos/neural-bg.mp4" />
        <div className="demo-bg-overlay" />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', zIndex: 1,
            width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(108,124,255,0.4)' : 'rgba(245,166,35,0.3)',
            left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
            boxShadow: i % 2 === 0 ? '0 0 6px rgba(108,124,255,0.3)' : '0 0 6px rgba(245,166,35,0.2)',
          }} />
        ))}

        <div className="demo-card" style={{ background: 'linear-gradient(135deg, rgba(12,20,36,0.95), rgba(17,24,39,0.98))', border: `1px solid ${s.color}20`, boxShadow: `0 0 60px rgba(0,0,0,0.5), 0 0 30px ${s.color}08` }} onClick={e => e.stopPropagation()}>
          {/* Autoplay progress bar */}
          <div className="demo-progress" style={{ background: s.color, width: '100%', animation: 'none', transition: 'none' }}>
            <div style={{ height: '100%', background: s.color, animation: `demoProgress 5s linear`, width: '100%' }} />
          </div>

          <style>{`@keyframes demoProgress { from{width:0%} to{width:100%} }`}</style>

          {/* Header */}
          <div className="demo-header" style={{ borderBottom: `1px solid ${s.color}10` }}>
            <div>
              <div style={{ fontSize: 7, fontFamily: 'monospace', color: s.color, letterSpacing: 1.5, fontWeight: 700 }}>PULSAR DEMO — {slide + 1}/{total}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F0F2F5', marginTop: 3 }}>{t(s.titleFr, s.titleEn)}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
          </div>

          {/* Mockup */}
          <div className="demo-mockup demo-slide-enter" key={slide}>
            <DemoMockup index={slide} />
          </div>

          {/* Navigation */}
          <div className="demo-nav" style={{ borderTop: `1px solid ${s.color}08` }}>
            <button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0}
              style={{ padding: '5px 14px', borderRadius: 8, background: slide > 0 ? '#1A2035' : 'transparent', color: slide > 0 ? '#E8EAF0' : '#3A3A50', border: 'none', fontSize: 10, fontWeight: 600, cursor: slide > 0 ? 'pointer' : 'default' }}>
              ←
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              {DEMO_SLIDES.map((_, i) => (
                <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 16 : 5, height: 5, borderRadius: 3, background: i === slide ? s.color : i < slide ? `${s.color}60` : '#2A2A40', cursor: 'pointer', transition: 'all 0.3s ease' }} />
              ))}
            </div>
            {slide < total - 1 ? (
              <button onClick={() => setSlide(slide + 1)}
                style={{ padding: '5px 14px', borderRadius: 8, background: s.color, color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                →
              </button>
            ) : (
              <button onClick={onClose}
                style={{ padding: '5px 14px', borderRadius: 8, background: '#F5A623', color: '#000', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                {t('Fermer', 'Close')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
