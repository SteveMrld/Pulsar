export default function Page() {
  const layers = ['Intention (3 champs sémantiques)','Contexte (Modificateurs)','Règles métier (4 règles référencées)','Courbe (Trajectoire historique)']
  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:'var(--p-space-4)',marginBottom:'var(--p-space-6)'}}>
        <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'var(--p-vps)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:800,color:'#fff',fontFamily:'var(--p-font-mono)'}}>VPS</div>
        <div><h1 style={{fontSize:'var(--p-text-2xl)',fontWeight:800,color:'var(--p-text)'}}>VPS Engine</h1><span style={{fontSize:'var(--p-text-xs)',color:'var(--p-vps)',fontFamily:'var(--p-font-mono)'}}>Vital Prognosis Score — 4 couches</span></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--p-space-4)'}}>
        {layers.map((l,i) => <div key={i} style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-lg)',padding:'var(--p-space-5)',borderLeft:'3px solid var(--p-vps)'}}>
          <div style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-vps)',fontFamily:'var(--p-font-mono)',marginBottom:'var(--p-space-2)'}}>COUCHE {i+1}</div>
          <div style={{fontSize:'var(--p-text-sm)',color:'var(--p-text)'}}>{l}</div>
          <div style={{marginTop:'var(--p-space-3)',padding:'var(--p-space-2) var(--p-space-3)',background:'var(--p-bg-elevated)',borderRadius:'var(--p-radius-md)',fontSize:'var(--p-text-xs)',color:'var(--p-text-dim)'}}>Vue détaillée — Sessions 4-6</div>
        </div>)}
      </div>
    </div>
  )
}
