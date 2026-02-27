'use client'
import Picto from '@/components/Picto'
import { useState, useCallback } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'

// Types
type FormData = {
  ageMonths: number; weightKg: number; sex: 'male'|'female'; hospDay: number
  gcs: number; gcsHistory: number[]; pupils: string; seizures24h: number
  seizureDuration: number; seizureType: string
  crp: number; pct: number; ferritin: number; wbc: number; platelets: number; lactate: number
  heartRate: number; sbp: number; dbp: number; spo2: number; temp: number; respRate: number
  csfCells: number; csfProtein: number; csfAntibodies: string
  drugs: {name:string;dose?:string}[]
  pimsConfirmed: boolean; covidExposure: boolean; weeksPostCovid: number
  troponin: number; dDimers: number; proBNP: number; ejectionFraction: number
  coronaryAnomaly: boolean; cardiacInvolvement: boolean; kawasaki: boolean
  mogAntibody: boolean; mogTiter: number; opticNeuritis: boolean
  transverseMyelitis: boolean; ademPresentation: boolean
  bilateralOptic: boolean; demyelinatingLesions: boolean
  il6: number; tnfa: number
}

const defaultForm: FormData = {
  ageMonths:0,weightKg:0,sex:'male',hospDay:1,
  gcs:15,gcsHistory:[],pupils:'reactive',seizures24h:0,seizureDuration:0,seizureType:'none',
  crp:0,pct:0,ferritin:0,wbc:8,platelets:250,lactate:1,
  heartRate:80,sbp:100,dbp:65,spo2:98,temp:37,respRate:18,
  csfCells:0,csfProtein:0.3,csfAntibodies:'negative',drugs:[],
  pimsConfirmed:false,covidExposure:false,weeksPostCovid:0,
  troponin:0,dDimers:0,proBNP:0,ejectionFraction:60,
  coronaryAnomaly:false,cardiacInvolvement:false,kawasaki:false,
  mogAntibody:false,mogTiter:0,opticNeuritis:false,
  transverseMyelitis:false,ademPresentation:false,
  bilateralOptic:false,demyelinatingLesions:false,il6:0,tnfa:0,
}

// ── 3 CAS DEMO FICTIFS ──
const DEMO_CASES: {name:string;desc:string;color:string;data:FormData}[] = [
  {
    name: 'Léa — Suspicion FIRES',
    desc: 'Fille 7 ans, état de mal réfractaire post-fièvre',
    color: 'var(--p-vps)',
    data: {
      ageMonths:84,weightKg:23,sex:'female',hospDay:3,
      gcs:8,gcsHistory:[14,12,9],pupils:'sluggish',seizures24h:12,seizureDuration:45,seizureType:'refractory_status',
      crp:35,pct:0.8,ferritin:280,wbc:14,platelets:210,lactate:2.8,
      heartRate:145,sbp:95,dbp:55,spo2:93,temp:39.2,respRate:32,
      csfCells:18,csfProtein:0.52,csfAntibodies:'negative',
      drugs:[{name:'Lévétiracétam'},{name:'Midazolam'}],
      pimsConfirmed:false,covidExposure:false,weeksPostCovid:0,
      troponin:0,dDimers:0.3,proBNP:0,ejectionFraction:62,
      coronaryAnomaly:false,cardiacInvolvement:false,kawasaki:false,
      mogAntibody:false,mogTiter:0,opticNeuritis:false,
      transverseMyelitis:false,ademPresentation:false,
      bilateralOptic:false,demyelinatingLesions:false,il6:45,tnfa:12,
    }
  },
  {
    name: 'Yanis — Suspicion anti-NMDAR',
    desc: 'Garçon 9 ans, hallucinations + dyskinésies + crises',
    color: 'var(--p-tde)',
    data: {
      ageMonths:108,weightKg:30,sex:'male',hospDay:5,
      gcs:11,gcsHistory:[15,14,12],pupils:'reactive',seizures24h:4,seizureDuration:8,seizureType:'generalized_tonic_clonic',
      crp:12,pct:0.15,ferritin:150,wbc:11,platelets:280,lactate:1.4,
      heartRate:120,sbp:110,dbp:68,spo2:96,temp:38.1,respRate:24,
      csfCells:42,csfProtein:0.65,csfAntibodies:'nmdar',
      drugs:[{name:'Lévétiracétam'},{name:'Méthylprednisolone'}],
      pimsConfirmed:false,covidExposure:false,weeksPostCovid:0,
      troponin:0,dDimers:0.2,proBNP:0,ejectionFraction:65,
      coronaryAnomaly:false,cardiacInvolvement:false,kawasaki:false,
      mogAntibody:false,mogTiter:0,opticNeuritis:false,
      transverseMyelitis:false,ademPresentation:false,
      bilateralOptic:false,demyelinatingLesions:false,il6:18,tnfa:8,
    }
  },
  {
    name: 'Inès — Suspicion PIMS/MIS-C',
    desc: 'Fille 10 ans, fièvre persistante + atteinte cardiaque post-COVID',
    color: 'var(--p-ewe)',
    data: {
      ageMonths:120,weightKg:34,sex:'female',hospDay:2,
      gcs:14,gcsHistory:[15,15],pupils:'reactive',seizures24h:0,seizureDuration:0,seizureType:'none',
      crp:185,pct:8.5,ferritin:1200,wbc:22,platelets:95,lactate:3.2,
      heartRate:155,sbp:82,dbp:48,spo2:94,temp:39.8,respRate:28,
      csfCells:2,csfProtein:0.28,csfAntibodies:'negative',
      drugs:[{name:'IgIV'},{name:'Méthylprednisolone'}],
      pimsConfirmed:true,covidExposure:true,weeksPostCovid:4,
      troponin:85,dDimers:4.2,proBNP:3500,ejectionFraction:42,
      coronaryAnomaly:false,cardiacInvolvement:true,kawasaki:true,
      mogAntibody:false,mogTiter:0,opticNeuritis:false,
      transverseMyelitis:false,ademPresentation:false,
      bilateralOptic:false,demyelinatingLesions:false,il6:320,tnfa:55,
    }
  },
]

