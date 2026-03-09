'use client'
import PulsarLogo from '@/components/PulsarLogo'
import { useLang, LangToggle } from '@/contexts/LanguageContext'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'
import dynamic from 'next/dynamic'
const DemoPlayer = dynamic(() => import('@/components/DemoPlayer'), { ssr: false })
import { startTour } from '@/components/GuidedTour'

/* ══════════════════════════════════════════════════════════════
   PULSAR — Splash cinématique
   ══════════════════════════════════════════════════════════════ */
const SPLASH_LETTERS = [
  { char: 'P', word: 'PEDIATRIC',    color: '#6C7CFF' },
  { char: 'U', word: 'UNIFIED',      color: '#2FD1C8' },
  { char: 'L', word: 'LEARNING',     color: '#10B981' },
  { char: 'S', word: 'SURVEILLANCE', color: '#B96BFF' },
  { char: 'A', word: 'ANALYSIS',     color: '#FFB347' },
  { char: 'R', word: 'RESPONSE',     color: '#FF6B35' },
]

const SPLASH_CSS = `
  .sp { position:fixed;inset:0;background:#04070F;display:flex;align-items:center;justify-content:center;z-index:9999;overflow:hidden;font-family:-apple-system,sans-serif; }
  .sp-bg { position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.2; }
  .sp-vig { position:absolute;inset:0;background:radial-gradient(ellipse 70% 70% at 50% 50%,transparent 30%,rgba(4,7,15,.95) 100%);pointer-events:none; }
  .sp-bar { position:absolute;bottom:0;left:0;height:1px;background:linear-gradient(90deg,#6C7CFF,#2FD1C8,#10B981);animation:sp-bar 10s linear forwards; }
  .sp-c { position:relative;z-index:2;text-align:center; }
  .sp-lb { animation:sp-up .85s cubic-bezier(.22,1,.36,1); }
  .sp-l { font-size:min(36vw,148px);font-weight:900;letter-spacing:-4px;line-height:1;color:#fff;filter:drop-shadow(0 0 60px rgba(108,124,255,.2)); }
  .sp-w { margin-top:6px;font-size:12px;letter-spacing:8px;opacity:.35;color:#fff;text-transform:uppercase;font-weight:300; }
  .sp-pul { font-size:min(26vw,120px);font-weight:900;letter-spacing:-3px;line-height:1;animation:sp-asm 1.3s cubic-bezier(.22,1,.36,1);background:linear-gradient(135deg,#6C7CFF,#9C6CFF,#2FD1C8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 40px rgba(108,124,255,.35)); }
  .sp-ring { position:absolute;top:50%;left:50%;border-radius:50%;border:1px solid rgba(108,124,255,.12);pointer-events:none;animation:sp-ring 1.6s cubic-bezier(.22,1,.36,1) both; }
  .sp-r1 { width:min(54vw,216px);height:min(54vw,216px);transform:translate(-50%,-50%); }
  .sp-r2 { width:min(70vw,280px);height:min(70vw,280px);transform:translate(-50%,-50%);border-color:rgba(108,124,255,.05);animation-delay:.18s; }
  .sp-txt { margin-top:34px;max-width:540px;margin-left:auto;margin-right:auto;padding:0 24px;animation:sp-up 1.4s cubic-bezier(.22,1,.36,1); }
  .sp-sub { font-size:11px;color:rgba(108,124,255,.65);letter-spacing:.16em;text-transform:uppercase;font-weight:600;margin:0 0 14px; }
  .sp-tag { font-size:min(3.8vw,16px);color:rgba(232,234,240,.85);line-height:1.75;margin:0;font-style:italic;font-weight:300; }
  .sp-mem { margin-top:24px;font-size:13px;color:#F5A623;letter-spacing:.1em;font-weight:400;animation:sp-mem 3s ease-in-out 1s infinite; }
  .sp-skip { position:absolute;bottom:22px;right:22px;background:transparent;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.35);padding:6px 14px;border-radius:16px;cursor:pointer;font-size:11px;z-index:3;letter-spacing:.05em;transition:all .2s; }
  .sp-skip:hover { border-color:rgba(255,255,255,.3);color:rgba(255,255,255,.75); }
  @keyframes sp-up  { from{opacity:0;transform:translateY(28px);filter:blur(12px)} to{opacity:1;transform:none;filter:none} }
  @keyframes sp-asm { from{transform:scale(.58);opacity:0;filter:blur(24px)} to{transform:scale(1);opacity:1;filter:none} }
  @keyframes sp-ring{ from{transform:translate(-50%,-50%) scale(.2);opacity:0} to{transform:translate(-50%,-50%) scale(1);opacity:1} }
  @keyframes sp-mem { 0%,100%{text-shadow:0 0 16px rgba(245,166,35,.35)} 50%{text-shadow:0 0 48px rgba(245,166,35,.7),0 0 80px rgba(245,166,35,.15)} }
  @keyframes sp-bar { from{width:0} to{width:100%} }
`

