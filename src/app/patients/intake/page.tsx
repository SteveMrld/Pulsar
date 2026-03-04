'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import Picto from '@/components/Picto'
import RoleGate from '@/components/RoleGate'
import { analyzeIntake, DEFAULT_HISTORY, type IntakeData, type AdmissionMode, type ExistingExam, type MedicalHistory, type IntakeAnalysis, type HistoryAlert } from '@/lib/engines/IntakeAnalyzer'
import { intakeToPatientState, formatAge } from '@/lib/engines/intakeToPatientState'
import { intakePersistenceService } from '@/lib/services/intakePersistenceService'

/* ══════════════════════════════════════════════════════════════
   INTAKE V17.1 — Module d'Analyse Intelligente de Dossier
   2 modes : Transfert / Première admission
   Split-screen : Saisie ← | → Analyse IA live
   ══════════════════════════════════════════════════════════════ */

const SEI_TYPES = [
  { value: '', label: 'Aucune crise' }, { value: 'focal_aware', label: 'Focale simple' },
  { value: 'focal_impaired', label: 'Focale avec alt. conscience' }, { value: 'generalized_tonic_clonic', label: 'TC généralisée' },
  { value: 'status', label: 'Status epilepticus' }, { value: 'refractory_status', label: 'Status réfractaire' },
  { value: 'super_refractory', label: 'Status super-réfractaire' },
]
const FOCAL_SIGNS = [
  { value: 'hemiparesis', label: 'Hémiparésie' }, { value: 'aphasia', label: 'Aphasie' },
  { value: 'dyskinesia', label: 'Dyskinésie' }, { value: 'chorea', label: 'Chorée' },
  { value: 'optic_neuritis', label: 'Névrite optique' }, { value: 'cranial_nerve', label: 'Paire crânienne' },
]
const MRI_FINDS = [
  { value: 'normal', label: 'Normal' }, { value: 'limbic_temporal', label: 'Hypersignal limbique' },
  { value: 'cortical_diffusion', label: 'Restriction diffusion' }, { value: 'demyelination_large', label: 'Démyélinisation (ADEM)' },
  { value: 'demyelination_periventricular', label: 'Démyélinisation périV' }, { value: 'basal_ganglia', label: 'Noyaux gris' },
  { value: 'meningeal_enhancement', label: 'Rehaussement méningé' }, { value: 'vasculitis_pattern', label: 'Vasculite' },
]
const CSF_AB = [
  { value: 'negative', label: 'Négatif' }, { value: 'pending', label: 'En attente' },
  { value: 'nmdar', label: 'Anti-NMDAR +' }, { value: 'mog', label: 'Anti-MOG +' },
  { value: 'lgi1', label: 'Anti-LGI1 +' }, { value: 'caspr2', label: 'Anti-CASPR2 +' },
  { value: 'other_positive', label: 'Autre +' },
]

const inputS: React.CSSProperties = { width:'100%',padding:'8px 12px',borderRadius:'var(--p-radius-md)',background:'var(--p-bg-elevated)',border:'1px solid rgba(108,124,255,0.1)',color:'var(--p-text)',fontFamily:'var(--p-font-mono)',fontSize:'12px',outline:'none',boxSizing:'border-box' }
const selS: React.CSSProperties = { ...inputS,cursor:'pointer',appearance:'auto' as React.CSSProperties['appearance'] }

