'use client'
import Picto from '@/components/Picto';
import { useState } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'

export default function UrgencePage() {
  const [gcs,setGcs]=useState(15)
  const [seizure,setSeizure]=useState('none')
  const [fever,setFever]=useState(37.0)
  const [pupils,setPupils]=useState('reactive')
  const [onset,setOnset]=useState(1)
  const [drugs,setDrugs]=useState<string[]>([])
  const [result,setResult]=useState<PatientState|null>(null)
  const [running,setRunning]=useState(false)
  const qDrugs=['Midazolam','Lévétiracétam','Valproate','Méthylprednisolone']

  const run=()=>{
    setRunning(true)
    setTimeout(()=>{
      const hasSz=seizure!=='none'
      const ps=new PatientState({
        ageMonths:72,weightKg:20,sex:'male',hospDay:onset,
        gcs,gcsHistory:[15,gcs],pupils,seizures24h:hasSz?6:0,
        seizureDuration:hasSz?15:0,seizureType:seizure,
        crp:fever>=38.5?45:fever>=38?15:0,pct:0,ferritin:0,
        wbc:10,platelets:250,lactate:1.5,
        heartRate:110,sbp:95,dbp:60,spo2:96,temp:fever,respRate:22,
        csfCells:0,csfProtein:0.3,csfAntibodies:'negative',
        drugs:drugs.map(d=>({name:d})),
      })
      setResult(runPipeline(ps))
      setRunning(false)
    },800)
  }

  const vs=result?.vpsResult?.synthesis.score??0
  const vc=vs>70?'var(--p-critical)':vs>40?'var(--p-warning)':'var(--p-success)'
  const iS={width:'100%',marginTop:'8px',padding:'10px 12px',background:'var(--p-input-bg)',border:'var(--p-border)',borderRadius:'var(--p-radius-md)',color:'var(--p-text)',fontSize:'var(--p-text-sm)',outline:'none'} as const

  return (
    <div className="page-enter-stagger" style={{maxWidth:'900px',margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:'var(--p-space-4)',marginBottom:'var(--p-space-2)'}}>
        <Picto name="alert" size={36} glow glowColor="rgba(255,71,87,0.5)" />
        <div>
          <h1 style={{fontSize:'var(--p-text-2xl)',fontWeight:800,color:'var(--p-text)'}}>Mode Urgence 3h</h1>
          <span style={{fontSize:'var(--p-text-xs)',color:'var(--p-critical)',fontFamily:'var(--p-font-mono)'}}>6 champs · Score immédiat</span>
        </div>
      </div>
      <p style={{color:'var(--p-text-dim)',fontSize:'var(--p-text-sm)',marginBottom:'var(--p-space-6)'}}>Protocole rapide — 30 secondes pour un premier score VPS.</p>

      <div style={{display:'grid',gridTemplateColumns:result?'1fr 1fr':'1fr',gap:'var(--p-space-6)'}}>
        <div className="glass-card" style={{border:'2px solid var(--p-critical)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)'}}>
          {/* 1. GCS */}
          <div style={{marginBottom:'var(--p-space-5)'}}>
            <label style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>1. Glasgow (GCS) <span style={{color:'var(--p-critical)'}}>*</span></label>
            <div style={{display:'flex',alignItems:'center',gap:'16px',marginTop:'8px'}}>
              <input type="range" min={3} max={15} value={gcs} onChange={e=>setGcs(Number(e.target.value))} style={{flex:1,accentColor:gcs<=8?'#FF4757':gcs<=12?'#FFA502':'#2ED573'}} />
              <div style={{width:'48px',height:'48px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:800,fontFamily:'var(--p-font-mono)',background:gcs<=8?'var(--p-critical-bg)':gcs<=12?'var(--p-warning-bg)':'var(--p-success-bg)',color:gcs<=8?'var(--p-critical)':gcs<=12?'var(--p-warning)':'var(--p-success)',border:`2px solid ${gcs<=8?'var(--p-critical)':gcs<=12?'var(--p-warning)':'var(--p-success)'}`}}>{gcs}</div>
            </div>
          </div>
          {/* 2. Crises */}
          <div style={{marginBottom:'var(--p-space-5)'}}>
            <label style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>2. Crises <span style={{color:'var(--p-critical)'}}>*</span></label>
            <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
              {[{v:'none',l:'Aucune'},{v:'generalized_tonic_clonic',l:'Généralisées'},{v:'status',l:'État de mal'},{v:'refractory_status',l:'Réfractaire'}].map(o=>(
                <div key={o.v} onClick={()=>setSeizure(o.v)} style={{padding:'7px 14px',borderRadius:'var(--p-radius-md)',cursor:'pointer',background:seizure===o.v?'var(--p-critical-bg)':'var(--p-bg-elevated)',border:seizure===o.v?'1px solid var(--p-critical)':'var(--p-border)',color:seizure===o.v?'var(--p-critical)':'var(--p-text-muted)',fontSize:'12px',fontWeight:seizure===o.v?600:400}}>{o.l}</div>
              ))}
            </div>
          </div>
          {/* 3. Fièvre */}
          <div style={{marginBottom:'var(--p-space-5)'}}>
            <label style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>3. Température (°C) <span style={{color:'var(--p-critical)'}}>*</span></label>
            <input type="number" value={fever} onChange={e=>setFever(Number(e.target.value))} step={0.1} style={iS} />
          </div>
          {/* 4. Pupilles */}
          <div style={{marginBottom:'var(--p-space-5)'}}>
            <label style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>4. Pupilles <span style={{color:'var(--p-critical)'}}>*</span></label>
            <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
              {[{v:'reactive',l:'Réactives'},{v:'sluggish',l:'Lentes'},{v:'fixed_one',l:'Fixe unilat.'},{v:'fixed_both',l:'Fixes bilat.'}].map(o=>(
                <div key={o.v} onClick={()=>setPupils(o.v)} style={{padding:'7px 12px',borderRadius:'var(--p-radius-md)',cursor:'pointer',flex:1,textAlign:'center',background:pupils===o.v?'var(--p-vps-dim)':'var(--p-bg-elevated)',border:pupils===o.v?'1px solid var(--p-vps)':'var(--p-border)',color:pupils===o.v?'var(--p-vps)':'var(--p-text-muted)',fontSize:'11px',fontWeight:pupils===o.v?600:400}}>{o.l}</div>
              ))}
            </div>
          </div>
          {/* 5. Onset */}
          <div style={{marginBottom:'var(--p-space-5)'}}>
            <label style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>5. Début symptômes (jours) <span style={{color:'var(--p-critical)'}}>*</span></label>
            <input type="number" value={onset} onChange={e=>setOnset(Number(e.target.value))} min={1} style={iS} />
          </div>
          {/* 6. Drugs */}
          <div style={{marginBottom:'var(--p-space-5)'}}>
            <label style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>6. Traitements déjà administrés</label>
            <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
              {qDrugs.map(d=>{const a=drugs.includes(d);return <div key={d} onClick={()=>setDrugs(a?drugs.filter(x=>x!==d):[...drugs,d])} style={{padding:'6px 14px',borderRadius:'var(--p-radius-full)',fontSize:'12px',cursor:'pointer',background:a?'var(--p-ewe-dim)':'var(--p-bg-elevated)',border:a?'1px solid var(--p-ewe)':'var(--p-border)',color:a?'var(--p-ewe)':'var(--p-text-muted)',fontWeight:a?600:400}}>{d}</div>})}
            </div>
          </div>
          <button onClick={run} disabled={running} style={{width:'100%',padding:'var(--p-space-3)',background:'var(--p-critical)',border:'none',borderRadius:'var(--p-radius-lg)',color:'#fff',cursor:'pointer',fontSize:'var(--p-text-base)',fontWeight:800,opacity:running?0.6:1}}>
            {running?'⏳ Analyse…':'⚡ Score VPS immédiat'}
          </button>
        </div>

        {result && (
          <div className="animate-in">
            <div className="glass-card" style={{borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)',marginBottom:'var(--p-space-4)',borderLeft:`4px solid ${vc}`,textAlign:'center'}}>
              <div style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-muted)',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'var(--p-space-2)'}}>Score VPS</div>
              <div style={{fontSize:'4rem',fontWeight:800,fontFamily:'var(--p-font-mono)',color:vc,lineHeight:1}}>{vs}</div>
              <div style={{fontSize:'var(--p-text-sm)',color:'var(--p-text-muted)',marginTop:'var(--p-space-2)'}}>/ 100 — {result.vpsResult?.synthesis.level?.toUpperCase()}</div>
            </div>
            {result.alerts.length>0 && <div className="glass-card" style={{borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-5)',marginBottom:'var(--p-space-4)'}}>
              <div style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-critical)',marginBottom:'var(--p-space-3)'}}>🚨 {result.alerts.length} ALERTES</div>
              {result.alerts.slice(0,5).map((a,i)=><div key={i} style={{padding:'var(--p-space-2) var(--p-space-3)',marginBottom:'4px',borderRadius:'var(--p-radius-md)',fontSize:'var(--p-text-xs)',background:a.severity==='critical'?'var(--p-critical-bg)':'var(--p-warning-bg)',borderLeft:`3px solid ${a.severity==='critical'?'var(--p-critical)':'var(--p-warning)'}`}}><span style={{fontWeight:600,color:'var(--p-text)'}}>{a.title}</span></div>)}
            </div>}
            {result.recommendations.length>0 && <div className="glass-card" style={{borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-5)'}}>
              <div style={{fontSize:'var(--p-text-xs)',fontWeight:700,color:'var(--p-tde)',marginBottom:'var(--p-space-3)'}}>💊 RECOMMANDATIONS</div>
              {result.recommendations.slice(0,4).map((r,i)=><div key={i} style={{padding:'var(--p-space-2) var(--p-space-3)',marginBottom:'4px',borderLeft:`2px solid ${r.priority==='urgent'?'var(--p-critical)':'var(--p-tde)'}`,fontSize:'var(--p-text-xs)',color:'var(--p-text-dim)'}}><span style={{fontWeight:600,color:'var(--p-text-muted)'}}>{r.title}</span></div>)}
            </div>}
          </div>
        )}
      </div>
    </div>
  )
}
