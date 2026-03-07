'use client';
import { useEffect, useState } from 'react';

interface ResearchStatus {
  lastRun: string | null;
  nextRun: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  hypothesesUpdated: number;
  pubmedResults: number;
}

const CRON_DAY = 0; // Dimanche
const CRON_HOUR = 3;

function getNextCron(): Date {
  const now = new Date();
  const next = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(CRON_HOUR, 0, 0, 0);
  return next;
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

interface Props {
  compact?: boolean;
}

export default function ResearchPulse({ compact = false }: Props) {
  const [tick, setTick] = useState(0);
  const [status] = useState<ResearchStatus>({
    lastRun: 'Dimanche dernier 03:00',
    nextRun: getNextCron().toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
    status: 'idle',
    hypothesesUpdated: 3,
    pubmedResults: 47,
  });

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const msUntilNext = getNextCron().getTime() - Date.now();
  const pulseStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 0 0 #10B98144',
    animation: 'researchPulse 3s ease-out infinite',
    flexShrink: 0,
  };

  if (compact) {
    return (
      <>
        <style>{`
          @keyframes researchPulse {
            0% { box-shadow: 0 0 0 0 #10B98166; }
            70% { box-shadow: 0 0 0 10px #10B98100; }
            100% { box-shadow: 0 0 0 0 #10B98100; }
          }
        `}</style>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10B98115', border: '1px solid #10B98130', borderRadius: 20, padding: '5px 12px' }}>
          <div style={pulseStyle}/>
          <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>Research Lab actif</span>
          <span style={{ fontSize: 11, color: '#475569' }}>· {formatDuration(msUntilNext)}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes researchPulse {
          0% { box-shadow: 0 0 0 0 #10B98166; }
          70% { box-shadow: 0 0 0 10px #10B98100; }
          100% { box-shadow: 0 0 0 0 #10B98100; }
        }
      `}</style>
      <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 16, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={pulseStyle}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Research Lab Engine</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', background: '#1E293B', padding: '2px 8px', borderRadius: 10 }}>CRON dim. 03:00</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Prochain run', value: formatDuration(msUntilNext), color: '#6C4DFF' },
            { label: 'Dernier run', value: status.lastRun || '—', color: '#10B981' },
            { label: 'PubMed résultats', value: String(status.pubmedResults), color: '#3B82F6' },
            { label: 'Hypothèses maj', value: String(status.hypothesesUpdated), color: '#F59E0B' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#0A0E1A', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
