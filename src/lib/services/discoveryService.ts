// ============================================================
// PULSAR V18 — Discovery Service
// CRUD Supabase pour signals, hypotheses, articles
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { logAudit } from './auditService'
import type {
  DiscoverySignalRow, DiscoveryHypothesisRow, DiscoveryArticleRow,
  SignalCard, SignalStatus,
} from '@/lib/types/discovery'

export const discoveryService = {

  // ══════════════════════════════════════════════
  // SIGNALS
  // ══════════════════════════════════════════════

  async saveSignals(signals: SignalCard[]): Promise<void> {
    const supabase = createClient()
    const rows = signals.map(s => ({
      type: s.type,
      title: s.title,
      description: s.description,
      strength: s.strength,
      status: s.status,
      statistics: s.statistics,
      parameters: s.parameters,
      patients_data: s.patients,
      chart_data: s.chart || null,
      source: s.source,
      evidence_level: s.evidenceLevel,
      tags: s.tags,
    }))

    const { error } = await supabase
      .from('discovery_signals')
      .insert(rows)

    if (error) throw new Error(`[DiscoveryService] saveSignals: ${error.message}`)

    await logAudit('discovery.signals.save', 'discovery_signals', undefined, {
      count: signals.length,
      types: [...new Set(signals.map(s => s.type))].join(', '),
    })
  },

  async getSignals(options?: {
    type?: string
    strength?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<DiscoverySignalRow[]> {
    const supabase = createClient()
    let query = supabase
      .from('discovery_signals')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.type && options.type !== 'all') {
      query = query.eq('type', options.type)
    }
    if (options?.strength && options.strength !== 'all') {
      query = query.eq('strength', options.strength)
    }
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options?.limit || 20) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`[DiscoveryService] getSignals: ${error.message}`)
    return data || []
  },

  async updateSignalStatus(signalId: string, status: SignalStatus): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('discovery_signals')
      .update({ status })
      .eq('id', signalId)

    if (error) throw new Error(`[DiscoveryService] updateSignalStatus: ${error.message}`)

    await logAudit('discovery.signal.update', 'discovery_signals', signalId, { status })
  },

  async getSignalCount(): Promise<{ total: number; new: number; strong: number }> {
    const supabase = createClient()
    const { count: total } = await supabase
      .from('discovery_signals')
      .select('*', { count: 'exact', head: true })

    const { count: newCount } = await supabase
      .from('discovery_signals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')

    const { count: strongCount } = await supabase
      .from('discovery_signals')
      .select('*', { count: 'exact', head: true })
      .in('strength', ['strong', 'very_strong'])

    return {
      total: total || 0,
      new: newCount || 0,
      strong: strongCount || 0,
    }
  },

  // ══════════════════════════════════════════════
  // HYPOTHESES (Phase C — CRUD préparé)
  // ══════════════════════════════════════════════

  async saveHypothesis(hypothesis: Omit<DiscoveryHypothesisRow, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('discovery_hypotheses')
      .insert(hypothesis)
      .select('id')
      .single()

    if (error) throw new Error(`[DiscoveryService] saveHypothesis: ${error.message}`)
    return data.id
  },

  async getHypotheses(status?: string): Promise<DiscoveryHypothesisRow[]> {
    const supabase = createClient()
    let query = supabase
      .from('discovery_hypotheses')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw new Error(`[DiscoveryService] getHypotheses: ${error.message}`)
    return data || []
  },

  // ══════════════════════════════════════════════
  // ARTICLES (Phase B — CRUD préparé)
  // ══════════════════════════════════════════════

  async saveArticles(articles: Omit<DiscoveryArticleRow, 'id'>[]): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('discovery_articles')
      .insert(articles)

    if (error) throw new Error(`[DiscoveryService] saveArticles: ${error.message}`)
  },

  async getArticles(limit: number = 20): Promise<DiscoveryArticleRow[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('discovery_articles')
      .select('*')
      .order('relevance_score', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`[DiscoveryService] getArticles: ${error.message}`)
    return data || []
  },
}
