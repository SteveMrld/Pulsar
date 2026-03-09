'use client';
export default function VersionBadge() {
  return (
    <div style={{
      position: 'fixed', bottom: 72, right: 24, zIndex: 998,
      fontFamily: 'monospace', fontSize: 10,
      color: 'rgba(255,255,255,0.25)',
      letterSpacing: '0.08em',
      pointerEvents: 'none',
    }}>
      PULSAR v21.4 · β
    </div>
  );
}