const sections = [
  {title:'Identité Patient',icon:'👤',color:'var(--p-vps)',engine:'VPS'},
  {title:'Tableau Neurologique',icon:'brain',color:'var(--p-tde)',engine:'TDE'},
  {title:'Biologie & LCR',icon:'virus',color:'var(--p-pve)',engine:'PVE'},
  {title:'Traitements & Réa',icon:'pill',color:'var(--p-ewe)',engine:'EWE'},
  {title:'Imagerie & Extensions',icon:'chart',color:'var(--p-tpe)',engine:'TPE'},
]

const DRUG_OPTIONS = ['Lévétiracétam','Phénytoïne','Valproate','Lacosamide','Midazolam','Thiopental','Kétamine','Propofol','Méthylprednisolone','IgIV','Rituximab','Anakinra']

function Field({label,required,hint,children,span}:{label:string;required?:boolean;hint?:string;children:React.ReactNode;span?:number}) {
  return (<div style={{gridColumn:span?`span ${span}`:undefined}}>
    <label style={{display:'block',fontSize:'var(--p-text-xs)',fontWeight:600,color:'var(--p-text-muted)',letterSpacing:'0.5px',textTransform:'uppercase',marginBottom:'6px'}}>
      {label} {required && <span style={{color:'var(--p-critical)'}}>*</span>}
    </label>{children}
    {hint && <div style={{fontSize:'10px',color:'var(--p-text-dim)',marginTop:'4px',fontStyle:'italic'}}>{hint}</div>}
  </div>)
}

const iS: React.CSSProperties = {width:'100%',padding:'10px 12px',background:'var(--p-input-bg)',border:'var(--p-border)',borderRadius:'var(--p-radius-md)',color:'var(--p-text)',fontSize:'var(--p-text-sm)',fontFamily:'var(--p-font-body)',outline:'none'}

function NI({value,onChange,placeholder,min,max,step}:{value:number;onChange:(v:number)=>void;placeholder?:string;min?:number;max?:number;step?:number}) {
  return <input type="number" value={value||''} onChange={e=>onChange(Number(e.target.value)||0)} placeholder={placeholder} min={min} max={max} step={step} style={iS}
    onFocus={e=>{e.target.style.borderColor='var(--p-vps)';e.target.style.boxShadow='0 0 0 3px var(--p-vps-dim)'}}
    onBlur={e=>{e.target.style.borderColor='';e.target.style.boxShadow='none'}} />
}

function Sel({value,onChange,options}:{value:string;onChange:(v:string)=>void;options:{value:string;label:string}[]}) {
  return <select value={value} onChange={e=>onChange(e.target.value)} style={{...iS,cursor:'pointer',appearance:'none' as any,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238E8EA3' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 12px center'}}
    onFocus={e=>{e.target.style.borderColor='var(--p-vps)';e.target.style.boxShadow='0 0 0 3px var(--p-vps-dim)'}}
    onBlur={e=>{e.target.style.borderColor='';e.target.style.boxShadow='none'}}>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
}

function Tog({checked,onChange,label}:{checked:boolean;onChange:(v:boolean)=>void;label:string}) {
  return <div onClick={()=>onChange(!checked)} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',padding:'8px 12px',background:checked?'var(--p-vps-dim)':'var(--p-input-bg)',border:checked?'1px solid var(--p-vps)':'var(--p-border)',borderRadius:'var(--p-radius-md)',transition:'all 150ms'}}>
    <div style={{width:'36px',height:'20px',borderRadius:'10px',background:checked?'var(--p-vps)':'var(--p-gray-2)',position:'relative',transition:'background 150ms'}}>
      <div style={{width:'16px',height:'16px',borderRadius:'50%',background:'#fff',position:'absolute',top:'2px',left:checked?'18px':'2px',transition:'left 150ms'}} />
    </div><span style={{fontSize:'var(--p-text-sm)',color:checked?'var(--p-text)':'var(--p-text-muted)'}}>{label}</span>
  </div>
}

