'use client'
import { useState, useEffect } from 'react'
import { usePatient } from '@/contexts/PatientContext'
import { historyService, type HistoryEvent } from '@/lib/services/historyService'
import Picto from '@/components/Picto'

/* ══════════════════════════════════════════════════════════════
   HISTORIQUE — Timeline · Courbes d'évolution · Dossier complet
   ══════════════════════════════════════════════════════════════ */

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  admission:  { icon: 'transfer', color: '#6C7CFF', label: 'Admission' },
  vitals:     { icon: 'heart',    color: '#FF6B8A', label: 'Constantes' },
  lab:        { icon: 'blood',    color: '#B96BFF', label: 'Biologie' },
  medication: { icon: 'pill',     color: '#2FD1C8', label: 'Médicament' },
  treatment:  { icon: 'pill',     color: '#2FD1C8', label: 'Traitement' },
  engine:     { icon: 'brain',    color: '#FFB347', label: 'Moteur IA' },
  alert:      { icon: 'alert',    color: '#FF4757', label: 'Alerte' },
  exam:       { icon: 'microscope', color: '#B96BFF', label: 'Examen' },
  note:       { icon: 'note',     color: '#6C7CFF', label: 'Note' },
  discharge:  { icon: 'transfer', color: '#2ED573', label: 'Sortie' },
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF4757', warning: '#FFB347', info: 'var(--p-text-dim)', success: '#2ED573',
}

const CATEGORY_LABELS: Record<string, string> = {
  clinical: 'Clinique', diagnostic: 'Diagnostic', therapeutic: 'Thérapeutique', system: 'Système',
}

