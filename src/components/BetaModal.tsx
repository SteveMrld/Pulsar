'use client';
import React, { useEffect, useState } from 'react';

export default function BetaModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('pulsar-beta-acknowledged');
    if (!seen) setOpen(true);
  }, []);

  const accept = () => {
    localStorage.setItem('pulsar-beta-acknowledged', '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#07101f',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 20,
        maxWidth: 520,
        width: '100%',
        padding: 40,
        position: 'relative',
      }}>
        {/* Top line */}
        <div style={{
          position: 'absolute', top: 0, left: 40, right: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)'
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 20, padding: '4px 14px', marginBottom: 20,
        }}>
          <span style={{fontSize: 12}}>⚠️</span>
          <span style={{fontFamily: 'monospace', fontSize: 10, color: '#f59e0b', letterSpacing: '0.15em', textTransform: 'uppercase'}}>
            Version Bêta — Évaluation Clinique
          </span>
        </div>

        <h2 style={{
          fontFamily: 'Georgia, serif', fontSize: 22, color: '#fff',
          marginBottom: 16, lineHeight: 1.3
        }}>
          PULSAR est un outil<br />d'aide à la décision
        </h2>

        <p style={{fontSize: 13, color: '#94a3b8', lineHeight: 1.85, marginBottom: 20}}>
          Cette application est en phase de <strong style={{color:'#e2e8f0'}}>bêta clinique</strong>.
          Elle propose des analyses et recommandations basées sur des données biomarqueurs
          et la littérature médicale — elle <strong style={{color:'#e2e8f0'}}>ne remplace pas</strong> le
          jugement du clinicien et ne constitue pas une prescription médicale.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 28,
          fontSize: 12, color: '#64748b', lineHeight: 1.7
        }}>
          • Aucune donnée patient réelle n'est traitée dans cette version<br/>
          • Les recommandations sont indicatives et non validées cliniquement<br/>
          • Toute décision thérapeutique relève de la responsabilité du praticien<br/>
          • Version : PULSAR v21.4 — Discovery Engine v4.0
        </div>

        <button
          onClick={accept}
          style={{
            width: '100%', padding: '14px 24px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none', borderRadius: 10, color: '#000',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'monospace', letterSpacing: '0.05em'
          }}
        >
          J'ai compris — Accéder à PULSAR
        </button>

        <p style={{textAlign:'center', marginTop: 14, fontSize: 11, color: '#475569'}}>
          En continuant, vous acceptez les conditions d'utilisation bêta
        </p>
      </div>
    </div>
  );
}
