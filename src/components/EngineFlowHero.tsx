'use client';
import { useEffect, useRef, useState } from 'react';

const GROUPS = [
  { id: 'A', label: 'ANALYSER', color: '#3B82F6', engines: ['VPS', 'IntakeAnalyzer', 'PVE'], desc: 'Données patient' },
  { id: 'R', label: 'RAISONNER', color: '#6C4DFF', engines: ['TDE', 'EWE', 'CAE', 'TPE'], desc: 'Hypothèses & scoring' },
  { id: 'D', label: 'DÉCOUVRIR', color: '#10B981', engines: ['PatternMiner', 'LitScanner', 'HypothesisEng', 'PathFinder'], desc: 'Recherche & traitement' },
];

interface Particle { id: number; x: number; progress: number; lane: number; }

export default function EngineFlowHero() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(0);
  const raf = useRef<number>();
  const pid = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Pulse actif
    const pulse = setInterval(() => setActive(a => (a + 1) % 3), 2000);
    // Spawn particles
    const spawn = setInterval(() => {
      setParticles(p => [
        ...p.filter(x => x.progress < 1),
        { id: pid.current++, x: 0, progress: 0, lane: Math.random() }
      ]);
    }, 400);
    // Animate
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setParticles(p => p.map(x => ({ ...x, progress: x.progress + dt * 0.18 })).filter(x => x.progress <= 1.05));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { clearInterval(pulse); clearInterval(spawn); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [visible]);

  const W = 680, H = 200;

  return (
    <div ref={ref} style={{ background: 'linear-gradient(180deg, #0A0E1A 0%, #0F1629 100%)', borderRadius: 20, padding: '32px 24px', margin: '24px 0', position: 'relative', overflow: 'hidden', border: '1px solid #1E293B' }}>

      {/* Background grid */}
      <svg style={{ position:'absolute', inset:0, opacity:0.04, pointerEvents:'none' }} width="100%" height="100%">
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6C4DFF" strokeWidth="1"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      {/* Titre */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:11, color:'#475569', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>Architecture moteurs</div>
        <div style={{ fontSize:20, fontWeight:700, color:'#F1F5F9', letterSpacing:'-0.5px' }}>12 engines · 3 groupes · 1 décision</div>
      </div>

      {/* SVG flux animé */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', display:'block' }}>
        <defs>
          {GROUPS.map(g => (
            <filter key={g.id} id={`glow-${g.id}`}>
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
          <filter id="pglow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Connecteurs */}
        {[{x1:195,x2:245},{x1:435,x2:485}].map((c,i)=>(
          <g key={i}>
            <line x1={c.x1} y1={H/2} x2={c.x2} y2={H/2} stroke="#1E293B" strokeWidth="2"/>
            {[0,1,2].map(l=>{
              const progress = (particles.filter(p=>p.lane > l/3 && p.lane <= (l+1)/3)[0]?.progress || 0);
              const px = c.x1 + (c.x2 - c.x1) * Math.min(progress * 3, 1);
              if (px < c.x1 || px > c.x2) return null;
              return <circle key={l} cx={px} cy={H/2 - 6 + l*6} r="2.5" fill={GROUPS[i].color} opacity="0.9" filter="url(#pglow)"/>;
            })}
          </g>
        ))}

        {/* Particules sur tout le flux */}
        {particles.map(p => {
          const x = 10 + p.progress * (W - 20);
          const y = H/2 - 8 + p.lane * 16;
          const groupIdx = p.progress < 0.33 ? 0 : p.progress < 0.66 ? 1 : 2;
          const color = GROUPS[groupIdx]?.color || '#6C4DFF';
          const opacity = p.progress > 0.95 ? (1.05 - p.progress) * 20 : p.progress < 0.05 ? p.progress * 20 : 0.7;
          return <circle key={p.id} cx={x} cy={y} r="2" fill={color} opacity={opacity} filter="url(#pglow)"/>;
        })}

        {/* Groupes */}
        {GROUPS.map((g, i) => {
          const cx = 100 + i * 240;
          const isActive = active === i;
          return (
            <g key={g.id}>
              {/* Box */}
              <rect x={cx-90} y={H/2-60} width={180} height={120} rx={12}
                fill={isActive ? g.color+'18' : '#111827'}
                stroke={isActive ? g.color : '#1E293B'}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition:'all 0.5s' }}
                filter={isActive ? `url(#glow-${g.id})` : undefined}
              />
              {/* Label groupe */}
              <text x={cx} y={H/2-36} textAnchor="middle" fill={g.color} fontSize="11" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui">
                {g.label}
              </text>
              {/* Engines */}
              {g.engines.slice(0,3).map((e,j) => (
                <text key={e} x={cx} y={H/2 - 16 + j*18} textAnchor="middle" fill={isActive ? '#94A3B8' : '#334155'} fontSize="9" fontFamily="system-ui" style={{ transition:'all 0.5s' }}>
                  {e}
                </text>
              ))}
              {/* Desc */}
              <text x={cx} y={H/2+56} textAnchor="middle" fill="#334155" fontSize="9" fontFamily="system-ui">{g.desc}</text>
            </g>
          );
        })}
      </svg>

      {/* Stats bas */}
      <div style={{ display:'flex', justifyContent:'center', gap:32, marginTop:20 }}>
        {[['44 routes','#6C4DFF'],['12 engines','#10B981'],['H1 FIRES 81%','#EF4444']].map(([label,color])=>(
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, fontWeight:700, color }}>{label.split(' ')[0]}</div>
            <div style={{ fontSize:10, color:'#334155', letterSpacing:'0.05em' }}>{label.split(' ').slice(1).join(' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
