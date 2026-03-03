'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pulsar-lang') as Lang) || 'fr'
    }
    return 'fr'
  })

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
      onClick={toggleLang}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      style={{
        padding: '3px 10px',
        borderRadius: '9999px',
        background: 'rgba(108,124,255,0.08)',
        border: '1px solid rgba(108,124,255,0.15)',
        color: '#6C7CFF',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'var(--p-font-mono)',
        letterSpacing: '0.05em',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
    </button>
  )
}
