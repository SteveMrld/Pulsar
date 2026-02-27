'use client'

const events = [
  { time: 'J0 08:00', type: 'admission', title: 'Admission urgences', desc: 'Enfant 7 ans, fièvre 39.2°C depuis 48h, première crise TC', color: 'var(--p-vps)', icon: '🏥' },
  { time: 'J0 08:15', type: 'exam', title: 'Bilan biologique lancé', desc: 'NFS, CRP, PCT, iono, lactates, bilan hépatique', color: 'var(--p-pve)', icon: '🔬' },
  { time: 'J0 09:30', type: 'alert', title: 'État de mal épileptique', desc: '2ème crise TC > 5 min, Midazolam 0.15 mg/kg IV', color: 'var(--p-critical)', icon: '🚨' },
  { time: 'J0 10:00', type: 'treatment', title: 'Lévétiracétam 40 mg/kg IV', desc: 'Charge antiépileptique 1ère ligne', color: 'var(--p-ewe)', icon: '💊' },
  { time: 'J0 11:00', type: 'exam', title: 'Ponction lombaire', desc: 'Cellules 18/mm³, protéines 0.52 g/L, glucose normal', color: 'var(--p-pve)', icon: '💉' },
  { time: 'J0 14:00', type: 'result', title: 'Résultats biologie', desc: 'CRP 35 mg/L, PCT 0.8 ng/mL, ferritine 280 µg/L', color: 'var(--p-tde)', icon: '📋' },
  { time: 'J0 16:00', type: 'alert', title: 'Crises réfractaires', desc: '4 crises en 8h malgré LEV + MDZ, escalade nécessaire', color: 'var(--p-critical)', icon: '⚠️' },
  { time: 'J0 17:00', type: 'engine', title: 'Pipeline PULSAR — VPS 68/100', desc: 'Niveau SÉVÈRE, pattern détérioration progressive détecté', color: 'var(--p-vps)', icon: '🧠' },
  { time: 'J1 08:00', type: 'treatment', title: 'Méthylprednisolone 30 mg/kg', desc: 'Immunothérapie 1ère ligne lancée + IgIV prévues J2', color: 'var(--p-ewe)', icon: '💊' },
  { time: 'J1 14:00', type: 'exam', title: 'IRM cérébrale', desc: 'Pas de lésion structurelle, FLAIR normal', color: 'var(--p-pve)', icon: '🧲' },
  { time: 'J2 10:00', type: 'treatment', title: 'IgIV 2 g/kg', desc: 'Immunoglobulines IV, perfusion sur 12h', color: 'var(--p-ewe)', icon: '💊' },
  { time: 'J3 08:00', type: 'engine', title: 'Pipeline PULSAR — VPS 45/100', desc: 'Amélioration modérée, 2 crises/24h vs 12 à J0', color: 'var(--p-tde)', icon: '🧠' },
]

export default function TimelinePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
        <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: 'var(--p-tde)' }} />
        <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Timeline</h1>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-6)' }}>Chronologie complète du séjour patient</p>

      <div style={{ position: 'relative', paddingLeft: '40px' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: 'var(--p-gray-1)' }} />

        {events.map((e, i) => (
          <div key={i} className="animate-in" style={{ position: 'relative', marginBottom: 'var(--p-space-4)', animationDelay: `${i * 60}ms` }}>
            {/* Node */}
            <div style={{ position: 'absolute', left: '-33px', top: '12px', width: '12px', height: '12px', borderRadius: '50%', background: e.color, border: '2px solid var(--p-bg)', zIndex: 1 }} />

            <div style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-4)', borderLeft: `3px solid ${e.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-2)' }}>
                  <span style={{ fontSize: '14px' }}>{e.icon}</span>
                  <span style={{ fontSize: 'var(--p-text-sm)', fontWeight: 700, color: 'var(--p-text)' }}>{e.title}</span>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: e.color, fontWeight: 600 }}>{e.time}</span>
              </div>
              <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)' }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
