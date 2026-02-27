const publications = [
  {id:1,authors:'Wickström R. et al.',year:2022,title:'Protocoles thérapeutiques FIRES',journal:'Epilepsia',topic:'FIRES',cited:'TDE Rules'},
  {id:2,authors:'Sheikh Z. et al.',year:2023,title:'Immunothérapie encéphalite auto-immune',journal:'Neurology',topic:'EAIS',cited:'TDE Rules'},
  {id:3,authors:'Gaspard N. et al.',year:2015,title:'Status epilepticus réfractaire',journal:'JAMA Neurology',topic:'NORSE',cited:'TDE Rules'},
  {id:4,authors:'Titulaer M. et al.',year:2013,title:'Encéphalite anti-NMDAR : traitement et pronostic',journal:'Lancet Neurology',topic:'anti-NMDAR',cited:'TDE Rules'},
  {id:5,authors:'Matics T. & Sanchez-Pinto',year:2017,title:'pSOFA — Pediatric Sequential Organ Failure Assessment',journal:'Pediatric Critical Care',topic:'Scoring',cited:'VPS Rules'},
  {id:6,authors:'Trinka E. et al.',year:2015,title:'Classification ILAE du status epilepticus',journal:'Epilepsia',topic:'Classification',cited:'VPS Rules'},
  {id:7,authors:'Graus F. et al.',year:2016,title:'Critères diagnostiques encéphalite auto-immune',journal:'Lancet Neurology',topic:'Diagnostic',cited:'VPS Rules'},
  {id:8,authors:'Beslow L. et al.',year:2012,title:'mRS pédiatrique — Modified Rankin Scale',journal:'Stroke',topic:'Scoring',cited:'VPS Rules'},
  {id:9,authors:'Dalmau J. et al.',year:2008,title:'Encéphalite anti-NMDA receptor',journal:'Annals of Neurology',topic:'anti-NMDAR',cited:'Référence'},
  {id:10,authors:'Irani S. et al.',year:2010,title:'Neuro-immunologie et anticorps neuronaux',journal:'Brain',topic:'Neuro-immunologie',cited:'Référence'},
  {id:11,authors:'Francoeur C. et al.',year:2023,title:'PIMS/MIS-C outcomes — OR 1.85/2.18',journal:'JAMA Pediatrics',topic:'PIMS',cited:'PVE Benchmark'},
  {id:12,authors:'Bilodeau P. et al.',year:2024,title:'MOGAD pédiatrique — cohorte prospective',journal:'Neurology',topic:'MOGAD',cited:'PVE Benchmark'},
  {id:13,authors:'Shakeshaft A. et al.',year:2024,title:'EEG patterns en neuro-inflammation — AUC 0.72',journal:'Clinical Neurophysiology',topic:'EEG',cited:'EWE Benchmark'},
  {id:14,authors:'Kramer U. et al.',year:2011,title:'FIRES — incidence et mortalité',journal:'Epilepsia',topic:'FIRES',cited:'Épidémiologie'},
  {id:15,authors:'Specchio N. et al.',year:2020,title:'FIRES — revue systématique',journal:'Seizure',topic:'FIRES',cited:'Référence'},
  {id:16,authors:'Feldstein L. et al.',year:2020,title:'MIS-C — 186 cas, mortalité 1-2%',journal:'NEJM',topic:'PIMS',cited:'Épidémiologie'},
  {id:17,authors:'Florance N. et al.',year:2009,title:'Anti-NMDAR chez lenfant',journal:'Annals of Neurology',topic:'anti-NMDAR',cited:'Référence'},
]

export default function EvidencePage() {
  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:'var(--p-space-4)',marginBottom:'var(--p-space-6)'}}>
        <img src="/assets/organs/virus.png" alt="Evidence" width={40} height={40} style={{ borderRadius: 8, filter: 'drop-shadow(0 0 12px rgba(185,107,255,0.4))' }} />
        <div>
          <h1 style={{fontSize:'var(--p-text-2xl)',fontWeight:800,color:'var(--p-text)'}}>Evidence Vault</h1>
          <span style={{fontSize:'var(--p-text-xs)',color:'var(--p-vps)',fontFamily:'var(--p-font-mono)'}}>{publications.length} publications référencées</span>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'var(--p-space-3)'}}>
        {publications.map(p => (
          <div key={p.id} style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-lg)',padding:'var(--p-space-4)',display:'flex',gap:'var(--p-space-4)',alignItems:'flex-start'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'var(--p-bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,fontFamily:'var(--p-font-mono)',color:'var(--p-text-dim)',flexShrink:0}}>{p.id}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:'var(--p-text-sm)',fontWeight:600,color:'var(--p-text)',marginBottom:'2px'}}>{p.title}</div>
              <div style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-muted)'}}>{p.authors} — <span style={{fontStyle:'italic'}}>{p.journal}</span> ({p.year})</div>
            </div>
            <div style={{display:'flex',gap:'6px',flexShrink:0}}>
              <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'var(--p-radius-full)',background:'var(--p-vps-dim)',color:'var(--p-vps)',fontFamily:'var(--p-font-mono)',fontWeight:600}}>{p.topic}</span>
              <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'var(--p-radius-full)',background:'var(--p-bg-elevated)',color:'var(--p-text-dim)',fontFamily:'var(--p-font-mono)'}}>{p.cited}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