function PulsarSplash({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(-1)
  const [assembled, setAssembled] = useState(false)
  const [showText, setShowText] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    let ctx: AudioContext | null = null
    try {
      ctx = new AudioContext()
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 2.5)
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 11.5)
      g.connect(ctx.destination)
      ;[55, 82.41, 110, 164.81].forEach((f, i) => {
        const o = ctx!.createOscillator(), og = ctx!.createGain()
        o.type = i < 2 ? 'sine' : 'triangle'
        o.frequency.setValueAtTime(f, ctx!.currentTime)
        o.frequency.linearRampToValueAtTime(f * 1.002, ctx!.currentTime + 6)
        og.gain.setValueAtTime(i < 2 ? 0.36 : 0.11, ctx!.currentTime)
        o.connect(og); og.connect(g)
        o.start(); o.stop(ctx!.currentTime + 12)
      })
    } catch { /* noop */ }
    return () => { ctx?.close().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pulsar-splash-seen')) { onComplete(); return }
    let i = -1
    const iv = setInterval(() => {
      i++; setIndex(i)
      if (i === SPLASH_LETTERS.length) {
        clearInterval(iv)
        setTimeout(() => setAssembled(true), 650)
        setTimeout(() => setShowText(true), 1800)
        setTimeout(() => { sessionStorage.setItem('pulsar-splash-seen', '1'); onComplete() }, 11000)
      }
    }, 1450)
    return () => clearInterval(iv)
  }, [onComplete])

  const skip = () => { if (typeof window !== 'undefined') sessionStorage.setItem('pulsar-splash-seen', '1'); onComplete() }

  return (
    <>
      <style>{SPLASH_CSS}</style>
      <div className="sp">
        <video className="sp-bg" autoPlay muted loop playsInline src="/assets/videos/neural-bg.mp4" />
        <div className="sp-vig" />
        <div className="sp-bar" />
        {assembled && <><div className="sp-ring sp-r1" /><div className="sp-ring sp-r2" /></>}
        <div className="sp-c">
          {!assembled && index >= 0 && index < SPLASH_LETTERS.length && (
            <div className="sp-lb" key={index}>
              <div className="sp-l" style={{ color: SPLASH_LETTERS[index].color, filter: `drop-shadow(0 0 60px ${SPLASH_LETTERS[index].color}60)` }}>{SPLASH_LETTERS[index].char}</div>
              <div className="sp-w">{SPLASH_LETTERS[index].word}</div>
            </div>
          )}
          {assembled && <div className="sp-pul">PULSAR</div>}
          {showText && (
            <div className="sp-txt">
              <p className="sp-sub">{t('Intelligence clinique pédiatrique', 'Pediatric clinical intelligence')}</p>
              <p className="sp-tag">{t("Quand le cerveau d'un enfant s'enflamme,", "When a child's brain ignites,")}<br />{t("chaque seconde d'avance sauve une vie.", "every second ahead saves a life.")}</p>
              <p className="sp-mem">{t("À la mémoire d'Alejandro R. · 2019–2025", "In memory of Alejandro R. · 2019–2025")}</p>
            </div>
          )}
        </div>
        <button className="sp-skip" onClick={skip}>{t('Passer →', 'Skip →')}</button>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   PULSAR — Landing page
   ══════════════════════════════════════════════════════════════ */

const ENGINES = [
  { id: 'VPS', name: 'Vital Prognosis Score',       color: '#6C7CFF', desc: 'Score sévérité 0–100 · 4 champs sémantiques · 13 critères FIRES' },
  { id: 'TDE', name: 'Therapeutic Decision Engine', color: '#2FD1C8', desc: 'Escalade thérapeutique · FIRES · PIMS · MOGAD · anti-NMDAR' },
  { id: 'PVE', name: 'Pharmacovigilance Engine',    color: '#B96BFF', desc: 'Interactions critiques temps réel · polythérapie cardiotoxique' },
  { id: 'EWE', name: 'Early Warning Engine',        color: '#A78BFA', desc: 'Détection précoce · tendances vitales · pré-décompensation' },
  { id: 'TPE', name: 'Therapeutic Prospection',     color: '#FFB347', desc: 'Projection J+7/J+14 · recommandations anticipées' },
  { id: 'CAE', name: 'Cascade Alert Engine',        color: '#FF6B35', desc: 'Effets en chaîne · cascade cardiaque iatrogène' },
]

const DISCOVERY = [
  { n: 'L1', label: 'Pattern Mining',       color: '#10B981', detail: 'Pearson 34 params · k-means k=3 · z-score 2.5σ' },
  { n: 'L2', label: 'Literature Scanner',   color: '#3B82F6', detail: '100+ publications · 3 NCT actifs · veille PubMed live' },
  { n: 'L3', label: 'Hypothesis Engine',    color: '#8B5CF6', detail: 'Claude API · H1/H2/H3 · workflow validation' },
  { n: 'L4', label: 'Treatment Pathfinder', color: '#EC4899', detail: 'anakinra · tocilizumab · KD · rituximab · eligibility scoring' },
]

const CSS = `
  /* ── Layout ── */
  .lp { min-height:100vh; background:var(--p-bg); color:var(--p-text); }

  /* ── Nav ── */
  .lp-nav { display:flex; justify-content:space-between; align-items:center; padding:0 32px; height:60px; position:sticky; top:0; z-index:100; background:rgba(18,18,25,0.9); backdrop-filter:blur(24px) saturate(1.4); border-bottom:1px solid rgba(108,124,255,0.07); gap:12px; }
  .lp-logo { display:flex; align-items:center; gap:10px; flex-shrink:0; }
  .lp-logo-text { font-size:16px; font-weight:800; letter-spacing:.14em; white-space:nowrap; }
  .lp-nav-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .lp-btn { padding:7px 16px; border-radius:10px; font-size:12px; font-weight:600; text-decoration:none; cursor:pointer; border:none; transition:all .18s; white-space:nowrap; }
  .lp-btn-soft { background:transparent; color:var(--p-text-muted); }
  .lp-btn-soft:hover { color:var(--p-text); background:var(--p-bg-elevated); }
  .lp-btn-main { background:var(--p-vps); color:#fff; box-shadow:0 0 20px rgba(108,124,255,.2); }
  .lp-btn-main:hover { box-shadow:0 0 32px rgba(108,124,255,.4); transform:translateY(-1px); }
  @media (max-width:640px) {
    .lp-nav { padding:0 16px; }
    .lp-btn-soft { display:none; }
    .lp-btn { font-size:11px; padding:6px 12px; }
  }

  /* ── Sections ── */
  .lp-wrap { max-width:1000px; margin:0 auto; padding:0 48px; }
  .lp-hero { padding:40px 0 72px; text-align:center; }
  .lp-section { padding:72px 0; }
  .lp-section-alt { padding:64px 0; background:var(--p-bg-card); border-top:1px solid rgba(108,124,255,.06); border-bottom:1px solid rgba(108,124,255,.06); }

  /* ── Typography ── */
  .lp-eyebrow { font-family:var(--p-font-mono); font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--p-text-dim); margin-bottom:14px; }
  .lp-h1 { font-size:clamp(2rem,5vw,3.25rem); font-weight:900; line-height:1.12; letter-spacing:-1.5px; margin-bottom:20px; }
  .lp-h2 { font-size:clamp(1.4rem,3vw,1.9rem); font-weight:800; line-height:1.2; letter-spacing:-.5px; }
  .lp-lead { font-size:16px; color:var(--p-text-muted); line-height:1.78; font-weight:300; }

  /* ── Tags ── */
  .lp-badge { display:inline-flex; align-items:center; padding:4px 14px; border-radius:20px; font-family:var(--p-font-mono); font-size:10px; font-weight:700; letter-spacing:.1em; }

  /* ── Cards ── */
  .lp-card { border-radius:18px; padding:28px 28px; background:var(--p-bg-card); border:1px solid rgba(108,124,255,0.07); transition:border-color .2s,transform .2s; }
  .lp-card:hover { border-color:rgba(108,124,255,0.18); transform:translateY(-2px); }
  .lp-card-flat { border-radius:14px; padding:20px 22px; background:var(--p-bg-elevated); border:1px solid transparent; }

  /* ── Grids ── */
  .lp-g2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(420px,1fr)); gap:16px; }
  .lp-g3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; }
  .lp-g4 { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; }

  /* ── Engine row ── */
  .lp-eng { display:flex; align-items:center; gap:16px; padding:16px 20px; border-radius:12px; background:var(--p-bg-card); border:1px solid rgba(108,124,255,.06); border-left-width:2px; transition:background .15s; }
  .lp-eng:hover { background:var(--p-bg-elevated); }
  .lp-eng-id { font-family:var(--p-font-mono); font-size:12px; font-weight:900; min-width:38px; }
  .lp-eng-name { font-size:13px; font-weight:700; color:var(--p-text); }
  .lp-eng-desc { font-size:11px; color:var(--p-text-dim); margin-top:2px; font-family:var(--p-font-mono); }

  /* ── Stats bar ── */
  .lp-stats { display:flex; justify-content:space-around; flex-wrap:wrap; padding:28px 48px; border-top:1px solid rgba(108,124,255,.06); border-bottom:1px solid rgba(108,124,255,.06); background:var(--p-bg-card); }
  .lp-stat { text-align:center; padding:12px 20px; }
  .lp-stat-v { font-family:var(--p-font-mono); font-size:clamp(1.5rem,3vw,2rem); font-weight:900; letter-spacing:-1px; line-height:1; }
  .lp-stat-l { font-size:10.5px; color:var(--p-text-dim); text-transform:uppercase; letter-spacing:.1em; margin-top:4px; font-family:var(--p-font-mono); }

  /* ── Memorial ── */
  .lp-mem { padding:18px 0; text-align:center; border-bottom:1px solid rgba(245,166,35,.05); }
  .lp-mem-line { display:inline-flex; align-items:center; gap:12px; }
  .lp-mem-bar { width:56px; height:1px; }
  .lp-mem-text { font-size:12px; color:rgba(245,166,35,.6); font-style:italic; letter-spacing:.05em; }

  /* ── Divider ── */
  .lp-div { max-width:1000px; margin:0 auto; height:1px; background:rgba(108,124,255,.06); }

  /* ── CTA block ── */
  .lp-cta-box { border-radius:24px; padding:56px 48px; background:var(--p-bg-card); border:1px solid rgba(108,124,255,.1); max-width:700px; margin:0 auto; text-align:center; }

  /* ── Footer ── */
  .lp-foot { border-top:1px solid rgba(108,124,255,.06); padding:20px 48px; text-align:center; font-family:var(--p-font-mono); font-size:10.5px; color:var(--p-text-dim); }

  /* ── Animations ── */
  @keyframes lp-in { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
  .lp-a  { animation:lp-in .6s cubic-bezier(.22,1,.36,1) both; }
  .lp-a1 { animation-delay:.04s } .lp-a2 { animation-delay:.1s }
  .lp-a3 { animation-delay:.17s } .lp-a4 { animation-delay:.25s }
`

export default function LandingPage() {
  const { t } = useLang()
  const [splashDone, setSplashDone] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pulsar-splash-seen')) setSplashDone(true)
  }, [])

  if (!splashDone) return <PulsarSplash onComplete={() => setSplashDone(true)} />

  return (
    <>
      <style>{CSS}</style>
      <div className="lp">

        {/* ─── NAV ─── */}
        <nav className="lp-nav">
          <div className="lp-logo">
            
            <span className="lp-logo-text text-gradient-brand">PULSAR</span>
          </div>
          <div className="lp-nav-actions">
            <LangToggle />
          </div>
        </nav>

        {/* ─── MÉMORIAL ─── */}
        <div className="lp-mem">
          <div className="lp-mem-line">
            <div className="lp-mem-bar" style={{ background: 'linear-gradient(to right, transparent, rgba(245,166,35,.25))' }} />
            <span className="lp-mem-text">
              {t("À la mémoire d'Alejandro R. · 2019–2025", "In memory of Alejandro R. · 2019–2025")}
            </span>
            <div className="lp-mem-bar" style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,.25))' }} />
          </div>
        </div>

        {/* ─── HERO ─── */}
        <section className="lp-wrap lp-hero">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <span className="lp-badge lp-a lp-a1" style={{ background: 'rgba(108,124,255,.1)', color: '#6C7CFF', border: '1px solid rgba(108,124,255,.18)' }}>
              {t('Intelligence clinique', 'Clinical Intelligence')}
            </span>
            <span className="lp-badge lp-a lp-a1" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', border: '1px solid rgba(16,185,129,.14)' }}>
              {t('Recherche translationnelle', 'Translational Research')}
            </span>
          </div>

          <h1 className="lp-h1 lp-a lp-a2">
            {t("Quand le cerveau d'un enfant s'enflamme,", "When a child's brain ignites,")}<br />
            <span className="text-gradient-vps">
              {t("chaque seconde d'avance sauve une vie.", "every second ahead saves a life.")}
            </span>
          </h1>

          <p className="lp-lead lp-a lp-a3" style={{ maxWidth: 660, margin: '0 auto 40px' }}>
            {t(
              "FIRES, NORSE, anti-NMDAR, MOGAD, PIMS — des pathologies rares, mortelles, où chaque heure compte. PULSAR est le premier système d'intelligence artificielle entièrement dédié à ces urgences neurologiques pédiatriques.",
              "FIRES, NORSE, anti-NMDAR, MOGAD, PIMS — rare, deadly conditions where every hour matters. PULSAR is the first AI system entirely dedicated to pediatric neurological emergencies."
            )}
          </p>

          <div className="lp-a lp-a4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={startTour} style={{
              padding: '13px 32px', borderRadius: 10, border: '1px solid rgba(108,124,255,.35)',
              color: '#6C7CFF', background: 'rgba(108,124,255,.1)', cursor: 'pointer', fontSize: 15, fontWeight: 700, transition: 'all .18s'
            }}>{t('▶ Parcours guidé', '▶ Guided tour')}</button>
            <button onClick={() => setDemoOpen(true)} style={{
              padding: '13px 24px', borderRadius: 10, border: '1px solid rgba(245,166,35,.2)',
              color: '#F5A623', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all .18s'
            }}>{t('Voir la démo', 'View demo')}</button>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <div className="lp-stats">
          {[
            { v: '12',    l: t('Moteurs actifs', 'Active engines'),   c: '#6C7CFF' },
            { v: '95/95', l: t('Tests validés', 'Validated tests'),   c: '#10B981' },
            { v: '81%',   l: 'FIRES détecté H1',                     c: '#8B5CF6' },
            { v: '5',     l: t('Pathologies', 'Pathologies'),         c: '#FFB347' },
            { v: '34K+',  l: t('Lignes de code', 'Lines of code'),    c: '#2FD1C8' },
          ].map((s, i) => (
            <div key={i} className="lp-stat">
              <div className="lp-stat-v" style={{ color: s.c }}>{s.v}</div>
              <div className="lp-stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ─── NAVIGATION HUB ─── */}
        <section style={{ padding: '64px 48px 0' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--p-font-mono)', color: '#6C7CFF', letterSpacing: 3, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>
                {t('Par où commencer ?', 'Where to start?')}
              </div>
              <h2 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
                {t('Choisissez votre entrée', 'Choose your entry point')}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                {
                  href: '#',
                  color: '#6C7CFF',
                  icon: '▶',
                  label: t('Voir la démo', 'View demo'),
                  sub: t('Patient fictif. Tous les moteurs actifs. Parcours complet.', 'Fictional patient. All engines active. Full workflow.'),
                  tag: t('Démo live', 'Live demo'),
                  onClick: () => setDemoOpen(true),
                },
              ].map((card, i) => (
                <a key={i} href={(card as any).onClick ? '#' : card.href} onClick={(card as any).onClick} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--p-bg-card)',
                    borderRadius: 16,
                    border: `1px solid ${card.color}18`,
                    borderTop: `3px solid ${card.color}`,
                    padding: '22px 20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    height: '100%',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${card.color}18` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: 20, color: card.color }}>{card.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--p-font-mono)', color: card.color, background: `${card.color}12`, border: `1px solid ${card.color}20`, padding: '2px 8px', borderRadius: 4 }}>{card.tag}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--p-text)', marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--p-text-muted)', lineHeight: 1.6 }}>{card.sub}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section>
          <div className="lp-wrap lp-section">
            <div className="lp-g2">

              {/* Côté clinique */}
              <div className="glass-card" style={{ borderRadius: 20, padding: '36px 32px', borderTop: '2px solid #6C7CFF' }}>
                <div className="lp-eyebrow" style={{ color: '#6C7CFF' }}>{t('Côté clinique', 'Clinical side')}</div>
                <h2 className="lp-h2" style={{ marginBottom: 16 }}>
                  {t('Comprimer le délai entre', 'Compress the time between')}<br />
                  {t('le premier signal et', 'the first signal and')}{' '}
                  <span style={{ color: '#6C7CFF' }}>{t('la bonne décision', 'the right decision')}</span>
                </h2>
                <p style={{ fontSize: 13, color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
                  {t(
                    "Dans ces maladies, la différence entre séquelles et récupération se joue en heures. 12 moteurs qui pensent ensemble — sévérité, escalade, pharmacovigilance, alerte précoce, prospection — pour que chaque clinicien ait la puissance de décision du meilleur service au monde.",
                    "In these diseases, the difference between damage and recovery is measured in hours. 12 engines thinking together — severity, escalation, pharmacovigilance, early warning, prospection — so every clinician has world-class decision power."
                  )}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ENGINES.map(e => (
                    <span key={e.id} style={{
                      padding: '3px 10px', borderRadius: 8,
                      background: `${e.color}14`, border: `1px solid ${e.color}22`,
                      fontFamily: 'var(--p-font-mono)', fontSize: 10, fontWeight: 700, color: e.color
                    }}>{e.id}</span>
                  ))}
                </div>
              </div>

              {/* Côté recherche */}
              <div className="glass-card" style={{ borderRadius: 20, padding: '36px 32px', borderTop: '2px solid #10B981' }}>
                <div className="lp-eyebrow" style={{ color: '#10B981' }}>{t('Côté recherche', 'Research side')}</div>
                <h2 className="lp-h2" style={{ marginBottom: 16 }}>
                  {t('Chaque patient rend le système', 'Every patient makes the system')}{' '}
                  <span style={{ color: '#10B981' }}>{t('plus intelligent', 'smarter')}</span>{' '}
                  {t('pour le suivant', 'for the next one')}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
                  {t(
                    "Le Discovery Engine croise les données cliniques avec PubMed et ClinicalTrials.gov en temps réel, génère des hypothèses de recherche validables. L'enfant admis à Pointe-à-Pitre enrichit la décision pour l'enfant admis demain à Lyon.",
                    "The Discovery Engine cross-references clinical data with PubMed and ClinicalTrials.gov in real time, generating validatable research hypotheses. A child admitted in Pointe-à-Pitre enriches the decision for a child admitted tomorrow in Lyon."
                  )}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DISCOVERY.map(d => (
                    <span key={d.n} style={{
                      padding: '3px 10px', borderRadius: 8,
                      background: `${d.color}12`, border: `1px solid ${d.color}20`,
                      fontFamily: 'var(--p-font-mono)', fontSize: 10, fontWeight: 700, color: d.color
                    }}>{d.n} {d.label}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── MOTEURS ─── */}
        <section className="lp-section-alt">
          <div className="lp-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="lp-eyebrow">{t('Architecture · 12 moteurs actifs', 'Architecture · 12 active engines')}</div>
                <h2 className="lp-h2">
                  {t('Un vrai système.', 'A real system.')}{' '}
                  <span className="text-gradient-brand">{t('Pas un chatbot.', 'Not a chatbot.')}</span>
                </h2>
              </div>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: 11, color: 'var(--p-text-dim)' }}>
                95/95 {t('tests · 0 erreur', 'tests · 0 errors')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ENGINES.map(e => (
                <div key={e.id} className="lp-eng" style={{ borderLeftColor: e.color }}>
                  <span className="lp-eng-id" style={{ color: e.color }}>{e.id}</span>
                  <div>
                    <div className="lp-eng-name">{e.name}</div>
                    <div className="lp-eng-desc">{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* ENGINE FLOW illustration */}
            <div className="pulsar-illus-wrap" style={{ marginTop: 28, border: '1px solid rgba(108,124,255,0.15)' }}>
              <img src="/assets/illustrations/PULSAR_ENGINE_FLOW.png" alt="Flux des 12 moteurs PULSAR" />
              <div className="pulsar-illus-caption">{t('Flux de décision — 12 moteurs · temps réel', 'Decision flow — 12 engines · real time')}</div>
            </div>
          </div>
        </section>

        {/* ─── DISCOVERY ENGINE ─── */}
        <section>
          <div className="lp-wrap lp-section">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,.9fr)', gap: 48, alignItems: 'center' }}>

              {/* Texte gauche */}
              <div>
                <span className="lp-badge" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', border: '1px solid rgba(16,185,129,.14)', marginBottom: 16, display: 'inline-flex' }}>
                  DISCOVERY ENGINE v4.0
                </span>
                <h2 className="lp-h2" style={{ marginBottom: 16 }}>
                  {t('De la donnée clinique à', 'From clinical data to')}<br />
                  <span style={{ color: '#10B981' }}>{t("l'hypothèse de recherche", 'the research hypothesis')}</span>
                </h2>
                <p style={{ fontSize: 13, color: 'var(--p-text-muted)', lineHeight: 1.8, marginBottom: 24 }}>
                  {t(
                    "4 niveaux d'analyse en cascade. PubMed et ClinicalTrials.gov en temps réel. Génération d'hypothèses par intelligence artificielle. Export Brief FR/EN · JSON · BibTeX.",
                    "4 cascading levels of analysis. PubMed and ClinicalTrials.gov in real time. AI-powered hypothesis generation. Brief FR/EN · JSON · BibTeX export."
                  )}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['PubMed live', 'ClinicalTrials.gov', 'Claude API', 'TDE Enrichment'].map(tag => (
                    <span key={tag} style={{ padding: '4px 12px', borderRadius: 8, background: 'var(--p-bg-elevated)', border: '1px solid rgba(108,124,255,.1)', fontFamily: 'var(--p-font-mono)', fontSize: 10, color: 'var(--p-text-dim)' }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Niveaux droite */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DISCOVERY.map((d, i) => (
                  <div key={d.n} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 12,
                    background: 'var(--p-bg-card)',
                    border: `1px solid ${d.color}18`,
                    borderLeft: `3px solid ${d.color}`
                  }}>
                    <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: 15, fontWeight: 900, color: d.color, minWidth: 28 }}>{d.n}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--p-text)', marginBottom: 2 }}>{d.label}</div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 10, color: 'var(--p-text-dim)' }}>{d.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            {/* Discovery Funnel */}
            <div className="pulsar-illus-wrap" style={{ marginTop: 32, border: '1px solid rgba(16,185,129,0.15)' }}>
              <img src="/assets/illustrations/PULSAR_DISCOVERY_FUNNEL.png" alt="Discovery funnel" />
              <div className="pulsar-illus-caption">Entonnoir Discovery — L1→L4 · de la donnée brute à l&apos;hypothèse validée</div>
            </div>
          </div>
        </section>

        {/* ─── ÉPIDÉMIO ─── */}
        <section className="lp-section-alt">
          <div className="lp-wrap">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="lp-eyebrow" style={{ color: '#F5A623' }}>{t('Maladies neuro-inflammatoires pédiatriques', 'Pediatric neuroinflammatory diseases')}</div>
              <h2 className="lp-h2">{t('Le problème que personne', 'The problem no one')}<br />{t("n'a encore résolu", 'has solved yet')}</h2>
            </div>
            <div className="lp-g3">
              {[
                { v: '~30 000', l: t('enfants/an', 'children/year'), sub: t('touchés par des maladies neuro-inflammatoires dans le monde', 'affected by neuroinflammatory diseases worldwide'), c: '#8B5CF6' },
                { v: '12–30%',  l: t('mortalité',  'mortality'),     sub: t('dans les formes réfractaires — FIRES, NORSE, encéphalites', 'in refractory forms — FIRES, NORSE, encephalitis'), c: '#A78BFA' },
                { v: '90%',     l: t('séquelles',  'sequelae'),      sub: t('des survivants gardent des déficits cognitifs ou une épilepsie chronique', 'of survivors retain cognitive deficits or chronic epilepsy'), c: '#FFB347' },
              ].map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '32px 24px', borderRadius: 16,
                  background: `${s.c}07`, border: `1px solid ${s.c}1A`
                }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: 'clamp(1.7rem,3vw,2.1rem)', fontWeight: 900, color: s.c, lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--p-text)', marginBottom: 6 }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: 'var(--p-text-dim)', lineHeight: 1.55 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--p-font-mono)', fontSize: 10, color: 'var(--p-text-dim)' }}>
              FIRES · Anti-NMDAR · NORSE · PIMS · MOGAD/ADEM — {t('Sources : Epilepsia 2018 · Frontiers Neurology 2024 · NORD', 'Sources: Epilepsia 2018 · Frontiers Neurology 2024 · NORD')}
            </p>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section>
          <div className="lp-wrap lp-section">
            <div className="lp-cta-box">
              <h2 className="lp-h2" style={{ marginBottom: 14 }}>
                {t('La bonne information.', 'The right information.')}<br />
                {t('Au bon endroit.', 'In the right place.')}{' '}
                <span className="text-gradient-vps">{t('Au bon moment.', 'At the right time.')}</span>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--p-text-muted)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.75 }}>
                {t(
                  '95/95 tests validés · 12 moteurs actifs · Discovery Engine v4.0 · Veille PubMed live · Déployable dans tout centre hospitalier',
                  '95/95 validated tests · 12 active engines · Discovery Engine v4.0 · Live PubMed monitoring · Deployable in any hospital center'
                )}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={startTour} style={{
                  padding: '13px 32px', borderRadius: 10,
                  border: '1px solid rgba(108,124,255,.35)', color: '#6C7CFF',
                  background: 'rgba(108,124,255,.1)', cursor: 'pointer', fontSize: 15, fontWeight: 700
                }}>{t('▶ Parcours guidé', '▶ Guided tour')}</button>
                <button onClick={() => setDemoOpen(true)} style={{
                  padding: '13px 20px', borderRadius: 10,
                  border: '1px solid rgba(245,166,35,.2)', color: '#F5A623',
                  background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600
                }}>{t('Voir la démo', 'View demo')}</button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="lp-foot">
          PULSAR · {t('Intelligence clinique pédiatrique', 'Pediatric Clinical Intelligence')} · Discovery Engine v4.0 · 12 {t('moteurs', 'engines')} · © 2026 Steve Moradel
        </footer>

      </div>
      <DemoPlayer open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  )
}
