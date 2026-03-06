'use client'
import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { usePatient } from '@/contexts/PatientContext'
import Picto from '@/components/Picto'
import { OracleEngine, PRESET_SCENARIOS, type OracleResult, type ScenarioResult, type TimePoint } from '@/lib/engines/OracleEngine'

// ══════════════════════════════════════════════════════════════
// PULSAR ORACLE — Clinical Foresight Engine
// "Il ne voit plus où en est le patient. Il voit où il va."
// Couleur identitaire : #E879F9 (fuchsia)
// ══════════════════════════════════════════════════════════════

const ORACLE_COLOR = '#E879F9'
const COLORS = { standard: '#6C7CFF', aggressive: '#F59E0B', experimental: '#E879F9', notreatment: '#EF4444' }

function VPSBar({ score, label, color }: { score: number; label: string; color: string }) {
  const level = score >= 80 ? 'CRITIQUE' : score >= 60 ? 'SÉVÈRE' : score >= 40 ? 'MODÉRÉ' : score >= 20 ? 'LÉGER' : 'STABLE'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--p-text-dim)', width: 40, textAlign: 'right', fontFamily: 'var(--p-font-mono)' }}>{label}</span>
      <div style={{ flex: 1, height: 18, background: 'var(--p-bg)', borderRadius: 9, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${Math.min(100, score)}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}40, ${color})`,
          borderRadius: 9, transition: 'width 0.6s ease',
        }} />
        <span style={{ position: 'absolute', right: 8, top: 1, fontSize: 10, fontWeight: 700, color: 'var(--p-text)', fontFamily: 'var(--p-font-mono)' }}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  )
}

function ScenarioCard({ result, isSelected, onClick, baseVPS, t }: {
  result: ScenarioResult; isSelected: boolean; onClick: () => void; baseVPS: number; t: (fr: string, en: string) => string
}) {
  const { scenario, finalVPS, riskProfile, keyInsights } = result
  const delta = baseVPS - finalVPS
  const catLabels: Record<string, string> = { standard: 'Standard', aggressive: 'Agressif', experimental: 'Expérimental' }

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'var(--p-bg-card)' : 'var(--p-bg)',
        border: isSelected ? `2px solid ${scenario.color}` : '1px solid var(--p-border-color, rgba(255,255,255,0.06))',
        borderRadius: 'var(--p-radius-xl)', padding: 16, cursor: 'pointer',
        transition: 'all 0.2s', boxShadow: isSelected ? `0 0 20px ${scenario.color}20` : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: scenario.color,
          boxShadow: `0 0 8px ${scenario.color}60`,
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)', flex: 1 }}>{scenario.name}</span>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          background: `${scenario.color}15`, color: scenario.color,
        }}>{catLabels[scenario.category]}</span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 9, color: 'var(--p-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
        {scenario.description}
      </p>

      {/* Médicaments */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {scenario.drugs.map((d, i) => (
          <span key={i} style={{
            fontSize: 8, padding: '2px 6px', borderRadius: 4,
            background: 'var(--p-bg)', border: '1px solid var(--p-border-color, rgba(255,255,255,0.06))',
            color: 'var(--p-text-secondary)',
          }}>
            {d.name} {d.dose}
          </span>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
        {[
          { label: 'VPS 72h', value: finalVPS, color: finalVPS >= 60 ? '#EF4444' : finalVPS >= 40 ? '#F59E0B' : '#10B981' },
          { label: t('Récup. neuro', 'Neuro recovery'), value: `${riskProfile.goodRecovery}%`, color: riskProfile.goodRecovery >= 60 ? '#10B981' : '#F59E0B' },
          { label: t('Mortalité', 'Mortality'), value: `${riskProfile.mortality}%`, color: riskProfile.mortality >= 20 ? '#EF4444' : '#10B981' },
          { label: 'ΔVPS', value: delta > 0 ? `−${delta}` : `+${-delta}`, color: delta > 0 ? '#10B981' : '#EF4444' },
        ].map((kpi, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: kpi.color, fontFamily: 'var(--p-font-mono)' }}>{kpi.value}</div>
            <div style={{ fontSize: 7, color: 'var(--p-text-dim)', marginTop: 2 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {keyInsights.length > 0 && (
        <div style={{ borderTop: '1px solid var(--p-border-color, rgba(255,255,255,0.06))', paddingTop: 8 }}>
          {keyInsights.map((insight, i) => (
            <div key={i} style={{ fontSize: 8, color: 'var(--p-text-muted)', marginBottom: 3, display: 'flex', gap: 4 }}>
              <span style={{ color: scenario.color }}>→</span> {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TrajectoryChart({ oracleResult, selectedScenario, t }: {
  oracleResult: OracleResult; selectedScenario: string | null; t: (fr: string, en: string) => string
}) {
  const horizons = ['0h', '6h', '12h', '24h', '48h', '72h']
  const baseVPS = oracleResult.baselineVPS
  const maxVPS = 100

  // Prepare data lines
  const lines: { label: string; color: string; points: number[]; dashed?: boolean }[] = []

  // No treatment
  lines.push({
    label: t('Sans traitement', 'No treatment'),
    color: '#EF4444',
    points: [baseVPS, ...oracleResult.noTreatmentProjection.map(tp => tp.vpsScore)],
    dashed: true,
  })

  // Scenarios
  for (const sr of oracleResult.scenarios) {
    if (selectedScenario && sr.scenario.id !== selectedScenario) continue
    lines.push({
      label: sr.scenario.name.split('—')[0].trim(),
      color: sr.scenario.color,
      points: [baseVPS, ...sr.timePoints.map(tp => tp.vpsScore)],
    })
  }

  const chartW = 500
  const chartH = 200
  const padL = 40, padR = 20, padT = 20, padB = 30
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB

  return (
    <div style={{ background: 'var(--p-bg)', borderRadius: 'var(--p-radius-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)', marginBottom: 12 }}>
        <Picto name="chart" size={14} glow glowColor={ORACLE_COLOR} /> {t('Trajectoire VPS simulée', 'Simulated VPS Trajectory')}
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', maxWidth: 500 }}>
        {/* Grid */}
        {[0, 20, 40, 60, 80, 100].map(v => {
          const y = padT + plotH - (v / maxVPS) * plotH
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
              <text x={padL - 6} y={y + 3} fontSize={8} fill="#6B7280" textAnchor="end" fontFamily="monospace">{v}</text>
            </g>
          )
        })}
        {/* X axis labels */}
        {horizons.map((h, i) => {
          const x = padL + (i / (horizons.length - 1)) * plotW
          return <text key={h} x={x} y={chartH - 8} fontSize={8} fill="#6B7280" textAnchor="middle" fontFamily="monospace">{h}</text>
        })}
        {/* Danger zones */}
        <rect x={padL} y={padT} width={plotW} height={(20 / maxVPS) * plotH} fill="rgba(239,68,68,0.06)" />
        <rect x={padL} y={padT + (20 / maxVPS) * plotH} width={plotW} height={(20 / maxVPS) * plotH} fill="rgba(245,158,11,0.04)" />
        {/* Lines */}
        {lines.map((line, li) => {
          const pathPoints = line.points.map((v, i) => {
            const x = padL + (i / (horizons.length - 1)) * plotW
            const y = padT + plotH - (v / maxVPS) * plotH
            return `${i === 0 ? 'M' : 'L'}${x},${y}`
          }).join(' ')
          return (
            <g key={li}>
              <path d={pathPoints} fill="none" stroke={line.color} strokeWidth={line.dashed ? 1.5 : 2.5}
                strokeDasharray={line.dashed ? '4,3' : undefined} opacity={0.9} />
              {line.points.map((v, i) => {
                const x = padL + (i / (horizons.length - 1)) * plotW
                const y = padT + plotH - (v / maxVPS) * plotH
                return <circle key={i} cx={x} cy={y} r={3} fill={line.color} opacity={0.9} />
              })}
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 16, height: 2, background: line.color, borderRadius: 1, opacity: line.dashed ? 0.5 : 1 }} />
            <span style={{ fontSize: 8, color: 'var(--p-text-dim)' }}>{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OraclePage() {
  const { id } = useParams()
  const { t } = useLang()
  const { ps, info } = usePatient()
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<OracleResult | null>(null)

  const runOracle = () => {
    if (!ps) return
    setRunning(true)
    // Simulate async for UX
    setTimeout(() => {
      const engine = new OracleEngine()
      const oracleResult = engine.run(ps)
      setResult(oracleResult)
      setRunning(false)
    }, 1500)
  }

  return (
    <div style={{ padding: 'var(--p-space-6)', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--p-space-6)' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${ORACLE_COLOR}15`, boxShadow: `0 0 16px ${ORACLE_COLOR}30`,
        }}>
          <Picto name="chart" size={20} glow glowColor={ORACLE_COLOR} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            ORACLE
            <span style={{ fontSize: 10, fontWeight: 500, color: ORACLE_COLOR, padding: '2px 8px', borderRadius: 12, background: `${ORACLE_COLOR}12` }}>
              Clinical Foresight
            </span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--p-text-muted)', margin: 0 }}>
            {t(
              'Simulez le futur du patient selon les décisions thérapeutiques',
              'Simulate the patient\'s future based on therapeutic decisions'
            )}
          </p>
        </div>
      </div>

      {/* Current state banner */}
      {ps?.vpsResult && (
        <div className="glass-card" style={{ borderRadius: 'var(--p-radius-xl)', padding: 16, marginBottom: 'var(--p-space-4)', borderLeft: `3px solid ${ORACLE_COLOR}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 10, color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
                {t('ÉTAT ACTUEL', 'CURRENT STATE')}
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--p-vps)', fontFamily: 'var(--p-font-mono)' }}>
                VPS {ps.vpsResult.synthesis.score}
                <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 8, color: 'var(--p-text-muted)' }}>
                  {ps.vpsResult.synthesis.level}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'GCS', value: ps.neuro.gcs },
                { label: t('Crises/24h', 'Seizures/24h'), value: ps.neuro.seizures24h },
                { label: 'CRP', value: ps.biology.crp },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--p-text)', fontFamily: 'var(--p-font-mono)' }}>{m.value}</div>
                  <div style={{ fontSize: 8, color: 'var(--p-text-dim)' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={runOracle}
              disabled={running}
              style={{
                padding: '10px 24px', borderRadius: 'var(--p-radius-lg)',
                background: running ? 'var(--p-gray-2)' : `linear-gradient(135deg, ${ORACLE_COLOR}, #8B5CF6)`,
                color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
                cursor: running ? 'not-allowed' : 'pointer',
                boxShadow: running ? 'none' : `0 4px 16px ${ORACLE_COLOR}30`,
              }}
            >
              {running ? t('Simulation en cours...', 'Simulating...') : t('▶ Lancer la simulation', '▶ Run Simulation')}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Trajectory chart */}
          <TrajectoryChart oracleResult={result} selectedScenario={selectedScenario} t={t} />

          {/* Recommendation banner */}
          <div style={{
            background: `linear-gradient(135deg, ${ORACLE_COLOR}10, #8B5CF620)`,
            border: `1px solid ${ORACLE_COLOR}30`, borderRadius: 'var(--p-radius-xl)',
            padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 9, color: ORACLE_COLOR, fontWeight: 700, marginBottom: 4, fontFamily: 'var(--p-font-mono)', letterSpacing: 1 }}>
              {t('RECOMMANDATION ORACLE', 'ORACLE RECOMMENDATION')}
            </div>
            <p style={{ fontSize: 11, color: 'var(--p-text)', margin: 0, lineHeight: 1.6 }}>
              {result.recommendation.rationale}
            </p>
            <div style={{ marginTop: 6, fontSize: 9, color: 'var(--p-text-dim)' }}>
              {t('Confiance', 'Confidence')}: {Math.round(result.recommendation.confidence * 100)}% — {t('Simulation, pas diagnostic. Le médecin décide.', 'Simulation, not diagnosis. The physician decides.')}
            </div>
          </div>

          {/* No treatment warning */}
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--p-radius-lg)', padding: 12, marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>
              {t('⚠ Projection SANS traitement', '⚠ Projection WITHOUT treatment')}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {result.noTreatmentProjection.map(tp => (
                <div key={tp.hours} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tp.vpsScore >= 80 ? '#EF4444' : '#F59E0B', fontFamily: 'var(--p-font-mono)' }}>
                    {Math.round(tp.vpsScore)}
                  </div>
                  <div style={{ fontSize: 7, color: 'var(--p-text-dim)' }}>VPS {tp.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario cards */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Picto name="pill" size={14} glow glowColor={ORACLE_COLOR} />
            {t('Scénarios thérapeutiques', 'Therapeutic Scenarios')}
            <span style={{ fontSize: 9, color: 'var(--p-text-dim)', fontWeight: 400 }}>
              — {t('Cliquez pour comparer', 'Click to compare')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {result.scenarios.map(sr => (
              <ScenarioCard
                key={sr.scenario.id}
                result={sr}
                isSelected={selectedScenario === sr.scenario.id}
                onClick={() => setSelectedScenario(selectedScenario === sr.scenario.id ? null : sr.scenario.id)}
                baseVPS={result.baselineVPS}
                t={t}
              />
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 20, padding: 12, background: 'var(--p-bg)', borderRadius: 'var(--p-radius-md)', textAlign: 'center' }}>
            <p style={{ fontSize: 8, color: 'var(--p-text-dim)', margin: 0, lineHeight: 1.6 }}>
              {t(
                'ORACLE est un outil de simulation basé sur des modèles pharmacologiques et la littérature médicale. '
                + 'Les projections ne constituent pas un diagnostic ni une prescription. '
                + 'Le médecin reste seul décisionnaire de la stratégie thérapeutique.',
                'ORACLE is a simulation tool based on pharmacological models and medical literature. '
                + 'Projections do not constitute a diagnosis or prescription. '
                + 'The physician remains the sole decision-maker for therapeutic strategy.'
              )}
            </p>
          </div>
        </>
      )}

      {/* Empty state */}
      {!result && !running && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--p-text-dim)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔮</div>
          <p style={{ fontSize: 13 }}>
            {t(
              'Lancez la simulation pour voir l\'évolution projetée du patient selon différents protocoles thérapeutiques.',
              'Run the simulation to see the patient\'s projected evolution under different therapeutic protocols.'
            )}
          </p>
        </div>
      )}
    </div>
  )
}
