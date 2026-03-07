'use client';
import { useEffect, useState } from 'react';

type AlertLevel = 'info' | 'warning' | 'critical';

interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  engine?: string;
  timestamp?: string;
}

const LEVEL_COLOR: Record<AlertLevel, string> = {
  info: '#3B82F6',
  warning: '#F59E0B',
  critical: '#EF4444',
};

const LEVEL_LABEL: Record<AlertLevel, string> = {
  info: 'INFO',
  warning: 'ALERTE',
  critical: 'CRITIQUE',
};

interface Props {
  alerts?: Alert[];
  maxVisible?: number;
}

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', level: 'critical', message: 'H1 FIRES > 80% — confirmation requise', engine: 'TDE', timestamp: 'Il y a 2 min' },
  { id: '2', level: 'warning', message: 'Marqueurs inflammatoires en hausse', engine: 'VPS', timestamp: 'Il y a 15 min' },
  { id: '3', level: 'info', message: '3 nouvelles publications PubMed indexées', engine: 'L2', timestamp: 'Il y a 1h' },
];

export default function AlertBadge({ alerts = DEFAULT_ALERTS, maxVisible = 3 }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = alerts.filter(a => !dismissed.includes(a.id)).slice(0, maxVisible);
  const criticalCount = visible.filter(a => a.level === 'critical').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {criticalCount > 0 && (
        <style>{`
          @keyframes criticalPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      )}
      {visible.map(alert => {
        const color = LEVEL_COLOR[alert.level];
        return (
          <div key={alert.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: color + '10',
            border: `1px solid ${color}30`,
            borderRadius: 10,
            padding: '10px 14px',
            animation: alert.level === 'critical' ? 'criticalPulse 2s ease-in-out infinite' : 'none',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}`,
              flexShrink: 0,
              marginTop: 5
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em' }}>{LEVEL_LABEL[alert.level]}</span>
                {alert.engine && <span style={{ fontSize: 10, color: '#475569', background: '#1E293B', padding: '1px 6px', borderRadius: 4 }}>{alert.engine}</span>}
                {alert.timestamp && <span style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>{alert.timestamp}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#CBD5E1' }}>{alert.message}</div>
            </div>
            <button
              onClick={() => setDismissed(d => [...d, alert.id])}
              style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}
            >×</button>
          </div>
        );
      })}
      {alerts.length - visible.length > 0 && (
        <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', padding: 4 }}>
          +{alerts.length - visible.length} alertes masquées
        </div>
      )}
    </div>
  );
}
