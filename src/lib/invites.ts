// ══════════════════════════════════════════════════════════════
// PULSAR — Invite System
// Gestion d'accès par invitation pour testeurs ciblés
// ══════════════════════════════════════════════════════════════

export interface InviteCode {
  code: string
  name: string
  email: string
  role: 'tester' | 'advisor' | 'medical' | 'investor'
  expiresAt: string // ISO date
  active: boolean
  welcomeMsg?: string
  welcomeMsgEn?: string
}

// ── Codes d'invitation actifs ──
// Steve: ajoute/modifie les testeurs ici
export const INVITE_CODES: InviteCode[] = [
  { code: 'PULSAR-NW-2026',  name: 'Nora Wong',       email: 'nora.norse@gmail.com',  role: 'advisor',  expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci pour votre soutien et votre engagement auprès des familles. C\'est grâce à des personnes comme vous que ce projet a un sens.',
    welcomeMsgEn: 'Thank you for your support and your commitment to families. It is because of people like you that this project has meaning.' },
  { code: 'PULSAR-T2-ALPHA', name: 'Testeur 2',       email: '',                      role: 'tester',   expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci pour votre accompagnement et votre bienveillance. Votre regard sur PULSAR compte énormément.' },
  { code: 'PULSAR-T3-ALPHA', name: 'Testeur 3',       email: '',                      role: 'tester',   expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci pour votre accompagnement et votre bienveillance. Votre regard sur PULSAR compte énormément.' },
  { code: 'PULSAR-T4-ALPHA', name: 'Testeur 4',       email: '',                      role: 'tester',   expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci pour votre accompagnement et votre bienveillance. Votre regard sur PULSAR compte énormément.' },
  { code: 'PULSAR-T5-ALPHA', name: 'Testeur 5',       email: '',                      role: 'tester',   expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci pour votre accompagnement et votre bienveillance. Votre regard sur PULSAR compte énormément.' },
  { code: 'PULSAR-MD-ALPHA', name: 'Médecin conseil',  email: '',                      role: 'medical',  expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci pour votre écoute et votre expertise. Votre avis clinique est essentiel pour que cet outil serve vraiment.' },
  { code: 'PULSAR-IV-ALPHA', name: 'Investisseur',     email: '',                      role: 'investor', expiresAt: '2026-04-04', active: true,
    welcomeMsg: 'Merci de prendre le temps de découvrir PULSAR. Votre retour est précieux.' },
  { code: 'PULSAR-SM-ADMIN', name: 'Steve Moradel',   email: 'steve.moradel@gmail.com', role: 'advisor', expiresAt: '2030-01-01', active: true,
    welcomeMsg: 'Bienvenue chez toi, Steve.' },
]

export function validateInvite(code: string): InviteCode | null {
  const invite = INVITE_CODES.find(i => i.code === code && i.active)
  if (!invite) return null
  if (new Date(invite.expiresAt) < new Date()) return null
  return invite
}

export function getInviteFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/pulsar-invite=([^;]+)/)
  return match ? match[1] : null
}

export function setInviteCookie(code: string, name: string) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `pulsar-invite=${code}; path=/; expires=${expires}; SameSite=Lax`
  document.cookie = `pulsar-invite-name=${encodeURIComponent(name)}; path=/; expires=${expires}; SameSite=Lax`
}

export function getInviteName(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/pulsar-invite-name=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function clearInviteCookie() {
  document.cookie = 'pulsar-invite=; path=/; max-age=0'
  document.cookie = 'pulsar-invite-name=; path=/; max-age=0'
}