function F({ label,children,tip,span }:{ label:string;children:React.ReactNode;tip?:string;span?:number }) {
  return <div style={{gridColumn:span?`span ${span}`:undefined}}><label style={{display:'block',fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'0.5px',marginBottom:'4px'}}>{label}</label>{children}{tip&&<div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',marginTop:'2px',opacity:0.6}}>{tip}</div>}</div>
}
function Chip({ label,active,color,onClick }:{ label:string;active:boolean;color?:string;onClick:()=>void }) {
  const c = color||'#6C7CFF'
  return <button onClick={onClick} style={{padding:'5px 12px',borderRadius:'var(--p-radius-full)',background:active?`${c}12`:'var(--p-bg-elevated)',border:active?`1px solid ${c}30`:'1px solid rgba(108,124,255,0.1)',color:active?c:'var(--p-text-dim)',fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:active?700:500,cursor:'pointer'}}>{label}</button>
}
function Toggle({ label,sub,active,color,onClick }:{ label:string;sub:string;active:boolean;color?:string;onClick:()=>void }) {
  const c = active ? (color||'#FFB347') : 'var(--p-text)'
  return <button onClick={onClick} style={{padding:'12px 16px',borderRadius:'var(--p-radius-lg)',cursor:'pointer',background:active?`${color||'#FFB347'}10`:'var(--p-bg-elevated)',border:active?`1px solid ${color||'#FFB347'}25`:'1px solid rgba(108,124,255,0.1)',textAlign:'left',width:'100%'}}><div style={{fontFamily:'var(--p-font-mono)',fontSize:'11px',fontWeight:700,color:c}}>{label}</div><div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)',marginTop:'2px'}}>{sub}</div></button>
}
function ConfBar({ value,color }:{ value:number;color:string }) {
  return <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}><div style={{width:`${value}%`,height:'100%',background:color,borderRadius:'2px',transition:'width 0.4s',boxShadow:`0 0 8px ${color}40`}}/></div>
}
function UrgencyGauge({ score,level }:{ score:number;level:string }) {
  const color = level==='critical'?'#8B5CF6':level==='high'?'#FFA502':level==='moderate'?'#FFB347':'#2ED573'
  const r=38,c=2*Math.PI*r,pct=Math.min(score,100)/100
  return <div style={{display:'flex',alignItems:'center',gap:'16px'}}><svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/><circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${c*pct*0.75} ${c}`} strokeLinecap="round" transform="rotate(-225 45 45)" style={{transition:'stroke-dasharray 0.5s',filter:`drop-shadow(0 0 6px ${color})`}}/><text x="45" y="42" textAnchor="middle" fill={color} fontFamily="var(--p-font-mono)" fontWeight="900" fontSize="22">{score}</text><text x="45" y="56" textAnchor="middle" fill="var(--p-text-dim)" fontFamily="var(--p-font-mono)" fontSize="8" letterSpacing="0.5">URGENCE</text></svg><div><div style={{fontFamily:'var(--p-font-mono)',fontSize:'11px',fontWeight:800,color,textTransform:'uppercase',letterSpacing:'1px'}}>{level}</div><div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)',marginTop:'2px'}}>{level==='critical'?'Prise en charge immédiate':level==='high'?'Bilan urgent < 1h':level==='moderate'?'Bilan programmé':'Surveillance standard'}</div></div></div>
}
function Badge({ label,color }:{ label:string;color:string }) {
  return <span style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',fontWeight:800,padding:'2px 8px',borderRadius:'var(--p-radius-full)',background:`${color}12`,color,border:`1px solid ${color}25`,textTransform:'uppercase',letterSpacing:'0.5px',flexShrink:0}}>{label}</span>
}

/* ══════ MAIN PAGE ══════ */
export default function IntakePage() {
  const { t } = useLang()
  const router = useRouter()
  const [data, setData] = useState<Partial<IntakeData>>({
    admissionMode: 'first_admission', transferHospital: '', transferReason: '',
    gcs:15,temp:37,hr:80,spo2:98,rr:18,seizures24h:0,
    wbc:8,platelets:250,lactate:1,crp:0,ferritin:0,pct:0,
    csfDone:false,eegDone:false,mriDone:false,feverBefore:false,symptomOnsetDays:0,
    focalSigns:[],mriFindings:[],currentDrugs:[],
    sex:'',seizureType:'',consciousness:'alert',pupils:'reactive',csfAntibodies:'negative',eegStatus:'',
    history: { ...DEFAULT_HISTORY },
    existingExams: [],
  })

  const analysis = useMemo(() => analyzeIntake(data), [data])
  const h = data.history || DEFAULT_HISTORY
  const isTransfer = data.admissionMode === 'transfer'

  // ── Patient identity (not part of analysis) ──
  const [patientName, setPatientName] = useState('')
  const [patientRoom, setPatientRoom] = useState('')
  const [admitting, setAdmitting] = useState(false)

  const set = (key: keyof IntakeData, value: unknown) => setData(prev => ({ ...prev, [key]: value }))
  const num = (key: keyof IntakeData, v: string) => set(key, v===''?0:parseFloat(v))
  const setH = (key: keyof MedicalHistory, value: unknown) => setData(prev => ({ ...prev, history: { ...DEFAULT_HISTORY, ...prev.history, [key]: value } }))
  const toggleArr = (key: 'focalSigns'|'mriFindings', val: string) => {
    const arr = (data[key] as string[])||[]; set(key, arr.includes(val)?arr.filter(x=>x!==val):[...arr,val])
  }
  const addExam = (type: ExistingExam['type'], name: string) => {
    const exams = [...(data.existingExams||[]), { type, name, done: true, result: '', date: '', hospital: data.transferHospital||'', normal: null as boolean|null }]
    set('existingExams', exams)
  }
  const updateExam = (idx: number, field: keyof ExistingExam, value: unknown) => {
    const exams = [...(data.existingExams||[])]; const ex = { ...exams[idx], [field]: value }; exams[idx] = ex; set('existingExams', exams)
  }
  const removeExam = (idx: number) => { const exams = [...(data.existingExams||[])]; exams.splice(idx, 1); set('existingExams', exams) }

  const [tab, setTab] = useState<string>('identity')

  const TABS = [
    { id:'identity', label:'Identité', icon:'heart', color:'#6C7CFF' },
    { id:'mode', label:'Mode', icon:'play', color:'#6C7CFF' },
    { id:'history', label:'Antécédents', icon:'clipboard', color:'#FFB347' },
    { id:'neuro', label:'Neuro', icon:'brain', color:'#8B5CF6' },
    { id:'bio', label:'Bio / LCR', icon:'blood', color:'#B96BFF' },
    { id:'imaging', label:'EEG / IRM', icon:'eeg', color:'#2FD1C8' },
    ...(isTransfer ? [{ id:'transfer', label:'Examens transf.', icon:'export', color:'#2ED573' }] : []),
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--p-bg)'}}>
      {/* TOP BAR */}
      <div style={{padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--p-border)',background:'var(--p-bg-card)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/patients" style={{display:'flex',alignItems:'center',padding:'6px',borderRadius:'var(--p-radius-md)',color:'var(--p-text-dim)',textDecoration:'none'}}><span style={{fontSize:'16px'}}>←</span></Link>
          <Picto name="brain" size={24} glow glowColor="rgba(108,124,255,0.5)" />
          <div>
            <h1 style={{fontSize:'16px',fontWeight:800,color:'var(--p-text)',margin:0}}>Analyse Intelligente</h1>
            <span style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',letterSpacing:'1px'}}>
              {isTransfer ? 'MODE TRANSFERT' : 'PREMIÈRE ADMISSION'} · 5 MOTEURS · SCAN ATCD
            </span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          {analysis.historyAlerts.filter(a=>a.severity==='critical').length > 0 && <Badge label={`${analysis.historyAlerts.filter(a=>a.severity==='critical').length} alerte ATCD`} color="#8B5CF6" />}
          <Badge label={`${analysis.completeness}%`} color={analysis.completeness>=50?'#2ED573':'#6C7CFF'} />
        </div>
      </div>

      {/* SPLIT */}
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 420px',minHeight:'calc(100vh - 52px)'}} className="intake-split">
      <style>{`@media(max-width:900px){.intake-split{grid-template-columns:1fr !important}}`}</style>

      {/* ════ LEFT: FORM ════ */}
      <div style={{borderRight:'1px solid var(--p-border)',overflow:'auto'}}>
        <div style={{display:'flex',borderBottom:'1px solid var(--p-border)',padding:'0 12px',overflowX:'auto'}}>
          {TABS.map(t=>{const a=tab===t.id;return <button key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:'5px',padding:'10px 12px',background:'transparent',border:'none',borderBottom:a?`2px solid ${t.color}`:'2px solid transparent',cursor:'pointer',fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:a?800:600,color:a?t.color:'var(--p-text-dim)',whiteSpace:'nowrap'}}><Picto name={t.icon} size={13} glow={a} glowColor={`${t.color}40`}/>{t.label}</button>})}
        </div>
        <div style={{padding:'20px 24px',maxWidth:'700px'}}>

        {/* ── MODE ── */}
        {tab==='mode' && (
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'11px',fontWeight:800,color:'var(--p-text)',marginBottom:'4px'}}>Comment arrive le patient ?</div>
            {[
              { mode:'first_admission' as AdmissionMode, label:'Première admission', desc:'Patient admis directement — aucun examen préalable', icon:'alert', color:'#8B5CF6' },
              { mode:'transfer' as AdmissionMode, label:'Transfert inter-hospitalier', desc:'Patient transféré avec dossier et examens existants', icon:'export', color:'#2ED573' },
            ].map(m=>(
              <button key={m.mode} onClick={()=>{set('admissionMode',m.mode);setTab('history')}} style={{
                padding:'20px',borderRadius:'var(--p-radius-xl)',cursor:'pointer',textAlign:'left',
                background:data.admissionMode===m.mode?`${m.color}08`:'var(--p-bg-elevated)',
                border:data.admissionMode===m.mode?`2px solid ${m.color}25`:'2px solid rgba(108,124,255,0.06)',
                transition:'all 0.2s',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <Picto name={m.icon} size={28} glow={data.admissionMode===m.mode} glowColor={`${m.color}40`}/>
                  <div>
                    <div style={{fontFamily:'var(--p-font-mono)',fontSize:'14px',fontWeight:800,color:data.admissionMode===m.mode?m.color:'var(--p-text)'}}>{m.label}</div>
                    <div style={{fontFamily:'var(--p-font-mono)',fontSize:'10px',color:'var(--p-text-dim)',marginTop:'2px'}}>{m.desc}</div>
                  </div>
                </div>
              </button>
            ))}
            {isTransfer && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginTop:'8px'}}>
                <F label="HÔPITAL D'ORIGINE"><input style={inputS} value={data.transferHospital} onChange={e=>set('transferHospital',e.target.value)} placeholder="ex: CHU Necker"/></F>
                <F label="MOTIF DU TRANSFERT"><input style={inputS} value={data.transferReason} onChange={e=>set('transferReason',e.target.value)} placeholder="ex: Status réfractaire"/></F>
              </div>
            )}
          </div>
        )}

        {/* ── IDENTITY ── */}
        {tab==='identity' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <F label="NOM DU PATIENT" span={2}><input style={inputS} value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="ex: Sofia M."/></F>
            <F label="ÂGE (mois)"><input type="number" style={inputS} value={data.ageMonths||''} onChange={e=>num('ageMonths',e.target.value)} placeholder="ex: 48"/></F>
            <F label="SEXE"><select style={selS} value={data.sex} onChange={e=>set('sex',e.target.value)}><option value="">—</option><option value="female">Fille</option><option value="male">Garçon</option></select></F>
            <F label="POIDS (kg)"><input type="number" style={inputS} value={data.weight||''} onChange={e=>num('weight',e.target.value)}/></F>
            <F label="CHAMBRE / LIT"><input style={inputS} value={patientRoom} onChange={e=>setPatientRoom(e.target.value)} placeholder="ex: Réa Neuro — Lit 8"/></F>
            <F label="CONSCIENCE"><select style={selS} value={data.consciousness} onChange={e=>set('consciousness',e.target.value)}><option value="alert">Alerte</option><option value="drowsy">Somnolent</option><option value="confused">Confus / Agité</option><option value="stupor">Stupeur</option><option value="coma">Coma</option></select></F>
            <F label="DÉBUT DES SYMPTÔMES (jours)"><input type="number" style={inputS} value={data.symptomOnsetDays||''} onChange={e=>num('symptomOnsetDays',e.target.value)} placeholder="Nombre de jours depuis le début"/></F>
          </div>
        )}

        {/* ── ANTÉCÉDENTS ── */}
        {tab==='history' && (
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#8B5CF6',letterSpacing:'1px'}}>CONDITIONS CHRONIQUES</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <Toggle label="Drépanocytose" sub="HbSS / HbSC" active={h.sickleCellDisease} color="#8B5CF6" onClick={()=>setH('sickleCellDisease',!h.sickleCellDisease)}/>
              <Toggle label="Épilepsie connue" sub="Diagnostiquée avant admission" active={h.epilepsyKnown} color="#B96BFF" onClick={()=>setH('epilepsyKnown',!h.epilepsyKnown)}/>
              <Toggle label="Immunodéficience" sub="Primaire ou acquise" active={h.immunodeficiency} color="#8B5CF6" onClick={()=>setH('immunodeficiency',!h.immunodeficiency)}/>
              <Toggle label="Maladie auto-immune" sub="Lupus, SAPL, etc." active={h.autoimmune} color="#FFB347" onClick={()=>setH('autoimmune',!h.autoimmune)}/>
              <Toggle label="Diabète type 1" sub="Terrain auto-immun" active={h.diabetesType1} color="#FFB347" onClick={()=>setH('diabetesType1',!h.diabetesType1)}/>
              <Toggle label="Cardiopathie" sub="Congénitale ou acquise" active={h.cardiacDisease} color="#A78BFA" onClick={()=>setH('cardiacDisease',!h.cardiacDisease)}/>
              <Toggle label="Cancer / Tumeur" sub="Active ou en rémission" active={h.cancer} color="#8B5CF6" onClick={()=>setH('cancer',!h.cancer)}/>
              <Toggle label="Transplantation" sub="Organe solide ou moelle" active={h.transplant} color="#8B5CF6" onClick={()=>setH('transplant',!h.transplant)}/>
              <Toggle label="VIH positif" sub="Charge virale / CD4" active={h.hivPositive} color="#8B5CF6" onClick={()=>setH('hivPositive',!h.hivPositive)}/>
              <Toggle label="Hydrocéphalie / DVP" sub="Dérivation ventriculaire" active={h.hydrocephalus} color="#B96BFF" onClick={()=>setH('hydrocephalus',!h.hydrocephalus)}/>
              <Toggle label="TSA" sub="Trouble spectre autistique" active={h.tsa} color="#6C7CFF" onClick={()=>setH('tsa',!h.tsa)}/>
              <Toggle label="Asthme" sub="Traitement de fond" active={h.asthma} color="#6C7CFF" onClick={()=>setH('asthma',!h.asthma)}/>
            </div>
            {h.cancer && <F label="TYPE DE TUMEUR"><input style={inputS} value={h.cancerType} onChange={e=>setH('cancerType',e.target.value)} placeholder="ex: neuroblastome, lymphome"/></F>}
            {h.transplant && <F label="ORGANE TRANSPLANTÉ"><input style={inputS} value={h.transplantOrgan} onChange={e=>setH('transplantOrgan',e.target.value)} placeholder="ex: rein, foie, moelle"/></F>}

            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#FFB347',letterSpacing:'1px',marginTop:'8px'}}>ANTÉCÉDENTS INFECTIEUX & EXPOSITIONS</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <Toggle label="ATCD Méningite" sub="Âge et germe si connu" active={h.previousMeningitis} color="#FFB347" onClick={()=>setH('previousMeningitis',!h.previousMeningitis)}/>
              <Toggle label="ATCD Encéphalite" sub="Épisode antérieur" active={h.previousEncephalitis} color="#8B5CF6" onClick={()=>setH('previousEncephalitis',!h.previousEncephalitis)}/>
              <Toggle label="Herpès / HSV" sub="Encéphalite ou récidives" active={h.herpesHistory} color="#A78BFA" onClick={()=>setH('herpesHistory',!h.herpesHistory)}/>
              <Toggle label="COVID récent" sub="< 6 semaines" active={h.recentCovid} color="#FFB347" onClick={()=>setH('recentCovid',!h.recentCovid)}/>
              <Toggle label="EBV / CMV récent" sub="Mononucléose, CMV" active={h.recentEBVCMV} color="#FFB347" onClick={()=>setH('recentEBVCMV',!h.recentEBVCMV)}/>
              <Toggle label="Tuberculose" sub="ATCD ou contage" active={h.tuberculosis} color="#8B5CF6" onClick={()=>setH('tuberculosis',!h.tuberculosis)}/>
              <Toggle label="Voyage tropical" sub="Zone endémique récente" active={h.recentTropicalTravel} color="#FFB347" onClick={()=>setH('recentTropicalTravel',!h.recentTropicalTravel)}/>
              <Toggle label="Piqûre de tique" sub="Documentée ou suspectée" active={h.tickBite} color="#FFB347" onClick={()=>setH('tickBite',!h.tickBite)}/>
            </div>
            {h.previousMeningitis && <F label="ÂGE MÉNINGITE"><input style={inputS} value={h.meningitisAge} onChange={e=>setH('meningitisAge',e.target.value)} placeholder="ex: 2 ans, pneumocoque"/></F>}
            {h.recentCovid && <F label="SEMAINES DEPUIS COVID"><input type="number" style={inputS} value={h.covidWeeksAgo||''} onChange={e=>setH('covidWeeksAgo',parseInt(e.target.value)||0)}/></F>}
            {h.recentTropicalTravel && <F label="DESTINATION"><input style={inputS} value={h.travelDestination} onChange={e=>setH('travelDestination',e.target.value)} placeholder="ex: Sénégal, Thaïlande"/></F>}
            {h.recentInfection && <F label="TYPE D'INFECTION"><input style={inputS} value={h.infectionType} onChange={e=>setH('infectionType',e.target.value)}/></F>}
            <Toggle label="Infection récente (autre)" sub="Virale / bactérienne" active={h.recentInfection} color="#FFB347" onClick={()=>setH('recentInfection',!h.recentInfection)}/>

            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#B96BFF',letterSpacing:'1px',marginTop:'8px'}}>NEURODÉVELOPPEMENT & ATCD NEURO</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <Toggle label="Convulsions fébriles" sub="Épisodes antérieurs" active={h.febrileSeizuresHistory} color="#B96BFF" onClick={()=>setH('febrileSeizuresHistory',!h.febrileSeizuresHistory)}/>
              <Toggle label="Retard développement" sub="Moteur / cognitif / langage" active={h.developmentalDelay} color="#B96BFF" onClick={()=>setH('developmentalDelay',!h.developmentalDelay)}/>
              <Toggle label="ATCD ADEM" sub="Encéphalomyélite disséminée" active={h.previousADEM} color="#8B5CF6" onClick={()=>setH('previousADEM',!h.previousADEM)}/>
              <Toggle label="Névrite optique" sub="Épisode antérieur" active={h.previousOpticNeuritis} color="#B96BFF" onClick={()=>setH('previousOpticNeuritis',!h.previousOpticNeuritis)}/>
              <Toggle label="Myélite transverse" sub="Épisode antérieur" active={h.previousMyelitis} color="#B96BFF" onClick={()=>setH('previousMyelitis',!h.previousMyelitis)}/>
              <Toggle label="TC récent" sub="Traumatisme crânien" active={h.recentHeadTrauma} color="#FFB347" onClick={()=>setH('recentHeadTrauma',!h.recentHeadTrauma)}/>
              <Toggle label="Tératome ovarien" sub="Connu ou suspecté (NMDAR)" active={h.ovarianTeratoma} color="#8B5CF6" onClick={()=>setH('ovarianTeratoma',!h.ovarianTeratoma)}/>
              <Toggle label="Kawasaki" sub="Épisode antérieur" active={h.previousKawasaki} color="#FFB347" onClick={()=>setH('previousKawasaki',!h.previousKawasaki)}/>
            </div>

            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#2FD1C8',letterSpacing:'1px',marginTop:'8px'}}>PÉRINATAL & FAMILLE</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <Toggle label="Prématurité" sub="< 37 SA" active={h.prematurity} color="#2FD1C8" onClick={()=>setH('prematurity',!h.prematurity)}/>
              <Toggle label="Consanguinité" sub="Parents apparentés" active={h.familyConsanguinity} color="#2FD1C8" onClick={()=>setH('familyConsanguinity',!h.familyConsanguinity)}/>
              <Toggle label="ATCD fam. épilepsie" sub="1er degré" active={h.familyEpilepsy} color="#6C7CFF" onClick={()=>setH('familyEpilepsy',!h.familyEpilepsy)}/>
              <Toggle label="ATCD fam. auto-immun" sub="1er degré" active={h.familyAutoimmune} color="#6C7CFF" onClick={()=>setH('familyAutoimmune',!h.familyAutoimmune)}/>
            </div>
            {h.prematurity && <F label="TERME (SA)"><input type="number" style={inputS} value={h.premWeeks||''} onChange={e=>setH('premWeeks',parseInt(e.target.value)||0)}/></F>}
          </div>
        )}

        {/* ── NEURO ── */}
        {tab==='neuro' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <F label="GCS" tip="3-15"><input type="number" min={3} max={15} style={inputS} value={data.gcs} onChange={e=>num('gcs',e.target.value)}/></F>
            <F label="PUPILLES"><select style={selS} value={data.pupils} onChange={e=>set('pupils',e.target.value)}><option value="reactive">Réactives</option><option value="sluggish">Paresseuses</option><option value="fixed_one">Fixée unilat.</option><option value="fixed_both">Fixes bilat.</option></select></F>
            <F label="CRISES / 24H"><input type="number" style={inputS} value={data.seizures24h} onChange={e=>num('seizures24h',e.target.value)}/></F>
            <F label="TYPE DE CRISE"><select style={selS} value={data.seizureType} onChange={e=>set('seizureType',e.target.value)}>{SEI_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></F>
            <F label="SIGNES FOCAUX" span={2}><div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{FOCAL_SIGNS.map(f=><Chip key={f.value} label={f.label} active={(data.focalSigns||[]).includes(f.value)} color="#8B5CF6" onClick={()=>toggleArr('focalSigns',f.value)}/>)}</div></F>
            <div style={{gridColumn:'span 2',borderTop:'1px solid var(--p-border)',paddingTop:'14px'}}>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'0.5px',marginBottom:'10px'}}>CONSTANTES</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px'}}>
                <F label="T°C"><input type="number" step="0.1" style={inputS} value={data.temp} onChange={e=>num('temp',e.target.value)}/></F>
                <F label="FC"><input type="number" style={inputS} value={data.hr} onChange={e=>num('hr',e.target.value)}/></F>
                <F label="SpO₂"><input type="number" style={inputS} value={data.spo2} onChange={e=>num('spo2',e.target.value)}/></F>
                <F label="FR"><input type="number" style={inputS} value={data.rr} onChange={e=>num('rr',e.target.value)}/></F>
                <F label="Lactate"><input type="number" step="0.1" style={inputS} value={data.lactate} onChange={e=>num('lactate',e.target.value)}/></F>
              </div>
            </div>
            <div style={{gridColumn:'span 2',borderTop:'1px solid var(--p-border)',paddingTop:'14px'}}>
              <Toggle label="Fièvre prodromique" sub="Fièvre avant symptômes neuro" active={data.feverBefore||false} color="#FFB347" onClick={()=>set('feverBefore',!data.feverBefore)}/>
              {data.feverBefore && <div style={{marginTop:'8px'}}><F label="JOURS DE FIÈVRE"><input type="number" style={inputS} value={data.feverDays||''} onChange={e=>num('feverDays',e.target.value)}/></F></div>}
            </div>
          </div>
        )}

        {/* ── BIO / LCR ── */}
        {tab==='bio' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <F label="CRP (mg/L)"><input type="number" style={inputS} value={data.crp||''} onChange={e=>num('crp',e.target.value)}/></F>
            <F label="GB (G/L)"><input type="number" step="0.1" style={inputS} value={data.wbc} onChange={e=>num('wbc',e.target.value)}/></F>
            <F label="PLAQUETTES (G/L)"><input type="number" style={inputS} value={data.platelets} onChange={e=>num('platelets',e.target.value)}/></F>
            <F label="PCT (ng/mL)"><input type="number" step="0.01" style={inputS} value={data.pct||''} onChange={e=>num('pct',e.target.value)}/></F>
            <F label="FERRITINE (µg/L)"><input type="number" style={inputS} value={data.ferritin||''} onChange={e=>num('ferritin',e.target.value)}/></F>
            <F label="LACTATE (mmol/L)"><input type="number" step="0.1" style={inputS} value={data.lactate} onChange={e=>num('lactate',e.target.value)}/></F>
            <div style={{gridColumn:'span 2',borderTop:'1px solid var(--p-border)',paddingTop:'14px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'0.5px'}}>PONCTION LOMBAIRE</div>
                <Chip label={data.csfDone?'Réalisée ✓':'Non réalisée'} active={data.csfDone||false} color="#B96BFF" onClick={()=>set('csfDone',!data.csfDone)}/>
              </div>
              {data.csfDone && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>
                  <F label="CELLULES (/mm³)"><input type="number" style={inputS} value={data.csfCells||''} onChange={e=>num('csfCells',e.target.value)}/></F>
                  <F label="PROTÉINES (g/L)"><input type="number" step="0.01" style={inputS} value={data.csfProtein||''} onChange={e=>num('csfProtein',e.target.value)}/></F>
                  <F label="ANTICORPS"><select style={selS} value={data.csfAntibodies} onChange={e=>set('csfAntibodies',e.target.value)}>{CSF_AB.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}</select></F>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EEG / IRM ── */}
        {tab==='imaging' && (
          <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)'}}>EEG</div>
                <Chip label={data.eegDone?'Réalisé ✓':'Non réalisé'} active={data.eegDone||false} color="#2FD1C8" onClick={()=>set('eegDone',!data.eegDone)}/>
              </div>
              {data.eegDone && <F label="RÉSULTAT"><select style={selS} value={data.eegStatus} onChange={e=>set('eegStatus',e.target.value)}><option value="">—</option><option value="normal">Normal</option><option value="slow">Ralentissement diffus</option><option value="epileptiform">Épileptiforme</option><option value="status">Status electrographicus</option><option value="ncse">NCSE suspecté</option></select></F>}
            </div>
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)'}}>IRM CÉRÉBRALE</div>
                <Chip label={data.mriDone?'Réalisée ✓':'Non réalisée'} active={data.mriDone||false} color="#2FD1C8" onClick={()=>set('mriDone',!data.mriDone)}/>
              </div>
              {data.mriDone && <F label="RÉSULTATS"><div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{MRI_FINDS.map(f=><Chip key={f.value} label={f.label} active={(data.mriFindings||[]).includes(f.value)} color="#2FD1C8" onClick={()=>toggleArr('mriFindings',f.value)}/>)}</div></F>}
            </div>
          </div>
        )}

        {/* ── TRANSFER EXAMS ── */}
        {tab==='transfer' && isTransfer && (
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'11px',fontWeight:800,color:'var(--p-text)'}}>Examens réalisés à {data.transferHospital || "l'hôpital source"}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {[
                { type:'blood' as const, label:'Bilan sanguin' },{ type:'csf' as const, label:'PL / LCR' },
                { type:'eeg' as const, label:'EEG' },{ type:'mri' as const, label:'IRM' },{ type:'ct' as const, label:'TDM / Scanner' },
                { type:'antibodies' as const, label:'Anticorps' },{ type:'culture' as const, label:'Cultures / PCR' },
                { type:'metabolic' as const, label:'Bilan métabolique' },{ type:'genetic' as const, label:'Bilan génétique' },
              ].map(e=><button key={e.type} onClick={()=>addExam(e.type,e.label)} style={{padding:'6px 14px',borderRadius:'var(--p-radius-full)',background:'var(--p-bg-elevated)',border:'1px solid rgba(108,124,255,0.1)',color:'var(--p-text-muted)',fontFamily:'var(--p-font-mono)',fontSize:'10px',cursor:'pointer'}}>+ {e.label}</button>)}
            </div>
            {(data.existingExams||[]).map((ex,i)=>(
              <div key={i} style={{padding:'12px 16px',borderRadius:'var(--p-radius-lg)',background:'var(--p-bg-elevated)',border:'1px solid rgba(108,124,255,0.06)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontFamily:'var(--p-font-mono)',fontSize:'11px',fontWeight:700,color:'var(--p-text)'}}>{ex.name}</span>
                  <button onClick={()=>removeExam(i)} style={{background:'none',border:'none',color:'var(--p-text-dim)',cursor:'pointer',fontSize:'14px'}}>✕</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <F label="DATE"><input type="date" style={inputS} value={ex.date} onChange={e=>updateExam(i,'date',e.target.value)}/></F>
                  <F label="RÉSULTAT"><select style={selS} value={ex.normal===null?'':ex.normal?'normal':'abnormal'} onChange={e=>updateExam(i,'normal',e.target.value===''?null:e.target.value==='normal')}>
                    <option value="">—</option><option value="normal">Normal</option><option value="abnormal">Anormal</option>
                  </select></F>
                </div>
                <div style={{marginTop:'6px'}}><F label="DÉTAILS"><input style={inputS} value={ex.result} onChange={e=>updateExam(i,'result',e.target.value)} placeholder="Résumé des résultats"/></F></div>
              </div>
            ))}
          </div>
        )}

        </div>
      </div>

      {/* ════ RIGHT: AI ANALYSIS ════ */}
      <div style={{background:'var(--p-bg-card)',overflow:'auto',padding:'20px'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

          <div className="glass-card" style={{padding:'16px',borderRadius:'var(--p-radius-xl)'}}><UrgencyGauge score={analysis.urgencyScore} level={analysis.urgencyLevel}/></div>

          {/* Triage Priority */}
          <div style={{
            padding:'14px 16px',borderRadius:'var(--p-radius-lg)',
            background:`${analysis.triage.color}08`,
            border:`1px solid ${analysis.triage.color}20`,
            display:'flex',alignItems:'center',justifyContent:'space-between',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{
                width:'40px',height:'40px',borderRadius:'var(--p-radius-md)',
                background:`${analysis.triage.color}15`,
                border:`2px solid ${analysis.triage.color}40`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'var(--p-font-mono)',fontSize:'16px',fontWeight:900,
                color:analysis.triage.color,
                boxShadow:`0 0 12px ${analysis.triage.color}20`,
              }}>{analysis.triage.priority}</div>
              <div>
                <div style={{fontFamily:'var(--p-font-mono)',fontSize:'12px',fontWeight:800,color:analysis.triage.color}}>{analysis.triage.label}</div>
                <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)',marginTop:'1px'}}>Prise en charge {analysis.triage.maxDelay}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'22px',fontWeight:900,color:analysis.triage.color,lineHeight:1}}>{analysis.triage.score}</div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'7px',color:'var(--p-text-dim)',letterSpacing:'0.5px'}}>TRIAGE</div>
            </div>
          </div>

          {/* Triage Factors */}
          {analysis.triage.factors.length > 0 && (
            <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
              {analysis.triage.factors.map((f,i) => (
                <div key={i} title={f.detail} style={{
                  padding:'3px 8px',borderRadius:'var(--p-radius-full)',
                  background:'var(--p-bg-elevated)',border:'1px solid rgba(108,124,255,0.06)',
                  fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',
                  display:'flex',alignItems:'center',gap:'4px',
                }}>
                  {f.factor}
                  <span style={{fontWeight:800,color:f.points>=5?'#FFB347':'var(--p-text-muted)'}}>+{f.points}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{padding:'12px 16px',borderRadius:'var(--p-radius-lg)',background:'rgba(108,124,255,0.04)',border:'1px solid rgba(108,124,255,0.1)',fontFamily:'var(--p-font-mono)',fontSize:'10px',color:'var(--p-text-muted)',lineHeight:1.6}}>
            <Picto name="brain" size={12}/> {analysis.clinicalSummary}
          </div>

          {/* History Alerts */}
          {analysis.historyAlerts.length > 0 && (
            <div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#FFB347',letterSpacing:'1px',marginBottom:'8px'}}>
                <Picto name="clipboard" size={11}/> ALERTES ANTÉCÉDENTS ({analysis.historyAlerts.length})
              </div>
              {analysis.historyAlerts.map((a,i)=>(
                <details key={i} style={{marginBottom:'4px'}}>
                  <summary style={{padding:'8px 12px',borderRadius:'var(--p-radius-md)',background:a.severity==='critical'?'rgba(139,92,246,0.06)':a.severity==='warning'?'rgba(255,179,71,0.06)':'rgba(108,124,255,0.04)',border:`1px solid ${a.severity==='critical'?'rgba(139,92,246,0.15)':a.severity==='warning'?'rgba(255,179,71,0.15)':'rgba(108,124,255,0.1)'}`,cursor:'pointer',fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:700,color:a.severity==='critical'?'#8B5CF6':a.severity==='warning'?'#FFB347':'#6C7CFF',listStyle:'none',display:'flex',alignItems:'center',gap:'6px'}}>
                    <Picto name={a.icon} size={12}/> {a.title}
                    <Badge label={a.severity} color={a.severity==='critical'?'#8B5CF6':a.severity==='warning'?'#FFB347':'#6C7CFF'}/>
                  </summary>
                  <div style={{padding:'8px 12px',marginTop:'2px',fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)',lineHeight:1.7}}>
                    <div style={{marginBottom:'6px',color:'var(--p-text-muted)'}}>{a.detail}</div>
                    {a.implications.map((imp,j)=><div key={j} style={{paddingLeft:'8px',borderLeft:`2px solid ${a.severity==='critical'?'rgba(139,92,246,0.2)':'rgba(108,124,255,0.1)'}`,marginBottom:'4px'}}>→ {imp}</div>)}
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Differentials */}
          <div>
            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'1px',marginBottom:'8px'}}>DIAGNOSTIC DIFFÉRENTIEL</div>
            {analysis.differentials.length===0?(
              <div style={{padding:'16px',textAlign:'center',fontFamily:'var(--p-font-mono)',fontSize:'10px',color:'var(--p-text-dim)',background:'var(--p-bg-elevated)',borderRadius:'var(--p-radius-lg)'}}>Données insuffisantes</div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {analysis.differentials.slice(0,5).map((dd,i)=>(
                  <div key={dd.syndrome} style={{padding:'10px 14px',borderRadius:'var(--p-radius-lg)',background:i===0?`${dd.color}08`:'var(--p-bg-elevated)',border:i===0?`1px solid ${dd.color}20`:'1px solid rgba(108,124,255,0.06)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                      <span style={{fontFamily:'var(--p-font-mono)',fontSize:'12px',fontWeight:800,color:dd.color}}>{dd.syndrome}</span>
                      <span style={{fontFamily:'var(--p-font-mono)',fontSize:'14px',fontWeight:900,color:dd.color}}>{dd.confidence}%</span>
                    </div>
                    <ConfBar value={dd.confidence} color={dd.color}/>
                    <div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',marginTop:'4px'}}>{dd.matchedMajor}/{dd.totalMajor} majeurs · {dd.matchedCriteria.filter(c=>c.weight==='minor'&&c.matched).length} mineurs</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Red Flags */}
          {analysis.redFlags.length>0&&(
            <div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#8B5CF6',letterSpacing:'1px',marginBottom:'8px'}}><Picto name="alert" size={11}/> RED FLAGS ({analysis.redFlags.length})</div>
              {analysis.redFlags.map((rf,i)=><div key={i} style={{padding:'8px 12px',marginBottom:'4px',borderRadius:'var(--p-radius-md)',background:rf.severity==='critical'?'rgba(139,92,246,0.06)':'rgba(255,179,71,0.06)',border:`1px solid ${rf.severity==='critical'?'rgba(139,92,246,0.15)':'rgba(255,179,71,0.15)'}`,fontFamily:'var(--p-font-mono)',fontSize:'10px',color:rf.severity==='critical'?'#8B5CF6':'#FFB347'}}>{rf.flag} <span style={{opacity:0.5,fontSize:'8px'}}>({rf.source})</span></div>)}
            </div>
          )}

          {/* Exam Gaps */}
          {analysis.examGaps.length>0&&(
            <div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'#A78BFA',letterSpacing:'1px',marginBottom:'8px'}}><Picto name="microscope" size={11}/> GAPS IDENTIFIÉS</div>
              {analysis.examGaps.map((g,i)=>(
                <div key={i} style={{padding:'10px 14px',marginBottom:'4px',borderRadius:'var(--p-radius-lg)',background:`${g.urgency==='critical'?'rgba(139,92,246,0.04)':'rgba(108,124,255,0.04)'}`,border:`1px solid ${g.urgency==='critical'?'rgba(139,92,246,0.1)':'rgba(108,124,255,0.08)'}`}}>
                  <div style={{fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:700,color:g.urgency==='critical'?'#8B5CF6':'var(--p-text)',marginBottom:'4px'}}>{g.category}</div>
                  <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)'}}>
                    {g.missing.map((m,j)=><span key={j}>• {m}<br/></span>)}
                  </div>
                  <div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',marginTop:'4px',fontStyle:'italic'}}>{g.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Exam Recommendations */}
          {analysis.examRecommendations.length>0&&(
            <div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'1px',marginBottom:'8px'}}>EXAMENS RECOMMANDÉS</div>
              {analysis.examRecommendations.map((ex,i)=>{
                const col=ex.urgency==='immediate'?'#8B5CF6':ex.urgency==='urgent'?'#FFA502':'#6C7CFF'
                return <div key={i} style={{padding:'8px 12px',marginBottom:'4px',borderRadius:'var(--p-radius-md)',background:'var(--p-bg-elevated)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:700,color:'var(--p-text)',display:'flex',alignItems:'center',gap:'6px'}}>
                      {ex.name} {ex.needsRepeat&&<Badge label="Recontrôle" color="#FFA502"/>} {ex.alreadyDone&&!ex.needsRepeat&&<Badge label="Fait" color="#2ED573"/>}
                    </div>
                    <div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',marginTop:'2px'}}>{ex.rationale}</div>
                  </div>
                  <Badge label={ex.urgency==='immediate'?'Immédiat':ex.urgency==='urgent'?'Urgent':'Standard'} color={col}/>
                </div>
              })}
            </div>
          )}

          {/* Engines */}
          <div>
            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'1px',marginBottom:'8px'}}>MOTEURS PULSAR</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {analysis.engineReadiness.map(eng=>(
                <div key={eng.engine} title={eng.reason} style={{padding:'6px 12px',borderRadius:'var(--p-radius-full)',background:eng.ready?'rgba(46,213,115,0.08)':'var(--p-bg-elevated)',border:eng.ready?'1px solid rgba(46,213,115,0.2)':'1px solid rgba(108,124,255,0.06)',fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:700,color:eng.ready?'#2ED573':'var(--p-text-dim)',display:'flex',alignItems:'center',gap:'5px'}}>
                  <div style={{width:'5px',height:'5px',borderRadius:'50%',background:eng.ready?'#2ED573':'var(--p-text-dim)',boxShadow:eng.ready?'0 0 4px #2ED573':'none'}}/>{eng.engine}
                </div>
              ))}
            </div>
          </div>

          {/* Similar cases */}
          {analysis.similarCases.length>0&&(
            <div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'1px',marginBottom:'8px'}}>CAS SIMILAIRES</div>
              {analysis.similarCases.map(c=>(
                <div key={c.caseId} style={{padding:'8px 12px',marginBottom:'4px',borderRadius:'var(--p-radius-md)',background:'var(--p-bg-elevated)',display:'flex',justifyContent:'space-between'}}>
                  <div><div style={{fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:700,color:'var(--p-text)'}}>{c.caseId}</div><div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)'}}>{c.family} · {c.region}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:c.outcome.includes('Rémission')?'#2ED573':'#FFB347'}}>{c.outcome}</div></div>
                </div>
              ))}
            </div>
          )}

          <button
            disabled={admitting || analysis.completeness < 15 || !patientName.trim()}
            onClick={async () => {
              setAdmitting(true)
              try {
                const bridge = intakeToPatientState(data, analysis)
                const result = await intakePersistenceService.admitFromIntake(
                  patientName.trim() || 'Patient',
                  patientRoom.trim() || 'Non assigné',
                  data,
                  analysis,
                  bridge.patientData,
                  analysis.triage,
                )
                router.push(`/patient/${result.patientId}/cockpit`)
              } catch (err) {
                console.error('[Intake] Erreur admission:', err)
                setAdmitting(false)
              }
            }}
            style={{
              marginTop:'8px',padding:'14px',borderRadius:'var(--p-radius-lg)',border:'none',
              background: admitting ? 'var(--p-bg-elevated)'
                : (analysis.completeness >= 15 && patientName.trim())
                  ? 'linear-gradient(135deg,#6C7CFF,#B96BFF)'
                  : 'var(--p-bg-elevated)',
              color: (analysis.completeness >= 15 && patientName.trim() && !admitting) ? '#fff' : 'var(--p-text-dim)',
              fontFamily:'var(--p-font-mono)',fontSize:'12px',fontWeight:800,
              cursor: (analysis.completeness >= 15 && patientName.trim() && !admitting) ? 'pointer' : 'not-allowed',
              letterSpacing:'0.5px',
              boxShadow: (analysis.completeness >= 15 && patientName.trim() && !admitting) ? '0 4px 20px rgba(108,124,255,0.3)' : 'none',
              width: '100%',
              transition: 'all 0.3s',
            }}>
            {admitting ? 'Création du dossier...' : !patientName.trim() ? 'Renseignez le nom du patient' : 'Admettre et lancer les moteurs →'}
          </button>
          {!patientName.trim() && analysis.completeness >= 15 && (
            <div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'#FFB347',textAlign:'center',padding:'2px 0'}}>
              Onglet Identité → Nom du patient requis
            </div>
          )}

          <div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',textAlign:'center',padding:'4px 0'}}>
            PULSAR V17 · Ne se substitue pas au jugement clinique
          </div>
        </div>
      </div>

      </div>
    </div>
  )
}
