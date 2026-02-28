'use client'
import { useState, useMemo, useEffect } from 'react'
import Picto from '@/components/Picto'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { DEMO_PATIENTS } from '@/lib/data/demoScenarios'

type Lang = 'simple' | 'detail'

const sections = [
  { icon: 'heart', color: 'var(--p-vps)', title: 'Ce qui se passe',
    simple: 'Votre enfant présente des crises (convulsions) accompagnées de fièvre. Ces crises sont provoquées par une inflammation dans le cerveau. Ce n\'est pas contagieux et ce n\'est pas de votre faute. L\'équipe médicale surveille votre enfant en permanence.',
    detail: 'Votre enfant est atteint d\'une encéphalite auto-immune, une maladie rare où le système immunitaire attaque par erreur des cellules du cerveau. Cela provoque des crises d\'épilepsie et parfois des changements de comportement. Le système PULSAR aide l\'équipe à suivre l\'évolution en temps réel.' },
  { icon: 'microscope', color: 'var(--p-pve)', title: 'Les examens réalisés',
    simple: 'Nous avons fait des prises de sang pour vérifier l\'inflammation, une ponction lombaire (prélèvement dans le dos, sous anesthésie) pour analyser le liquide autour du cerveau, et une IRM (photo du cerveau, sans douleur). Un EEG (capteurs sur la tête) surveille l\'activité du cerveau en continu.',
    detail: 'Le bilan comprend : NFS/CRP/PCT (inflammation), panel d\'auto-anticorps sériques et dans le LCR (anti-NMDAR, LGI1, CASPR2), IRM cérébrale séquences FLAIR et diffusion, et EEG continu sur 24h minimum. Les résultats orientent le diagnostic et le choix du traitement.' },
  { icon: 'pill', color: 'var(--p-ewe)', title: 'Les traitements donnés',
    simple: 'Votre enfant reçoit des médicaments contre les crises (antiépileptiques) et des traitements pour calmer l\'inflammation (corticoïdes et immunoglobulines en perfusion). Ces traitements sont bien connus et utilisés régulièrement dans cette situation.',
    detail: 'Ligne 1 : Méthylprednisolone 30 mg/kg/j pendant 3-5 jours + IgIV 2 g/kg sur 2 jours. Si insuffisant : Rituximab ou échanges plasmatiques. Les antiépileptiques (Lévétiracétam en 1ère intention) contrôlent les crises. La pharmacovigilance surveille les effets secondaires en temps réel.' },
  { icon: 'chart', color: 'var(--p-tde)', title: 'L\'évolution attendue',
    simple: 'Chaque enfant est différent, mais en général l\'amélioration commence dans les premiers jours de traitement. La surveillance dure plusieurs semaines. Nous vous informerons régulièrement de l\'évolution.',
    detail: 'Le score VPS (Vital Prognosis Score) suit l\'évolution heure par heure. Un score en baisse = amélioration. Les crises diminuent généralement en 48-72h sous traitement. L\'IRM de contrôle à J+7-14 vérifie la régression des lésions. Le suivi neurologique se poursuit sur 6-12 mois.' },
  { icon: 'brain', color: 'var(--p-tpe)', title: 'Questions fréquentes',
    simple: 'Puis-je rester ? Oui, votre présence est importante et rassurante. Combien de temps ? Généralement 2-4 semaines en phase aiguë, puis suivi ambulatoire. Mon enfant va-t-il guérir ? Avec un traitement précoce, la grande majorité des enfants récupèrent bien. Chaque cas est unique.',
    detail: 'Facteurs de bon pronostic : diagnostic précoce, réponse rapide à l\'immunothérapie, absence de complication infectieuse surajoutée. Le suivi à long terme inclut : EEG de contrôle, bilan neuropsychologique à 3 mois, suivi scolaire adapté si nécessaire. Un protocole de rechute est prévu.' },
]

