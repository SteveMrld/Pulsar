'use client'
import React, { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary PULSAR — empêche le crash complet de l'app.
 * Attrape les erreurs de rendu et affiche un fallback élégant.
 *
 * Usage:
 *   <ErrorBoundary context="Cockpit VPS">
 *     <VPSPanel />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[PULSAR ErrorBoundary] ${this.props.context || 'Unknown'}:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="glass-card" style={{
          padding: '20px', borderRadius: 'var(--p-radius-xl)',
          border: '1px solid rgba(139,92,246,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠</div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', fontWeight: 800, color: 'var(--p-text)', marginBottom: '4px' }}>
            Erreur de chargement
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)', marginBottom: '10px' }}>
            {this.props.context ? `Module : ${this.props.context}` : 'Un composant a rencontré une erreur.'}
          </div>
          <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '9px', color: '#8B5CF6', marginBottom: '12px', maxWidth: '400px', margin: '0 auto 12px' }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '6px 16px', borderRadius: 'var(--p-radius-md)', border: 'none',
              background: 'var(--p-bg-elevated)', cursor: 'pointer',
              fontFamily: 'var(--p-font-mono)', fontSize: '10px', fontWeight: 700,
              color: '#6C7CFF', transition: 'all 0.2s',
            }}
          >
            Réessayer
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook wrapper pour les appels async avec gestion d'erreur
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.error(`[PULSAR SafeAsync] ${context || ''}:`, err)
    return fallback
  }
}

/**
 * Wrapper de service — retry automatique avec backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  context?: string
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.warn(`[PULSAR Retry] ${context || ''} — tentative ${attempt + 1}/${maxRetries}, retry dans ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
