'use client';
import { useEffect, useRef, useState } from 'react';

interface TimelineEvent {
  date: string;
  label: string;
  type: 'admission' | 'symptom' | 'exam' | 'treatment' | 'milestone';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  note?: string;
}

const TYPE_COLOR: Record<string, string> = {
  admission: '#6C4DFF',
  symptom: '#EF4444',
  exam: '#3B82F6',
  treatment: '#10B981',
  milestone: '#F59E0B',
};

const DEFAULT_EVENTS: TimelineEvent[] = [
  { date: 'J0', label: 'Admission urgences', type: 'admission', severity: 'critical', note: 'Convulsions réfractaires' },
  { date: 'J1', label: 'IRM cérébrale', type: 'exam', note: 'Hypersignaux temporaux' },
  { date: 'J2', label: 'Ponction lombaire', type: 'exam', note: 'Pléiocytose 87 cellules' },
  { date: 'J3', label: 'Lévétiracétam IV', type: 'treatment', severity: 'high' },
  { date: 'J7', label: 'Status epilepticus', type: 'symptom', severity: 'critical', note: 'EEG continu activé' },
  { date: 'J10', label: 'Anakinra débuté', type: 'treatment', severity: 'medium', note: 'IL-1β bloqué' },
  { date: 'J18', label: 'Amélioration EEG', type: 'milestone', note: 'Réduction 60% crises' },
];

interface Props {
  events?: TimelineEvent[];
  patientName?: string;
}

export default function PatientTimeline({ events = DEFAULT_EVENTS, patientName }: Props) {
  const [visible, setVisible] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        events.forEach((_, i) => {
          setTimeout(() => setVisible(v => [...v, i]), i * 120);
        });
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [events]);

  return (
    <div ref={ref} style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 16, padding: '24px 20px' }}>
      <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
        {patientName ? `Timeline — ${patientName}` : 'Chronologie clinique'}
      </div>
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#1E293B', borderRadius: 1 }}/>
        {events.map((ev, i) => {
          const color = TYPE_COLOR[ev.type] || '#64748B';
          const isVisible = visible.includes(i);
          return (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              marginBottom: 16,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
              transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: -21,
                top: 4,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}80`,
                border: '2px solid #111827',
                flexShrink: 0
              }}/>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569', background: '#1E293B', padding: '1px 6px', borderRadius: 4 }}>{ev.date}</span>
                  <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>{ev.label}</span>
                  {ev.severity === 'critical' && (
                    <span style={{ fontSize: 10, color: '#EF4444', background: '#EF444420', padding: '1px 6px', borderRadius: 10, border: '1px solid #EF444440' }}>CRITIQUE</span>
                  )}
                </div>
                {ev.note && <div style={{ fontSize: 12, color: '#64748B', paddingLeft: 2 }}>{ev.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
