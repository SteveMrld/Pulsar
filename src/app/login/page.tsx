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
// DEMO OVERLAY — Vision complète de PULSAR
// 9 slides couvrant l'intégralité de la promesse
// ═══════════════════════════════════════════════════════════

const DEMO_SLIDES = [
  { titleFr: 'Registre patients', titleEn: 'Patient Registry', color: '#6C7CFF', descFr: '4 patients pédiatriques suivis en temps réel. Score VPS par couleur, syndrome, chambre, crises actives. Vue d\'ensemble instantanée pour le service.', descEn: '4 pediatric patients tracked in real time. Color-coded VPS score, syndrome, room, active seizures. Instant service overview.' },
  { titleFr: 'Cockpit — Monitoring temps réel', titleEn: 'Cockpit — Real-time Monitoring', color: '#EF4444', descFr: 'Pour chaque patient : VPS score en continu (0-100), GCS, pupilles, crises/24h, durée, type. Constantes vitales. Biomarqueurs (CRP, ferritine, WBC, lactate). LCR. Cytokines. Tout sur un seul écran, mis à jour en temps réel.', descEn: 'Per patient: continuous VPS score (0-100), GCS, pupils, seizures/24h, duration, type. Vitals. Biomarkers (CRP, ferritin, WBC, lactate). CSF. Cytokines. All on one screen, real-time updates.' },
  { titleFr: 'Cerveau — Heatmap & EEG', titleEn: 'Brain — Heatmap & EEG', color: '#EC4899', descFr: 'Cartographie cérébrale interactive : zones colorées selon l\'activité EEG, lésions IRM, biomarqueurs neuro (NSE, S100B, GFAP). Le cerveau de l\'enfant visualisé en temps réel.', descEn: 'Interactive brain map: colored zones based on EEG activity, MRI lesions, neuro biomarkers (NSE, S100B, GFAP). The child\'s brain visualized in real time.' },
  { titleFr: 'Pipeline — 10 moteurs IA', titleEn: 'Pipeline — 10 AI Engines', color: '#2FD1C8', descFr: 'VPS → TDE → PVE → EWE → TPE → NeuroCore → Discovery → Oracle → DDD → Consult. Chaque moteur enrichit le suivant. Alertes agrégées, recommandations prioritaires. 8 005 lignes de logique clinique.', descEn: 'VPS → TDE → PVE → EWE → TPE → NeuroCore → Discovery → Oracle → DDD → Consult. Each engine enriches the next. Aggregated alerts, priority recommendations. 8,005 lines of clinical logic.' },
  { titleFr: 'Alerte retard diagnostique', titleEn: 'Diagnostic Delay Alert', color: '#DC2626', descFr: 'Le garde-fou contre l\'inertie clinique. PULSAR compare le parcours réel du patient au parcours optimal (littérature evidence-based). Si l\'immunothérapie aurait dû être initiée il y a 48h — il le dit. 8 règles sourées (Gaspard 2015, Titulaer 2013, Dilena 2019).', descEn: 'The safeguard against clinical inertia. PULSAR compares the actual care path to the optimal one (evidence-based). If immunotherapy should have been started 48h ago — it says so. 8 sourced rules.' },
  { titleFr: 'Oracle — Simulation clinique', titleEn: 'Oracle — Clinical Simulation', color: '#E879F9', descFr: 'Le médecin simule le futur. 3-4 scénarios thérapeutiques projetés à H+6, H+12, H+24, H+72. VPS, risque de status réfractaire, probabilité de récupération neurologique. "Si IVIG : risque 34%. Si Rituximab : risque 19%."', descEn: 'The doctor simulates the future. 3-4 therapeutic scenarios projected at H+6, H+12, H+24, H+72. VPS, refractory status risk, neurological recovery probability.' },
  { titleFr: 'Discovery Engine — 4 niveaux', titleEn: 'Discovery Engine — 4 levels', color: '#10B981', descFr: 'N1 PatternMiner : corrélations statistiques (Pearson, k-means). N2 LiteratureScanner : PubMed temps réel, 10 requêtes. N3 HypothesisEngine : génération d\'hypothèses via Claude API. N4 TreatmentPathfinder : chemins thérapeutiques innovants + ClinicalTrials.gov.', descEn: 'L1 PatternMiner: statistical correlations (Pearson, k-means). L2 LiteratureScanner: real-time PubMed. L3 HypothesisEngine: hypothesis generation via Claude API. L4 TreatmentPathfinder: innovative treatment paths + ClinicalTrials.gov.' },
  { titleFr: 'Consult — Brief expert en 10s', titleEn: 'Consult — Expert brief in 10s', color: '#3B82F6', descFr: 'Un clic → dossier complet pour l\'expert. Timeline, biomarqueurs, traitements, analyse des 10 moteurs, alertes retard, projection Oracle. Questions auto-générées : "Faut-il initier Rituximab ?" "Transfert centre de référence ?" Prêt à envoyer. FR/EN.', descEn: 'One click → complete expert brief. Timeline, biomarkers, treatments, 10-engine analysis, delay alerts, Oracle projection. Auto-generated questions. Ready to send. FR/EN.' },
  { titleFr: 'Admission & Export', titleEn: 'Admission & Export', color: '#F5A623', descFr: 'Admission en 8 étapes validées : Source → Identité → Admission → Antécédents → Neuro → Bio → Imagerie → Synthèse. Export PDF, JSON, BibTeX. Audit trail complet. RBAC 5 rôles. Bilingue FR/EN. 95/95 tests validés.', descEn: 'Admission in 8 validated steps. Export PDF, JSON, BibTeX. Full audit trail. 5-role RBAC. Bilingual FR/EN. 95/95 tests passed.' },
]

