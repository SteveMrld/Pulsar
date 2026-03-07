'use client';
import { useEffect, useRef, useState } from 'react';

interface TEvent {
  date: string; label: string;
  type: 'admission'|'symptom'|'exam'|'treatment'|'milestone'|'alert';
  severity?: 'low'|'medium'|'high'|'critical';
  note?: string; engine?: string;
}

const TC: Record<string,string> = {
  admission:'#6C4DFF', symptom:'#EF4444', exam:'#3B82F6',
  treatment:'#10B981', milestone:'#F59E0B', alert:'#EF4444',
};
const TL: Record<string,string> = {
  admission:'ADMISSION', symptom:'SYMPTÔME', exam:'EXAMEN',
  treatment:'TRAITEMENT', milestone:'JALON', alert:'ALERTE',
};

const DEFAULT: TEvent[] = [
  { date:'J0', label:'Admission urgences', type:'admission', severity:'critical', note:'Convulsions réfractaires · 38.9°C' },
  { date:'J1', label:'IRM cérébrale', type:'exam', note:'Hypersignaux temporaux bilatéraux', engine:'VPS' },
  { date:'J1', label:'Ponction lombaire', type:'exam', note:'Pléiocytose 87 cellules · Protéines ↑', engine:'IntakeAnalyzer' },
  { date:'J2', label:'Lévétiracétam IV', type:'treatment', severity:'high', note:'40mg/kg bolus' },
  { date:'J3', label:'EEG continu', type:'exam', note:'Status epilepticus non convulsif', engine:'TDE' },
  { date:'J5', label:'FIRES H1 81%', type:'alert', severity:'critical', note:'Discovery Engine — hypothèse dominante', engine:'TDE' },
  { date:'J7', label:'Status epilepticus', type:'symptom', severity:'critical', note:'Réfractaire · Intubation' },
  { date:'J10', label:'Anakinra débuté', type:'treatment', note:'IL-1β bloqué · 2mg/kg/j SC', engine:'L4' },
  { date:'J14', label:'IL-6 normalisé', type:'milestone', note:'Marqueurs inflammatoires ↓ 60%' },
  { date:'J18', label:'Amélioration EEG', type:'milestone', note:'Réduction 60% crises · Extubation' },
];

interface Props { events?: TEvent[]; patientName?: string; }

export default function PatientTimeline({ events = DEFAULT, patientName }: Props) {
  const [visible, setVisible] = useState<number[]>([]);
  const [filter, setFilter] = useState('all');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      events.forEach((_, i) => setTimeout(() => setVisible(v => [...v, i]), i * 100));
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [events]);

  const types = ['all', ...Array.from(new Set(events.map(e => e.type)))];
  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  return (
    <div ref={ref} style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 16, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {patientName ? `Timeline — ${patientName}` : 'Chronologie clinique'}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', background: filter === t ? (TC[t] || '#6C4DFF') : '#1E293B', color: filter === t ? '#FFF' : '#475569', transition: 'all 0.2s' }}>
              {t === 'all' ? 'TOUT' : TL[t] || t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,#6C4DFF,#10B981)', borderRadius: 1, opacity: 0.4 }}/>
        {filtered.map((ev, i) => {
          const color = TC[ev.type] || '#64748B';
          const origIdx = events.indexOf(ev);
          const show = visible.includes(origIdx);
          return (
            <div key={i} style={{ marginBottom: 14, opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-10px)', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: -23, top: 3, width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80`, border: '2px solid #111827' }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569', background: '#1E293B', padding: '1px 7px', borderRadius: 4, flexShrink: 0 }}>{ev.date}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: ev.note ? 3 : 0 }}>
                    <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>{ev.label}</span>
                    {ev.severity === 'critical' && <span style={{ fontSize: 9, color: '#EF4444', background: '#EF444420', padding: '1px 6px', borderRadius: 8, border: '1px solid #EF444440', fontWeight: 700, letterSpacing: '0.08em' }}>CRITIQUE</span>}
                    {ev.engine && <span style={{ fontSize: 9, color: '#6C4DFF', background: '#6C4DFF15', padding: '1px 6px', borderRadius: 8, border: '1px solid #6C4DFF30' }}>{ev.engine}</span>}
                  </div>
                  {ev.note && <div style={{ fontSize: 11, color: '#475569' }}>{ev.note}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
