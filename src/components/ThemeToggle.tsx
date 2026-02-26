'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('pulsar-theme') as 'dark' | 'light'
    if (saved) setTheme(saved)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('pulsar-theme', next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        background: 'var(--p-bg-elevated)',
        border: 'var(--p-border)',
        borderRadius: 'var(--p-radius-md)',
        padding: 'var(--p-space-2) var(--p-space-3)',
        color: 'var(--p-text-muted)',
        cursor: 'pointer',
        fontSize: 'var(--p-text-sm)',
        transition: `all var(--p-duration-normal) var(--p-ease)`,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
