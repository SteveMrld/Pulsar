'use client';

interface VitalSign {
  label: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'critical';
}

interface SilhouetteNeonProps {
  patientName?: string;
  age?: number;
  gender?: 'M' | 'F';
  vitals?: {
    neuro?: VitalSign;
    cardio?: VitalSign;
    resp?: VitalSign;
    inflam?: VitalSign;
    temp?: VitalSign;
  };
  severity?: 'normal' | 'warning' | 'critical';
}

const STATUS_COLORS = {
  normal:   { main: '#10B981', glow: '16,185,129',  dot: '#34d399' },
  warning:  { main: '#f59e0b', glow: '245,158,11',  dot: '#fbbf24' },
  critical: { main: '#ef4444', glow: '239,68,68',   dot: '#f87171' },
};

function StatusDots({ status }: { status: 'normal' | 'warning' | 'critical' }) {
  const colors = {
    normal:   ['#10B981', '#1e293b', '#1e293b'],
    warning:  ['#f59e0b', '#f59e0b', '#1e293b'],
    critical: ['#ef4444', '#ef4444', '#ef4444'],
  }[status];
  return (
    <span style={{ display: 'flex', gap: 3 }}>
      {colors.map((c, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c,
          boxShadow: c !== '#1e293b' ? `0 0 5px ${c}` : 'none' }}/>
      ))}
    </span>
  );
}

function VitalPanel({ icon, label, vital }: { icon: string; label: string; vital?: VitalSign }) {
  const status = vital?.status ?? 'normal';
  const col = STATUS_COLORS[status];
  return (
    <div style={{
      background: 'rgba(5,12,24,0.88)', border: `1px solid ${col.main}44`,
      borderRadius: 8, padding: '7px 11px', width: 144, backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: col.main, fontFamily: 'monospace', letterSpacing: 1 }}>
          {icon} {label}
        </span>
        <StatusDots status={status}/>
      </div>
      {vital && (
        <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
          <span style={{ color: col.main, fontWeight: 600 }}>{vital.value}</span>
          {vital.unit && <span style={{ color: '#64748b' }}> {vital.unit}</span>}
          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{vital.label}</div>
        </div>
      )}
    </div>
  );
}

export default function SilhouetteNeon({
  patientName = 'Patient',
  age,
  gender = 'F',
  vitals = {},
  severity = 'normal',
}: SilhouetteNeonProps) {
  const sevColor = severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#10B981';

  // Hotspots positionnés sur la silhouette féminine (droite de l'image)
  // L'image contient 2 silhouettes : garçon gauche, fille droite
  // On affiche uniquement si gender='M' (garçon) ou 'F' (fille)
  // Pour PULSAR : on crop/positionne selon le genre
  const imgStyle = gender === 'M'
    ? { objectPosition: '20% center' }
    : { objectPosition: '75% center' };

  const hotspots = [
    { id: 'neuro',  top: '12%', left: gender === 'M' ? '28%' : '68%', status: vitals.neuro?.status  ?? 'normal' },
    { id: 'cardio', top: '36%', left: gender === 'M' ? '35%' : '62%', status: vitals.cardio?.status ?? 'normal' },
    { id: 'resp',   top: '33%', left: gender === 'M' ? '28%' : '56%', status: vitals.resp?.status   ?? 'normal' },
    { id: 'inflam', top: '48%', left: gender === 'M' ? '33%' : '63%', status: vitals.inflam?.status ?? 'normal' },
    { id: 'temp',   top: '60%', left: gender === 'M' ? '32%' : '62%', status: vitals.temp?.status   ?? 'normal' },
  ];

  return (
    <div style={{
      background: '#07111f', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 12,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
          PULSAR — VISUAL PHYSIOLOGY SYSTEM
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>
          {patientName}{age ? `, ${age} ans` : ''}
        </div>
        <div style={{
          display: 'inline-block', marginTop: 5, padding: '2px 10px', borderRadius: 20,
          background: `rgba(${STATUS_COLORS[severity].glow},0.15)`,
          border: `1px solid ${sevColor}55`,
          fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: sevColor, letterSpacing: 1,
        }}>
          {severity === 'critical' ? '● CRITIQUE' : severity === 'warning' ? '● VIGILANCE' : '● STABLE'}
        </div>
      </div>

      {/* Contenu : panneaux + image + panneaux */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Panneaux gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <VitalPanel icon="🧠" label="NEURO"  vital={vitals.neuro}/>
          <VitalPanel icon="❤️" label="CARDIO" vital={vitals.cardio}/>
          <VitalPanel icon="🫁" label="RESP"   vital={vitals.resp}/>
        </div>

        {/* Image silhouette avec hotspots */}
        <div style={{ position: 'relative', width: 220, height: 340, borderRadius: 12, overflow: 'hidden' }}>
          <img
            src="/assets/silhouette-neon.jpg"
            alt="Visual Physiology"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              ...imgStyle,
            }}
          />
          {/* Hotspots SVG overlay */}
          {hotspots.map(h => {
            const col = STATUS_COLORS[h.status];
            return (
              <div key={h.id} style={{
                position: 'absolute', top: h.top, left: h.left,
                transform: 'translate(-50%, -50%)',
                width: 18, height: 18,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: col.main,
                  boxShadow: `0 0 8px 3px rgba(${col.glow},0.6)`,
                  position: 'absolute', top: 4, left: 4,
                  animation: h.status === 'critical' ? 'pulse 1s infinite' : 'none',
                }}/>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `1.5px solid ${col.main}`,
                  opacity: 0.5, position: 'absolute', top: 0, left: 0,
                }}/>
              </div>
            );
          })}
          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.6;transform:translate(-50%,-50%) scale(1.3)} }`}</style>
        </div>

        {/* Panneaux droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <VitalPanel icon="🔥" label="INFLAM" vital={vitals.inflam}/>
          <VitalPanel icon="🌡️" label="TEMP"   vital={vitals.temp}/>
        </div>
      </div>
    </div>
  );
}
