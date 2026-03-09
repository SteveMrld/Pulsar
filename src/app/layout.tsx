import type { Metadata, Viewport } from 'next'
import BetaModal from '@/components/BetaModal';
import VersionBadge from '@/components/VersionBadge';
import '@/styles/tokens.css'
import AppShell from '@/components/AppShell'
import ResearchPulse from '@/components/ResearchPulse'
import dynamic from 'next/dynamic'
const GuidedTour = dynamic(() => import('@/components/GuidedTour'), { ssr: false });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0E0E16' },
    { media: '(prefers-color-scheme: light)', color: '#F8F9FC' },
  ],
}

export const metadata: Metadata = {
  title: 'PULSAR â Aide Ã  la dÃ©cision clinique pÃ©diatrique',
  description: 'SystÃ¨me d\'aide Ã  la dÃ©cision pour les urgences neuro-inflammatoires pÃ©diatriques.',
  keywords: ['PULSAR', 'neurologie pÃ©diatrique', 'FIRES', 'PIMS', 'MOGAD', 'anti-NMDAR', 'aide Ã  la dÃ©cision clinique', 'neuro-inflammatoire'],
  authors: [{ name: 'Steve Moradel' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'PULSAR â Aide Ã  la dÃ©cision clinique pÃ©diatrique',
    description: 'SystÃ¨me d\'aide Ã  la dÃ©cision pour les urgences neuro-inflammatoires pÃ©diatriques.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'PULSAR',
  },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('pulsar-theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })()
        `}} />
      </head>
      <body><AppShell>{children}</AppShell><GuidedTour /></body>
        <BetaModal />
        <VersionBadge />
    </html>
  )
}
