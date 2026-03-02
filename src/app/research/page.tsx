'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'
import { discoveryEngine } from '@/lib/engines/DiscoveryEngine'
import { DEMO_PATIENTS, SEED_SIGNALS } from '@/lib/data/discoveryData'
import { SEED_ARTICLES } from '@/lib/data/literatureData'
import { PARAMETER_META, DISCOVERY_CONFIG } from '@/lib/types/discovery'
import type {
  SignalCard, SignalFilters, SignalSortBy, SignalType, SignalStrength,
  CorrelationMatrix, PatientCluster,
} from '@/lib/types/discovery'
import type { LiteratureArticle, LiteratureAlert, ScanResult } from '@/lib/engines/LiteratureScanner'

/* ══════════════════════════════════════════════════════════════
   RESEARCH DASHBOARD — Discovery Engine Phase B
   Signal Feed · Corrélations · Clusters · Veille scientifique · Roadmap
   ══════════════════════════════════════════════════════════════ */

// ── Design tokens ──
const DISC = '#10B981'
const DISC_DIM = 'rgba(16, 185, 129, 0.12)'
const DISC_GLOW = 'rgba(16, 185, 129, 0.30)'

type Tab = 'signals' | 'correlations' | 'clusters' | 'literature' | 'roadmap'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'signals', label: 'Signal Feed', icon: 'alert' },
  { id: 'correlations', label: 'Corrélations', icon: 'chart' },
  { id: 'clusters', label: 'Clusters', icon: 'dna' },
  { id: 'literature', label: 'Veille scientifique', icon: 'books' },
  { id: 'roadmap', label: 'Roadmap', icon: 'clipboard' },
]

// ── Strength badge colors ──
const STRENGTH_COLORS: Record<SignalStrength, string> = {
  very_strong: '#FF4757',
  strong: '#FFA502',
  moderate: '#6C7CFF',
  weak: '#8E8EA3',
}

const STRENGTH_LABELS: Record<SignalStrength, string> = {
  very_strong: 'TRÈS FORT',
  strong: 'FORT',
  moderate: 'MODÉRÉ',
  weak: 'FAIBLE',
}

const TYPE_LABELS: Record<SignalType, string> = {
  correlation: 'Corrélation',
  temporal_pattern: 'Pattern temporel',
  cluster: 'Cluster',
  anomaly: 'Anomalie',
  treatment_response: 'Réponse traitement',
  biomarker_predictor: 'Biomarqueur prédictif',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'NOUVEAU', color: '#3B82F6' },
  confirmed: { label: 'CONFIRMÉ', color: '#2ED573' },
  monitoring: { label: 'SURVEILLANCE', color: '#FFA502' },
  archived: { label: 'ARCHIVÉ', color: '#8E8EA3' },
  rejected: { label: 'REJETÉ', color: '#FF4757' },
}

