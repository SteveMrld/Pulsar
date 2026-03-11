'use client'
import { useState, useCallback } from 'react'
import { PatientState } from '@/lib/engines/PatientState'
import { runPipeline } from '@/lib/engines/pipeline'
import { CLINICAL_CASES } from '@/lib/engines/clinicalTests'

interface CheckResult {
  engine: string
  desc: string
  passed: boolean
}

interface CaseResult {
  id: string
  label: string
  passed: number
  total: number
  checks: CheckResult[]
  vps: number
  tde: number
  durationMs: number
  expanded: boolean
}

export default function RegressionBot() {
  const [results, setResults] = useState<CaseResult[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)

  const runAll = useCallback(async () => {
    setRunning(true)
    setResults([])
    setProgress(0)

    const out: CaseResult[] = []

    for (let i = 0; i < CLINICAL_CASES.length; i++) {
      const c = CLINICAL_CASES[i]
      await new Promise(r => setTimeout(r, 80)) // petit délai pour l'animation

      const t0 = performance.now()
      const ps = new PatientState(c.data)
      runPipeline(ps)
      const dur = Math.round(performance.now() - t0)

      const checkResults: CheckResult[] = c.checks.map(ch => ({
        engine: ch.engine,
        desc: ch.desc,
        passed: (() => { try { return ch.test(ps) } catch { return false } })()
      }))

      const passed = checkResults.filter(r => r.passed).length

      out.push({
        id: c.id,
        label: c.label,
        passed,
        total: checkResults.length,
        checks: checkResults,
        vps: ps.vpsResult?.synthesis.score ?? 0,
        tde: ps.tdeResult?.synthesis.score ?? 0,
        durationMs: dur,
        expanded: false,
      })

      setResults([...out])
      setProgress(Math.round(((i + 1) / CLINICAL_CASES.length) * 100))
    }

    setRunning(false)
  }, [])

  const totalPassed = results.reduce((s, r) => s + r.passed, 0)
  const totalChecks = results.reduce((s, r) => s + r.total, 0)
  const allCases = results.length
  const perfectCases = results.filter(r => r.passed === r.total).length
  const globalScore = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0

  const scoreColor = globalScore >= 90 ? '#10B981' : globalScore >= 70 ? '#FFB347' : '#EF4444'

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-text)' }}>🤖 Bot de Régression Clinique</div>
          <div style={{ fontSize: '12px', color: 'var(--p-text-muted)', marginTop: '4px' }}>
            {CLINICAL_CASES.length} profils · {CLINICAL_CASES.reduce((s, c) => s + c.checks.length, 0)} assertions · Pipeline VPS + TDE + PVE + EWE
          </div>
        </div>
        <button
          onClick={runAll}
          disabled={running}
          style={{
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            background: running ? 'rgba(16,185,129,0.2)' : '#10B981',
            color: running ? '#10B981' : '#000',
            fontWeight: 800, fontSize: '13px', cursor: running ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--p-font-mono)', letterSpacing: '1px',
          }}
        >
          {running ? `ANALYSE... ${progress}%` : '▶ LANCER LES TESTS'}
        </button>
      </div>

      {/* Progress bar */}
      {running && (
        <div style={{ height: '4px', background: 'rgba(16,185,129,0.15)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#10B981', transition: 'width 0.3s', borderRadius: '2px' }} />
        </div>
      )}

      {/* Score global */}
      {results.length > 0 && !running && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px'
        }}>
          {[
            { label: 'SCORE GLOBAL', value: `${globalScore}%`, color: scoreColor },
            { label: 'CAS RÉUSSIS', value: `${perfectCases}/${allCases}`, color: perfectCases === allCases ? '#10B981' : '#FFB347' },
            { label: 'ASSERTIONS OK', value: `${totalPassed}/${totalChecks}`, color: '#6C7CFF' },
            { label: 'STATUT', value: globalScore >= 90 ? '✓ STABLE' : globalScore >= 70 ? '⚠ DÉGRADÉ' : '✗ RÉGRESSION', color: scoreColor },
          ].map(s => (
            <div key={s.label} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}33` }}>
              <div style={{ fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-muted)', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: s.color, fontFamily: 'var(--p-font-mono)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Résultats par cas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {results.map(r => {
          const rate = Math.round((r.passed / r.total) * 100)
          const color = rate === 100 ? '#10B981' : rate >= 70 ? '#FFB347' : '#EF4444'
          const isExpanded = expanded === r.id

          return (
            <div key={r.id} style={{ borderRadius: '12px', border: `1px solid ${color}33`, overflow: 'hidden' }}>
              {/* Row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : r.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 16px', cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                }}
              >
                {/* Status icon */}
                <div style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>
                  {rate === 100 ? '✅' : rate >= 70 ? '⚠️' : '❌'}
                </div>

                {/* Label */}
                <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--p-text)' }}>{r.label}</div>

                {/* Scores */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: '#8B5CF6' }}>VPS {r.vps}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: '#6C7CFF' }}>TDE {r.tde}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-muted)' }}>{r.durationMs}ms</span>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--p-font-mono)', color, minWidth: '50px' }}>{r.passed}/{r.total}</span>
                </div>

                <div style={{ color: 'var(--p-text-muted)', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {/* Detail checks */}
              {isExpanded && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {r.checks.map((ch, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '8px 12px', borderRadius: '8px',
                      background: ch.passed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    }}>
                      <span style={{ fontSize: '14px' }}>{ch.passed ? '✓' : '✗'}</span>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: '#6C7CFF', minWidth: '40px' }}>{ch.engine}</span>
                      <span style={{ fontSize: '12px', color: ch.passed ? '#10B981' : '#EF4444' }}>{ch.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {results.length === 0 && !running && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--p-text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
          <div style={{ fontSize: '14px' }}>Lance les tests pour mesurer la qualité des moteurs</div>
        </div>
      )}
    </div>
  )
}
