'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pulsar-theme');
    if (saved === 'light') {
      setDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('pulsar-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      title={dark ? 'Mode clair' : 'Mode sombre'}
      style={{
        background: 'none',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        padding: '5px 8px',
        fontSize: 14,
        transition: 'all 0.2s',
        lineHeight: 1,
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
