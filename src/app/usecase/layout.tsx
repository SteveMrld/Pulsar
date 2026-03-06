import { LanguageProvider } from '@/contexts/LanguageContext'

export default function UseCaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', background: 'var(--p-bg, #0C1424)' }}>
        {children}
      </div>
    </LanguageProvider>
  )
}