function DemoMockup({ index }: { index: number }) {
  const s = { bg: '#111827', accent: DEMO_SLIDES[index].color }
  const c = s.accent

  if (index === 0) return ( // Patient Registry
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { name: 'Inès M.', age: '4 ans', synd: 'FIRES', vps: 78, room: 'Réa Neuro — Lit 3', sex: 'F', col: '#EF4444' },
        { name: 'Lucas R.', age: '14 ans', synd: 'Anti-NMDAR', vps: 62, room: 'Réa Neuro — Lit 7', sex: 'M', col: '#F59E0B' },
        { name: 'Amara T.', age: '8 ans', synd: 'MOGAD', vps: 41, room: 'Neuropéd. — Lit 12', sex: 'F', col: '#F5A623' },
        { name: 'Noah B.', age: '6 ans', synd: 'Épil. focale', vps: 23, room: 'Neuropéd. — Lit 5', sex: 'M', col: '#10B981' },
      ].map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${p.col}08`, borderRadius: 8, borderLeft: `3px solid ${p.col}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${p.col}20`, border: `2px solid ${p.col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: p.col }}>{p.sex}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F0F2F5' }}>{p.name} <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 9 }}>{p.age}</span></div>
            <div style={{ fontSize: 8, color: '#9CA3AF' }}>{p.synd} · {p.room}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: p.col, fontFamily: 'var(--p-font-mono)' }}>{p.vps}</div>
            <div style={{ fontSize: 7, color: p.col, fontWeight: 700 }}>VPS</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (index === 1) return ( // Cockpit
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: '0 0 90px', background: '#EF444415', border: '1px solid #EF444430', borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#EF4444', fontFamily: 'var(--p-font-mono)', fontWeight: 700 }}>VPS</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#EF4444', fontFamily: 'var(--p-font-mono)' }}>78</div>
          <div style={{ fontSize: 7, color: '#EF4444' }}>CRITIQUE</div>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[{ l: 'GCS', v: '7/15', c: '#EF4444' }, { l: 'Crises/24h', v: '12', c: '#F59E0B' }, { l: 'CRP', v: '145', c: '#EF4444' }, { l: 'Ferritine', v: '2400', c: '#EF4444' }, { l: 'FC', v: '152', c: '#F59E0B' }, { l: 'SpO2', v: '94%', c: '#F59E0B' }, { l: 'Temp', v: '39.2°', c: '#EF4444' }, { l: 'Lactate', v: '4.8', c: '#EF4444' }].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: `${r.c}08`, borderRadius: 4 }}>
              <span style={{ fontSize: 7, color: '#6B7280' }}>{r.l}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: r.c, fontFamily: 'var(--p-font-mono)' }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '6px 8px', background: '#EF444412', borderRadius: 6, borderLeft: '3px solid #EF4444' }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: '#EF4444' }}>🚨 3 alertes critiques · 5 recommandations</div>
        <div style={{ fontSize: 7, color: '#9CA3AF', marginTop: 2 }}>SE super-réfractaire · Immunothérapie recommandée · Anakinra à considérer</div>
      </div>
    </div>
  )

  if (index === 2) return ( // Brain
    <div style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #EC489940 0%, #8B5CF620 40%, #6C7CFF10 70%, transparent)', border: '1px solid #EC489930', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ fontSize: 8, color: '#EC4899', fontWeight: 700, textAlign: 'center' }}>Activité<br/>anormale</div>
        {[{ t: -20, l: 15, c: '#EF4444' }, { t: -10, l: 60, c: '#F59E0B' }, { t: 25, l: 10, c: '#EF4444' }, { t: 30, l: 55, c: '#EC4899' }].map((d, i) => (
          <div key={i} style={{ position: 'absolute', top: `${50+d.t}%`, left: `${d.l}%`, width: 6, height: 6, borderRadius: 3, background: d.c, boxShadow: `0 0 6px ${d.c}` }} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[{ l: 'EEG', v: 'Burst-suppression', c: '#EF4444' }, { l: 'IRM', v: 'Hypersignal T2 temporal', c: '#F59E0B' }, { l: 'NSE', v: '45 ng/mL ↑↑', c: '#EF4444' }, { l: 'S100B', v: '0.8 µg/L ↑', c: '#F59E0B' }, { l: 'GFAP', v: '12 ng/mL ↑↑', c: '#EF4444' }].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', background: `${r.c}08`, borderRadius: 4 }}>
            <span style={{ fontSize: 8, color: '#9CA3AF' }}>{r.l}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: r.c, fontFamily: 'var(--p-font-mono)' }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (index === 3) return ( // Pipeline
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
        {[{ n: 'VPS', c: '#6C7CFF' }, { n: 'TDE', c: '#2FD1C8' }, { n: 'PVE', c: '#B96BFF' }, { n: 'EWE', c: '#A78BFA' }, { n: 'TPE', c: '#FFB347' }, { n: 'Neuro', c: '#EC4899' }, { n: 'DISC', c: '#10B981' }, { n: 'ORACLE', c: '#E879F9' }, { n: 'DDD', c: '#DC2626' }, { n: 'CONSULT', c: '#3B82F6' }].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ padding: '3px 8px', borderRadius: 6, background: `${e.c}15`, border: `1px solid ${e.c}25` }}>
              <span style={{ fontSize: 7, fontWeight: 800, color: e.c, fontFamily: 'var(--p-font-mono)' }}>{e.n}</span>
            </div>
            {i < 9 && <span style={{ color: '#3A3A50', fontSize: 8 }}>→</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[{ l: 'Fichiers engines', v: '23' }, { l: 'Lignes logique', v: '8 005' }, { l: 'Tests validés', v: '95/95' }, { l: 'Align. littérature', v: '93%' }].map((k, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '5px', background: '#1A2035', borderRadius: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#2FD1C8', fontFamily: 'var(--p-font-mono)' }}>{k.v}</div>
            <div style={{ fontSize: 7, color: '#6B7280' }}>{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (index === 4) return ( // DDD
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ background: '#DC262612', border: '1px solid #DC262625', borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#DC2626' }}>🚨 RETARD DIAGNOSTIQUE CRITIQUE</div>
        <div style={{ fontSize: 8, color: '#E8EAF0', lineHeight: 1.5, marginTop: 4 }}>6 signaux compatibles encéphalite auto-immune/FIRES. 64% des cas similaires : immunothérapie {'<'} 48h. Délai actuel : J4.</div>
      </div>
      {[{ a: 'Immunothérapie 1ère ligne', d: '+48h', c: '#DC2626' }, { a: 'Panel anticorps complet', d: '+24h', c: '#DC2626' }, { a: 'Anakinra (anti-IL-1)', d: 'Fenêtre se ferme', c: '#F59E0B' }, { a: 'Ponction lombaire', d: 'Réalisée ✓', c: '#10B981' }].map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: `${r.c}08`, borderRadius: 5, borderLeft: `2px solid ${r.c}` }}>
          <span style={{ fontSize: 8, color: '#E8EAF0' }}>{r.a}</span>
          <span style={{ fontSize: 8, color: r.c, fontWeight: 700, fontFamily: 'var(--p-font-mono)' }}>{r.d}</span>
        </div>
      ))}
    </div>
  )

  if (index === 5) return ( // Oracle
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {[{ l: 'Standard', c: '#6C7CFF' }, { l: 'Immuno agressive', c: '#8B5CF6' }, { l: 'Expérimental', c: '#F5A623' }, { l: 'Sans action', c: '#EF4444' }].map((s, i) => (
          <span key={i} style={{ fontSize: 7, padding: '2px 6px', borderRadius: 99, background: `${s.c}15`, color: s.c, fontWeight: 700 }}>{s.l}</span>
        ))}
      </div>
      {[{ t: 'T0', a: 78, b: 78, c2: 78, no: 78 }, { t: 'H+6', a: 74, b: 68, c2: 65, no: 82 }, { t: 'H+24', a: 62, b: 48, c2: 42, no: 86 }, { t: 'H+72', a: 52, b: 35, c2: 28, no: 89 }].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ width: 26, fontSize: 7, color: '#6B7280', fontFamily: 'var(--p-font-mono)', textAlign: 'right' }}>{r.t}</span>
          <div style={{ flex: 1, height: 12, background: '#1A2035', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', height: '100%', width: `${r.no}%`, background: '#EF444425', borderRadius: 6 }} />
            <div style={{ position: 'absolute', height: '100%', width: `${r.a}%`, background: '#6C7CFF30', borderRadius: 6 }} />
            <div style={{ position: 'absolute', height: '100%', width: `${r.c2}%`, background: '#F5A62340', borderRadius: 6 }} />
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: 6, padding: '4px 8px', background: '#F5A62310', borderRadius: 6 }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: '#F5A623' }}>Recommandation : Expérimental — VPS 28 à H+72 (vs 89 sans action)</span>
      </div>
    </div>
  )

  if (index === 6) return ( // Discovery
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {[
        { n: 'N1', l: 'PatternMiner', c2: '#10B981', d: '3 corrélations significatives · z-score 2.5σ' },
        { n: 'N2', l: 'LiteratureScanner', c2: '#3B82F6', d: '7 articles PubMed · 2 essais NCT actifs' },
        { n: 'N3', l: 'HypothesisEngine', c2: '#8B5CF6', d: '"IL-1β/Ferritine pathway in FIRES" — confiance 78%' },
        { n: 'N4', l: 'TreatmentPathfinder', c2: '#EC4899', d: 'Anakinra ✓ · Ketogenic diet ✓ · Tocilizumab à évaluer' },
      ].map((lv, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 8px', background: `${lv.c2}08`, borderRadius: 6, borderLeft: `2px solid ${lv.c2}` }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: lv.c2, fontFamily: 'var(--p-font-mono)', minWidth: 18 }}>{lv.n}</span>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#E8EAF0' }}>{lv.l}</div>
            <div style={{ fontSize: 7, color: '#9CA3AF', marginTop: 1 }}>{lv.d}</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (index === 7) return ( // Consult
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 7, fontFamily: 'var(--p-font-mono)', color: '#3B82F6', letterSpacing: 1, fontWeight: 700 }}>PULSAR CONSULT — BRIEF EXPERT</div>
      {['Résumé clinique', 'Chronologie J0→J4', 'Examen neurologique', 'Biomarqueurs + cytokines', 'Traitements en cours', 'Analyse 10 moteurs', '⚠️ Alerte retard', 'Projection Oracle 72h'].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px', background: i === 6 ? '#DC262610' : '#1A2035', borderRadius: 4 }}>
          <div style={{ width: 3, height: 3, borderRadius: 2, background: i === 6 ? '#DC2626' : '#3B82F6' }} />
          <span style={{ fontSize: 7.5, color: i === 6 ? '#DC2626' : '#9CA3AF', fontWeight: i === 6 ? 700 : 400 }}>{s}</span>
        </div>
      ))}
      <div style={{ marginTop: 2, padding: '6px 8px', background: '#3B82F610', borderRadius: 6, borderLeft: '2px solid #3B82F6' }}>
        <div style={{ fontSize: 7, fontWeight: 700, color: '#3B82F6', marginBottom: 2 }}>QUESTIONS AUTO-GÉNÉRÉES</div>
        <div style={{ fontSize: 7, color: '#E8EAF0', lineHeight: 1.5 }}>
          1. [URGENT] Immunothérapie malgré absence confirmation anticorps ?<br/>
          2. [URGENT] Anakinra justifié pour FIRES suspecté ?<br/>
          3. [24H] Transfert centre de référence nécessaire ?
        </div>
      </div>
    </div>
  )

  // index === 8 — Admission & Export
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 7, fontFamily: 'var(--p-font-mono)', color: '#F5A623', letterSpacing: 1, fontWeight: 700 }}>INTAKE — 8 ÉTAPES VALIDÉES</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {['1. Source', '2. Identité', '3. Admission', '4. Antécédents', '5. Neurologie', '6. Biologie', '7. Imagerie', '8. Synthèse'].map((s, i) => (
          <div key={i} style={{ padding: '3px 6px', background: '#F5A62308', borderRadius: 4, fontSize: 7.5, color: i < 6 ? '#10B981' : '#F5A623', borderLeft: `2px solid ${i < 6 ? '#10B981' : '#F5A623'}` }}>
            {s} {i < 6 ? '✓' : ''}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        {[{ l: 'PDF', c2: '#EF4444' }, { l: 'JSON', c2: '#6C7CFF' }, { l: 'BibTeX', c2: '#10B981' }, { l: 'Brief FR/EN', c2: '#3B82F6' }].map((e, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px', background: `${e.c2}10`, borderRadius: 4, fontSize: 7, fontWeight: 700, color: e.c2 }}>{e.l}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        {[{ l: '5 rôles RBAC', c2: '#8B5CF6' }, { l: 'Audit trail', c2: '#F59E0B' }, { l: '95/95 tests', c2: '#10B981' }, { l: '100% FR/EN', c2: '#6C7CFF' }].map((k, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '4px', background: `${k.c2}08`, borderRadius: 4, fontSize: 7, color: k.c2 }}>{k.l}</div>
        ))}
      </div>
    </div>
  )
}

function DemoOverlay({ t, slide, setSlide, onClose }: { t: (fr: string, en: string) => string; slide: number; setSlide: (n: number) => void; onClose: () => void }) {
  const s = DEMO_SLIDES[slide]
  const total = DEMO_SLIDES.length

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ maxWidth: 440, width: '100%', background: '#0C1424', borderRadius: 14, border: `1px solid ${s.color}30`, overflow: 'hidden', boxShadow: `0 0 40px ${s.color}15` }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${s.color}12`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 7, fontFamily: 'var(--p-font-mono)', color: s.color, letterSpacing: 1.5, fontWeight: 700 }}>PULSAR DEMO — {slide + 1}/{total}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F0F2F5', marginTop: 3 }}>{t(s.titleFr, s.titleEn)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Mockup */}
        <div style={{ background: '#111827', minHeight: 160 }}>
          <DemoMockup index={slide} />
        </div>

        {/* Description */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${s.color}08` }}>
          <p style={{ fontSize: 9.5, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>{t(s.descFr, s.descEn)}</p>
        </div>

        {/* Navigation */}
        <div style={{ padding: '10px 16px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0}
            style={{ padding: '5px 12px', borderRadius: 6, background: slide > 0 ? '#1A2035' : 'transparent', color: slide > 0 ? '#E8EAF0' : '#3A3A50', border: 'none', fontSize: 10, fontWeight: 600, cursor: slide > 0 ? 'pointer' : 'default' }}>
            ← {t('Précédent', 'Previous')}
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {DEMO_SLIDES.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 14 : 5, height: 5, borderRadius: 3, background: i === slide ? s.color : '#3A3A50', cursor: 'pointer', transition: 'all 0.3s ease' }} />
            ))}
          </div>
          {slide < total - 1 ? (
            <button onClick={() => setSlide(slide + 1)}
              style={{ padding: '5px 12px', borderRadius: 6, background: s.color, color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              {t('Suivant', 'Next')} →
            </button>
          ) : (
            <button onClick={onClose}
              style={{ padding: '5px 12px', borderRadius: 6, background: '#F5A623', color: '#000', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              {t('Fermer', 'Close')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
