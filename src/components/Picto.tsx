'use client';

import Image from 'next/image';

/* ── Picto mapping ────────────────────────────────────────── */
const PICTO_MAP: Record<string, string> = {
  // ── LOT 1: Organ pictos (8) ──
  brain:  '/assets/organs/brain.png',
  lungs:  '/assets/organs/lungs.png',
  heart:  '/assets/organs/heart.png',
  thermo: '/assets/organs/thermo.png',
  blood:  '/assets/organs/blood.png',
  dna:    '/assets/organs/dna.png',
  eeg:    '/assets/organs/eeg.png',
  virus:  '/assets/organs/virus.png',
  // ── LOT 2: Module pictos (12) ──
  alert:      '/assets/organs/alert.png',
  pill:       '/assets/organs/pill.png',
  shield:     '/assets/organs/shield.png',
  clipboard:  '/assets/organs/clipboard.png',
  chart:      '/assets/organs/chart.png',
  microscope: '/assets/organs/microscope.png',
  warning:    '/assets/organs/warning.png',
  cycle:      '/assets/organs/cycle.png',
  export:     '/assets/organs/export.png',
  books:      '/assets/organs/books.png',
  family:     '/assets/organs/family.png',
  play:       '/assets/organs/play.png',
  // ── Aliases: organs ──
  neuro:       '/assets/organs/brain.png',
  respiratory: '/assets/organs/lungs.png',
  cardio:      '/assets/organs/heart.png',
  fever:       '/assets/organs/thermo.png',
  biology:     '/assets/organs/blood.png',
  genetics:    '/assets/organs/dna.png',
  neurophysio: '/assets/organs/eeg.png',
  immunology:  '/assets/organs/virus.png',
  infection:   '/assets/organs/virus.png',
  // ── Aliases: modules ──
  diagnostic:  '/assets/organs/dna.png',
  cockpit:     '/assets/organs/chart.png',
  bilan:       '/assets/organs/microscope.png',
  urgence:     '/assets/organs/alert.png',
  pharma:      '/assets/organs/shield.png',
  treatment:   '/assets/organs/pill.png',
  recommandations: '/assets/organs/pill.png',
  pharmacovigilance: '/assets/organs/shield.png',
  interpellation: '/assets/organs/warning.png',
  casematching: '/assets/organs/cycle.png',
  timeline:    '/assets/organs/chart.png',
  suivi:       '/assets/organs/chart.png',
  synthese:    '/assets/organs/clipboard.png',
  evidence:    '/assets/organs/books.png',
  experts:     '/assets/organs/books.png',
  demo:        '/assets/organs/play.png',
  admission:   '/assets/organs/clipboard.png',
  // Logo
  logo:        '/assets/logo-pulsar.png',
  // ── V17 pictos ──
  stethoscope: '/assets/pictos-v17/stethoscope-128.png',
  'file-active': '/assets/pictos-v17/file-active-128.png',
  'bed-patient': '/assets/pictos-v17/bed-patient-128.png',
  'pdf-export': '/assets/pictos-v17/pdf-export-128.png',
  'staff-group': '/assets/pictos-v17/staff-group-128.png',
  'urgence-chrono': '/assets/pictos-v17/urgence-chrono-128.png',
  'pulsar-ai': '/assets/pictos-v17/pulsar-ai-icon-128.png',
  'brain-hero': '/assets/pictos-v17/brain-hero-128.png',
  upload:      '/assets/pictos-v17/pdf-export-128.png',
  search:      '/assets/pictos-v17/pulsar-ai-icon-128.png',
  pen:         '/assets/pictos-v17/file-active-128.png',
};

/* ── Emoji → Picto fallback mapping ──────────────────────── */
const EMOJI_TO_PICTO: Record<string, string> = {
  '🧠': 'brain', '🫁': 'lungs', '❤️': 'heart',
  '🌡️': 'thermo', '🌡': 'thermo', '🩸': 'blood',
  '🧬': 'dna', '🔬': 'microscope', '📊': 'chart',
  '💊': 'pill', '🧪': 'virus', '🏥': 'heart',
  '🚨': 'alert', '🛡️': 'shield', '🛡': 'shield',
  '📋': 'clipboard', '📈': 'chart', '⚠️': 'warning',
  '⚠': 'warning', '🔄': 'cycle', '📤': 'export',
  '📚': 'books', '👪': 'family', '🎬': 'play', '💜': 'brain',
};

interface PictoProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
  glowColor?: string;
}

export default function Picto({ name, size = 24, className, style, glow, glowColor }: PictoProps) {
  const resolved = PICTO_MAP[name] || PICTO_MAP[EMOJI_TO_PICTO[name] || ''];

  if (!resolved) {
    return (
      <span
        className={className}
        style={{
          fontSize: size * 0.8, lineHeight: 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: size, height: size, flexShrink: 0, ...style,
        }}
      >
        {name}
      </span>
    );
  }

  const gc = glowColor || 'rgba(108,124,255,0.5)';
  const blur = String(Math.round(size * 0.3));
  const glowFilter = glow ? `drop-shadow(0 0 ${blur}px ${gc})` : undefined;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      <Image
        src={resolved}
        alt={name}
        width={size}
        height={size}
        style={{
          objectFit: 'contain',
          borderRadius: size > 48 ? 8 : size > 24 ? 4 : 2,
          filter: glowFilter,
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        unoptimized
      />
    </span>
  );
}

export function pictoSrc(name: string): string {
  return PICTO_MAP[name] || PICTO_MAP[EMOJI_TO_PICTO[name] || ''] || '';
}
