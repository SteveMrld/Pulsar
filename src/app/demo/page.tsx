export default function Page() {
  return (
    <div style={{maxWidth:'800px',margin:'0 auto'}}>
      <div style={{marginBottom:'var(--p-space-6)'}}>
        <span style={{fontSize:'2.5rem'}}>▶️</span>
        <h1 style={{fontSize:'var(--p-text-2xl)',fontWeight:800,color:'var(--p-text)',marginTop:'var(--p-space-3)'}}>Démo Inès</h1>
        <span style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-dim)',fontFamily:'var(--p-font-mono)'}}>Ressource</span>
      </div>
      <div style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-8)',textAlign:'center'}}>
        <p style={{color:'var(--p-text-muted)',fontSize:'var(--p-text-sm)',marginBottom:'var(--p-space-4)',maxWidth:'500px',margin:'0 auto var(--p-space-4)'}}>Parcours autopilot 13 scènes — Inès M., 5 ans, suspicion FIRES. Durée ~3 minutes.</p>
        <div style={{display:'inline-block',padding:'var(--p-space-2) var(--p-space-4)',background:'var(--p-tpe-dim)',borderRadius:'var(--p-radius-full)',fontSize:'var(--p-text-xs)',color:'var(--p-tpe)',fontFamily:'var(--p-font-mono)',fontWeight:600}}>Sessions 4-6</div>
      </div>
    </div>
  )
}
