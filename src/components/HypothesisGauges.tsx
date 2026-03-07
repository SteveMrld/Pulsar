'use client';
import { useEffect, useRef, useState } from 'react';

interface Hypothesis {
  id: string;
  label: string;
  score: number;
  color: string;
  status: string;
  delay: number;
}

const DEFAULT_HYPOTHESES: Hypothesis[] = [
  { id: 'H1', label: 'FIRES', score: 81, color: '#EF4444', status: 'DOMINANT', delay: 0 },
  { id: 'H2', label: 'EAIS', score: 39, color: '#F59E0B', status: 'CONCURRENT', delay: 0.35 },
  { id: 'H3', label: 'PIMS', score: 23, color: '#3B82F6', status: 'MINORITAIRE', delay: 0.7 },
];

function Gauge({ h, animate }: { h: Hypothesis; animate: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      const start = performance.now();
      const duration = 1800;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setDisplayed(Math.round(easeOut(t) * h.score));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, h.delay * 1000);
    return () => { clearTimeout(timer); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate, h.score, h.delay]);

  const R = 54, cx = 70, cy = 70;
  const totalArc = Math.PI;
  const progress = animate ? (displayed / 100) * totalArc : 0;
  const toXY = (a: number) => ({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
  const s = toXY(Math.PI);
  const eT = toXY(2 * Math.PI);
  const eV = toXY(Math.PI + progress);
  const trackPath = `M ${s.x} ${s.y} A ${R} ${R} 0 1 1 ${eT.x} ${eT.y}`;
  const valuePath = progress > 0 ? `M ${s.x} ${s.y} A ${R} ${R} 0 ${progress > Math.PI ? 1 : 0} 1 ${eV.x} ${eV.y}` : '';

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        <defs>
          <filter id={`glow-${h.id}`}>
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d={trackPath} fill="none" stroke="#1E293B" strokeWidth="8" strokeLinecap="round"/>
        {valuePath && <path d={valuePath} fill="none" stroke={h.color} strokeWidth="8" strokeLinecap="round" filter={`url(#glow-${h.id})`}/>}
        <text x={cx} y={cy-4} textAnchor="middle" fill={h.color} fontSize="22" fontWeight="700" fontFamily="system-ui">{displayed}%</text>
        <text x={cx} y={cy+14} textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="system-ui">{h.label}</text>
      </svg>
      <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', color:h.color, background:h.color+'20', padding:'3px 10px', borderRadius:20, border:`1px solid ${h.color}40` }}>
        {h.id} · {h.status}
      </div>
    </div>
  );
}

export default function HypothesisGauges({ data = DEFAULT_HYPOTHESES }: { data?: Hypothesis[] }) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); obs.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ background:'#111827', border:'1px solid #1E293B', borderRadius:16, padding:'24px 20px' }}>
      <div style={{ fontSize:11, color:'#475569', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:20 }}>Hypothèses diagnostiques</div>
      <div style={{ display:'flex', gap:8, justifyContent:'space-around', flexWrap:'wrap' }}>
        {data.map(h => <Gauge key={h.id} h={h} animate={animate}/>)}
      </div>
    </div>
  );
}
