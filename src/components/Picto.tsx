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
  logo:        '/assets/logo-pulsar.jpg',
};

/* ── Emoji → Picto fallback mapping ──────────────────────── */
const EMOJI_TO_PICTO: Record<string, string> = {
  '🧠': 'brain',
  '🫁': 'lungs',
  '❤️': 'heart',
  '🌡️': 'thermo',
  '🌡': 'thermo',
  '🩸': 'blood',
  '🧬': 'dna',
  '🔬': 'microscope',
  '📊': 'chart',
  '💊': 'pill',
  '🧪': 'virus',
  '🏥': 'heart',
  '🚨': 'alert',
  '🛡️': 'shield',
  '🛡': 'shield',
  '📋': 'clipboard',
  '📈': 'chart',
  '⚠️': 'warning',
  '⚠': 'warning',
  '🔄': 'cycle',
  '📤': 'export',
  '📚': 'books',
  '👪': 'family',
  '🎬': 'play',
  '💜': 'brain',
};

interface PictoProps {
  name: string;       // key from PICTO_MAP or emoji character
  size?: number;      // px, default 24
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;     // add neon glow effect
  glowColor?: string; // custom glow color
}

export default function Picto({ name, size = 24, className, style, glow, glowColor }: PictoProps) {
  // Resolve: try direct name, then emoji alias
  const resolved = PICTO_MAP[name] || PICTO_MAP[EMOJI_TO_PICTO[name] || ''];

  if (!resolved) {
    // Fallback: render as text (emoji or letter)
    return (
      <span
        className={className}
        style={{ fontSize: size * 0.8, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, ...style }}
      >
        {name}
      </span>
    );
  }

  const gc = glowColor || "rgba(108,124,255,0.5)"
  const blur = String(size * 0.3)
  const glowStyle: React.CSSProperties = glow ? {
    filter: "drop-shadow(0 0 " + blur + "px " + gc + ")",
  } : {};

  return (
    <Image
      src={resolved}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        borderRadius: size > 48 ? 8 : 4,
        ...glowStyle,
        ...style,
      }}
      unoptimized
    />
  );
}

/* ── Helper: get picto src for inline use ─────────────────── */
export function pictoSrc(name: string): string {
  return PICTO_MAP[name] || PICTO_MAP[EMOJI_TO_PICTO[name] || ''] || '';
}
