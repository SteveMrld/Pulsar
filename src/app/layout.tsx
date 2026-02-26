import type { Metadata } from 'next'
import '@/styles/tokens.css'

export const metadata: Metadata = {
  title: 'PULSAR V15 — Pediatric Urgent Lifesaving System',
  description: '5 Brain Engines × 4 Layers — Clinical Decision Support for Pediatric Neuroinflammatory Emergencies',
  icons: { icon: '/favicon.ico' },
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
      <body>{children}</body>
    </html>
  )
}