export default function ResearchPage() {
  const [tab, setTab] = useState<Tab>('signals')
  const [filters, setFilters] = useState<SignalFilters>({ type: 'all', strength: 'all', status: 'all', search: '' })
  const [sortBy, setSortBy] = useState<SignalSortBy>('strength')
  const [selectedSignal, setSelectedSignal] = useState<SignalCard | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Run Discovery Engine on demo data
  const discoveryResult = useMemo(() => {
    return discoveryEngine.run(DEMO_PATIENTS, SEED_ARTICLES)
  }, [])

  // Merge seed signals with mined signals (seed first for showcase)
  const allSignals = useMemo(() => {
    const mined = discoveryResult.signals
    const seedIds = new Set(SEED_SIGNALS.map(s => s.id))
    const unique = [...SEED_SIGNALS, ...mined.filter(s => !seedIds.has(s.id))]
    return unique
  }, [discoveryResult])

  // Apply filters & sort
  const filteredSignals = useMemo(() => {
    let result = [...allSignals]

    if (filters.type && filters.type !== 'all') {
      result = result.filter(s => s.type === filters.type)
    }
    if (filters.strength && filters.strength !== 'all') {
      result = result.filter(s => s.strength === filters.strength)
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    const strengthOrder: Record<string, number> = { very_strong: 4, strong: 3, moderate: 2, weak: 1 }
    switch (sortBy) {
      case 'strength':
        result.sort((a, b) => (strengthOrder[b.strength] || 0) - (strengthOrder[a.strength] || 0))
        break
      case 'date':
        result.sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
        break
      case 'patients':
        result.sort((a, b) => b.patients.count - a.patients.count)
        break
      case 'correlation':
        result.sort((a, b) => Math.abs(b.statistics.correlation || 0) - Math.abs(a.statistics.correlation || 0))
        break
    }

    return result
  }, [allSignals, filters, sortBy])

  const summary = discoveryResult.summary
  const litStats = discoveryResult.literature.stats
  const status = discoveryEngine.getStatus()

  // ── Helpers ──
  const glass = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: 'var(--p-bg-card)',
    border: '1px solid var(--p-border)',
    borderRadius: 'var(--p-radius-xl)',
    ...extra,
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)' }}>

      {/* ══ TOP BAR ══ */}
      <div style={{
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/patients" style={{
            display: 'flex', alignItems: 'center', padding: '6px',
            borderRadius: 'var(--p-radius-md)', color: 'var(--p-text-dim)',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '16px' }}>←</span>
          </Link>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--p-radius-lg)',
            background: DISC_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${DISC_GLOW}`,
          }}>
            <Picto name="microscope" size={18} glow glowColor={DISC_GLOW} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--p-text)', margin: 0, lineHeight: 1.2 }}>
              Discovery Engine
            </h1>
            <span style={{
              fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)',
              letterSpacing: '1px',
            }}>
              PHASE B · PATTERN MINING + VEILLE · {summary.patientsAnalyzed} PATIENTS · {litStats.articlesScanned} PUBLICATIONS
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: DISC_DIM, border: `1px solid ${DISC}30`,
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700, color: DISC,
          }}>
            {summary.totalSignals} signaux
          </div>
          <div style={{
            padding: '4px 12px', borderRadius: 'var(--p-radius-full)',
            background: summary.strongSignals > 0 ? 'rgba(255,71,87,0.08)' : 'rgba(108,124,255,0.06)',
            border: `1px solid ${summary.strongSignals > 0 ? 'rgba(255,71,87,0.15)' : 'rgba(108,124,255,0.1)'}`,
            fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
            color: summary.strongSignals > 0 ? '#FF4757' : 'var(--p-text-dim)',
          }}>
            {summary.strongSignals} fort{summary.strongSignals !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div style={{
        display: 'flex', gap: '2px', padding: '0 24px',
        borderBottom: '1px solid var(--p-border)', background: 'var(--p-bg)',
        overflowX: 'auto',
      }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '10px 16px', background: active ? `${DISC}08` : 'transparent',
              border: 'none', borderBottom: active ? `2px solid ${DISC}` : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'var(--p-font-mono)', fontSize: '10px',
              fontWeight: active ? 800 : 600, color: active ? DISC : 'var(--p-text-dim)',
              letterSpacing: '0.3px', whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}>
              <Picto name={t.icon} size={14} glow={active} glowColor={active ? DISC_GLOW : undefined} />
              {t.label}
              {t.id === 'signals' && (
                <span style={{
                  marginLeft: '4px', padding: '1px 6px', borderRadius: 'var(--p-radius-full)',
                  background: DISC_DIM, fontSize: '9px', fontWeight: 800, color: DISC,
                }}>{filteredSignals.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── KPI strip ── */}
        <div className="page-enter-stagger" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '10px', marginBottom: '20px',
        }}>
          {[
            { label: 'Signaux total', value: summary.totalSignals, color: DISC },
            { label: 'Nouveaux', value: summary.newSignals, color: '#3B82F6' },
            { label: 'Signaux forts', value: summary.strongSignals, color: '#FF4757' },
            { label: 'Patients', value: summary.patientsAnalyzed, color: '#6C7CFF' },
            { label: 'Publications', value: litStats.articlesScanned, color: '#B96BFF' },
            { label: 'Confirmations', value: litStats.confirmations, color: '#2ED573' },
            { label: 'Contradictions', value: litStats.contradictions, color: '#FFA502' },
            { label: 'Essais cliniques', value: litStats.clinicalTrials, color: '#2FD1C8' },
          ].map((kpi, i) => (
            <div key={i} style={{
              ...glass({ padding: '14px', borderTop: `3px solid ${kpi.color}`, textAlign: 'center' }),
            }}>
              <div style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '24px', fontWeight: 900,
                color: kpi.color, lineHeight: 1,
              }}>{kpi.value}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--p-text-muted)', marginTop: '4px' }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════ SIGNAL FEED ════════════════════ */}
        {tab === 'signals' && (
          <div className="page-enter-stagger">
            {/* Filters bar */}
            <div style={{
              ...glass({ padding: '12px 16px', marginBottom: '16px' }),
              display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
            }}>
              <input
                type="text" placeholder="Rechercher un signal..."
                value={filters.search || ''}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                style={{
                  flex: '1 1 200px', padding: '6px 12px',
                  background: 'var(--p-bg)', border: '1px solid var(--p-border)',
                  borderRadius: 'var(--p-radius-md)', color: 'var(--p-text)',
                  fontFamily: 'var(--p-font-mono)', fontSize: '11px', outline: 'none',
                }}
              />
              {/* Type filter */}
              <select
                value={filters.type || 'all'}
                onChange={e => setFilters(f => ({ ...f, type: e.target.value as any }))}
                style={selectStyle()}
              >
                <option value="all">Tous types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {/* Strength filter */}
              <select
                value={filters.strength || 'all'}
                onChange={e => setFilters(f => ({ ...f, strength: e.target.value as any }))}
                style={selectStyle()}
              >
                <option value="all">Toutes forces</option>
                {Object.entries(STRENGTH_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SignalSortBy)}
                style={selectStyle()}
              >
                <option value="strength">Tri : Force</option>
                <option value="date">Tri : Date</option>
                <option value="patients">Tri : Patients</option>
                <option value="correlation">Tri : Corrélation</option>
              </select>
            </div>

            {/* Signal cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredSignals.map(signal => (
                <SignalCardView
                  key={signal.id}
                  signal={signal}
                  expanded={selectedSignal?.id === signal.id}
                  onToggle={() => setSelectedSignal(
                    selectedSignal?.id === signal.id ? null : signal
                  )}
                />
              ))}
              {filteredSignals.length === 0 && (
                <div style={{
                  ...glass({ padding: '40px', textAlign: 'center' }),
                }}>
                  <div style={{ fontSize: '14px', color: 'var(--p-text-muted)' }}>Aucun signal ne correspond aux filtres</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ CORRELATIONS ════════════════════ */}
        {tab === 'correlations' && (
          <div className="page-enter-stagger">
            <CorrelationMatrixView matrix={discoveryResult.correlationMatrix} />
          </div>
        )}

        {/* ════════════════════ CLUSTERS ════════════════════ */}
        {tab === 'clusters' && (
          <div className="page-enter-stagger">
            <ClustersView clusters={discoveryResult.clusters} patients={DEMO_PATIENTS} />
          </div>
        )}

        {/* ════════════════════ LITERATURE ════════════════════ */}
        {tab === 'literature' && (
          <div className="page-enter-stagger">
            <LiteratureView
              scanResult={discoveryResult.literature}
              articles={SEED_ARTICLES}
            />
          </div>
        )}

        {/* ════════════════════ ROADMAP ════════════════════ */}
        {tab === 'roadmap' && (
          <div className="page-enter-stagger">
            <RoadmapView />
          </div>
        )}

        {/* ── Disclaimer footer ── */}
        <div style={{
          textAlign: 'center', padding: '24px', color: 'var(--p-text-dim)',
          fontSize: '10px', fontFamily: 'var(--p-font-mono)',
          borderTop: '1px solid var(--p-border)', marginTop: '24px',
        }}>
          ⚠ PULSAR Discovery Engine · Phase B · Tous les signaux sont générés par IA et nécessitent validation clinique
          <br />Ne se substitue pas au jugement médical · Données illustratives
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// SIGNAL CARD COMPONENT
// ══════════════════════════════════════════════════════════════

function SignalCardView({ signal, expanded, onToggle }: {
  signal: SignalCard
  expanded: boolean
  onToggle: () => void
}) {
  const strengthColor = STRENGTH_COLORS[signal.strength]
  const statusInfo = STATUS_LABELS[signal.status] || STATUS_LABELS.new

  return (
    <div
      onClick={onToggle}
      style={{
        background: 'var(--p-bg-card)',
        border: `1px solid ${expanded ? strengthColor + '40' : 'var(--p-border)'}`,
        borderLeft: `4px solid ${strengthColor}`,
        borderRadius: 'var(--p-radius-xl)',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.25s var(--p-ease)',
        boxShadow: expanded ? `0 0 20px ${strengthColor}15` : 'none',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            <span style={badgeStyle(strengthColor)}>
              {STRENGTH_LABELS[signal.strength]}
            </span>
            <span style={badgeStyle('#6C7CFF')}>
              {TYPE_LABELS[signal.type] || signal.type}
            </span>
            <span style={badgeStyle(statusInfo.color)}>
              {statusInfo.label}
            </span>
            {signal.statistics.correlation != null && (
              <span style={badgeStyle(signal.statistics.correlation > 0 ? '#2FD1C8' : '#FF6B8A')}>
                r = {signal.statistics.correlation > 0 ? '+' : ''}{signal.statistics.correlation}
              </span>
            )}
          </div>
          {/* Title */}
          <div style={{
            fontSize: '14px', fontWeight: 700, color: 'var(--p-text)',
            lineHeight: 1.4,
          }}>{signal.title}</div>
        </div>
        {/* Patient count badge */}
        <div style={{
          textAlign: 'center', padding: '6px 10px',
          background: 'var(--p-bg)', borderRadius: 'var(--p-radius-lg)',
          border: '1px solid var(--p-border)', flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '16px', fontWeight: 900, color: strengthColor }}>
            {signal.patients.count}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>
            patient{signal.patients.count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Description (always visible, truncated when collapsed) */}
      <div style={{
        fontSize: '12px', color: 'var(--p-text-muted)', marginTop: '8px',
        lineHeight: 1.6,
        ...(expanded ? {} : {
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }),
      }}>{signal.description}</div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          marginTop: '16px', paddingTop: '16px',
          borderTop: '1px solid var(--p-border)',
        }}>
          {/* Statistics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            {signal.statistics.pValue != null && (
              <StatBox label="p-value" value={signal.statistics.pValue < 0.001 ? '<0.001' : String(signal.statistics.pValue)} color={signal.statistics.pValue < 0.05 ? '#2ED573' : '#FF4757'} />
            )}
            {signal.statistics.sampleSize != null && (
              <StatBox label="n patients" value={String(signal.statistics.sampleSize)} color="#6C7CFF" />
            )}
            {signal.statistics.effectSize != null && (
              <StatBox label="Taille effet" value={signal.statistics.effectSize.toFixed(2)} color="#FFB347" />
            )}
          </div>

          {/* Mini scatter chart */}
          {signal.chart && signal.chart.type === 'scatter' && signal.chart.data.length > 0 && (
            <MiniScatter chart={signal.chart} color={strengthColor} />
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
            {signal.tags.map((tag, i) => (
              <span key={i} style={{
                padding: '2px 8px', borderRadius: 'var(--p-radius-full)',
                background: 'var(--p-bg)', border: '1px solid var(--p-border)',
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)',
              }}>{tag}</span>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: '12px', padding: '8px 12px',
            background: 'rgba(255,165,2,0.06)', border: '1px solid rgba(255,165,2,0.12)',
            borderRadius: 'var(--p-radius-md)',
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#FFA502',
          }}>
            ⚠ {signal.disclaimer}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MINI SCATTER CHART (SVG)
// ══════════════════════════════════════════════════════════════

function MiniScatter({ chart, color }: { chart: SignalCard['chart']; color: string }) {
  if (!chart || chart.data.length === 0) return null
  const W = 400, H = 180, PAD = 40

  const xs = chart.data.map(d => d.x)
  const ys = chart.data.map(d => d.y)
  const xMin = Math.min(...xs), xMax = Math.max(...xs) || 1
  const yMin = Math.min(...ys), yMax = Math.max(...ys) || 1

  const scaleX = (v: number) => PAD + ((v - xMin) / (xMax - xMin)) * (W - PAD * 2)
  const scaleY = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - PAD * 2)

  return (
    <div style={{
      background: 'var(--p-bg)', borderRadius: 'var(--p-radius-lg)',
      border: '1px solid var(--p-border)', padding: '12px', overflow: 'hidden',
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => (
          <line key={frac}
            x1={PAD} y1={H - PAD - frac * (H - PAD * 2)}
            x2={W - PAD} y2={H - PAD - frac * (H - PAD * 2)}
            stroke="var(--p-border)" strokeWidth={0.5} strokeDasharray="4 4"
          />
        ))}
        {/* Axis labels */}
        <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--p-text-dim)" fontSize={9} fontFamily="var(--p-font-mono)">{chart.xLabel}</text>
        <text x={8} y={H / 2} textAnchor="middle" fill="var(--p-text-dim)" fontSize={9} fontFamily="var(--p-font-mono)" transform={`rotate(-90, 8, ${H / 2})`}>{chart.yLabel}</text>
        {/* Points */}
        {chart.data.map((d, i) => (
          <g key={i}>
            <circle cx={scaleX(d.x)} cy={scaleY(d.y)} r={5} fill={color} opacity={0.8} />
            <circle cx={scaleX(d.x)} cy={scaleY(d.y)} r={5} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
            {d.label && (
              <text
                x={scaleX(d.x) + 8} y={scaleY(d.y) + 3}
                fill="var(--p-text-dim)" fontSize={8} fontFamily="var(--p-font-mono)"
              >{d.label}</text>
            )}
          </g>
        ))}
        {/* Trend line (simple regression) */}
        {chart.data.length >= 3 && (() => {
          const n = chart.data.length
          const sumX = xs.reduce((a, b) => a + b, 0)
          const sumY = ys.reduce((a, b) => a + b, 0)
          const sumXY = chart.data.reduce((a, d) => a + d.x * d.y, 0)
          const sumX2 = xs.reduce((a, b) => a + b * b, 0)
          const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1)
          const intercept = (sumY - slope * sumX) / n
          const y1 = slope * xMin + intercept
          const y2 = slope * xMax + intercept
          return (
            <line
              x1={scaleX(xMin)} y1={scaleY(y1)}
              x2={scaleX(xMax)} y2={scaleY(y2)}
              stroke={color} strokeWidth={1.5} strokeDasharray="6 3" opacity={0.5}
            />
          )
        })()}
      </svg>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CORRELATION MATRIX VIEW
// ══════════════════════════════════════════════════════════════

function CorrelationMatrixView({ matrix }: { matrix: CorrelationMatrix }) {
  const params = matrix.parameters
  const n = params.length
  const CELL = 28

  return (
    <div>
      <h2 style={{
        fontSize: '15px', fontWeight: 800, color: 'var(--p-text)',
        marginBottom: '4px',
      }}>Matrice de corrélation</h2>
      <p style={{
        fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: '16px',
      }}>
        {matrix.significantPairs.length} paire{matrix.significantPairs.length !== 1 ? 's' : ''} significative{matrix.significantPairs.length !== 1 ? 's' : ''} (p &lt; 0.05, |r| ≥ {DISCOVERY_CONFIG.CORRELATION_THRESHOLD})
      </p>

      {/* Matrix heatmap */}
      <div style={{
        background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
        borderRadius: 'var(--p-radius-xl)', padding: '16px', overflowX: 'auto',
      }}>
        <svg
          viewBox={`0 0 ${(n + 1) * CELL + 80} ${(n + 1) * CELL + 20}`}
          style={{ width: '100%', maxWidth: `${(n + 1) * CELL + 80}px`, height: 'auto' }}
        >
          {/* Column headers */}
          {params.map((p, i) => {
            const meta = PARAMETER_META[p]
            return (
              <text key={`col-${i}`}
                x={80 + i * CELL + CELL / 2} y={14}
                textAnchor="middle" fill={meta?.color || 'var(--p-text-dim)'}
                fontSize={7} fontFamily="var(--p-font-mono)" fontWeight={600}
              >{meta?.label || p}</text>
            )
          })}
          {/* Rows */}
          {params.map((pRow, i) => {
            const meta = PARAMETER_META[pRow]
            return (
              <g key={`row-${i}`}>
                {/* Row label */}
                <text
                  x={76} y={20 + i * CELL + CELL / 2 + 3}
                  textAnchor="end" fill={meta?.color || 'var(--p-text-dim)'}
                  fontSize={7} fontFamily="var(--p-font-mono)" fontWeight={600}
                >{meta?.label || pRow}</text>
                {/* Cells */}
                {params.map((pCol, j) => {
                  const val = matrix.matrix[i]?.[j] || 0
                  const abs = Math.abs(val)
                  const hue = val > 0 ? '160' : '350' // green for positive, red for negative
                  const sat = abs > 0.3 ? '70%' : '30%'
                  const light = `${50 - abs * 30}%`
                  const alpha = abs < 0.2 ? 0.1 : abs * 0.8

                  return (
                    <g key={`cell-${i}-${j}`}>
                      <rect
                        x={80 + j * CELL} y={20 + i * CELL}
                        width={CELL - 2} height={CELL - 2}
                        rx={3}
                        fill={i === j ? 'var(--p-bg-elevated)' : `hsla(${hue}, ${sat}, ${light}, ${alpha})`}
                        stroke={abs >= DISCOVERY_CONFIG.CORRELATION_THRESHOLD && i !== j ? `hsla(${hue}, 80%, 50%, 0.6)` : 'transparent'}
                        strokeWidth={1}
                      />
                      {abs >= 0.3 && i !== j && (
                        <text
                          x={80 + j * CELL + (CELL - 2) / 2}
                          y={20 + i * CELL + (CELL - 2) / 2 + 3}
                          textAnchor="middle" fill="var(--p-text)"
                          fontSize={6} fontFamily="var(--p-font-mono)" fontWeight={700}
                        >{val.toFixed(1)}</text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Significant pairs list */}
      <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)', marginTop: '20px', marginBottom: '10px' }}>
        Paires significatives
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {matrix.significantPairs.slice(0, 10).map((pair, i) => {
          const metaA = PARAMETER_META[pair.paramA]
          const metaB = PARAMETER_META[pair.paramB]
          const color = pair.coefficient > 0 ? '#2ED573' : '#FF4757'
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
              borderRadius: 'var(--p-radius-md)', padding: '8px 14px',
            }}>
              <div style={{
                fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 900,
                color, minWidth: '56px', textAlign: 'center',
              }}>
                {pair.coefficient > 0 ? '+' : ''}{pair.coefficient}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--p-text)' }}>
                  {metaA?.label || pair.paramA} ↔ {metaB?.label || pair.paramB}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--p-text-dim)', marginLeft: '8px', fontFamily: 'var(--p-font-mono)' }}>
                  n={pair.sampleSize} · p={pair.pValue < 0.001 ? '<.001' : pair.pValue.toFixed(3)}
                </span>
              </div>
              <span style={badgeStyle(color, '8px')}>
                {strengthFromR(Math.abs(pair.coefficient))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CLUSTERS VIEW
// ══════════════════════════════════════════════════════════════

function ClustersView({ clusters, patients }: { clusters: PatientCluster[]; patients: any[] }) {
  const clusterColors = ['#6C7CFF', '#2FD1C8', '#FF6B8A', '#FFB347', '#B96BFF']

  return (
    <div>
      <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '4px' }}>
        Clustering patients (k-means, k=3)
      </h2>
      <p style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: '16px' }}>
        Regroupement non supervisé basé sur CRP, GCS, VPS, Crises/24h et Température
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {clusters.map((cluster, ci) => {
          const color = clusterColors[ci % clusterColors.length]
          return (
            <div key={cluster.id} style={{
              background: 'var(--p-bg-card)', border: `1px solid ${color}25`,
              borderTop: `3px solid ${color}`, borderRadius: 'var(--p-radius-xl)',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color }}>
                  {cluster.label}
                </div>
                <span style={{
                  padding: '2px 10px', borderRadius: 'var(--p-radius-full)',
                  background: `${color}12`, fontFamily: 'var(--p-font-mono)',
                  fontSize: '10px', fontWeight: 700, color,
                }}>{cluster.size} patients</span>
              </div>

              {/* Distinctive features */}
              {cluster.distinctiveFeatures.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginBottom: '4px' }}>
                    TRAITS DISTINCTIFS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {cluster.distinctiveFeatures.map((feat, fi) => (
                      <span key={fi} style={badgeStyle(color, '8px')}>{feat}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Centroid values */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px',
                marginTop: '10px',
              }}>
                {Object.entries(cluster.centroid).map(([key, val]) => {
                  const meta = PARAMETER_META[key]
                  return (
                    <div key={key} style={{
                      textAlign: 'center', padding: '6px',
                      background: 'var(--p-bg)', borderRadius: 'var(--p-radius-md)',
                    }}>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color }}>
                        {typeof val === 'number' ? val.toFixed(1) : val}
                      </div>
                      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>
                        {meta?.label || key}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Patient list */}
              <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--p-text-dim)', fontFamily: 'var(--p-font-mono)' }}>
                {patients
                  .filter(p => cluster.patientIds.includes(p.id))
                  .map(p => p.display_name)
                  .join(' · ')}
              </div>
            </div>
          )
        })}
        {clusters.length === 0 && (
          <div style={{
            background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
            borderRadius: 'var(--p-radius-xl)', padding: '40px', textAlign: 'center',
            gridColumn: '1 / -1',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--p-text-muted)' }}>
              Pas assez de données pour le clustering (minimum {DISCOVERY_CONFIG.MIN_SAMPLE_SIZE * 2} patients requis)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ROADMAP VIEW
// ══════════════════════════════════════════════════════════════

function RoadmapView() {
  const roadmap = discoveryEngine.getRoadmap()
  const phaseColors: Record<string, string> = { A: DISC, B: '#6C7CFF', C: '#B96BFF', D: '#FFB347' }

  return (
    <div>
      <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '4px' }}>
        Roadmap Discovery Engine
      </h2>
      <p style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: '20px' }}>
        4 phases d'implémentation · Phase A active
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {roadmap.map((item, i) => {
          const color = phaseColors[item.phase] || '#8E8EA3'
          const active = item.phase === 'A'
          return (
            <div key={i} style={{
              background: 'var(--p-bg-card)',
              border: `1px solid ${active ? color + '40' : 'var(--p-border)'}`,
              borderLeft: `4px solid ${color}`,
              borderRadius: 'var(--p-radius-xl)',
              padding: '20px',
              opacity: active ? 1 : 0.7,
              boxShadow: active ? `0 0 24px ${color}10` : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 'var(--p-radius-md)',
                    background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 900, color,
                  }}>
                    {item.phase}
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--p-text)' }}>
                    {item.level}
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
                  background: active ? `${color}15` : 'var(--p-bg)',
                  fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                  color: active ? color : 'var(--p-text-dim)',
                  border: `1px solid ${active ? color + '30' : 'var(--p-border)'}`,
                }}>
                  {item.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--p-text-muted)', lineHeight: 1.6 }}>
                {item.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LITERATURE VIEW
// ══════════════════════════════════════════════════════════════

function LiteratureView({ scanResult, articles }: { scanResult: ScanResult; articles: LiteratureArticle[] }) {
  const [litFilter, setLitFilter] = useState<'all' | 'high' | 'medium' | 'trials'>('all')
  const [alertExpanded, setAlertExpanded] = useState<string | null>(null)

  const filteredArticles = useMemo(() => {
    let result = [...(scanResult.articles.length > 0 ? scanResult.articles : articles)]
    switch (litFilter) {
      case 'high': result = result.filter(a => a.relevance === 'high'); break
      case 'medium': result = result.filter(a => a.relevance === 'medium' || a.relevance === 'high'); break
      case 'trials': result = result.filter(a => a.isClinicalTrial); break
    }
    result.sort((a, b) => b.relevanceScore - a.relevanceScore)
    return result
  }, [scanResult, articles, litFilter])

  const ALERT_COLORS: Record<string, string> = {
    contradiction: '#FFA502',
    confirmation: '#2ED573',
    opportunity: '#3B82F6',
    update: '#8E8EA3',
  }
  const ALERT_ICONS: Record<string, string> = {
    contradiction: '⚠',
    confirmation: '✓',
    opportunity: '🔬',
    update: '↻',
  }

  return (
    <div>
      {/* ── Alerts section ── */}
      {scanResult.alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '10px' }}>
            Alertes veille ({scanResult.alerts.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scanResult.alerts.map(alert => {
              const color = ALERT_COLORS[alert.type] || '#8E8EA3'
              const expanded = alertExpanded === alert.id
              return (
                <div key={alert.id}
                  onClick={() => setAlertExpanded(expanded ? null : alert.id)}
                  style={{
                    background: 'var(--p-bg-card)', borderLeft: `4px solid ${color}`,
                    border: `1px solid ${expanded ? color + '40' : 'var(--p-border)'}`,
                    borderLeftWidth: '4px', borderLeftColor: color,
                    borderRadius: 'var(--p-radius-lg)', padding: '12px 16px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{ALERT_ICONS[alert.type]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={badgeStyle(color)}>{alert.type.toUpperCase()}</span>
                        {alert.severity === 'critical' && <span style={badgeStyle('#FF4757')}>CRITIQUE</span>}
                        {alert.protocolImpact && <span style={badgeStyle('#FFB347')}>TDE {alert.protocolImpact}</span>}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p-text)', marginTop: '4px' }}>
                        {alert.title}
                      </div>
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--p-border)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--p-text-muted)', lineHeight: 1.6, marginBottom: '10px' }}>
                        {alert.description}
                      </div>
                      <div style={{
                        padding: '8px 12px', background: `${color}08`, borderRadius: 'var(--p-radius-md)',
                        border: `1px solid ${color}15`,
                        fontFamily: 'var(--p-font-mono)', fontSize: '10px', color,
                      }}>
                        Action requise : {alert.actionRequired}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>
          Bibliothèque ({filteredArticles.length} publications)
        </h2>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'high', label: 'Haute pertinence' },
            { id: 'medium', label: 'Moy. & haute' },
            { id: 'trials', label: 'Essais cliniques' },
          ].map(f => (
            <button key={f.id}
              onClick={() => setLitFilter(f.id as any)}
              style={{
                padding: '4px 10px', borderRadius: 'var(--p-radius-full)',
                background: litFilter === f.id ? `${DISC}15` : 'var(--p-bg)',
                border: `1px solid ${litFilter === f.id ? DISC + '40' : 'var(--p-border)'}`,
                fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                color: litFilter === f.id ? DISC : 'var(--p-text-dim)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* ── Articles list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredArticles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* ── PubMed queries info ── */}
      <div style={{
        marginTop: '20px', background: 'var(--p-bg-card)',
        border: '1px solid var(--p-border)', borderRadius: 'var(--p-radius-xl)',
        padding: '16px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)', marginBottom: '8px' }}>
          Requêtes PubMed configurées
        </div>
        <div style={{ fontSize: '11px', color: 'var(--p-text-dim)', marginBottom: '10px' }}>
          En production, ces requêtes interrogeront automatiquement PubMed E-utilities pour détecter de nouvelles publications.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {discoveryEngine.getLiteratureScanner().getQueries().map((q, i) => (
            <span key={i} style={{
              padding: '3px 10px', borderRadius: 'var(--p-radius-full)',
              background: q.priority === 1 ? '#FF475710' : q.priority === 2 ? '#6C7CFF10' : 'var(--p-bg)',
              border: `1px solid ${q.priority === 1 ? '#FF475720' : q.priority === 2 ? '#6C7CFF20' : 'var(--p-border)'}`,
              fontFamily: 'var(--p-font-mono)', fontSize: '9px',
              color: q.priority === 1 ? '#FF4757' : q.priority === 2 ? '#6C7CFF' : 'var(--p-text-dim)',
            }}>
              P{q.priority} · {q.topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ARTICLE CARD
// ══════════════════════════════════════════════════════════════

function ArticleCard({ article }: { article: LiteratureArticle }) {
  const [open, setOpen] = useState(false)

  const relColor = article.relevance === 'high' ? '#2ED573' :
    article.relevance === 'medium' ? '#FFB347' : '#8E8EA3'

  const actionColor = article.action === 'confirms' ? '#2ED573' :
    article.action === 'contradicts' ? '#FF4757' :
    article.action === 'extends' ? '#3B82F6' : '#8E8EA3'

  const actionLabel = article.action === 'confirms' ? 'CONFIRME' :
    article.action === 'contradicts' ? 'CONTREDIT' :
    article.action === 'extends' ? 'ÉTEND' : 'NEUTRE'

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: 'var(--p-bg-card)', border: '1px solid var(--p-border)',
        borderRadius: 'var(--p-radius-lg)', padding: '12px 16px',
        cursor: 'pointer', transition: 'all 0.2s',
        borderLeft: `3px solid ${relColor}`,
      }}
    >
      {/* Top line: badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
        <span style={badgeStyle(relColor)}>
          {(article.relevanceScore * 100).toFixed(0)}% pertinent
        </span>
        <span style={badgeStyle(actionColor)}>{actionLabel}</span>
        {article.isClinicalTrial && (
          <span style={badgeStyle('#2FD1C8')}>ESSAI · {article.trialPhase}</span>
        )}
        {article.source !== 'seed' && (
          <span style={badgeStyle('#8E8EA3')}>{article.source.toUpperCase()}</span>
        )}
        <span style={badgeStyle('#8E8EA3')}>{article.year}</span>
      </div>

      {/* Title */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p-text)', lineHeight: 1.4 }}>
        {article.title}
      </div>

      {/* Authors & journal */}
      <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '4px', fontFamily: 'var(--p-font-mono)' }}>
        {article.authors} · <span style={{ color: '#B96BFF' }}>{article.journal}</span>
        {article.pmid && <span> · PMID:{article.pmid}</span>}
        {article.trialId && <span> · {article.trialId}</span>}
      </div>

      {/* Expanded: abstract + matched keywords */}
      {open && article.abstract && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--p-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', lineHeight: 1.6 }}>
            {article.abstract}
          </div>
          {article.matchedKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginRight: '4px' }}>MATCHED:</span>
              {article.matchedKeywords.map((kw, i) => (
                <span key={i} style={{
                  padding: '1px 6px', borderRadius: 'var(--p-radius-full)',
                  background: `${DISC}10`, border: `1px solid ${DISC}20`,
                  fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: DISC,
                }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// UTILITY COMPONENTS & HELPERS
// ══════════════════════════════════════════════════════════════

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'var(--p-bg)', borderRadius: 'var(--p-radius-md)',
      padding: '8px', textAlign: 'center', border: '1px solid var(--p-border)',
    }}>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '14px', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

function badgeStyle(color: string, fontSize: string = '9px'): React.CSSProperties {
  return {
    padding: '2px 8px',
    borderRadius: 'var(--p-radius-full)',
    background: `${color}12`,
    border: `1px solid ${color}25`,
    fontFamily: 'var(--p-font-mono)',
    fontSize,
    fontWeight: 700,
    color,
    letterSpacing: '0.3px',
  }
}

function selectStyle(): React.CSSProperties {
  return {
    padding: '6px 10px', background: 'var(--p-bg)', border: '1px solid var(--p-border)',
    borderRadius: 'var(--p-radius-md)', color: 'var(--p-text)',
    fontFamily: 'var(--p-font-mono)', fontSize: '10px', cursor: 'pointer', outline: 'none',
  }
}

function strengthFromR(absR: number): string {
  if (absR >= 0.85) return 'TRÈS FORT'
  if (absR >= 0.7) return 'FORT'
  if (absR >= 0.4) return 'MODÉRÉ'
  return 'FAIBLE'
}
