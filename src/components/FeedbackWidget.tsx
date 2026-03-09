'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  { id: 'bug', label: 'Ã°ÂÂÂ Bug' },
  { id: 'ux', label: 'Ã°ÂÂÂ¨ UX' },
  { id: 'contenu', label: 'Ã°ÂÂÂ Contenu clinique' },
  { id: 'suggestion', label: 'Ã°ÂÂÂ¡ Suggestion' },
  { id: 'autre', label: 'Ã°ÂÂÂ¬ Autre' },
];

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const submit = async () => {
    if (!message.trim() || rating === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('beta_feedback').insert({
        user_id: user?.id ?? null,
        user_email: user?.email ?? 'anonyme',
        page: typeof window !== 'undefined' ? window.location.pathname : '/',
        rating,
        category: category || 'autre',
        message: message.trim(),
        is_urgent: urgent,
      });
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setRating(0); setMessage(''); setCategory(''); }, 2000);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        title="Donner un feedback"
        style={{
          position: 'fixed', bottom: 70, right: 24, zIndex: 997,
          background: open ? '#7c3aed' : 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: '50%', width: 44, height: 44,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18,
          backdropFilter: 'blur(8px)', transition: 'all 0.2s',
        }}
      >
        Ã°ÂÂÂ¬
      </button>

      {/* Panel feedback */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 124, right: 20, zIndex: 996,
          width: 320, background: '#07101f',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16, padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {sent ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>Ã¢ÂÂ</div>
              <div style={{color:'#10B981',fontFamily:'monospace',fontSize:13}}>Merci pour votre retour !</div>
            </div>
          ) : (
            <>
              <div style={{fontFamily:'monospace',fontSize:11,color:'#7c3aed',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:14}}>
                Feedback bÃÂªta clinicien
              </div>

              {/* ÃÂtoiles */}
              <div style={{display:'flex',gap:6,marginBottom:16}}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)} style={{
                    background:'none',border:'none',cursor:'pointer',
                    fontSize:22,opacity:n<=rating?1:0.25,
                    transition:'opacity 0.15s',padding:0
                  }}>Ã¢ÂÂ</button>
                ))}
              </div>

              {/* CatÃÂ©gorie */}
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{
                    background: category===c.id ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (category===c.id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'),
                    borderRadius: 8, padding: '4px 10px',
                    color: category===c.id ? '#a78bfa' : '#64748b',
                    fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
                  }}>{c.label}</button>
                ))}
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="DÃÂ©crivez votre observation clinique..."
                rows={4}
                style={{
                  width:'100%', background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:10, padding:'10px 12px',
                  color:'#e2e8f0', fontSize:13, resize:'vertical',
                  fontFamily:'inherit', outline:'none',
                  boxSizing:'border-box',
                }}
              />

              {/* Urgent */}
              <label style={{display:'flex',alignItems:'center',gap:8,margin:'10px 0 16px',cursor:'pointer'}}>
                <input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)} />
                <span style={{fontSize:12,color:'#94a3b8'}}>Signalement urgent</span>
              </label>

              <button
                onClick={submit}
                disabled={loading || !message.trim() || rating===0}
                style={{
                  width:'100%', padding:'11px 0',
                  background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  border:'none', borderRadius:10, color:'#fff',
                  fontWeight:700, fontSize:13, cursor:'pointer',
                  opacity: (loading||!message.trim()||rating===0)?0.4:1,
                  fontFamily:'monospace',
                }}
              >
                {loading ? 'Envoi...' : 'Envoyer le feedback'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
