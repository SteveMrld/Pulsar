'use client';

/* ══════════════════════════════════════════════════════════════
   PULSAR Picto — SVG inline icons
   Clean, transparent, scalable, no sprite sheets
   ══════════════════════════════════════════════════════════════ */

interface PictoProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
  glowColor?: string;
}

// Map icon names to SVG path data (viewBox 0 0 24 24)
const SVG_ICONS: Record<string, { d: string; color: string }> = {
  brain:      { d: 'M12 2C9 2 7 4 7 6.5c0 1-.5 2-1.5 2.5C4 10 3 12 3 14c0 3 2.5 5 5.5 5 .5 0 1-.1 1.5-.2V22h4v-3.2c.5.1 1 .2 1.5.2 3 0 5.5-2 5.5-5 0-2-1-4-2.5-5C17.5 8.5 17 7.5 17 6.5 17 4 15 2 12 2zm-2 9c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1zm4 0c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1z', color: '#8B5CF6' },
  lungs:      { d: 'M12 4v14M8 7c-2 0-4 2-4 5s1 5 3 6c1 .5 2 0 3-1M16 7c2 0 4 2 4 5s-1 5-3 6c-1 .5-2 0-3-1', color: '#38BDF8' },
  heart:      { d: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', color: '#F43F5E' },
  thermo:     { d: 'M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0zM11.5 3.5a.5.5 0 011 0v8h-1v-8z', color: '#FB923C' },
  blood:      { d: 'M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z', color: '#DC2626' },
  dna:        { d: 'M7 4h10M7 8c1.5 2 3 3 5 3s3.5-1 5-3M7 16c1.5-2 3-3 5-3s3.5 1 5 3M7 20h10M7 4v16M17 4v16', color: '#A78BFA' },
  eeg:        { d: 'M2 12h3l2-4 3 8 2-6 2 4 3-6 2 4h3', color: '#6C7CFF' },
  virus:      { d: 'M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M19.07 4.93l-2.83 2.83m-8.48 8.48l-2.83 2.83M12 8a4 4 0 100 8 4 4 0 000-8z', color: '#34D399' },
  alert:      { d: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01', color: '#F59E0B' },
  pill:       { d: 'M10.5 1.5l-8 8a5 5 0 007 7l8-8a5 5 0 00-7-7zM6.5 12.5L17 2', color: '#10B981' },
  shield:     { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', color: '#6C7CFF' },
  clipboard:  { d: 'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m4-2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0a2 2 0 012-2h2zM8 12h8m-8 4h4', color: '#60A5FA' },
  chart:      { d: 'M18 20V10M12 20V4M6 20v-6', color: '#2FD1C8' },
  microscope: { d: 'M9 3h6l1 4H8L9 3zM8 7v3a4 4 0 008 0V7M9 16v3m6-3v3m-7 0h8M10 11h4', color: '#10B981' },
  warning:    { d: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01', color: '#EF4444' },
  cycle:      { d: 'M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16', color: '#06B6D4' },
  export:     { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12', color: '#818CF8' },
  books:      { d: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z', color: '#FB923C' },
  family:     { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', color: '#34D399' },
  play:       { d: 'M5 3l14 9-14 9V3z', color: '#6C7CFF' },
  // ── Navigation / UI ──
  stethoscope:   { d: 'M6 14a6 6 0 0012 0V5a2 2 0 00-2-2H8a2 2 0 00-2 2v9zm6 8a4 4 0 004-4m-4 4a4 4 0 01-4-4', color: '#6C7CFF' },
  'file-active':  { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-2 0v6h6M10 13h4m-4 4h4', color: '#60A5FA' },
  'bed-patient':  { d: 'M2 17v-5a3 3 0 013-3h14a3 3 0 013 3v5M2 17h20M6 12V8a2 2 0 012-2h0a2 2 0 012 2v4', color: '#8B5CF6' },
  'pdf-export':   { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-2 0v6h6M12 18v-6m-3 3l3 3 3-3', color: '#EF4444' },
  'staff-group':  { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', color: '#2FD1C8' },
  'urgence-chrono': { d: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2', color: '#F59E0B' },
  'pulsar-ai':   { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', color: '#8B5CF6' },
  'brain-hero':  { d: 'M12 2C9 2 7 4 7 6.5c0 1-.5 2-1.5 2.5C4 10 3 12 3 14c0 3 2.5 5 5.5 5 .5 0 1-.1 1.5-.2V22h4v-3.2c.5.1 1 .2 1.5.2 3 0 5.5-2 5.5-5 0-2-1-4-2.5-5C17.5 8.5 17 7.5 17 6.5 17 4 15 2 12 2zm-2 9c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1zm4 0c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1z', color: '#6C7CFF' },
  upload:     { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12', color: '#818CF8' },
  search:     { d: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35', color: '#B96BFF' },
  pen:        { d: 'M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z', color: '#10B981' },
  logo:       { d: 'M12 2C9 2 7 4 7 6.5c0 1-.5 2-1.5 2.5C4 10 3 12 3 14c0 3 2.5 5 5.5 5 .5 0 1-.1 1.5-.2V22h4v-3.2c.5.1 1 .2 1.5.2 3 0 5.5-2 5.5-5 0-2-1-4-2.5-5C17.5 8.5 17 7.5 17 6.5 17 4 15 2 12 2z', color: '#6C7CFF' },
};

// Aliases
const ALIASES: Record<string, string> = {
  neuro: 'brain', respiratory: 'lungs', cardio: 'heart', fever: 'thermo',
  biology: 'blood', genetics: 'dna', neurophysio: 'eeg', immunology: 'virus',
  infection: 'virus', diagnostic: 'dna', cockpit: 'chart', bilan: 'microscope',
  urgence: 'alert', pharma: 'shield', treatment: 'pill', recommandations: 'pill',
  pharmacovigilance: 'shield', interpellation: 'warning', casematching: 'cycle',
  timeline: 'chart', suivi: 'chart', synthese: 'clipboard', evidence: 'books',
  experts: 'books', demo: 'play', admission: 'clipboard',
};

export default function Picto({ name, size = 24, className, style, glow, glowColor }: PictoProps) {
  const resolvedName = ALIASES[name] || name;
  const icon = SVG_ICONS[resolvedName];

  if (!icon) {
    return (
      <span className={className} style={{
        fontSize: size * 0.7, lineHeight: 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, flexShrink: 0, ...style,
      }}>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  const gc = glowColor || icon.color + '80';
  const blur = Math.round(size * 0.3);
  const isStroke = ['lungs', 'eeg', 'virus', 'dna', 'cycle', 'stethoscope', 'chart'].includes(resolvedName);

  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, flexShrink: 0, ...style,
    }}>
      <svg
        width={size} height={size} viewBox="0 0 24 24"
        fill={isStroke ? 'none' : icon.color}
        stroke={isStroke ? icon.color : 'none'}
        strokeWidth={isStroke ? 2 : 0}
        strokeLinecap="round" strokeLinejoin="round"
        style={{
          filter: glow ? `drop-shadow(0 0 ${blur}px ${gc})` : undefined,
          display: 'block',
        }}
      >
        <path d={icon.d} />
      </svg>
    </span>
  );
}

export function pictoSrc(name: string): string {
  return ''; // SVG inline, no image file needed
}
