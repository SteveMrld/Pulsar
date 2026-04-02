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
  lang: 'fr' | 'en'
  welcomeMsg: string
}

// ── Codes d'invitation actifs ──
// Steve: ajoute/modifie les testeurs ici
export const INVITE_CODES: InviteCode[] = [
  // ── Nominatifs ──
  { code: 'PULSAR-NW-2026',  name: 'Nora Wong',       email: 'nora.norse@gmail.com',  role: 'advisor',  expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your support and your commitment to families. We will never forget your kindness and your help. Thank you for Alejandro.' },
  { code: 'PULSAR-PS-2026',  name: 'Pierre Sonigo',   email: '',                      role: 'advisor',  expiresAt: '2026-05-01', active: true, lang: 'fr',
    welcomeMsg: 'Merci pour votre soutien et votre bienveillance. Nous n\'oublierons jamais votre écoute et votre aide. Merci pour Alejandro.' },
  { code: 'PULSAR-AH-2026',  name: 'Aurélie Hanin',   email: 'aurelie.hanin@icm-institute.org', role: 'medical',  expiresAt: '2026-06-30', active: true, lang: 'fr',
    welcomeMsg: 'Merci pour votre expertise et votre engagement auprès des familles. Votre regard clinique sur PULSAR est précieux. Merci pour Alejandro.' },
  { code: 'PULSAR-AVB-2026', name: 'Andreas van Baalen', email: 'van.baalen@pedneuro.uni-kiel.de', role: 'medical', expiresAt: '2026-06-30', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your expertise and your commitment to children with FIRES. Your clinical insight on PULSAR is invaluable. Thank you for Alejandro.' },
  { code: 'PULSAR-BD-2026',  name: 'Blandine Dozières', email: 'blandine.dozieres@aphp.fr',    role: 'medical',  expiresAt: '2026-06-30', active: true, lang: 'fr',
    welcomeMsg: 'Merci pour votre expertise et votre engagement auprès des enfants. Votre regard clinique sur PULSAR est précieux. Merci pour Alejandro.' },
  // ── Testeurs génériques (anglais) ──
  { code: 'PULSAR-T2-ALPHA', name: 'Tester 2',        email: '',                      role: 'tester',   expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your support and kindness. Your feedback on PULSAR means a great deal.' },
  { code: 'PULSAR-T3-ALPHA', name: 'Tester 3',        email: '',                      role: 'tester',   expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your support and kindness. Your feedback on PULSAR means a great deal.' },
  { code: 'PULSAR-T4-ALPHA', name: 'Tester 4',        email: '',                      role: 'tester',   expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your support and kindness. Your feedback on PULSAR means a great deal.' },
  { code: 'PULSAR-T5-ALPHA', name: 'Tester 5',        email: '',                      role: 'tester',   expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your support and kindness. Your feedback on PULSAR means a great deal.' },
  { code: 'PULSAR-MD-ALPHA', name: 'Doctor',           email: '',                      role: 'medical',  expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your expertise and your time. Your clinical insight is essential for this tool to truly serve.' },
  { code: 'PULSAR-IV-ALPHA', name: 'Investor',         email: '',                      role: 'investor', expiresAt: '2026-05-01', active: true, lang: 'en',
    welcomeMsg: 'Thank you for taking the time to discover PULSAR. Your feedback is invaluable.' },
  // ── Admin ──
  { code: 'PULSAR-AVB-2026',  name: 'Andreas van Baalen', email: 'van.baalen@pedneuro.uni-kiel.de', role: 'medical',  expiresAt: '2026-06-30', active: true, lang: 'en',
    welcomeMsg: 'Thank you for your expertise and your pioneering work on FIRES. Your perspective on PULSAR is invaluable.' },
  { code: 'PULSAR-SM-ADMIN', name: 'Steve Moradel',   email: 'steve.moradel@gmail.com', role: 'advisor', expiresAt: '2030-01-01', active: true, lang: 'fr',
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
