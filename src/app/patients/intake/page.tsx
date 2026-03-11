'use client'
import { useLang } from '@/contexts/LanguageContext'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Picto from '@/components/Picto'

const STEPS = [
  { id: 'source', icon: 'file-active', label: 'Source', labelEn: 'Source' },
  { id: 'identity', icon: 'heart', label: 'Identité', labelEn: 'Identity' },
  { id: 'admission', icon: 'urgence', label: 'Admission', labelEn: 'Admission' },
  { id: 'history', icon: 'clipboard', label: 'Antécédents', labelEn: 'History' },
  { id: 'neuro', icon: 'brain', label: 'Neuro', labelEn: 'Neuro' },
  { id: 'bio', icon: 'blood', label: 'Bio / LCR', labelEn: 'Bio / CSF' },
  { id: 'imaging', icon: 'eeg', label: 'Imagerie', labelEn: 'Imaging' },
  { id: 'summary', icon: 'chart', label: 'Synthèse', labelEn: 'Summary' },
]

const inputS: React.CSSProperties = { width:'100%',padding:'10px 14px',borderRadius:'10px',background:'var(--p-input-bg)',border:'var(--p-border)',color:'var(--p-text)',fontFamily:'var(--p-font-mono)',fontSize:'13px',outline:'none' }
const selS: React.CSSProperties = { ...inputS, appearance:'none' as const }
const labelS: React.CSSProperties = { display:'block',fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:700,color:'var(--p-text-dim)',letterSpacing:'0.5px',marginBottom:'6px' }
const secS = (c:string): React.CSSProperties => ({ fontFamily:'var(--p-font-mono)',fontSize:'10px',fontWeight:800,color:c,letterSpacing:'1.5px',marginBottom:'16px',marginTop:'8px' })