// ── Mini bar chart for score evolution ──
function ScoreChart({ points, color, label, maxScore = 100 }: {
  points: { score: number; day: number }[]; color: string; label: string; maxScore?: number
}) {
  if (points.length === 0) return null
  const latest = points[points.length - 1]
  const prev = points.length > 1 ? points[points.length - 2] : null
  const trend = prev ? latest.score - prev.score : 0

  return (
    <div className="glass-card" style={{ padding: '14px', borderRadius: 'var(--p-radius-xl)', flex: '1 1 200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color, letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '18px', fontWeight: 900, color }}>
            {latest.score}
          </span>
          {trend !== 0 && (
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: trend > 0 ? '#FF4757' : '#2ED573' }}>
              {trend > 0 ? '▲' : '▼'}{Math.abs(trend)}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '50px' }}>
        {points.slice(-12).map((p, i) => {
          const h = Math.max(3, (p.score / maxScore) * 46)
          const isLast = i === Math.min(points.length, 12) - 1
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{
                width: '100%', maxWidth: '16px', height: `${h}px`,
                background: isLast ? color : `${color}40`,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.5s ease',
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>
          J{points[Math.max(0, points.length - 12)].day}
        </span>
        <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', color: 'var(--p-text-dim)' }}>
          J{latest.day}
        </span>
      </div>
    </div>
  )
}

// ── GCS evolution chart ──
function GcsChart({ points }: { points: { gcs: number; day: number }[] }) {
  if (points.length === 0) return null
  return (
    <ScoreChart
      points={points.map(p => ({ score: p.gcs, day: p.day }))}
      color="#FF6B8A" label="GCS" maxScore={15}
    />
  )
}

// ── Timeline event card ──
function EventCard({ event, expanded, onToggle }: { event: HistoryEvent; expanded: boolean; onToggle: () => void }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.note
  const sevColor = SEVERITY_COLORS[event.severity || 'info']

  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', gap: '12px', padding: '10px 12px',
        borderRadius: 'var(--p-radius-lg)', cursor: 'pointer',
        background: expanded ? 'var(--p-bg-elevated)' : 'transparent',
        transition: 'background 0.2s',
        borderLeft: `3px solid ${sevColor}`,
      }}
    >
      {/* Time column */}
      <div style={{ minWidth: '50px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--p-text)' }}>
          J{event.day}
        </div>
        <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)' }}>
          {event.hour}
        </div>
      </div>

      {/* Icon */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: `${config.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Picto name={config.icon} size={14} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--p-text)' }}>
            {event.title}
          </span>
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontSize: '8px', padding: '1px 5px',
            borderRadius: '4px', background: `${config.color}20`, color: config.color,
          }}>
            {config.label}
          </span>
          {event.source && (
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'var(--p-text-dim)' }}>
              via {event.source}
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)',
          marginTop: '3px', lineHeight: 1.4,
          maxHeight: expanded ? '200px' : '18px',
          overflow: 'hidden', transition: 'max-height 0.3s ease',
        }}>
          {event.detail}
        </div>
      </div>
    </div>
  )
}

export default function HistoriquePage() {
  const { info } = usePatient()
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [scores, setScores] = useState<{ engine: string; points: { score: number; day: number }[] }[]>([])
  const [gcsData, setGcsData] = useState<{ gcs: number; day: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [evts, sc, gcs] = await Promise.all([
          historyService.getFullHistory(info.id),
          historyService.getScoreEvolution(info.id),
          historyService.getGcsEvolution(info.id),
        ])
        setEvents(evts)
        setScores(sc)
        setGcsData(gcs)
      } catch (err) {
        console.error('[Historique] Erreur:', err)
      }
      setLoading(false)
    }
    load()
  }, [info.id])

  const filters = [
    { key: 'all', label: 'Tout', color: 'var(--p-text)' },
    { key: 'clinical', label: 'Clinique', color: '#FF6B8A' },
    { key: 'diagnostic', label: 'Diagnostic', color: '#B96BFF' },
    { key: 'therapeutic', label: 'Thérapeutique', color: '#2FD1C8' },
    { key: 'system', label: 'Système', color: '#6C7CFF' },
  ]

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.category === filter)

  // Group by day
  const dayGroups: Record<number, HistoryEvent[]> = {}
  for (const e of filteredEvents) {
    if (!dayGroups[e.day]) dayGroups[e.day] = []
    dayGroups[e.day].push(e)
  }
  const sortedDays = Object.keys(dayGroups).map(Number).sort((a, b) => b - a)

  const ENGINE_COLORS: Record<string, string> = {
    VPS: '#FF4757', TDE: '#2FD1C8', PVE: '#FFB347', EWE: '#6C7CFF', TPE: '#B96BFF',
  }

  return (
    <div className="page-enter-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Picto name="clipboard" size={28} glow glowColor="rgba(108,124,255,0.5)" />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--p-text)', margin: 0 }}>Historique patient</h1>
          <span style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            Timeline · Évolution · Dossier {'\u00b7'} {info.displayName} {'\u00b7'} J+{info.hospDay}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
          Chargement de l'historique...
        </div>
      ) : (
        <>
          {/* Score evolution charts */}
          {(scores.length > 0 || gcsData.length > 0) && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {scores.map(s => (
                <ScoreChart
                  key={s.engine}
                  points={s.points}
                  color={ENGINE_COLORS[s.engine] || '#6C7CFF'}
                  label={s.engine}
                />
              ))}
              {gcsData.length > 0 && <GcsChart points={gcsData} />}
            </div>
          )}

          {/* Stats bar */}
          <div className="glass-card" style={{ padding: '10px 14px', borderRadius: 'var(--p-radius-lg)', marginBottom: '14px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800, color: 'var(--p-text-dim)' }}>
              {events.length} événements · {sortedDays.length} jours
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {filters.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: '3px 8px', borderRadius: 'var(--p-radius-sm)', border: 'none', cursor: 'pointer',
                  background: filter === f.key ? `${f.color}20` : 'transparent',
                  fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700,
                  color: filter === f.key ? f.color : 'var(--p-text-dim)',
                  transition: 'all 0.2s',
                }}>
                  {f.label}
                  {f.key !== 'all' && (
                    <span style={{ marginLeft: '3px', opacity: 0.6 }}>
                      {events.filter(e => e.category === f.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {filteredEvents.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', borderRadius: 'var(--p-radius-xl)' }}>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '11px', color: 'var(--p-text-dim)' }}>
                Aucun événement enregistré
              </div>
              <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: '4px' }}>
                Les données apparaîtront ici après la saisie de constantes, bilans ou notes
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sortedDays.map(day => (
                <div key={day}>
                  {/* Day header */}
                  <div style={{
                    fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 800,
                    color: day === info.hospDay ? '#6C7CFF' : 'var(--p-text-dim)',
                    padding: '8px 12px 4px', letterSpacing: '0.5px',
                    borderBottom: '1px solid var(--p-dark-4)',
                  }}>
                    JOUR {day} {day === info.hospDay ? '(aujourd\'hui)' : ''}
                    <span style={{ fontWeight: 400, marginLeft: '8px' }}>
                      {dayGroups[day].length} événement{dayGroups[day].length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {dayGroups[day].map(e => (
                    <EventCard
                      key={e.id}
                      event={e}
                      expanded={expandedId === e.id}
                      onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
