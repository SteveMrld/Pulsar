'use client';
import { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  label?: string;
}

export default function UseCaseButton({ children, onClick, variant = 'primary', label }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: 10,
        border: isPrimary ? 'none' : '1px solid #1E293B',
        background: isPrimary ? 'linear-gradient(135deg,#6C4DFF,#4C35CC)' : '#111827',
        color: isPrimary ? '#FFFFFF' : '#94A3B8',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
        letterSpacing: '-0.2px',
      }}
    >
      {label || children}
    </button>
  );
}