function F({label,children,span,tip}:{label:string;children:React.ReactNode;span?:number;tip?:string}){
  return <div style={{gridColumn:span?`span ${span}`:undefined}}><label style={labelS}>{label}</label>{children}{tip&&<div style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',color:'var(--p-text-dim)',marginTop:'3px',opacity:0.6}}>{tip}</div>}</div>
}

function Tog({label,sub,active,color,onClick}:{label:string;sub?:string;active:boolean;color:string;onClick:()=>void}){
  return <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'10px',border:active?`2px solid ${color}`:'var(--p-border)',background:active?`${color}10`:'var(--p-bg-elevated)',cursor:'pointer',transition:'all 0.2s',textAlign:'left' as const,width:'100%'}}>
    <div style={{width:'18px',height:'18px',borderRadius:'5px',flexShrink:0,background:active?color:'transparent',border:active?'none':'2px solid var(--p-text-dim)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'#fff'}}>{active?'✓':''}</div>
    <div><div style={{fontSize:'12px',fontWeight:600,color:active?color:'var(--p-text)'}}>{label}</div>{sub&&<div style={{fontSize:'9px',color:'var(--p-text-dim)',fontFamily:'var(--p-font-mono)'}}>{sub}</div>}</div>
  </button>
}

export default function IntakePage(){
  const {t,lang}=useLang()
  const router=useRouter()
  const fileRef=useRef<HTMLInputElement>(null)
  const [step,setStep]=useState(0)
  const [uploading,setUploading]=useState(false)
  const [uploadedFile,setUploadedFile]=useState<string|null>(null)
  const [analyzing,setAnalyzing]=useState(false)

  const [id,setIdState]=useState({lastName:'',firstName:'',dob:'',ageMonths:'',sex:'',weight:'',height:'',room:'',fileNumber:'',contactName:'',contactPhone:''})
  const [adm,setAdmState]=useState({mode:'' as string,chiefComplaint:'',symptomOnsetDays:'',consciousness:'alert',transferFrom:'',referringDoctor:''})
  const [h,setHState]=useState({sickleCellDisease:false,epilepsyKnown:false,immunodeficiency:false,autoimmune:false,diabetesType1:false,cardiacDisease:false,cancer:false,cancerType:'',transplant:false,transplantOrgan:'',hivPositive:false,hydrocephalus:false,tsa:false,asthma:false,otherChronic:'',previousMeningitis:false,meningitisAge:'',previousEncephalitis:false,herpesHistory:false,recentCovid:false,covidWeeksAgo:0,recentEBVCMV:false,tuberculosis:false,recentTropicalTravel:false,travelDestination:'',tickBite:false,recentInfection:false,infectionType:'',otherInfection:'',febrileSeizuresHistory:false,developmentalDelay:false,previousADEM:false,previousOpticNeuritis:false,previousMyelitis:false,recentHeadTrauma:false,ovarianTeratoma:false,previousKawasaki:false,otherNeuro:'',prematurity:false,premWeeks:0,familyConsanguinity:false,familyEpilepsy:false,familyAutoimmune:false,otherFamily:'',allergies:'',currentMedications:''})
  const [n,setNState]=useState({gcs:15,gcsEye:4,gcsVerbal:5,gcsMotor:6,pupils:'normal',seizureType:'none',seizureFreq:'',focalSigns:false,focalDetail:'',meningealSigns:false,abnormalMovements:false,movementDetail:'',otherNeuro:''})
  const [bio,setBState]=useState({wbc:'',crp:'',pct:'',lactate:'',na:'',k:'',glucose:'',hb:'',platelets:'',inr:'',csfDone:false,csfWbc:'',csfProtein:'',csfGlucose:'',csfCulture:'',csfAppearance:'clear',csfPressure:'',otherBio:''})
  const [img,setIState]=useState({eegDone:false,eegResult:'',eegDetail:'',mriDone:false,mriResult:'',mriDetail:'',ctDone:false,ctResult:'',ctDetail:'',otherImaging:''})

  const sId=useCallback((k:string,v:string)=>setIdState(p=>({...p,[k]:v})),[])
  const sAd=useCallback((k:string,v:string)=>setAdmState(p=>({...p,[k]:v})),[])
  const sH=useCallback((k:string,v:any)=>setHState(p=>({...p,[k]:v})),[])
  const sN=useCallback((k:string,v:any)=>setNState(p=>({...p,[k]:v})),[])
  const sB=useCallback((k:string,v:any)=>setBState(p=>({...p,[k]:v})),[])
  const sI=useCallback((k:string,v:any)=>setIState(p=>({...p,[k]:v})),[])

  const parsePdfText = (text: string) => {
    // Format réel : label sur une ligne, valeur sur la ligne suivante
    const afterLabel = (label: string): string => {
      const re = new RegExp(label + '\\s*\\n([^\\n]{1,120})', 'i')
      const m = text.match(re)
      return m ? m[1].trim() : ''
    }
    const n = (s: string): number => {
      const x = parseFloat(s.replace(/\s/g,'').replace(',','.').replace(/[^\d.]/g,''))
      return isNaN(x) ? 0 : x
    }
    const inlineNum = (label: string): number => {
      const re = new RegExp(label + '[^\\d]*(\\d+[,\\s]?\\d*)', 'i')
      const m = text.match(re)
      return m ? n(m[1]) : 0
    }

    // Nom / Prénom — format "COHEN Théo" sur la ligne suivant le label
    const nomVal = afterLabel('Nom / Prénom') || afterLabel('Nom.*?Prénom')
    // Sépare NOM (majuscules) et Prénom (casse mixte)
    const nomMatch = nomVal.match(/^([A-ZÉÀÜÈÊ\-]+)\s+(.+)$/)
    const lastName  = nomMatch ? nomMatch[1] : nomVal.split(/\s+/)[0] || ''
    const firstName = nomMatch ? nomMatch[2].trim() : nomVal.split(/\s+/).slice(1).join(' ') || ''

    // Âge — "7 ans 6 mois" dans le texte
    let ageMonths = 0
    const am = text.match(/(\d+)\s*ans?\s*(\d+)?\s*mois?/i)
    if(am) ageMonths = parseInt(am[1])*12 + (parseInt(am[2]??'0')||0)

    // Sexe
    const sexVal = afterLabel('Sexe')
    const sex = /f[ée]m|female/i.test(sexVal) ? 'female' : 'male'

    // Poids — "25.2 kg"
    const poidsVal = afterLabel('Poids')
    const weightKg = n(poidsVal) || inlineNum('Poids')

    // N° dossier
    const fileNumber = afterLabel('N°\\s*dossier') || afterLabel('dossier')

    // Motif principal
    const chiefComplaint = afterLabel('Motif principal')

    // Délai symptômes
    const onsetM = chiefComplaint.match(/J[-−](\d+)/i) || text.match(/depuis\s+J[-−](\d+)/i)
    const symptomOnsetDays = onsetM ? parseInt(onsetM[1]) : 0

    // GCS — "15 / 15"
    const gcsVal = afterLabel('Glasgow') || ''
    const gcs = parseInt(gcsVal) || inlineNum('Glasgow') || 15

    // Crises
    const seizures24h = inlineNum('Crises.*24h') || inlineNum('Crises / 24h')
    const seizureDuration = inlineNum('Durée.*crise') || inlineNum('durée.*crise')

    // Type de crise
    let seizureType = 'none'
    if(seizures24h === 0 && !/crise|seizure/i.test(chiefComplaint)) seizureType = 'none'
    else if(/super.réfractaire|super_refractory/i.test(text)) seizureType = 'super_refractory'
    else if(/réfractaire/i.test(text) && /status|état de mal/i.test(text)) seizureType = 'refractory_status'
    else if(/status epilepticus|état de mal/i.test(text)) seizureType = 'status'
    else if(/généralisée|tonico/i.test(text)) seizureType = 'generalized_tonic_clonic'
    else if(/focale/i.test(text)) seizureType = 'focal_impaired'

    // Bio — valeurs après labels dans tableau
    const crp      = inlineNum('CRP')
    const ferritin = inlineNum('Ferritine')
    const wbc      = inlineNum('Leucocytes')
    const temp     = inlineNum('Température')
    const heartRate= inlineNum('FC')
    const spo2     = inlineNum('SpO2')
    const sbp      = inlineNum('TA systolique')
    const map      = inlineNum('PAM')

    // LCR
    const csfCells   = inlineNum('Leucocytes LCR')
    const csfProtein = inlineNum('Protéinorachie')

    // Imagerie — récupère jusqu'à 3 lignes après le label
    const afterLabelMulti = (label: string): string => {
      const re = new RegExp(label + '\\s*\\n([^\\n]{1,120}(?:\\n[^\\n]{1,120}){0,2})', 'i')
      const m = text.match(re)
      return m ? m[1].replace(/\n/g,' ').trim() : ''
    }
    const eegDone   = /EEG/i.test(text)
    const eegResult = afterLabelMulti('Conclusion EEG')
    const mriDone   = /IRM/i.test(text) && !/NON RÉALISÉE/i.test(text.slice(text.search(/IRM/i), text.search(/IRM/i)+100))
    const mriResult = afterLabelMulti('Conclusion imagerie')
    const ctDone    = /scanner/i.test(text.toLowerCase())
    const ctResult  = afterLabelMulti('Résultat scanner')

    return {
      lastName, firstName, ageMonths, sex, weightKg, fileNumber,
      chiefComplaint, symptomOnsetDays,
      gcs, seizureType, seizures24h, seizureDuration,
      crp, ferritin, wbc, temp, heartRate, spo2, sbp, map,
      csfCells, csfProtein,
      eegDone, eegResult, mriDone, mriResult, ctDone, ctResult,
    }
  }

  const handleUpload=useCallback(async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return
    setUploading(true);setUploadedFile(file.name)

    try {
      // Charger pdf.js depuis CDN
      if(!(window as any).pdfjsLib) {
        await new Promise<void>((res,rej)=>{
          const s=document.createElement('script')
          s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          s.onload=()=>res(); s.onerror=()=>rej()
          document.head.appendChild(s)
        })
        ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      }
      const pdfjsLib = (window as any).pdfjsLib

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise
      let text = ''
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i)
        const tc = await page.getTextContent()
        text += tc.items.map((item:any)=>item.str).join(' ') + '\n'
      }

      const ex = parsePdfText(text)

      if(ex.lastName)      sId('lastName',   ex.lastName)
      if(ex.firstName)     sId('firstName',  ex.firstName)
      if(ex.ageMonths)     sId('ageMonths',  String(ex.ageMonths))
      if(ex.sex)           sId('sex',        ex.sex)
      if(ex.weightKg)      sId('weight',     String(ex.weightKg))
      if(ex.fileNumber)    sId('fileNumber', ex.fileNumber)
      if(ex.chiefComplaint)    sAd('chiefComplaint',    ex.chiefComplaint)
      // Mode admission auto-détecté
      const textLower = (ex.chiefComplaint||'').toLowerCase()
      if(/urgence|status|réfractaire|convuls|crise/i.test(ex.chiefComplaint||'')) sAd('mode','urgence')
      else if(/transfert|transféré/i.test(ex.chiefComplaint||'')) sAd('mode','transfert')
      else sAd('mode','urgence')
      if(ex.symptomOnsetDays)  sAd('symptomOnsetDays',  String(ex.symptomOnsetDays))
      if(ex.gcs)           sN('gcs',         ex.gcs)
      if(ex.seizureType)   sN('seizureType', ex.seizureType)
      if(ex.seizures24h)   sN('seizureFreq', String(ex.seizures24h))
      if(ex.crp)           sB('crp',         String(ex.crp))
      if(ex.wbc)           sB('wbc',         String(ex.wbc))
      if(ex.eegDone)  sI('eegDone', true)
      if(ex.eegResult) {
        const eegR = /NORMAL|normal/i.test(ex.eegResult) ? 'normal'
          : /épileptiforme|epileptiform|pointe|spike/i.test(ex.eegResult) ? 'epileptiform'
          : /état de mal|status/i.test(ex.eegResult) ? 'status'
          : /ralentiss|slowing|thêta|delta/i.test(ex.eegResult) ? 'slowing' : 'normal'
        sI('eegResult', eegR)
        sI('eegDetail', ex.eegResult.slice(0,80))
      }
      // IRM — ne cocher que si réellement réalisée
      const mriNotDone = /NON RÉALISÉE|non réalisée|not performed/i.test(ex.mriResult || '')
      if(ex.mriDone && !mriNotDone) {
        sI('mriDone', true)
        if(ex.mriResult) {
          const mriR = /NORMAL|normal/i.test(ex.mriResult) ? 'normal'
            : /temporal|hippocampe/i.test(ex.mriResult) ? 'temporal'
            : /multifocal/i.test(ex.mriResult) ? 'multifocal'
            : /démyélin|demyelin/i.test(ex.mriResult) ? 'demyelination' : 'normal'
          sI('mriResult', mriR)
          sI('mriDetail', ex.mriResult.slice(0,80))
        }
      }
      if(ex.ctDone) {
        sI('ctDone', true)
        if(ex.ctResult) {
          const ctR = /NORMAL|normal/i.test(ex.ctResult) ? 'normal'
            : /oedème|edema/i.test(ex.ctResult) ? 'edema'
            : /hémorragie|hemorrhage/i.test(ex.ctResult) ? 'hemorrhage' : 'normal'
          sI('ctResult', ctR)
          sI('ctDetail', ex.ctResult.slice(0,80))
        }
      }

      // Antécédents texte libre depuis PDF
      const rhinite = /rhinite/i.test(text) ? 'Rhinite récurrente' : ''
      const constip = /constipation/i.test(text) ? 'Constipation chronique' : ''
      const atcdInfect = [rhinite, constip].filter(Boolean).join(' — ')
      if(atcdInfect) sH('otherInfection', atcdInfect)

      // Antécédents familiaux
      const famMatch = text.match(/Antécédents familiaux[\s\n]+([^\n]{10,150})/i)
      if(famMatch) sH('otherFamily', famMatch[1].trim())

      // Convulsions fébriles
      if(/convulsion.*fébril|fébril.*convulsion/i.test(text)) sH('febrileSeizuresHistory', true)
      if(ex.csfCells > 0){ sB('csfDone',true); sB('csfWbc',String(ex.csfCells)) }
      if(ex.csfProtein)    sB('csfProtein',  String(ex.csfProtein))
      const ferNote = ex.ferritin ? `Ferritine: ${ex.ferritin} µg/L | T°: ${ex.temp}°C | FC: ${ex.heartRate} | SpO2: ${ex.spo2}%` : ''
      if(ferNote)          sB('otherBio',    ferNote)

    } catch(err) {
      console.error('PDF extraction error:', err)
    }

    setUploading(false)
    setStep(1)
  },[])


  const loadDemo = useCallback((profile: 'prodrome' | 'status') => {
    if (profile === 'prodrome') {
      sId('lastName','Cohen'); sId('firstName','Théo'); sId('ageMonths','90')
      sId('sex','male'); sId('weight','25.2'); sId('fileNumber','BCT-2025-07831')
      sAd('mode','urgence'); sAd('chiefComplaint','Fièvre persistante depuis J-5 — myalgies membres inférieurs — refus de marcher'); sAd('symptomOnsetDays','5')
      sN('gcs',15); sN('seizureType','none'); sN('seizureFreq','0')
      sB('crp','48'); sB('wbc','11.4'); sB('otherBio','Ferritine: 420 µg/L | IL-6: 22 pg/mL | CK: 485 UI/L | PCT: 0.6 | T°: 39.1°C | FC: 104 | SpO2: 98%')
      sI('eegDone',true); sI('eegResult','NORMAL — activité bêta frontale discrète — pas de foyer épileptique')
      sI('ctDone',true); sI('ctResult','NORMAL — pas de lésion focale')
      setUploadedFile('PULSAR_Patient_Prodrome_J2_Theo_Cohen.pdf')
    } else {
      sId('lastName','Martin'); sId('firstName','Lucas'); sId('ageMonths','81')
      sId('sex','male'); sId('weight','22.4'); sId('fileNumber','RDB-2025-04712')
      sAd('mode','urgence'); sAd('chiefComplaint','Status epilepticus réfractaire — 3e convulsion en 18h — fièvre depuis J-5'); sAd('symptomOnsetDays','1')
      sN('gcs',9); sN('seizureType','refractory_status'); sN('seizureFreq','5')
      sB('crp','142'); sB('wbc','14.2'); sB('otherBio','Ferritine: 1840 µg/L | IL-6: 87 pg/mL | PCT: 0.8 | T°: 39.2°C | FC: 118 | SpO2: 94% | PAM: 62')
      sB('csfDone',true); sB('csfWbc','8'); sB('csfProtein','0.52'); sB('csfAppearance','clear')
      sI('eegDone',true); sI('eegResult','Pointes-ondes bitemporales — 2 crises infracliniques — EEG FIRES compatible')
      sI('mriDone',true); sI('mriResult','Hypersignal FLAIR hippocampe gauche — pas de prise de contraste')
      setUploadedFile('PULSAR_Patient_Lucas_Martin_StatusJ1.pdf')
    }
    setStep(1)
  }, [])

  const canGo=useCallback((s:number)=>{
    if(s===1)return id.ageMonths!==''&&id.sex!==''
    if(s===2)return true
    return true
  },[id,adm])

  const next=useCallback(()=>{if(step<STEPS.length-1)setStep(step+1)},[step])
  const prev=useCallback(()=>{if(step>0)setStep(step-1)},[step])

  const launch=useCallback(()=>{setAnalyzing(true);setTimeout(()=>router.push('/patients'),1500)},[router])

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'24px 16px'}}>
      {/* HEADER */}
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Picto name="stethoscope" size={28} glow glowColor="rgba(108,124,255,0.5)"/>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:800,color:'var(--p-text)',margin:0}}>{t('Nouvelle Admission','New Admission')}</h1>
          <span style={{fontFamily:'var(--p-font-mono)',fontSize:'10px',color:'var(--p-text-dim)'}}>{t('Analyse intelligente — Parcours clinique guidé','Smart Analysis — Guided clinical pathway')}</span>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{display:'flex',gap:'2px',marginBottom:'24px'}}>
        {STEPS.map((s,i)=>(
          <button key={s.id} onClick={()=>i<=step?setStep(i):null} style={{flex:1,padding:'8px 4px',background:i<=step?'rgba(108,124,255,0.12)':'var(--p-bg-elevated)',border:i===step?'2px solid #6C7CFF':'1px solid rgba(255,255,255,0.06)',borderRadius:i===0?'10px 0 0 10px':i===STEPS.length-1?'0 10px 10px 0':'0',cursor:i<=step?'pointer':'default',transition:'all 0.3s',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
            <Picto name={s.icon} size={14} glow={i===step} glowColor="#6C7CFF40"/>
            <span style={{fontFamily:'var(--p-font-mono)',fontSize:'8px',fontWeight:i===step?800:600,color:i===step?'#6C7CFF':i<step?'var(--p-text-muted)':'var(--p-text-dim)'}}>{lang==='en'&&s.labelEn?s.labelEn:s.label}</span>
            {i<step&&<div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10B981'}}/>}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="glass-card" style={{borderRadius:'16px',padding:'28px',minHeight:'400px'}}>

        {/* STEP 0: SOURCE */}
        {step===0&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'8px'}}>{t("Comment souhaitez-vous renseigner ce patient ?","How would you like to enter this patient's data?")}</h2>
          <p style={{fontSize:'13px',color:'var(--p-text-muted)',marginBottom:'28px'}}>{t("Importez un document existant ou saisissez les informations manuellement.","Import an existing document or enter information manually.")}</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'16px'}}>
            <button onClick={()=>fileRef.current?.click()} style={{padding:'28px 20px',borderRadius:'16px',border:'2px dashed rgba(108,124,255,0.3)',background:'rgba(108,124,255,0.04)',cursor:'pointer',textAlign:'left',transition:'all 0.3s',display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(108,124,255,0.12)',border:'1px solid rgba(108,124,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:900,color:'#6C7CFF',fontFamily:'var(--p-font-mono)'}}>↑</div>
              <div style={{fontSize:'15px',fontWeight:700,color:'#6C7CFF'}}>{t('Importer un document','Import a document')}</div>
              <div style={{fontSize:'12px',color:'var(--p-text-muted)',lineHeight:1.6}}>{t("PDF, scan, courrier d'un autre hôpital… L'IA extraira les données.","PDF, scan, letter from another hospital… AI will extract data.")}</div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)'}}>PDF · JPG · PNG · DOCX</div>
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleUpload} style={{display:'none'}}/>
            <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
              <button onClick={()=>loadDemo('prodrome')} style={{flex:1,padding:'16px 12px',borderRadius:'12px',border:'2px solid rgba(245,166,35,0.4)',background:'rgba(245,166,35,0.06)',cursor:'pointer',textAlign:'left'}}>
                <div style={{fontSize:'11px',fontWeight:800,color:'#F5A623',letterSpacing:'1px'}}>DÉMO PRODROME</div>
                <div style={{fontSize:'10px',color:'var(--p-text-muted)',marginTop:'4px'}}>Théo Cohen · 7a · J-2 · GCS 15</div>
              </button>
              <button onClick={()=>loadDemo('status')} style={{flex:1,padding:'16px 12px',borderRadius:'12px',border:'2px solid rgba(239,68,68,0.4)',background:'rgba(239,68,68,0.06)',cursor:'pointer',textAlign:'left'}}>
                <div style={{fontSize:'11px',fontWeight:800,color:'#EF4444',letterSpacing:'1px'}}>DÉMO STATUS</div>
                <div style={{fontSize:'10px',color:'var(--p-text-muted)',marginTop:'4px'}}>Lucas Martin · 6a · J+1 · SE réfractaire</div>
              </button>
            </div>
            <button onClick={()=>setStep(1)} style={{padding:'28px 20px',borderRadius:'16px',border:'2px dashed rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.04)',cursor:'pointer',textAlign:'left',transition:'all 0.3s',display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:900,color:'#10B981',fontFamily:'var(--p-font-mono)'}}>+</div>
              <div style={{fontSize:'15px',fontWeight:700,color:'#10B981'}}>{t('Saisie manuelle','Manual entry')}</div>
              <div style={{fontSize:'12px',color:'var(--p-text-muted)',lineHeight:1.6}}>{t("Renseignez les informations étape par étape.","Enter information step by step.")}</div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)'}}>{t('~5 min pour un dossier complet','~5 min for a complete record')}</div>
            </button>
            <button onClick={()=>router.push('/patients')} style={{padding:'28px 20px',borderRadius:'16px',border:'2px dashed rgba(185,107,255,0.3)',background:'rgba(185,107,255,0.04)',cursor:'pointer',textAlign:'left',transition:'all 0.3s',display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(185,107,255,0.12)',border:'1px solid rgba(185,107,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:900,color:'#B96BFF',fontFamily:'var(--p-font-mono)'}}>⌕</div>
              <div style={{fontSize:'15px',fontWeight:700,color:'#B96BFF'}}>{t('Patient existant','Existing patient')}</div>
              <div style={{fontSize:'12px',color:'var(--p-text-muted)',lineHeight:1.6}}>{t("Rechercher un patient déjà enregistré.","Search for an existing patient.")}</div>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'var(--p-text-dim)'}}>{t('Accès à la file active','Access active caseload')}</div>
            </button>
          </div>
          {uploading&&<div style={{marginTop:'20px',padding:'16px',borderRadius:'12px',background:'rgba(108,124,255,0.06)',border:'1px solid rgba(108,124,255,0.15)',display:'flex',alignItems:'center',gap:'12px'}}>
            <div className="animate-breathe" style={{width:'20px',height:'20px',borderRadius:'50%',background:'#6C7CFF'}}/>
            <div><div style={{fontSize:'13px',fontWeight:700,color:'#6C7CFF'}}>{t('Analyse du document...','Analyzing document...')}</div><div style={{fontSize:'11px',color:'var(--p-text-muted)'}}>{uploadedFile}</div></div>
          </div>}
        </div>}

        {/* STEP 1: IDENTITY */}
        {step===1&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t('Identité du patient','Patient Identity')}</h2>
          {uploadedFile&&<div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px'}}><span style={{color:'#10B981',fontSize:'14px'}}>✓</span><span style={{fontSize:'12px',color:'#10B981',fontWeight:600}}>{t('Données extraites de','Data extracted from')} {uploadedFile}</span></div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <F label={t("NOM *","LAST NAME *")}><input style={inputS} value={id.lastName} onChange={e=>sId('lastName',e.target.value)} placeholder={t("ex: Martin","e.g. Martin")}/></F>
            <F label={t("PRÉNOM","FIRST NAME")}><input style={inputS} value={id.firstName} onChange={e=>sId('firstName',e.target.value)}/></F>
            <F label={t("DATE DE NAISSANCE","DATE OF BIRTH")}><input type="date" style={inputS} value={id.dob} onChange={e=>sId('dob',e.target.value)}/></F>
            <F label={t("ÂGE (mois) *","AGE (months) *")} tip={t("Requis pour les scores","Required for scores")}><input type="number" style={inputS} value={id.ageMonths} onChange={e=>sId('ageMonths',e.target.value)} placeholder="48"/></F>
            <F label={t("SEXE *","SEX *")}><select style={selS} value={id.sex} onChange={e=>sId('sex',e.target.value)}><option value="">—</option><option value="female">{t("Fille","Female")}</option><option value="male">{t("Garçon","Male")}</option></select></F>
            <F label={t("POIDS (kg)","WEIGHT (kg)")}><input type="number" style={inputS} value={id.weight} onChange={e=>sId('weight',e.target.value)}/></F>
            <F label={t("N° DOSSIER","FILE NUMBER")}><input style={inputS} value={id.fileNumber} onChange={e=>sId('fileNumber',e.target.value)}/></F>
            <F label={t("CHAMBRE / LIT","ROOM / BED")}><input style={inputS} value={id.room} onChange={e=>sId('room',e.target.value)} placeholder={t("Réa Neuro — Lit 8","Neuro ICU — Bed 8")}/></F>
            <F label={t("PERSONNE DE CONFIANCE","EMERGENCY CONTACT")}><input style={inputS} value={id.contactName} onChange={e=>sId('contactName',e.target.value)}/></F>
            <F label={t("TÉLÉPHONE","PHONE")}><input style={inputS} value={id.contactPhone} onChange={e=>sId('contactPhone',e.target.value)}/></F>
          </div>
        </div>}

        {/* STEP 2: ADMISSION */}
        {step===2&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t("Mode d'admission & Motif","Admission Mode & Reason")}</h2>
          <div style={secS('#6C7CFF')}>{t("MODE D'ADMISSION *","ADMISSION MODE *")}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
            {[{mode:'emergency',label:t('Urgence directe','Direct emergency')},{mode:'transfer',label:t('Transfert inter-hospitalier','Inter-hospital transfer')},{mode:'scheduled',label:t('Admission programmée','Scheduled admission')},{mode:'referral',label:t('Adressé par un confrère','Referred by colleague')}].map(m=>
              <Tog key={m.mode} label={m.label} active={adm.mode===m.mode} color="#6C7CFF" onClick={()=>sAd('mode',m.mode)}/>
            )}
          </div>
          {adm.mode==='transfer'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <F label={t("HÔPITAL D'ORIGINE","ORIGINATING HOSPITAL")}><input style={inputS} value={adm.transferFrom} onChange={e=>sAd('transferFrom',e.target.value)}/></F>
            <F label={t("MÉDECIN RÉFÉRENT","REFERRING DOCTOR")}><input style={inputS} value={adm.referringDoctor} onChange={e=>sAd('referringDoctor',e.target.value)}/></F>
          </div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <F label={t("MOTIF PRINCIPAL *","CHIEF COMPLAINT *")} span={2}><textarea style={{...inputS,minHeight:'80px',resize:'vertical'}} value={adm.chiefComplaint} onChange={e=>sAd('chiefComplaint',e.target.value)} placeholder={t("Ex: Convulsions tonico-cloniques depuis 24h, fièvre 39.5°C","E.g.: Generalized tonic-clonic seizures for 24h, fever 39.5°C")}/></F>
            <F label={t("DÉBUT SYMPTÔMES (jours)","SYMPTOM ONSET (days)")}><input type="number" style={inputS} value={adm.symptomOnsetDays} onChange={e=>sAd('symptomOnsetDays',e.target.value)}/></F>
            <F label={t("CONSCIENCE","CONSCIOUSNESS")}><select style={selS} value={adm.consciousness} onChange={e=>sAd('consciousness',e.target.value)}><option value="alert">{t("Alerte","Alert")}</option><option value="drowsy">{t("Somnolent","Drowsy")}</option><option value="confused">{t("Confus","Confused")}</option><option value="stupor">{t("Stupeur","Stupor")}</option><option value="coma">Coma</option></select></F>
          </div>
        </div>}

        {/* STEP 3: HISTORY */}
        {step===3&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t('Antécédents & Terrain','Medical History')}</h2>
          <div style={secS('#8B5CF6')}>{t("CONDITIONS CHRONIQUES","CHRONIC CONDITIONS")}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
            <Tog label={t("Drépanocytose","Sickle cell")} sub="HbSS/HbSC" active={h.sickleCellDisease} color="#8B5CF6" onClick={()=>sH('sickleCellDisease',!h.sickleCellDisease)}/>
            <Tog label={t("Épilepsie connue","Known epilepsy")} active={h.epilepsyKnown} color="#B96BFF" onClick={()=>sH('epilepsyKnown',!h.epilepsyKnown)}/>
            <Tog label={t("Immunodéficience","Immunodeficiency")} active={h.immunodeficiency} color="#8B5CF6" onClick={()=>sH('immunodeficiency',!h.immunodeficiency)}/>
            <Tog label={t("Auto-immune","Autoimmune")} sub={t("Lupus, SAPL…","Lupus, APS…")} active={h.autoimmune} color="#FFB347" onClick={()=>sH('autoimmune',!h.autoimmune)}/>
            <Tog label={t("Diabète T1","Diabetes T1")} active={h.diabetesType1} color="#FFB347" onClick={()=>sH('diabetesType1',!h.diabetesType1)}/>
            <Tog label={t("Cardiopathie","Heart disease")} active={h.cardiacDisease} color="#A78BFA" onClick={()=>sH('cardiacDisease',!h.cardiacDisease)}/>
            <Tog label={t("Cancer/Tumeur","Cancer/Tumor")} active={h.cancer} color="#8B5CF6" onClick={()=>sH('cancer',!h.cancer)}/>
            <Tog label={t("Transplantation","Transplant")} active={h.transplant} color="#8B5CF6" onClick={()=>sH('transplant',!h.transplant)}/>
            <Tog label="VIH+" active={h.hivPositive} color="#8B5CF6" onClick={()=>sH('hivPositive',!h.hivPositive)}/>
            <Tog label={t("Hydrocéphalie/DVP","Hydrocephalus/VP")} active={h.hydrocephalus} color="#B96BFF" onClick={()=>sH('hydrocephalus',!h.hydrocephalus)}/>
            <Tog label="TSA" sub={t("Spectre autistique","Autism spectrum")} active={h.tsa} color="#6C7CFF" onClick={()=>sH('tsa',!h.tsa)}/>
            <Tog label={t("Asthme","Asthma")} active={h.asthma} color="#6C7CFF" onClick={()=>sH('asthma',!h.asthma)}/>
          </div>
          {h.cancer&&<F label={t("TYPE TUMEUR","TUMOR TYPE")}><input style={inputS} value={h.cancerType} onChange={e=>sH('cancerType',e.target.value)}/></F>}
          {h.transplant&&<F label={t("ORGANE","ORGAN")}><input style={inputS} value={h.transplantOrgan} onChange={e=>sH('transplantOrgan',e.target.value)}/></F>}
          <div style={{marginTop:'8px'}}><F label={t("AUTRE CONDITION","OTHER CONDITION")}><input style={inputS} value={h.otherChronic} onChange={e=>sH('otherChronic',e.target.value)} placeholder={t("Préciser si non listé","Specify if not listed")}/></F></div>

          <div style={secS('#FFB347')}>{t("ANTÉCÉDENTS INFECTIEUX","INFECTIOUS HISTORY")}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
            <Tog label={t("ATCD Méningite","Prior meningitis")} active={h.previousMeningitis} color="#FFB347" onClick={()=>sH('previousMeningitis',!h.previousMeningitis)}/>
            <Tog label={t("ATCD Encéphalite","Prior encephalitis")} active={h.previousEncephalitis} color="#8B5CF6" onClick={()=>sH('previousEncephalitis',!h.previousEncephalitis)}/>
            <Tog label="Herpès/HSV" active={h.herpesHistory} color="#A78BFA" onClick={()=>sH('herpesHistory',!h.herpesHistory)}/>
            <Tog label={t("COVID récent","Recent COVID")} sub="<6 sem" active={h.recentCovid} color="#FFB347" onClick={()=>sH('recentCovid',!h.recentCovid)}/>
            <Tog label="EBV/CMV" active={h.recentEBVCMV} color="#FFB347" onClick={()=>sH('recentEBVCMV',!h.recentEBVCMV)}/>
            <Tog label={t("Tuberculose","Tuberculosis")} active={h.tuberculosis} color="#8B5CF6" onClick={()=>sH('tuberculosis',!h.tuberculosis)}/>
            <Tog label={t("Voyage tropical","Tropical travel")} active={h.recentTropicalTravel} color="#FFB347" onClick={()=>sH('recentTropicalTravel',!h.recentTropicalTravel)}/>
            <Tog label={t("Piqûre tique","Tick bite")} active={h.tickBite} color="#FFB347" onClick={()=>sH('tickBite',!h.tickBite)}/>
          </div>
          <F label={t("AUTRE INFECTIEUX","OTHER INFECTIOUS")}><input style={inputS} value={h.otherInfection} onChange={e=>sH('otherInfection',e.target.value)}/></F>

          <div style={secS('#B96BFF')}>{t("NEURODÉVELOPPEMENT","NEURODEVELOPMENT")}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
            <Tog label={t("Convulsions fébriles","Febrile seizures")} active={h.febrileSeizuresHistory} color="#B96BFF" onClick={()=>sH('febrileSeizuresHistory',!h.febrileSeizuresHistory)}/>
            <Tog label={t("Retard développement","Dev delay")} active={h.developmentalDelay} color="#B96BFF" onClick={()=>sH('developmentalDelay',!h.developmentalDelay)}/>
            <Tog label="ATCD ADEM" active={h.previousADEM} color="#8B5CF6" onClick={()=>sH('previousADEM',!h.previousADEM)}/>
            <Tog label={t("Névrite optique","Optic neuritis")} active={h.previousOpticNeuritis} color="#B96BFF" onClick={()=>sH('previousOpticNeuritis',!h.previousOpticNeuritis)}/>
            <Tog label={t("Myélite transverse","Transverse myelitis")} active={h.previousMyelitis} color="#B96BFF" onClick={()=>sH('previousMyelitis',!h.previousMyelitis)}/>
            <Tog label={t("Tératome ovarien","Ovarian teratoma")} sub="NMDAR" active={h.ovarianTeratoma} color="#8B5CF6" onClick={()=>sH('ovarianTeratoma',!h.ovarianTeratoma)}/>
          </div>
          <F label={t("AUTRE NEURO","OTHER NEURO")}><input style={inputS} value={h.otherNeuro} onChange={e=>sH('otherNeuro',e.target.value)}/></F>

          <div style={secS('#2FD1C8')}>{t("ALLERGIES & TRAITEMENTS","ALLERGIES & MEDICATIONS")}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <F label={t("ALLERGIES","ALLERGIES")}><textarea style={{...inputS,minHeight:'60px'}} value={h.allergies} onChange={e=>sH('allergies',e.target.value)} placeholder={t("Pénicilline, AINS…","Penicillin, NSAIDs…")}/></F>
            <F label={t("TRAITEMENTS EN COURS","CURRENT MEDICATIONS")}><textarea style={{...inputS,minHeight:'60px'}} value={h.currentMedications} onChange={e=>sH('currentMedications',e.target.value)} placeholder={t("Molécule + posologie","Molecule + dosage")}/></F>
          </div>
        </div>}

        {/* STEP 4: NEURO */}
        {step===4&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t('Examen neurologique','Neurological Examination')}</h2>
          <div style={secS('#8B5CF6')}>GLASGOW COMA SCALE</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <F label={t("YEUX (E)","EYES (E)")}><select style={selS} value={n.gcsEye} onChange={e=>{const v=+e.target.value;sN('gcsEye',v);sN('gcs',v+n.gcsVerbal+n.gcsMotor)}}>{[1,2,3,4].map(x=><option key={x} value={x}>{x}</option>)}</select></F>
            <F label={t("VERBAL (V)","VERBAL (V)")}><select style={selS} value={n.gcsVerbal} onChange={e=>{const v=+e.target.value;sN('gcsVerbal',v);sN('gcs',n.gcsEye+v+n.gcsMotor)}}>{[1,2,3,4,5].map(x=><option key={x} value={x}>{x}</option>)}</select></F>
            <F label={t("MOTEUR (M)","MOTOR (M)")}><select style={selS} value={n.gcsMotor} onChange={e=>{const v=+e.target.value;sN('gcsMotor',v);sN('gcs',n.gcsEye+n.gcsVerbal+v)}}>{[1,2,3,4,5,6].map(x=><option key={x} value={x}>{x}</option>)}</select></F>
          </div>
          <div style={{padding:'10px 16px',borderRadius:'10px',background:n.gcs<=8?'rgba(139,92,246,0.12)':'rgba(16,185,129,0.08)',border:`1px solid ${n.gcs<=8?'rgba(139,92,246,0.3)':'rgba(16,185,129,0.2)'}`,marginBottom:'20px',display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{fontFamily:'var(--p-font-mono)',fontSize:'24px',fontWeight:900,color:n.gcs<=8?'#8B5CF6':'#10B981'}}>{n.gcs}</span>
            <span style={{fontSize:'12px',color:n.gcs<=8?'#8B5CF6':'#10B981',fontWeight:700}}>{n.gcs<=8?t('COMA','COMA'):n.gcs<=12?t('Altération modérée','Moderate impairment'):t('Normal','Normal')}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <F label={t("PUPILLES","PUPILS")}><select style={selS} value={n.pupils} onChange={e=>sN('pupils',e.target.value)}><option value="normal">{t("Normales","Normal")}</option><option value="anisocoria">{t("Anisocorie","Anisocoria")}</option><option value="mydriasis">{t("Mydriase","Mydriasis")}</option><option value="fixed">{t("Fixes","Fixed")}</option></select></F>
            <F label={t("CONVULSIONS","SEIZURES")}><select style={selS} value={n.seizureType} onChange={e=>sN('seizureType',e.target.value)}><option value="none">{t("Aucune","None")}</option><option value="focal">{t("Focales","Focal")}</option><option value="generalized">{t("Généralisées","Generalized")}</option><option value="status">{t("État de mal","Status epilepticus")}</option></select></F>
            <Tog label={t("Signes focaux","Focal signs")} active={n.focalSigns} color="#8B5CF6" onClick={()=>sN('focalSigns',!n.focalSigns)}/>
            <Tog label={t("Signes méningés","Meningeal signs")} active={n.meningealSigns} color="#8B5CF6" onClick={()=>sN('meningealSigns',!n.meningealSigns)}/>
            {n.focalSigns&&<F label={t("DÉTAIL FOCAUX","FOCAL DETAIL")} span={2}><input style={inputS} value={n.focalDetail} onChange={e=>sN('focalDetail',e.target.value)} placeholder={t("Hémiparésie, aphasie…","Hemiparesis, aphasia…")}/></F>}
            <Tog label={t("Mouvements anormaux","Abnormal movements")} active={n.abnormalMovements} color="#B96BFF" onClick={()=>sN('abnormalMovements',!n.abnormalMovements)}/>
            {n.abnormalMovements&&<F label={t("DÉTAIL","DETAIL")}><input style={inputS} value={n.movementDetail} onChange={e=>sN('movementDetail',e.target.value)}/></F>}
            <F label={t("AUTRE OBSERVATION","OTHER OBSERVATION")} span={2}><input style={inputS} value={n.otherNeuro} onChange={e=>sN('otherNeuro',e.target.value)}/></F>
          </div>
        </div>}

        {/* STEP 5: BIO */}
        {step===5&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t('Biologie & Ponction lombaire','Biology & Lumbar Puncture')}</h2>
          <div style={secS('#B96BFF')}>{t("BIOLOGIE SANGUINE","BLOOD TESTS")}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
            <F label="GB (G/L)"><input type="number" step="0.1" style={inputS} value={bio.wbc} onChange={e=>sB('wbc',e.target.value)}/></F>
            <F label="CRP (mg/L)"><input type="number" step="0.1" style={inputS} value={bio.crp} onChange={e=>sB('crp',e.target.value)}/></F>
            <F label="PCT (ng/mL)"><input type="number" step="0.01" style={inputS} value={bio.pct} onChange={e=>sB('pct',e.target.value)}/></F>
            <F label="Lactate"><input type="number" step="0.1" style={inputS} value={bio.lactate} onChange={e=>sB('lactate',e.target.value)}/></F>
            <F label="Na+"><input type="number" style={inputS} value={bio.na} onChange={e=>sB('na',e.target.value)}/></F>
            <F label="K+"><input type="number" step="0.1" style={inputS} value={bio.k} onChange={e=>sB('k',e.target.value)}/></F>
            <F label={t("Glycémie","Glucose")}><input type="number" step="0.01" style={inputS} value={bio.glucose} onChange={e=>sB('glucose',e.target.value)}/></F>
            <F label="Hb (g/dL)"><input type="number" step="0.1" style={inputS} value={bio.hb} onChange={e=>sB('hb',e.target.value)}/></F>
            <F label={t("Plaquettes","Platelets")}><input type="number" style={inputS} value={bio.platelets} onChange={e=>sB('platelets',e.target.value)}/></F>
            <F label="INR"><input type="number" step="0.1" style={inputS} value={bio.inr} onChange={e=>sB('inr',e.target.value)}/></F>
          </div>
          <div style={secS('#2FD1C8')}>{t("PONCTION LOMBAIRE / LCR","LUMBAR PUNCTURE / CSF")}</div>
          <Tog label={t("PL réalisée","LP performed")} active={bio.csfDone} color="#2FD1C8" onClick={()=>sB('csfDone',!bio.csfDone)}/>
          {bio.csfDone&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginTop:'12px'}}>
            <F label={t("ASPECT","APPEARANCE")}><select style={selS} value={bio.csfAppearance} onChange={e=>sB('csfAppearance',e.target.value)}><option value="clear">{t("Clair","Clear")}</option><option value="turbid">{t("Trouble","Turbid")}</option><option value="bloody">{t("Hémorragique","Bloody")}</option></select></F>
            <F label={t("GB LCR","CSF WBC")}><input type="number" style={inputS} value={bio.csfWbc} onChange={e=>sB('csfWbc',e.target.value)}/></F>
            <F label={t("PROTÉINES","PROTEINS")}><input type="number" step="0.01" style={inputS} value={bio.csfProtein} onChange={e=>sB('csfProtein',e.target.value)}/></F>
            <F label={t("GLUCOSE LCR","CSF GLUCOSE")}><input type="number" step="0.01" style={inputS} value={bio.csfGlucose} onChange={e=>sB('csfGlucose',e.target.value)}/></F>
            <F label={t("PRESSION","PRESSURE")}><input type="number" style={inputS} value={bio.csfPressure} onChange={e=>sB('csfPressure',e.target.value)}/></F>
            <F label={t("CULTURE/PCR","CULTURE/PCR")}><input style={inputS} value={bio.csfCulture} onChange={e=>sB('csfCulture',e.target.value)}/></F>
          </div>}
          <div style={{marginTop:'16px'}}><F label={t("AUTRE BIO","OTHER BIO")}><input style={inputS} value={bio.otherBio} onChange={e=>sB('otherBio',e.target.value)} placeholder={t("Anti-NMDAR, MOG, AQP4…","Anti-NMDAR, MOG, AQP4…")}/></F></div>
        </div>}

        {/* STEP 6: IMAGING */}
        {step===6&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t('Imagerie & Explorations','Imaging & Investigations')}</h2>
          {[
            {key:'eeg',label:'EEG',color:'#2FD1C8',done:img.eegDone,result:img.eegResult,detail:img.eegDetail,opts:[{v:'normal',l:t('Normal','Normal')},{v:'slowing',l:t('Ralentissement','Slowing')},{v:'epileptiform',l:t('Épileptiforme','Epileptiform')},{v:'status',l:t('État de mal','Status')}]},
            {key:'mri',label:'IRM/MRI',color:'#6C7CFF',done:img.mriDone,result:img.mriResult,detail:img.mriDetail,opts:[{v:'normal',l:t('Normal','Normal')},{v:'temporal',l:t('Hypersignal temporal','Temporal hyperintensity')},{v:'multifocal',l:t('Multifocal','Multifocal')},{v:'demyelination',l:t('Démyélinisation','Demyelination')}]},
            {key:'ct',label:t('Scanner','CT scan'),color:'#FFB347',done:img.ctDone,result:img.ctResult,detail:img.ctDetail,opts:[{v:'normal',l:t('Normal','Normal')},{v:'edema',l:t('Œdème','Edema')},{v:'hemorrhage',l:t('Hémorragie','Hemorrhage')}]}
          ].map(ex=>(
            <div key={ex.key} style={{marginBottom:'20px'}}>
              <Tog label={`${ex.label} ${t('réalisé','performed')}`} active={ex.done} color={ex.color} onClick={()=>sI(`${ex.key}Done`,!ex.done)}/>
              {ex.done&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'10px',paddingLeft:'28px'}}>
                <F label={t("RÉSULTAT","RESULT")}><select style={selS} value={ex.result} onChange={e=>sI(`${ex.key}Result`,e.target.value)}><option value="">—</option>{ex.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></F>
                <F label={t("DÉTAIL","DETAIL")}><input style={inputS} value={ex.detail} onChange={e=>sI(`${ex.key}Detail`,e.target.value)}/></F>
              </div>}
            </div>
          ))}
          <F label={t("AUTRE EXAMEN","OTHER INVESTIGATION")}><input style={inputS} value={img.otherImaging} onChange={e=>sI('otherImaging',e.target.value)} placeholder={t("Angiographie, EMG…","Angiography, EMG…")}/></F>
        </div>}

        {/* STEP 7: SUMMARY */}
        {step===7&&<div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--p-text)',marginBottom:'20px'}}>{t("Synthèse — Lancer l'analyse","Summary — Launch Analysis")}</h2>
          <div style={{display:'grid',gap:'12px'}}>
            <div style={{padding:'16px',borderRadius:'12px',background:'rgba(108,124,255,0.04)',border:'1px solid rgba(108,124,255,0.1)'}}>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'#6C7CFF',fontWeight:800,letterSpacing:'1px',marginBottom:'8px'}}>PATIENT</div>
              <div style={{fontSize:'16px',fontWeight:800,color:'var(--p-text)'}}>{id.firstName} {id.lastName}</div>
              <div style={{fontSize:'12px',color:'var(--p-text-muted)',marginTop:'4px'}}>{id.ageMonths&&`${id.ageMonths} ${t('mois','mo')}`} · {id.sex==='female'?t('F','F'):id.sex==='male'?t('M','M'):'—'} {id.weight&&`· ${id.weight}kg`} {id.room&&`· ${id.room}`}</div>
            </div>
            <div style={{padding:'16px',borderRadius:'12px',background:'rgba(139,92,246,0.04)',border:'1px solid rgba(139,92,246,0.1)'}}>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:'#8B5CF6',fontWeight:800,letterSpacing:'1px',marginBottom:'8px'}}>ADMISSION</div>
              <div style={{fontSize:'13px',color:'var(--p-text)'}}>{adm.chiefComplaint||'—'}</div>
              <div style={{fontSize:'11px',color:'var(--p-text-muted)',marginTop:'4px'}}>{adm.mode} · {t('Conscience','Consciousness')}: {adm.consciousness} {adm.symptomOnsetDays&&`· J${adm.symptomOnsetDays}`}</div>
            </div>
            <div style={{padding:'16px',borderRadius:'12px',background:n.gcs<=8?'rgba(139,92,246,0.08)':'rgba(16,185,129,0.04)',border:`1px solid ${n.gcs<=8?'rgba(139,92,246,0.2)':'rgba(16,185,129,0.1)'}`}}>
              <div style={{fontFamily:'var(--p-font-mono)',fontSize:'9px',color:n.gcs<=8?'#8B5CF6':'#10B981',fontWeight:800,letterSpacing:'1px',marginBottom:'8px'}}>NEURO</div>
              <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                <span style={{fontFamily:'var(--p-font-mono)',fontSize:'28px',fontWeight:900,color:n.gcs<=8?'#8B5CF6':'#10B981'}}>GCS {n.gcs}</span>
                <div style={{fontSize:'11px',color:'var(--p-text-muted)'}}>
                  {n.seizureType!=='none'&&<div>⚡ {n.seizureType}</div>}
                  {n.focalSigns&&<div>📍 {n.focalDetail}</div>}
                  {n.meningealSigns&&<div>🔴 {t('Méningé','Meningeal')}</div>}
                </div>
              </div>
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:'28px'}}>
            <button onClick={launch} disabled={analyzing} style={{padding:'16px 48px',borderRadius:'16px',border:'none',cursor:analyzing?'wait':'pointer',background:'linear-gradient(135deg, #6C7CFF, #2FD1C8)',color:'#fff',fontSize:'16px',fontWeight:800,boxShadow:'0 4px 24px rgba(108,124,255,0.4)',display:'inline-flex',alignItems:'center',gap:'12px',transition:'all 0.3s',opacity:analyzing?0.7:1}}>
              {analyzing?<><div className="animate-breathe" style={{width:'16px',height:'16px',borderRadius:'50%',background:'#fff'}}/>{t('Analyse...','Analyzing...')}</>:<><Picto name="brain" size={20}/> {t("Lancer l'analyse PULSAR","Launch PULSAR Analysis")}</>}
            </button>
            <p style={{fontSize:'11px',color:'var(--p-text-dim)',marginTop:'12px'}}>{t('5 moteurs IA · Diagnostic différentiel · Red flags · Parcours clinique','5 AI engines · Differential diagnosis · Red flags · Clinical pathway')}</p>
          </div>
        </div>}
      </div>

      {/* NAV BUTTONS */}
      {step>0&&<div style={{display:'flex',justifyContent:'space-between',marginTop:'20px',gap:'12px'}}>
        <button onClick={prev} style={{padding:'12px 28px',borderRadius:'12px',background:'var(--p-bg-elevated)',border:'var(--p-border)',color:'var(--p-text-muted)',cursor:'pointer',fontSize:'13px',fontWeight:600}}>← {t('Retour','Back')}</button>
        {step<STEPS.length-1&&<button onClick={next} disabled={!canGo(step)} style={{padding:'12px 28px',borderRadius:'12px',border:'none',cursor:canGo(step)?'pointer':'not-allowed',background:canGo(step)?'#6C7CFF':'var(--p-bg-elevated)',color:canGo(step)?'#fff':'var(--p-text-dim)',fontSize:'13px',fontWeight:700,boxShadow:canGo(step)?'0 2px 12px rgba(108,124,255,0.3)':'none'}}>{t('Valider et continuer','Validate & continue')} →</button>}
      </div>}
      {step>=1&&step<=2&&<p style={{fontSize:'10px',color:'var(--p-text-dim)',textAlign:'center',marginTop:'12px',fontFamily:'var(--p-font-mono)'}}>{t('* Champs obligatoires','* Required fields')}</p>}
    </div>
  )
}
