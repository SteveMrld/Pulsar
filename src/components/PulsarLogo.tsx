import React from 'react';

interface PulsarLogoProps {
  size?: 'sm' | 'md' | 'lg';
  textColor?: string;
  starColor?: string;
  showText?: boolean;
}

const SIZES = {
  sm: { w: 110, h: 28, star: 10, textSize: 14, textX: 22, textY: 19, tx: 10, ty: 14 },
  md: { w: 160, h: 40, star: 14, textSize: 20, textX: 30, textY: 27, tx: 14, ty: 20 },
  lg: { w: 240, h: 60, star: 20, textSize: 30, textX: 44, textY: 40, tx: 20, ty: 30 },
};

export default function PulsarLogo({
  size = 'md',
  textColor = '#F1F5F9',
  starColor = '#6C4DFF',
  showText = true,
}: PulsarLogoProps) {
  const s = SIZES[size];
  const w = showText ? s.w : s.star * 2 + 8;
  return (
    <svg width={w} height={s.h} viewBox={`0 0 ${w} ${s.h}`} xmlns="http://www.w3.org/2000/svg" aria-label="PULSAR">
      <defs>
        <filter id="pulsar-glow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform={`translate(${s.tx},${s.ty})`} filter="url(#pulsar-glow)">
        <path
          d={`M 0 ${-s.star} C ${s.star*0.07} ${-s.star*0.36}, ${s.star*0.36} ${-s.star*0.07}, ${s.star} 0 C ${s.star*0.36} ${s.star*0.07}, ${s.star*0.07} ${s.star*0.36}, 0 ${s.star} C ${-s.star*0.07} ${s.star*0.36}, ${-s.star*0.36} ${s.star*0.07}, ${-s.star} 0 C ${-s.star*0.36} ${-s.star*0.07}, ${-s.star*0.07} ${-s.star*0.36}, 0 ${-s.star} Z`}
          fill={starColor}
        />
      </g>
      {showText && (
        <text
          x={s.textX}
          y={s.textY}
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
          fontSize={s.textSize}
          fontWeight="800"
          letterSpacing="-0.5"
          fill={textColor}
        >
          PULSAR
        </text>
      )}
    </svg>
  );
}
