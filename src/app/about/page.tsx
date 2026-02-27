export default function AboutPage() {
  return (
    <div style={{maxWidth:'700px',margin:'0 auto',textAlign:'center'}}>
      <div style={{marginBottom:'var(--p-space-8)',paddingTop:'var(--p-space-6)'}}>
        <div style={{fontSize:'3rem',marginBottom:'var(--p-space-4)'}}>💙</div>
        <h1 style={{fontSize:'var(--p-text-3xl)',fontWeight:800,color:'var(--p-text)',marginBottom:'var(--p-space-3)'}}>PULSAR</h1>
        <p style={{fontSize:'var(--p-text-sm)',color:'var(--p-vps)',fontFamily:'var(--p-font-mono)',letterSpacing:'1px'}}>Pediatric Urgent Lifesaving System & Alert Response</p>
        <p style={{fontSize:'var(--p-text-sm)',color:'var(--p-text-dim)',marginTop:'var(--p-space-2)'}}>Version 15 — Fusion Définitive</p>
      </div>

      <div style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-8)',marginBottom:'var(--p-space-6)'}}>
        <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'var(--p-vps-dim)',border:'2px solid var(--p-vps)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--p-space-4)',fontSize:'2rem'}}>🕊️</div>
        <h2 style={{fontSize:'var(--p-text-xl)',fontWeight:700,color:'var(--p-text)',marginBottom:'var(--p-space-2)'}}>In memory of Alejandro R.</h2>
        <p style={{fontSize:'var(--p-text-sm)',color:'var(--p-text-muted)',fontStyle:'italic',marginBottom:'var(--p-space-4)'}}>2019 – 2025</p>
        <p style={{fontSize:'var(--p-text-sm)',color:'var(--p-text-dim)',lineHeight:1.8,maxWidth:'500px',margin:'0 auto'}}>
          Pour Gabriel, et pour tous les enfants que le temps n&apos;a pas attendus.
        </p>
      </div>

      <div style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)',marginBottom:'var(--p-space-6)'}}>
        <h3 style={{fontSize:'var(--p-text-base)',fontWeight:700,color:'var(--p-text)',marginBottom:'var(--p-space-4)'}}>Auteurs</h3>
        <p style={{fontSize:'var(--p-text-sm)',color:'var(--p-text-muted)',lineHeight:1.8}}>
          Steve Moraldo & Claude (Anthropic)<br/>
          © 2026 — Outil d&apos;aide à la décision clinique
        </p>
      </div>

      <div style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)',marginBottom:'var(--p-space-6)'}}>
        <h3 style={{fontSize:'var(--p-text-base)',fontWeight:700,color:'var(--p-text)',marginBottom:'var(--p-space-4)'}}>Architecture V15</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--p-space-3)',textAlign:'left'}}>
          {[
            {l:'Moteurs cerveau',v:'5 (VPS+TDE+PVE+EWE+TPE)'},
            {l:'Couches par moteur',v:'4 (Intention→Contexte→Règles→Courbe)'},
            {l:'Pathologies couvertes',v:'5 (FIRES, NMDAR, NORSE, PIMS, MOGAD)'},
            {l:'Pipeline',v:'Séquentiel enrichi'},
            {l:'Crash tests',v:'7/7 validés'},
            {l:'Publications',v:'17 référencées'},
            {l:'Experts',v:'5 internationaux'},
            {l:'Stack',v:'Next.js + Supabase + Vercel'},
          ].map((r,i) => (
            <div key={i} style={{padding:'var(--p-space-2) var(--p-space-3)',background:'var(--p-bg-elevated)',borderRadius:'var(--p-radius-md)'}}>
              <div style={{fontSize:'10px',color:'var(--p-text-dim)'}}>{r.l}</div>
              <div style={{fontSize:'var(--p-text-xs)',fontWeight:600,color:'var(--p-text-muted)',fontFamily:'var(--p-font-mono)'}}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-dim)',lineHeight:1.6}}>
        PULSAR V15 est un outil d&apos;aide à la décision. Ne se substitue pas au jugement clinique.
      </p>
    </div>
  )
}
