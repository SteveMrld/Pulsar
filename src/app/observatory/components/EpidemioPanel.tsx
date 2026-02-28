'use client'
import { useState, useMemo } from 'react'
import Picto from '@/components/Picto'
import { SURVEILLANCE_FEEDS, PATHOLOGY_TRIGGERS, computeDiagnosticContext } from '@/lib/data/epidemioContext'
import type { EpidemioFeed } from '@/lib/data/epidemioContext'

const levelColor: Record<string, string> = {
  normal: 'var(--p-success)', elevated: 'var(--p-warning)', alert: 'var(--p-critical)', epidemic: '#FF0040',
}
const trendIcon: Record<string, string> = { rising: '↑', stable: '→', declining: '↓' }
const trendColor: Record<string, string> = { rising: 'var(--p-critical)', stable: 'var(--p-text-dim)', declining: 'var(--p-success)' }

function FeedCard({ feed }: { feed: EpidemioFeed }) {
  const lc = levelColor[feed.alertLevel]
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--p-radius-lg)',
      background: 'var(--p-bg-elevated)', borderLeft: `3px solid ${lc}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--p-text)' }}>
          {feed.indicator.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: lc }}>{feed.value} {feed.unit}</span>
          <span style={{ fontSize: '14px', color: trendColor[feed.trend] }}>{trendIcon[feed.trend]}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[feed.region, feed.source, feed.week, feed.alertLevel.toUpperCase()].map((t, i) => (
          <span key={i} style={{
            padding: '1px 7px', borderRadius: 'var(--p-radius-full)',
            background: i === 3 ? `${lc}20` : 'var(--p-dark-4)',
            color: i === 3 ? lc : 'var(--p-text-dim)',
            fontSize: '9px', fontFamily: 'var(--p-font-mono)', fontWeight: 600,
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

export default function EpidemioPanel({ family, region }: { family?: string; region?: string }) {
  const [selectedFamily, setSelectedFamily] = useState(family || 'FIRES')
  const [selectedRegion] = useState(region || 'Île-de-France')
  const [showTriggers, setShowTriggers] = useState(false)

  const families = ['FIRES', 'EAIS', 'PIMS', 'MOGAD', 'NORSE']

  const context = useMemo(() =>
    computeDiagnosticContext(selectedFamily, selectedRegion),
    [selectedFamily, selectedRegion]
  )

  const triggers = PATHOLOGY_TRIGGERS.find(p => p.family === selectedFamily)

  // Group feeds by alert level
  const alertFeeds = SURVEILLANCE_FEEDS.filter(f => f.alertLevel === 'alert' || f.alertLevel === 'epidemic')
  const elevatedFeeds = SURVEILLANCE_FEEDS.filter(f => f.alertLevel === 'elevated' || f.trend === 'rising')
  const normalFeeds = SURVEILLANCE_FEEDS.filter(f => f.alertLevel === 'normal' && f.trend !== 'rising')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-4)' }}>

      {/* Diagnostic Context Card */}
      <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--p-space-4)', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Picto name="virus" size={22} glow glowColor="var(--p-critical)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>Contexte Épidémiologique</span>
              <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>Aide au diagnostic différentiel par surveillance de terrain</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
            Sources : Odissé · ECDC Atlas · Sentinelles · SurSaUD
          </div>
        </div>

        {/* Family selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--p-space-4)' }}>
          {families.map(f => (
            <button key={f} onClick={() => setSelectedFamily(f)} style={{
              padding: '5px 14px', borderRadius: 'var(--p-radius-lg)',
              border: selectedFamily === f ? '2px solid var(--p-tde)' : 'var(--p-border)',
              background: selectedFamily === f ? 'var(--p-tde-dim)' : 'var(--p-bg-elevated)',
              color: selectedFamily === f ? 'var(--p-tde)' : 'var(--p-text-muted)',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            }}>{f}</button>
          ))}
        </div>

        {/* Diagnostic alerts from epidemiological context */}
        {context.alerts.length > 0 ? (
          <div style={{ marginBottom: 'var(--p-space-4)' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>
              ALERTES DIAGNOSTIQUES — {selectedFamily} × {selectedRegion}
            </div>
            {context.alerts.map((a, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 'var(--p-radius-lg)', marginBottom: '8px',
                borderLeft: `3px solid ${a.level === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)'}`,
                background: a.level === 'critical' ? 'var(--p-critical-bg)' : 'rgba(255,179,71,0.06)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: a.level === 'critical' ? 'var(--p-critical)' : 'var(--p-warning)', marginBottom: '4px' }}>{a.message}</div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginBottom: '2px' }}>
                  <strong>Déclencheur :</strong> {a.trigger}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', fontStyle: 'italic' }}>{a.mechanism}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '12px', borderRadius: 'var(--p-radius-lg)', background: 'rgba(46,204,113,0.06)', borderLeft: '3px solid var(--p-success)', marginBottom: 'var(--p-space-4)' }}>
            <div style={{ fontSize: '12px', color: 'var(--p-success)', fontWeight: 600 }}>Aucun signal épidémiologique notable pour {selectedFamily} × {selectedRegion}</div>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)', marginTop: '2px' }}>Le contexte infectieux régional ne suggère pas de facteur déclencheur actif.</div>
          </div>
        )}

        {/* Known triggers per pathology */}
        <button onClick={() => setShowTriggers(v => !v)} style={{
          padding: '6px 14px', borderRadius: 'var(--p-radius-lg)',
          background: showTriggers ? 'var(--p-tde-dim)' : 'var(--p-bg-elevated)',
          border: showTriggers ? '1px solid var(--p-tde)' : 'var(--p-border)',
          color: showTriggers ? 'var(--p-tde)' : 'var(--p-text-muted)',
          fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginBottom: showTriggers ? 'var(--p-space-3)' : 0,
        }}>
          {showTriggers ? '▾ Masquer' : '▸ Afficher'} les déclencheurs connus — {selectedFamily}
        </button>

        {showTriggers && triggers && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {triggers.triggers.map((t, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 'var(--p-radius-lg)', background: 'var(--p-bg-elevated)' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--p-tde)', marginBottom: '4px' }}>{t.agent}</div>
                <div style={{ fontSize: '11px', color: 'var(--p-text-muted)', marginBottom: '4px' }}>{t.mechanism}</div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>Réf: {t.evidence}</div>
                {t.feedIndicators.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {t.feedIndicators.map((fi, j) => (
                      <span key={j} style={{ padding: '1px 6px', borderRadius: 'var(--p-radius-full)', background: 'var(--p-dark-4)', fontSize: '9px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-text-dim)' }}>
                        📡 {fi}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Surveillance Feeds */}
      <div className="glass-card" style={{ padding: 'var(--p-space-5)', borderRadius: 'var(--p-radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--p-space-4)' }}>
          <Picto name="thermo" size={22} glow glowColor="var(--p-warning)" />
          <div>
            <span style={{ fontWeight: 700, fontSize: 'var(--p-text-sm)', color: 'var(--p-text)' }}>Flux de surveillance</span>
            <div style={{ fontSize: '10px', color: 'var(--p-text-dim)' }}>{SURVEILLANCE_FEEDS.length} indicateurs · 4 sources</div>
          </div>
        </div>

        {alertFeeds.length > 0 && (
          <>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-critical)', letterSpacing: '1px', marginBottom: '6px' }}>🔴 ALERTES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--p-space-4)' }}>
              {alertFeeds.map(f => <FeedCard key={f.id} feed={f} />)}
            </div>
          </>
        )}

        {elevatedFeeds.length > 0 && (
          <>
            <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-warning)', letterSpacing: '1px', marginBottom: '6px' }}>🟡 ÉLEVÉS / EN HAUSSE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--p-space-4)' }}>
              {elevatedFeeds.map(f => <FeedCard key={f.id} feed={f} />)}
            </div>
          </>
        )}

        <div style={{ fontSize: '10px', fontFamily: 'var(--p-font-mono)', color: 'var(--p-success)', letterSpacing: '1px', marginBottom: '6px' }}>🟢 NORMAUX</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {normalFeeds.map(f => <FeedCard key={f.id} feed={f} />)}
        </div>

        <div style={{ textAlign: 'center', fontSize: '9px', color: 'var(--p-text-dim)', marginTop: 'var(--p-space-4)', fontStyle: 'italic' }}>
          Données simulées · En production : connexion API Odissé (SPF) + ECDC Surveillance Atlas + Réseau Sentinelles
        </div>
      </div>
    </div>
  )
}