export default function FamillePage() {
  const [lang, setLang] = useState<Lang>('simple')
  const [openIdx, setOpenIdx] = useState<number>(0)
  const [scenario, setScenario] = useState('FIRES')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const ps = useMemo(() => {
    const p = new PatientState(DEMO_PATIENTS[scenario].data)
    runPipeline(p)
    return p
  }, [scenario])

  const vpsScore = ps.vpsResult?.synthesis.score || 0
  const vpsLevel = ps.vpsResult?.synthesis.level || 'N/A'
  const lc = vpsScore >= 75 ? 'var(--p-critical)' : vpsScore >= 50 ? 'var(--p-warning)' : vpsScore >= 25 ? 'var(--p-tpe)' : 'var(--p-success)'
  const hospDay = ps.hospDay
  const drugs = ps.drugs.map(d => d.name).join(', ') || 'Aucun pour le moment'
  const age = ps.ageMonths < 24 ? `${ps.ageMonths} mois` : `${Math.floor(ps.ageMonths / 12)} ans`

  const card: React.CSSProperties = { borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-5)' }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-4)', marginBottom: 'var(--p-space-2)' }}>
        <Picto name="family" size={36} glow glowColor="rgba(255,107,138,0.5)" />
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Espace Famille</h1>
          <span style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>Informations pour les parents · Pipeline connecté</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: 'var(--p-space-4) 0', flexWrap: 'wrap' }}>
        {Object.entries(DEMO_PATIENTS).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setOpenIdx(0) }} style={{
            padding: '6px 16px', borderRadius: 'var(--p-radius-lg)',
            border: scenario === k ? '2px solid var(--p-vps)' : 'var(--p-border)',
            background: scenario === k ? 'var(--p-vps-dim)' : 'var(--p-bg-elevated)',
            color: scenario === k ? 'var(--p-vps)' : 'var(--p-text-muted)',
            fontSize: 'var(--p-text-sm)', fontWeight: 600, cursor: 'pointer',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Patient Status Banner */}
      <div className={`glass-card ${mounted ? 'animate-in' : ''}`} style={{
        ...card, marginBottom: 'var(--p-space-5)',
        borderLeft: `4px solid ${lc}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: 'var(--p-space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>PATIENT</div>
            <div style={{ fontWeight: 700, color: 'var(--p-text)' }}>{ps.sex === 'male' ? 'Garçon' : 'Fille'}, {age}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>JOUR</div>
            <div style={{ fontWeight: 700, color: 'var(--p-text)' }}>J+{hospDay}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>ÉTAT</div>
            <div style={{ padding: '3px 12px', borderRadius: 'var(--p-radius-full)', background: `${lc}15`, color: lc, fontFamily: 'var(--p-font-mono)', fontWeight: 700, fontSize: '11px' }}>{vpsLevel}</div>
          </div>
        </div>
        <div style={{
          padding: '4px 14px', borderRadius: 'var(--p-radius-full)',
          background: 'var(--p-vps-dim)', border: '1px solid var(--p-vps)',
          fontSize: '11px', fontFamily: 'var(--p-font-mono)', fontWeight: 700, color: 'var(--p-vps)',
        }}>VPS {vpsScore}/100</div>
      </div>

      {/* Toggle langage */}
      <div className="glass-card" style={{ padding: 'var(--p-space-3)', marginBottom: 'var(--p-space-5)', display: 'flex', gap: '8px' }}>
        {([['simple', 'Langage simple'], ['detail', 'Détails médicaux']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setLang(key)} style={{
            flex: 1, padding: '8px 16px', borderRadius: 'var(--p-radius-md)', cursor: 'pointer',
            fontWeight: 600, fontSize: 'var(--p-text-sm)', transition: 'all 150ms',
            border: lang === key ? '2px solid var(--p-vps)' : '1px solid var(--p-gray-2)',
            background: lang === key ? 'rgba(108,124,255,0.12)' : 'transparent',
            color: lang === key ? 'var(--p-vps)' : 'var(--p-text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {/* Welcome with dynamic info */}
      <div className="glass-card" style={{ padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-5)', borderTop: '2px solid var(--p-tde)' }}>
        <h2 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>Chers parents,</h2>
        <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 1.8 }}>
          Votre {ps.sex === 'male' ? 'fils' : 'fille'} est pris{ps.sex === 'female' ? 'e' : ''} en charge depuis {hospDay} jour{hospDay > 1 ? 's' : ''}.
          {ps.drugs.length > 0 ? ` ${ps.sex === 'male' ? 'Il' : 'Elle'} reçoit actuellement : ${drugs}.` : ''} Cette page vous explique ce qui se passe, les examens, les traitements et les prochaines étapes.
        </p>
      </div>

      {/* Sections accordéon */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
        {sections.map((s, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} className="glass-card card-interactive" style={{ padding: 0, overflow: 'hidden', borderLeft: `3px solid ${s.color}` }}>
              <button onClick={() => setOpenIdx(isOpen ? -1 : i)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', width: '100%',
                padding: 'var(--p-space-4) var(--p-space-5)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-text)',
              }}>
                <Picto name={s.icon} size={24} glow={isOpen} glowColor={s.color} />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 'var(--p-text-sm)', textAlign: 'left' }}>{s.title}</span>
                <span style={{ color: 'var(--p-text-dim)', transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 200ms' }}>▾</span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 var(--p-space-5) var(--p-space-5) calc(var(--p-space-5) + 36px)' }}>
                  <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 1.8 }}>
                    {lang === 'simple' ? s.simple : s.detail}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Contact */}
      <div className="glass-card" style={{ padding: 'var(--p-space-5)', marginTop: 'var(--p-space-5)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-2)' }}>Besoin de parler ?</div>
        <p style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginBottom: 'var(--p-space-3)' }}>L&apos;équipe soignante est disponible 24h/24. N&apos;hésitez pas à poser vos questions.</p>
        <div style={{ display: 'flex', gap: 'var(--p-space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)' }}>Poste infirmier : <strong style={{ color: 'var(--p-text)' }}>Ext. 4201</strong></div>
          <div style={{ padding: '8px 20px', borderRadius: 'var(--p-radius-md)', background: 'var(--p-bg-elevated)', fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)' }}>Psychologue : <strong style={{ color: 'var(--p-text)' }}>Ext. 4215</strong></div>
        </div>
      </div>
    </div>
  )
}
