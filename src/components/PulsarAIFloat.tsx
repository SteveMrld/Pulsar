'use client'
import { useState } from 'react'
import Picto from '@/components/Picto'

interface PulsarAIFloatProps {
  patientName: string
  vpsScore: number
}

export default function PulsarAIFloat({ patientName, vpsScore }: PulsarAIFloatProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])

  const submit = () => {
    if (!query.trim()) return
    const q = query.trim()
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setQuery('')

    // Simulated AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Analyse en cours pour ${patientName}... VPS actuel: ${vpsScore}. Je recommande de consulter le cockpit pour les actions prioritaires.`,
      }
      setMessages(prev => [...prev, { role: 'ai', text: responses.default }])
    }, 800)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
        border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(108,124,255,0.3), 0 0 40px rgba(108,124,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}>
        <Picto name="brain" size={24} />
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
      width: '360px', maxHeight: '500px',
      background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(20px)',
      borderRadius: '16px', border: '1px solid rgba(108,124,255,0.1)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(108,124,255,0.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(108,124,255,0.06)',
        background: 'rgba(108,124,255,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Picto name="brain" size={16} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '11px', color: 'var(--p-white)' }}>PulsarAI</div>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>Contexte: {patientName}</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--p-text-dim)', fontSize: '16px', padding: '4px',
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        maxHeight: '340px', minHeight: '200px',
      }}>
        {messages.length === 0 && (
          <div style={{
            padding: '20px', textAlign: 'center',
            color: 'var(--p-text-dim)', fontSize: '11px',
            fontFamily: 'var(--p-font-mono)',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
            Assistant IA contextuel<br />
            <span style={{ fontSize: '9px', color: 'rgba(108,124,255,0.4)' }}>
              Posez une question sur {patientName}
            </span>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%', padding: '8px 12px', borderRadius: '12px',
            background: m.role === 'user' ? 'rgba(108,124,255,0.12)' : 'rgba(46,213,115,0.06)',
            border: `1px solid ${m.role === 'user' ? 'rgba(108,124,255,0.15)' : 'rgba(46,213,115,0.1)'}`,
            fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: '1.5',
            fontFamily: 'var(--p-font-body)',
          }}>
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid rgba(108,124,255,0.06)',
        display: 'flex', gap: '8px',
      }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Question sur le patient..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: '10px',
            background: 'rgba(108,124,255,0.04)',
            border: '1px solid rgba(108,124,255,0.08)',
            color: 'var(--p-text)', fontSize: '11px',
            fontFamily: 'var(--p-font-body)',
            outline: 'none',
          }}
        />
        <button onClick={submit} style={{
          padding: '8px 14px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #6C7CFF, #B96BFF)',
          color: 'white', fontWeight: 700, fontSize: '10px', cursor: 'pointer',
          fontFamily: 'var(--p-font-mono)',
        }}>→</button>
      </div>
    </div>
  )
}
