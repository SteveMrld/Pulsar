'use client';
import { useEffect, useRef, useState } from 'react';
import EngineStatusBar from '@/components/EngineStatusBar';
import ResearchPulse from '@/components/ResearchPulse';
import AlertBadge from '@/components/AlertBadge';

function CountUp({ target, duration = 1600, suffix = '', color = '#F1F5F9' }: { target: number; duration?: number; suffix?: string; color?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - t, 3)) * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref} style={{ color }}>{val}{suffix}</span>;
}

const STATS = [
  { label: 'Patients actifs', value: 12, suffix: '', color: '#6C4DFF', sub: '3 en surveillance critique' },
  { label: 'Score H1 moyen', value: 67, suffix: '%', color: '#EF4444', sub: 'Neuroinflammation' },
  { label: 'Analyses 24h', value: 847, suffix: '', color: '#10B981', sub: 'Toutes engines' },
  { label: 'Publications', value: 47, suffix: '', color: '#3B82F6', sub: 'PubMed ce mois' },
];

const PATIENTS = [
  { id: 'ALE-001', name: 'Patient A.', age: 6, score: 81, status: 'critical', diag: 'FIRES', upd: '2 min' },
  { id: 'MAR-002', name: 'Patient M.', age: 11, score: 54, status: 'monitoring', diag: 'EAIS suspecté', upd: '18 min' },
  { id: 'LUC-003', name: 'Patient L.', age: 8, score: 31, status: 'stable', diag: 'Post-encéphalite', upd: '2h' },
];

const SC: Record<string,string> = { critical: '#EF4444', monitoring: '#F59E0B', stable: '#10B981' };

export default function DashboardStats() {
  return (
    <div style={{ background: '#0A0E1A', minHeight: '100vh', padding: '24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Dashboard</h1>
        <ResearchPulse compact />
      </div>
      <AlertBadge />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, margin: '20px 0' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 14, padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>
              <CountUp target={s.value} suffix={s.suffix} color={s.color} />
            </div>
            <div style={{ fontSize: 10, color: '#334155' }}>{s.sub}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: '100%', background: s.color, opacity: 0.25 }}/>
          </div>
        ))}
      </div>
      <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Patients actifs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PATIENTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#0A0E1A', borderRadius: 10, border: '1px solid #1E293B' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: SC[p.status], boxShadow: `0 0 6px ${SC[p.status]}`, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{p.name} <span style={{ fontWeight: 400, color: '#475569' }}>{p.age}ans</span></div>
                <div style={{ fontSize: 11, color: '#475569' }}>{p.diag}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: SC[p.status] }}>{p.score}%</div>
                <div style={{ fontSize: 10, color: '#334155' }}>{p.upd}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <EngineStatusBar />
    </div>
  );
}
