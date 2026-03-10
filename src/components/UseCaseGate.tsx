'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const AlejandroCasePage = dynamic(() => import('@/app/usecase/alejandro/page'), { ssr: false })

// ══════════════════════════════════════════════════════════════
// USE CASE GATE — Écran d'accès protégé
// Design mémoriel · Pavé numérique · Code 0513
// ══════════════════════════════════════════════════════════════

export default function UseCaseGate() {
  const [code, setCode] = useState<string[]>(['', '', '', ''])
  const [state, setState] = useState<'idle' | 'typing' | 'error' | 'success'>('idle')
  const [showCase, setShowCase] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const fullCode = code.join('')

  const handleDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = v
    setCode(next)
    setState('typing')
    if (v && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code]
      next[index - 1] = ''
      setCode(next)
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') submit()
  }

  const submit = () => {
    if (fullCode === '0513') {
      setState('success')
      setTimeout(() => { setShowCase(true) }, 600)
    } else {
      setState('error')
      setCode(['', '', '', ''])
      setTimeout(() => { setState('idle'); inputRefs.current[0]?.focus() }, 1200)
    }
  }

  const handlePad = (digit: string) => {
    const idx = code.findIndex(d => d === '')
    if (idx === -1) return
    const next = [...code]
    next[idx] = digit
    setCode(next)
    setState('typing')
    if (idx < 3) inputRefs.current[idx + 1]?.focus()
    else inputRefs.current[idx]?.focus()
  }

  const handlePadDelete = () => {
    const idx = [...code].reverse().findIndex(d => d !== '')
    if (idx === -1) return
    const realIdx = 3 - idx
    const next = [...code]
    next[realIdx] = ''
    setCode(next)
    inputRefs.current[realIdx]?.focus()
  }

  useEffect(() => {
    if (fullCode.length === 4 && !code.includes('')) submit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCode])

  if (showCase) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#0C1424', overflowY: 'auto' }}>
      <button
        onClick={() => { setShowCase(false); setState('idle'); setCode(['','','','']); setOpen(false) }}
        style={{
          position: 'fixed', top: 12, right: 16, zIndex: 1000,
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'var(--p-font-mono)',
          padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >Fermer ✕</button>
      <AlejandroCasePage />
    </div>
  )

  if (!open) return (
    <button
      onClick={() => { setOpen(true); setTimeout(() => inputRefs.current[0]?.focus(), 100) }}
      style={{
        width: '100%', marginTop: 16, padding: '18px 20px',
        background: 'linear-gradient(135deg, rgba(245,166,35,0.06) 0%, rgba(245,166,35,0.03) 100%)',
        border: '1px solid rgba(245,166,35,0.18)',
        borderRadius: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'all 0.25s ease',
        textAlign: 'left',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,166,35,0.35)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,166,35,0.18)')}
    >
      {/* Icône */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>✦</div>
      {/* Texte */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623', marginBottom: 3 }}>
          Patient 0 — Alejandro R.
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
          Cas clinique fondateur · Accès protégé · Code requis
        </div>
      </div>
      {/* Badge */}
      <div style={{
        padding: '4px 10px', borderRadius: 8, flexShrink: 0,
        background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
        fontSize: 10, fontWeight: 700, color: '#F5A623', fontFamily: 'var(--p-font-mono)',
      }}>🔒 PRIVÉ</div>
    </button>
  )

  // ── Pavé ouvert ──
  const borderColor = state === 'error' ? '#EF4444'
    : state === 'success' ? '#10B981'
    : state === 'typing' ? 'rgba(245,166,35,0.5)'
    : 'rgba(245,166,35,0.18)'

  return (
    <div style={{
      marginTop: 16,
      background: 'linear-gradient(135deg, rgba(10,15,30,0.95) 0%, rgba(6,10,20,0.98) 100%)',
      border: `1px solid ${borderColor}`,
      borderRadius: 16, overflow: 'hidden',
      transition: 'border-color 0.3s ease',
      boxShadow: state === 'success' ? '0 0 30px rgba(16,185,129,0.15)' : state === 'error' ? '0 0 30px rgba(239,68,68,0.12)' : 'none',
    }}>
      {/* Bande haute */}
      <div style={{ height: 2, background: state === 'error' ? '#EF4444' : state === 'success' ? '#10B981' : 'linear-gradient(90deg, #F5A623, transparent)', opacity: 0.7 }}/>

      <div style={{ padding: '20px 20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>Patient 0 — Alejandro R.</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1, fontFamily: 'var(--p-font-mono)', letterSpacing: 1 }}>
              FIRES · 6 ans · 2025 · Cas fondateur PULSAR
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); setCode(['','','','']); setState('idle') }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 16, cursor: 'pointer', padding: 4, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* 4 cases code */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          {code.map((d, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <input
                ref={el => { inputRefs.current[i] = el }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 52, height: 60,
                  borderRadius: 12,
                  background: d ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${
                    state === 'error' ? 'rgba(239,68,68,0.6)'
                    : state === 'success' ? 'rgba(16,185,129,0.6)'
                    : d ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'
                  }`,
                  color: state === 'error' ? '#EF4444' : state === 'success' ? '#10B981' : '#F5A623',
                  fontSize: 24, fontWeight: 900,
                  fontFamily: 'var(--p-font-mono)',
                  textAlign: 'center',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  caretColor: 'transparent',
                  WebkitTextSecurity: 'disc',
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        {/* Message état */}
        <div style={{
          textAlign: 'center', height: 16, marginBottom: 16,
          fontSize: 11, fontFamily: 'var(--p-font-mono)', fontWeight: 700,
          color: state === 'error' ? '#EF4444' : state === 'success' ? '#10B981' : 'transparent',
          transition: 'color 0.3s',
        }}>
          {state === 'error' ? '✕  Code incorrect' : state === 'success' ? '✓  Accès autorisé' : '·'}
        </div>

        {/* Pavé numérique */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 220, margin: '0 auto' }}>
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button key={d} onClick={() => handlePad(d)} style={padBtn('#F5A623')}>{d}</button>
          ))}
          <div />
          <button onClick={() => handlePad('0')} style={padBtn('#F5A623')}>0</button>
          <button onClick={handlePadDelete} style={padBtn('#6B7280')}>⌫</button>
        </div>

        {/* Valider */}
        <button
          onClick={submit}
          disabled={fullCode.length < 4 || code.includes('')}
          style={{
            marginTop: 14, width: '100%',
            padding: '12px',
            borderRadius: 10,
            background: (fullCode.length === 4 && !code.includes('')) ? '#F5A623' : 'rgba(245,166,35,0.08)',
            border: `1px solid ${(fullCode.length === 4 && !code.includes('')) ? '#F5A623' : 'rgba(245,166,35,0.15)'}`,
            color: (fullCode.length === 4 && !code.includes('')) ? '#000' : 'rgba(245,166,35,0.3)',
            fontSize: 12, fontWeight: 800,
            fontFamily: 'var(--p-font-mono)', letterSpacing: 1,
            cursor: (fullCode.length === 4 && !code.includes('')) ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          }}
        >CONFIRMER</button>
      </div>
    </div>
  )
}

function padBtn(color: string): React.CSSProperties {
  return {
    height: 44, borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color, fontSize: 16, fontWeight: 700,
    fontFamily: 'var(--p-font-mono)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }
}
