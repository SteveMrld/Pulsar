'use client'
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export type Lang = 'fr' | 'en'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: (fr: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  toggleLang: () => {},
  t: (fr: string) => fr,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('pulsar-lang') as Lang
    if (saved && saved !== lang) setLangState(saved)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('pulsar-lang', l)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'fr' ? 'en' : 'fr'
      if (typeof window !== 'undefined') localStorage.setItem('pulsar-lang', next)
      return next
    })
  }, [])

  const t = useCallback((fr: string, en: string) => lang === 'fr' ? fr : en, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

/* ══════════════════════════════════════════════════════════════
   Language Toggle Button Component
   ══════════════════════════════════════════════════════════════ */
export function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, toggleLang } = useLang()
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLang(); }}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      style={{
        padding: '5px 12px',
        borderRadius: '9999px',
        background: lang === 'fr' ? 'rgba(108,124,255,0.12)' : 'rgba(16,185,129,0.12)',
        border: lang === 'fr' ? '2px solid rgba(108,124,255,0.3)' : '2px solid rgba(16,185,129,0.3)',
        color: lang === 'fr' ? '#6C7CFF' : '#10B981',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 800,
        fontFamily: 'var(--p-font-mono)',
        letterSpacing: '0.05em',
        transition: 'all 0.3s',
        minWidth: '68px',
        width: '68px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        textAlign: 'center' as const,
        ...style,
      }}
    >
      {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
    </button>
  )
}