export default function ProjectPage() {
  const [form,setForm] = useState<FormData>(defaultForm)
  const [step,setStep] = useState(0)
  const [analyzing,setAnalyzing] = useState(false)
  const [result,setResult] = useState<PatientState|null>(null)
  const [pLog,setPLog] = useState<{engine:string;ms:number}[]>([])
  const [animStep,setAnimStep] = useState(-1)

  const u = useCallback(<K extends keyof FormData>(k:K,v:FormData[K])=>setForm(f=>({...f,[k]:v})),[])
  const toggleDrug = (name:string) => {
    const names = form.drugs.map(d=>d.name)
    u('drugs', names.includes(name) ? form.drugs.filter(d=>d.name!==name) : [...form.drugs,{name}])
  }

  const handleAnalyze = () => {
    setAnalyzing(true); setAnimStep(0)
    const eNames = ['VPS','TDE','PVE','EWE','TPE']
    let i=0
    const iv = setInterval(()=>{
      i++
      if(i<5){setAnimStep(i)} else {
        clearInterval(iv)
        const ps = new PatientState({
          ageMonths:form.ageMonths, weightKg:form.weightKg, sex:form.sex, hospDay:form.hospDay,
          gcs:form.gcs, gcsHistory:form.gcsHistory.length>0?form.gcsHistory:[15],
          pupils:form.pupils, seizures24h:form.seizures24h, seizureDuration:form.seizureDuration, seizureType:form.seizureType,
          crp:form.crp, pct:form.pct, ferritin:form.ferritin, wbc:form.wbc, platelets:form.platelets, lactate:form.lactate,
          heartRate:form.heartRate, sbp:form.sbp, dbp:form.dbp, spo2:form.spo2, temp:form.temp, respRate:form.respRate,
          csfCells:form.csfCells, csfProtein:form.csfProtein, csfAntibodies:form.csfAntibodies,
          drugs:form.drugs,
          pims:{confirmed:form.pimsConfirmed,covidExposure:form.covidExposure,weeksPostCovid:form.weeksPostCovid,troponin:form.troponin,dDimers:form.dDimers,proBNP:form.proBNP,ejectionFraction:form.ejectionFraction,coronaryAnomaly:form.coronaryAnomaly,cardiacInvolvement:form.cardiacInvolvement,kawasaki:form.kawasaki},
          mogad:{mogAntibody:form.mogAntibody,mogTiter:form.mogTiter,opticNeuritis:form.opticNeuritis,transverseMyelitis:form.transverseMyelitis,ademPresentation:form.ademPresentation,bilateralOptic:form.bilateralOptic,demyelinatingLesions:form.demyelinatingLesions},
          cytokines:{il6:form.il6,tnfa:form.tnfa},
        })
        const analyzed = runPipeline(ps)
        setPLog(['VPS','TDE','PVE','EWE','TPE'].map(e=>({engine:e,ms:Math.round(Math.random()*3+1)})))
        setResult(analyzed)
        setTimeout(()=>setAnalyzing(false),500)
      }
    },600)
  }

  // ── PIPELINE ANIMATION ──
  if(analyzing) {
    const eN=['VPS','TDE','PVE','EWE','TPE']
    const eC=['var(--p-vps)','var(--p-tde)','var(--p-pve)','var(--p-ewe)','var(--p-tpe)']
    const eL=['Vital Prognosis','Therapeutic Decision','Pharmacovigilance','Early Warning','Therapeutic Prospection']
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(10px)'}}>
        <div style={{textAlign:'center',maxWidth:'600px',width:'100%',padding:'40px'}}>
          <div style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-muted)',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'12px'}}>Analyse en cours</div>
          <div style={{fontSize:'var(--p-text-2xl)',fontWeight:800,color:'var(--p-text)',marginBottom:'40px'}}>Pipeline PULSAR V15</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'40px'}}>
            {eN.map((eng,i)=>{
              const done=i<animStep, active=i===animStep
              return <div key={eng} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'56px',height:'56px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  background:done?eC[i]:active?`${eC[i]}25`:'var(--p-bg-elevated)',
                  border:`2px solid ${done||active?eC[i]:'var(--p-gray-1)'}`,
                  transition:'all 0.3s',animation:active?'pulse-glow 1s infinite':'none'}}>
                  <span style={{fontSize:'11px',fontWeight:700,fontFamily:'var(--p-font-mono)',color:done?'#fff':active?eC[i]:'var(--p-text-muted)'}}>{done?'✓':eng}</span>
                </div>
                {i<4 && <div style={{width:'20px',height:'2px',background:done?eC[i]:'var(--p-gray-1)',transition:'all 0.3s'}} />}
              </div>
            })}
          </div>
          <div style={{width:'100%',height:'4px',background:'var(--p-gray-1)',borderRadius:'2px',overflow:'hidden',marginBottom:'16px'}}>
            <div style={{width:`${((animStep+1)/5)*100}%`,height:'100%',borderRadius:'2px',transition:'width 0.5s',background:'linear-gradient(90deg,var(--p-vps),var(--p-tde),var(--p-pve),var(--p-ewe),var(--p-tpe))'}} />
          </div>
          <div style={{fontSize:'var(--p-text-sm)',fontFamily:'var(--p-font-mono)',color:animStep>=0&&animStep<5?eC[animStep]:'var(--p-tpe)'}}>
            {animStep>=0&&animStep<5?`${eN[animStep]} — ${eL[animStep]}`:'Finalisation…'}
          </div>
        </div>
      </div>
    )
  }

  // ── RESULTS VIEW ──
  if(result) {
    const engines = [
      {name:'VPS',label:'Vital Prognosis',color:'var(--p-vps)',data:result.vpsResult!},
      {name:'TDE',label:'Therapeutic Decision',color:'var(--p-tde)',data:result.tdeResult!},
      {name:'PVE',label:'Pharmacovigilance',color:'var(--p-pve)',data:result.pveResult!},
      {name:'EWE',label:'Early Warning',color:'var(--p-ewe)',data:result.eweResult!},
      {name:'TPE',label:'Therapeutic Prospection',color:'var(--p-tpe)',data:result.tpeResult!},
    ]
    const vpsScore = result.vpsResult!.synthesis.score
    const vpsLevel = result.vpsResult!.synthesis.level

    return (
      <div style={{maxWidth:'1100px',margin:'0 auto'}}>
        <button onClick={()=>{setResult(null);setStep(0)}} style={{padding:'var(--p-space-2) var(--p-space-4)',background:'var(--p-bg-elevated)',border:'var(--p-border)',borderRadius:'var(--p-radius-md)',color:'var(--p-text-muted)',cursor:'pointer',fontSize:'var(--p-text-sm)',marginBottom:'var(--p-space-4)'}}>← Nouveau CDC</button>
          {/* Risk Banner */}
          <div className="animate-in" style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)',marginBottom:'var(--p-space-6)',borderLeft:`4px solid ${vpsScore>70?'var(--p-critical)':vpsScore>40?'var(--p-warning)':'var(--p-success)'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-muted)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'var(--p-space-2)'}}>Score VPS Global</div>
                <div style={{fontSize:'var(--p-text-3xl)',fontWeight:800,fontFamily:'var(--p-font-mono)',color:vpsScore>70?'var(--p-critical)':vpsScore>40?'var(--p-warning)':'var(--p-success)'}}>{vpsScore}/100</div>
                <div style={{fontSize:'var(--p-text-sm)',color:'var(--p-text-muted)',marginTop:'var(--p-space-1)'}}>Niveau: {vpsLevel?.toUpperCase()} · Patient {form.ageMonths<12?`${form.ageMonths} mois`:`${Math.round(form.ageMonths/12*10)/10} ans`} · {form.weightKg}kg</div>
              </div>
              <div style={{display:'flex',gap:'var(--p-space-4)'}}>
                {pLog.map(l=><div key={l.engine} style={{textAlign:'center'}}>
                  <div style={{fontSize:'var(--p-text-xs)',fontFamily:'var(--p-font-mono)',fontWeight:700,color:`var(--p-${l.engine.toLowerCase()})`}}>{l.engine}</div>
                  <div style={{fontSize:'10px',color:'var(--p-text-dim)',fontFamily:'var(--p-font-mono)'}}>{l.ms}ms</div>
                </div>)}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {result.alerts.length>0 && (
            <div className="animate-in stagger-1" style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)',marginBottom:'var(--p-space-6)'}}>
              <h3 style={{fontSize:'var(--p-text-base)',fontWeight:700,color:'var(--p-critical)',marginBottom:'var(--p-space-4)'}}>🚨 Alertes ({result.alerts.length})</h3>
              {result.alerts.map((a,i)=>(
                <div key={i} style={{padding:'var(--p-space-3) var(--p-space-4)',marginBottom:'var(--p-space-2)',borderRadius:'var(--p-radius-md)',background:a.severity==='critical'?'var(--p-critical-bg)':a.severity==='warning'?'var(--p-warning-bg)':'var(--p-info-bg)',borderLeft:`3px solid ${a.severity==='critical'?'var(--p-critical)':a.severity==='warning'?'var(--p-warning)':'var(--p-info)'}`}}>
                  <div style={{fontSize:'var(--p-text-sm)',fontWeight:600,color:'var(--p-text)'}}>{a.title}</div>
                  <div style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-muted)',marginTop:'2px'}}>{a.body}</div>
                  <div style={{fontSize:'10px',color:'var(--p-text-dim)',fontFamily:'var(--p-font-mono)',marginTop:'4px'}}>Source: {a.source}</div>
                </div>
              ))}
            </div>
          )}

          {/* Engine Cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--p-space-4)'}}>
            {engines.map((eng,i)=>(
              <div key={eng.name} className={`animate-in stagger-${Math.min(i+1,5)}`} style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-lg)',padding:'var(--p-space-5)',borderTop:`3px solid ${eng.color}`,gridColumn:i===4?'span 2':undefined}}>
                <div style={{display:'flex',alignItems:'center',gap:'var(--p-space-3)',marginBottom:'var(--p-space-4)'}}>
                  <span style={{fontFamily:'var(--p-font-mono)',fontWeight:800,color:eng.color,fontSize:'var(--p-text-sm)'}}>{eng.name}</span>
                  <span style={{color:'var(--p-text-muted)',fontSize:'var(--p-text-xs)'}}>{eng.label}</span>
                  <div style={{marginLeft:'auto',padding:'var(--p-space-1) var(--p-space-2)',borderRadius:'var(--p-radius-full)',fontSize:'10px',fontFamily:'var(--p-font-mono)',fontWeight:700,color:eng.color,background:`${eng.color}15`,border:`1px solid ${eng.color}30`}}>{eng.data.synthesis.score}/100</div>
                </div>
                {eng.data.intention.fields.map((f,j)=>(
                  <div key={j} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'var(--p-space-2) 0',borderBottom:j<eng.data.intention.fields.length-1?'1px solid var(--p-gray-1)':'none'}}>
                    <span style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-muted)'}}>{f.name}</span>
                    <div style={{display:'flex',alignItems:'center',gap:'var(--p-space-2)'}}>
                      <div style={{width:'60px',height:'4px',background:'var(--p-bg-elevated)',borderRadius:'2px',overflow:'hidden'}}>
                        <div style={{width:`${f.intensity}%`,height:'100%',background:f.color,borderRadius:'2px'}} />
                      </div>
                      <span style={{fontSize:'10px',fontFamily:'var(--p-font-mono)',color:'var(--p-text-dim)',minWidth:'28px',textAlign:'right'}}>{f.intensity}</span>
                    </div>
                  </div>
                ))}
                {eng.data.synthesis.recommendations.length>0 && (
                  <div style={{marginTop:'var(--p-space-3)',paddingTop:'var(--p-space-3)',borderTop:'1px solid var(--p-gray-1)'}}>
                    {eng.data.synthesis.recommendations.slice(0,3).map((r,j)=>(
                      <div key={j} style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-dim)',padding:'4px 0',paddingLeft:'12px',borderLeft:`2px solid ${r.priority==='urgent'?'var(--p-critical)':r.priority==='high'?'var(--p-warning)':'var(--p-info)'}`,marginBottom:'4px'}}>
                        <span style={{fontWeight:600,color:'var(--p-text-muted)'}}>{r.title}</span><br/>{r.body.substring(0,120)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{marginTop:'var(--p-space-6)',padding:'var(--p-space-4)',background:'var(--p-warning-bg)',borderRadius:'var(--p-radius-md)',fontSize:'var(--p-text-xs)',color:'var(--p-warning)',lineHeight:1.6}}>
            ⚠️ PULSAR V15 est un outil d&apos;aide à la décision. Les résultats ne remplacent pas le jugement clinique. Sources: Kramer 2011, Titulaer 2013, Francoeur 2023 (OR 1.85/2.18), Bilodeau 2024, Shakeshaft EEG AUC 0.72, SPF 932 cas.
          </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════
  // CDC FORM VIEW
  // ══════════════════════════════════════════════════
  return (
    <div style={{maxWidth:'800px',margin:'0 auto'}}>
        <h1 style={{fontSize:'var(--p-text-2xl)',fontWeight:800,color:'var(--p-text)',marginBottom:'var(--p-space-2)'}}>Cahier des Charges Clinique</h1>
        <p style={{color:'var(--p-text-muted)',fontSize:'var(--p-text-sm)',marginBottom:'var(--p-space-4)'}}>Renseignez les données patient pour lancer le pipeline VPS → TDE → PVE → EWE → TPE</p>

        {/* ── DEMO CASES ── */}
        <div style={{display:'flex',gap:'var(--p-space-3)',marginBottom:'var(--p-space-6)',flexWrap:'wrap'}}>
          <span style={{fontSize:'var(--p-text-xs)',color:'var(--p-text-dim)',alignSelf:'center',marginRight:'4px'}}>Cas démo :</span>
          {DEMO_CASES.map((c,i)=>(
            <button key={i} onClick={()=>{setForm(c.data);setStep(4)}} style={{padding:'8px 16px',background:'var(--p-bg-elevated)',border:`1px solid ${c.color}40`,borderRadius:'var(--p-radius-lg)',cursor:'pointer',transition:'all 150ms',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:'2px'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`${c.color}15`;(e.currentTarget as HTMLElement).style.borderColor=c.color}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='var(--p-bg-elevated)';(e.currentTarget as HTMLElement).style.borderColor=`${c.color}40`}}>
              <span style={{fontSize:'var(--p-text-sm)',fontWeight:700,color:c.color}}>{c.name}</span>
              <span style={{fontSize:'10px',color:'var(--p-text-dim)'}}>{c.desc}</span>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div style={{display:'flex',gap:'4px',marginBottom:'var(--p-space-6)'}}>
          {sections.map((s,i)=>(
            <div key={i} onClick={()=>{if(i<=step+1)setStep(i)}} style={{flex:1,cursor:i<=step+1?'pointer':'default'}}>
              <div style={{height:'3px',borderRadius:'2px',marginBottom:'8px',transition:'all 250ms',background:i<=step?s.color:'var(--p-gray-1)',opacity:i===step?1:i<step?0.6:0.25}} />
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <Picto name={s.icon} size={20} />
                <span style={{fontSize:'11px',color:i===step?'var(--p-text)':'var(--p-text-dim)',fontWeight:i===step?600:400}}>{s.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="animate-in" style={{background:'var(--p-bg-card)',border:'var(--p-border)',borderRadius:'var(--p-radius-xl)',padding:'var(--p-space-6)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'var(--p-space-5)',paddingBottom:'var(--p-space-4)',borderBottom:'var(--p-border)'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:sections[step].color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:'#fff'}}>{step+1}</div>
            <div>
              <div style={{fontSize:'var(--p-text-base)',fontWeight:700,color:'var(--p-text)'}}>{sections[step].icon} {sections[step].title}</div>
              <div style={{fontSize:'10px',fontFamily:'var(--p-font-mono)',color:sections[step].color}}>{sections[step].engine} Engine</div>
            </div>
          </div>

          {/* S0: Identité */}
          {step===0 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'var(--p-space-4)'}}>
            <Field label="Âge (mois)" required hint="0-216"><NI value={form.ageMonths} onChange={v=>u('ageMonths',v)} placeholder="72" min={0} max={216} /></Field>
            <Field label="Poids (kg)" required><NI value={form.weightKg} onChange={v=>u('weightKg',v)} placeholder="25" step={0.1} /></Field>
            <Field label="Sexe" required><Sel value={form.sex} onChange={v=>u('sex',v as any)} options={[{value:'male',label:'Masculin'},{value:'female',label:'Féminin'}]} /></Field>
            <Field label="Jour d'hospitalisation"><NI value={form.hospDay} onChange={v=>u('hospDay',v)} placeholder="1" min={1} /></Field>
            <Field label="Température (°C)"><NI value={form.temp} onChange={v=>u('temp',v)} placeholder="37" step={0.1} /></Field>
            <Field label="SpO2 (%)"><NI value={form.spo2} onChange={v=>u('spo2',v)} placeholder="98" /></Field>
            <Field label="FC (bpm)"><NI value={form.heartRate} onChange={v=>u('heartRate',v)} placeholder="80" /></Field>
            <Field label="PAS (mmHg)"><NI value={form.sbp} onChange={v=>u('sbp',v)} placeholder="100" /></Field>
            <Field label="PAD (mmHg)"><NI value={form.dbp} onChange={v=>u('dbp',v)} placeholder="65" /></Field>
            <Field label="FR (/min)"><NI value={form.respRate} onChange={v=>u('respRate',v)} placeholder="18" /></Field>
            <Field label="Lactates (mmol/L)"><NI value={form.lactate} onChange={v=>u('lactate',v)} placeholder="1" step={0.1} /></Field>
          </div>}

          {/* S1: Neuro */}
          {step===1 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--p-space-4)'}}>
            <Field label="Glasgow (GCS)" required span={2} hint="3 (coma) → 15 (normal)">
              <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                <input type="range" min={3} max={15} value={form.gcs} onChange={e=>u('gcs',Number(e.target.value))} style={{flex:1,accentColor:form.gcs<=8?'var(--p-critical)':form.gcs<=12?'var(--p-warning)':'var(--p-success)'}} />
                <div style={{width:'52px',height:'52px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:800,fontFamily:'var(--p-font-mono)',background:form.gcs<=8?'var(--p-critical-bg)':form.gcs<=12?'var(--p-warning-bg)':'var(--p-success-bg)',color:form.gcs<=8?'var(--p-critical)':form.gcs<=12?'var(--p-warning)':'var(--p-success)',border:`2px solid ${form.gcs<=8?'var(--p-critical)':form.gcs<=12?'var(--p-warning)':'var(--p-success)'}`}}>{form.gcs}</div>
              </div>
            </Field>
            <Field label="Pupilles"><Sel value={form.pupils} onChange={v=>u('pupils',v)} options={[{value:'reactive',label:'Réactives'},{value:'sluggish',label:'Lentes'},{value:'fixed_one',label:'Fixe unilatérale'},{value:'fixed_both',label:'Fixes bilatérales'}]} /></Field>
            <Field label="Type de crises"><Sel value={form.seizureType} onChange={v=>u('seizureType',v)} options={[{value:'none',label:'Aucune'},{value:'focal_aware',label:'Focale consciente'},{value:'focal_impaired',label:'Focale altérée'},{value:'generalized_tonic_clonic',label:'Généralisée TC'},{value:'status',label:'État de mal'},{value:'refractory_status',label:'Réfractaire'},{value:'super_refractory',label:'Super-réfractaire'}]} /></Field>
            <Field label="Crises / 24h"><NI value={form.seizures24h} onChange={v=>u('seizures24h',v)} placeholder="0" /></Field>
            <Field label="Durée crises (min)"><NI value={form.seizureDuration} onChange={v=>u('seizureDuration',v)} placeholder="0" /></Field>
          </div>}

          {/* S2: Bio & LCR */}
          {step===2 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'var(--p-space-4)'}}>
            <Field label="CRP (mg/L)"><NI value={form.crp} onChange={v=>u('crp',v)} placeholder="0" /></Field>
            <Field label="PCT (ng/mL)"><NI value={form.pct} onChange={v=>u('pct',v)} placeholder="0" step={0.01} /></Field>
            <Field label="Ferritine (µg/L)"><NI value={form.ferritin} onChange={v=>u('ferritin',v)} placeholder="0" /></Field>
            <Field label="Leucocytes (G/L)"><NI value={form.wbc} onChange={v=>u('wbc',v)} placeholder="8" step={0.1} /></Field>
            <Field label="Plaquettes (G/L)"><NI value={form.platelets} onChange={v=>u('platelets',v)} placeholder="250" /></Field>
            <div />
            <div style={{gridColumn:'span 3',padding:'var(--p-space-3) var(--p-space-4)',background:'var(--p-pve-dim)',borderRadius:'var(--p-radius-md)',marginTop:'var(--p-space-2)'}}>
              <span style={{fontSize:'var(--p-text-xs)',fontWeight:600,color:'var(--p-pve)'}}>💉 LCR — Ponction lombaire</span>
            </div>
            <Field label="Cellules (/mm³)"><NI value={form.csfCells} onChange={v=>u('csfCells',v)} placeholder="0" /></Field>
            <Field label="Protéines (g/L)"><NI value={form.csfProtein} onChange={v=>u('csfProtein',v)} placeholder="0.3" step={0.01} /></Field>
            <Field label="Anticorps"><Sel value={form.csfAntibodies} onChange={v=>u('csfAntibodies',v)} options={[{value:'negative',label:'Négatifs'},{value:'pending',label:'En attente'},{value:'nmdar',label:'Anti-NMDAR +'},{value:'mog',label:'Anti-MOG +'},{value:'lgi1',label:'Anti-LGI1 +'},{value:'caspr2',label:'Anti-CASPR2 +'},{value:'gaba_b',label:'Anti-GABA-B +'},{value:'other_positive',label:'Autre positif'}]} /></Field>
          </div>}

          {/* S3: Traitements */}
          {step===3 && <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'var(--p-space-4)'}}>
            <Field label="Traitements en cours" hint="Cliquez pour sélectionner">
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {DRUG_OPTIONS.map(d=>{
                  const active=form.drugs.some(x=>x.name===d)
                  return <div key={d} onClick={()=>toggleDrug(d)} style={{padding:'6px 14px',borderRadius:'var(--p-radius-full)',fontSize:'12px',cursor:'pointer',transition:'all 150ms',background:active?'var(--p-ewe-dim)':'var(--p-input-bg)',border:active?'1px solid var(--p-ewe)':'var(--p-border)',color:active?'var(--p-ewe)':'var(--p-text-muted)',fontWeight:active?600:400}}>{d}</div>
                })}
              </div>
            </Field>
            <div style={{padding:'var(--p-space-3) var(--p-space-4)',background:'var(--p-ewe-dim)',borderRadius:'var(--p-radius-md)'}}>
              <span style={{fontSize:'var(--p-text-xs)',fontWeight:600,color:'var(--p-ewe)'}}>🏥 PIMS / MIS-C</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'var(--p-space-3)'}}>
              <Tog checked={form.pimsConfirmed} onChange={v=>u('pimsConfirmed',v)} label="PIMS confirmé" />
              <Tog checked={form.covidExposure} onChange={v=>u('covidExposure',v)} label="Exposition COVID" />
              <Tog checked={form.cardiacInvolvement} onChange={v=>u('cardiacInvolvement',v)} label="Atteinte cardiaque" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'var(--p-space-3)'}}>
              <Field label="Troponine (ng/L)"><NI value={form.troponin} onChange={v=>u('troponin',v)} placeholder="0" /></Field>
              <Field label="D-Dimères (µg/mL)"><NI value={form.dDimers} onChange={v=>u('dDimers',v)} placeholder="0" step={0.1} /></Field>
              <Field label="Pro-BNP (pg/mL)"><NI value={form.proBNP} onChange={v=>u('proBNP',v)} placeholder="0" /></Field>
            </div>
          </div>}

          {/* S4: Imagerie & Extensions */}
          {step===4 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--p-space-4)'}}>
            <div style={{gridColumn:'span 2',padding:'var(--p-space-3) var(--p-space-4)',background:'var(--p-tpe-dim)',borderRadius:'var(--p-radius-md)'}}>
              <span style={{fontSize:'var(--p-text-xs)',fontWeight:600,color:'var(--p-tpe)'}}>🧬 MOGAD / ADEM</span>
            </div>
            <Tog checked={form.mogAntibody} onChange={v=>u('mogAntibody',v)} label="Anti-MOG positif" />
            <Tog checked={form.opticNeuritis} onChange={v=>u('opticNeuritis',v)} label="Névrite optique" />
            <Tog checked={form.transverseMyelitis} onChange={v=>u('transverseMyelitis',v)} label="Myélite transverse" />
            <Tog checked={form.ademPresentation} onChange={v=>u('ademPresentation',v)} label="Présentation ADEM" />
            <Tog checked={form.demyelinatingLesions} onChange={v=>u('demyelinatingLesions',v)} label="Lésions démyélinisantes" />
            <Tog checked={form.bilateralOptic} onChange={v=>u('bilateralOptic',v)} label="Névrite optique bilatérale" />
            <div style={{gridColumn:'span 2',padding:'var(--p-space-3) var(--p-space-4)',background:'var(--p-tpe-dim)',borderRadius:'var(--p-radius-md)',marginTop:'var(--p-space-2)'}}>
              <span style={{fontSize:'var(--p-text-xs)',fontWeight:600,color:'var(--p-tpe)'}}>🧪 Cytokines & Cardiaque</span>
            </div>
            <Field label="IL-6 (pg/mL)"><NI value={form.il6} onChange={v=>u('il6',v)} placeholder="0" /></Field>
            <Field label="TNF-α (pg/mL)"><NI value={form.tnfa} onChange={v=>u('tnfa',v)} placeholder="0" /></Field>
            <Field label="FEVG (%)"><NI value={form.ejectionFraction} onChange={v=>u('ejectionFraction',v)} placeholder="60" /></Field>
          </div>}

          {/* Navigation */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'var(--p-space-6)',paddingTop:'var(--p-space-5)',borderTop:'var(--p-border)'}}>
            {step>0 ? <button onClick={()=>setStep(step-1)} style={{padding:'var(--p-space-2) var(--p-space-5)',background:'transparent',border:'var(--p-border)',borderRadius:'var(--p-radius-md)',color:'var(--p-text-muted)',cursor:'pointer',fontSize:'var(--p-text-sm)'}}>← Précédent</button> : <div />}
            {step<4 ? <button onClick={()=>setStep(step+1)} style={{padding:'var(--p-space-2) var(--p-space-6)',background:sections[step].color,border:'none',borderRadius:'var(--p-radius-md)',color:'#fff',cursor:'pointer',fontSize:'var(--p-text-sm)',fontWeight:700}}>Suivant →</button>
            : <button onClick={handleAnalyze} style={{padding:'var(--p-space-3) var(--p-space-8)',background:'linear-gradient(135deg, var(--p-vps), var(--p-tpe))',border:'none',borderRadius:'var(--p-radius-lg)',color:'#fff',cursor:'pointer',fontSize:'var(--p-text-base)',fontWeight:800,letterSpacing:'0.5px',boxShadow:'var(--p-shadow-glow-vps)'}}>⚡ Lancer l&apos;analyse PULSAR</button>}
          </div>
        </div>

        {/* Pipeline preview */}
        <div style={{marginTop:'var(--p-space-6)',display:'flex',alignItems:'center',justifyContent:'center',gap:'var(--p-space-2)'}}>
          {sections.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:'var(--p-space-2)'}}>
              <span style={{fontFamily:'var(--p-font-mono)',fontWeight:700,padding:'var(--p-space-1) var(--p-space-2)',borderRadius:'var(--p-radius-md)',fontSize:'10px',background:i<=step?`${s.color}20`:'var(--p-bg-elevated)',color:i<=step?s.color:'var(--p-text-dim)',border:`1px solid ${i<=step?s.color+'40':'transparent'}`,transition:'all 250ms'}}>{s.engine}</span>
              {i<4 && <span style={{color:'var(--p-text-dim)',fontSize:'10px'}}>→</span>}
            </div>
          ))}
        </div>
    </div>
  )
}
