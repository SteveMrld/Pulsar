'use client';

/**
 * UseCaseButton — Accès protégé au cas Alejandro R.
 * Code d'accès : 0513
 * À placer dans /patients et /dashboard (utilisateurs authentifiés uniquement)
 * 
 * Usage:
 *   <UseCaseButton />
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const USE_CASE_CODE = '0513';

export function UseCaseButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setCode('');
      setError('');
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (code === USE_CASE_CODE) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        router.push('/usecase/alejandro');
      }, 600);
    } else {
      setError('Code incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setCode('');
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 16px',
          backgroundColor: '#0F1525',
          border: '1px solid #2D3A4F',
          borderRadius: '8px',
          color: '#94A3B8',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#10B98166';
          (e.currentTarget as HTMLButtonElement).style.color = '#10B981';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#2D3A4F';
          (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
        }}
      >
        <span style={{ fontSize: '16px' }}>🔒</span>
        Use Case — Accès protégé
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <style>{`
            @keyframes fadeIn { from{ opacity:0; } to{ opacity:1; } }
            @keyframes slideUp { from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }
            @keyframes shakeX {
              0%,100%{ transform:translateX(0); }
              20%{ transform:translateX(-8px); }
              40%{ transform:translateX(8px); }
              60%{ transform:translateX(-6px); }
              80%{ transform:translateX(6px); }
            }
          `}</style>
          <div
            style={{
              backgroundColor: '#0F1525',
              border: '1px solid #1E2A3A',
              borderRadius: '14px',
              padding: '28px 32px',
              width: '340px',
              animation: 'slideUp 0.2s ease',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: success ? '#10B98122' : '#1E2A3A',
                border: `1px solid ${success ? '#10B98166' : '#2D3A4F'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                margin: '0 auto 12px',
                transition: 'all 0.3s',
              }}>
                {success ? '✅' : '🔒'}
              </div>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#E2E8F0',
                margin: '0 0 4px',
              }}>
                Accès protégé
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Cas clinique — Usage démonstratif uniquement
              </p>
            </div>

            {/* Input */}
            {!success && (
              <>
                <div style={{
                  animation: shake ? 'shakeX 0.4s ease' : 'none',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '16px',
                  }}>
                    <label style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      Code d'accès
                    </label>
                    <input
                      ref={inputRef}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={e => {
                        setCode(e.target.value.replace(/\D/g, ''));
                        setError('');
                      }}
                      onKeyDown={handleKey}
                      placeholder="• • • •"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        backgroundColor: '#0A0E1A',
                        border: `1px solid ${error ? '#EF444466' : '#1E2A3A'}`,
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        fontSize: '18px',
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#10B98166'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = error ? '#EF444466' : '#1E2A3A'; }}
                    />
                    {error && (
                      <span style={{ fontSize: '11px', color: '#EF4444', textAlign: 'center' }}>
                        {error}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid #1E2A3A',
                      borderRadius: '8px',
                      color: '#64748B',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={code.length === 0}
                    style={{
                      flex: 2,
                      padding: '10px',
                      backgroundColor: code.length > 0 ? '#10B981' : '#10B98133',
                      border: 'none',
                      borderRadius: '8px',
                      color: code.length > 0 ? '#0A0E1A' : '#10B98166',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: code.length > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    Accéder
                  </button>
                </div>
              </>
            )}

            {/* Success state */}
            {success && (
              <div style={{ textAlign: 'center', color: '#10B981', fontSize: '14px', padding: '8px 0' }}>
                Accès autorisé — Redirection…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default UseCaseButton;
