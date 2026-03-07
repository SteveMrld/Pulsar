'use client';
import { useEffect, useRef, useState } from 'react';
import PulsarLogo from '@/components/PulsarLogo';

interface Particle { id: number; progress: number; lane: number; }

const GROUPS = [
  { id: 'A', label: 'ANALYSER', color: '#3B82F6', engines: ['VPS', 'IntakeAnalyzer', 'PVE'], desc: 'Donnees patient' },
  { id: 'R', label: 'RAISONNER', color: '#6C4DFF', engines: ['TDE', 'EWE', 'CAE', 'TPE'], desc: 'Hypotheses & scoring' },
  { id: 'D', label: 'DECOUVRIR', color: '#10B981', engines: ['PatternMiner', 'LitScanner', 'HypothesisEng', 'PathFinder'], desc: 'Recherche & traitement' },
];

const FEATURES = [
  { icon: '[Neuro]', title: 'Diagnostic neurologique', desc: 'Hypotheses differentielles en temps reel — FIRES, EAIS, PIMS et 40+ pathologies' },
  { icon: '[Lab]', title: 'Discovery Engine', desc: '4 niveaux analyse : patterns, litterature, hypotheses, traitement cible' },
  { icon: '[Radar]', title: 'Research Lab', desc: 'CRON hebdomadaire — PubMed, essais cliniques, mise a jour automatique des scores' },
  { icon: '[Engine]', title: '12 moteurs actifs', desc: 'ANALYSER, RAISONNER, DECOUVRIR — pipeline complet en quelques secondes' },
];

const STATS = [
  { value: '44', label: 'Routes', color: '#6C4DFF' },
  { value: '12', label: 'Engines', color: '#10B981' },
  { value: '81%', label: 'H1 FIRES', color: '#EF4444' },
  { value: '47', label: 'PubMed', color: '#3B82F6' },
];

function EngineFlow() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(0);
  const pid = useRef(0);
  const raf = useRef<number>();

  useEffect(() => {
    const pulse = setInterval(() => setActive(a => (a + 1) % 3), 2200);
    const spawn = setInterval(() => {
      setParticles(p => [...p.filter(x => x.progress < 1.05), { id: pid.current++, progress: 0, lane: Math.random() }]);
    }, 350);
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setParticles(p => p.map(x => ({ ...x, progress: x.progress + dt * 0.16 })).filter(x => x.progress <= 1.1));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { clearInterval(pulse); clearInterval(spawn); if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const W = 700, H = 180;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <filter id="fglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="pglow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {[{ x1: 205, x2: 255 }, { x1: 445, x2: 495 }].map((c, i) => (
        <line key={i} x1={c.x1} y1={H / 2} x2={c.x2} y2={H / 2} stroke="#1E293B" strokeWidth="2"/>
      ))}
      {particles.map(p => {
        const x = 10 + p.progress * (W - 20);
        const y = H / 2 - 10 + p.lane * 20;
        const gi = p.progress < 0.33 ? 0 : p.progress < 0.66 ? 1 : 2;
        const color = GROUPS[gi]?.color || '#6C4DFF';
        const op = p.progress > 0.95 ? (1.05 - p.progress) * 20 : p.progress < 0.05 ? p.progress * 20 : 0.65;
        return <circle key={p.id} cx={x} cy={y} r="2" fill={color} opacity={op} filter="url(#pglow)"/>;
      })}
      {GROUPS.map((g, i) => {
        const cx = 103 + i * 247;
        const on = active === i;
        return (
          <g key={g.id}>
            <rect x={cx - 95} y={H / 2 - 68} width={190} height={136} rx={14}
              fill={on ? g.color + '18' : '#111827'}
              stroke={on ? g.color : '#1E293B'}
              strokeWidth={on ? 1.5 : 1}
              filter={on ? 'url(#fglow)' : undefined}
              style={{ transition: 'all 0.6s' }}
            />
            <text x={cx} y={H / 2 - 42} textAnchor="middle" fill={g.color} fontSize="11" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui">{g.label}</text>
            {g.engines.slice(0, 3).map((e, j) => (
              <text key={e} x={cx} y={H / 2 - 22 + j * 18} textAnchor="middle" fill={on ? '#64748B' : '#2D3748'} fontSize="9.5" fontFamily="system-ui" style={{ transition: 'all 0.6s' }}>{e}</text>
            ))}
            <text x={cx} y={H / 2 + 58} textAnchor="middle" fill="#2D3748" fontSize="9" fontFamily="system-ui">{g.desc}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function LandingHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div style={{ background: '#0A0E1A', minHeight: '100vh', color: '#F1F5F9' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#6C4DFF15', border: '1px solid #6C4DFF30', borderRadius: 20, padding: '5px 14px', marginBottom: 32, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C4DFF', boxShadow: '0 0 6px #6C4DFF' }}/>
          <span style={{ fontSize: 11, color: '#6C4DFF', letterSpacing: '0.08em' }}>En memoire d&apos;Alejandro R. — 2019–2025</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.8s 0.1s' }}>
          <PulsarLogo size="lg" />
        </div>

        <p style={{ fontSize: 18, color: '#64748B', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.2s' }}>
          Aide au diagnostic neurologique pediatrique.<br/>
          <span style={{ color: '#10B981' }}>12 moteurs</span>{' '}
          <span style={{ color: '#6C4DFF' }}>FIRES detecte en quelques secondes</span>
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.3s' }}>
          <a href="/patients" style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#6C4DFF,#4C35CC)', borderRadius: 12, color: '#FFF', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 24px #6C4DFF44' }}>
            Ouvrir un dossier patient
          </a>
          <a href="/lab" style={{ padding: '13px 28px', background: '#111827', border: '1px solid #1E293B', borderRadius: 12, color: '#94A3B8', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Research Lab
          </a>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 48, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.4s' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(180deg,#0F1629 0%,#111827 100%)', border: '1px solid #1E293B', borderRadius: 20, padding: '28px 20px', marginBottom: 48, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.5s' }}>
          <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>Architecture — flux temps reel</div>
          <EngineFlow />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 60, opacity: mounted ? 1 : 0, transition: 'opacity 0.8s 0.6s' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 14, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6C4DFF', marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.7 }}>
            PULSAR a ete concu apres le cas d&apos;Alejandro R., diagnostique FIRES en 2025.<br/>
            <span style={{ color: '#475569' }}>Ce projet existe pour que chaque enfant recoive le bon diagnostic au bon moment.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
