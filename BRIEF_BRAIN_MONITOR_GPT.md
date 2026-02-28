# BRIEF DESIGN — Composant BrainMonitor pour PULSAR V16

> Ce document contient TOUT ce dont tu as besoin pour redesigner le composant BrainMonitor.tsx.
> Tu n'as besoin d'aucune autre information. Lis tout, puis produis le fichier complet.

---

## 1. CONTEXTE PROJET

**PULSAR** est une application médicale d'aide au diagnostic neurologique pédiatrique, utilisée en réanimation.  
Stack : **Next.js 14 + TypeScript + React**. Pas de Tailwind, tout est en **inline styles** avec des **CSS custom properties** (tokens).

L'application surveille des enfants hospitalisés pour des encéphalopathies sévères (FIRES, Anti-NMDAR, MOGAD, NORSE, PIMS). Ces enfants sont en réanimation, souvent en coma artificiel, avec un monitoring continu du cerveau (EEG) et des constantes vitales (FC, SpO2, température, pression artérielle).

---

## 2. HISTOIRE HUMAINE (guide le design)

Un père a vécu l'hospitalisation de son fils Alerandro en réanimation pour FIRES. L'enfant a été plongé dans un coma artificiel pour protéger son cerveau des crises d'épilepsie qui l'abîmaient. Le "juge de paix" dans la chambre était l'écran de monitoring : l'EEG qui défilait, les constantes cardiaques, la température. Tout était adapté en temps réel — les médicaments, le régime cétogène — en fonction de ce que montrait le monitoring. Alerandro est décédé d'un arrêt cardiaque.

**Le BrainMonitor est la première chose que le médecin voit en ouvrant l'application.** Il doit donner l'impression d'entrer dans cette chambre de réa. C'est LE composant le plus important de toute l'application.

---

## 3. DESIGN SYSTEM COMPLET (à respecter ABSOLUMENT)

### 3.1 Palette de couleurs

```
/* Fond */
--p-black:       #0A0A0F
--p-dark-1:      #0E0E16    ← fond principal app
--p-dark-2:      #13131D    ← fond cards
--p-dark-3:      #1A1A28    ← fond éléments surélevés
--p-dark-4:      #222233
--p-dark-5:      #2C2C40

/* Gris */
--p-gray-1:      #3A3A50
--p-gray-2:      #4E4E66
--p-gray-3:      #6B6B85    ← texte dim
--p-gray-4:      #8E8EA3    ← texte muted
--p-gray-5:      #B0B0C0

/* Clairs */
--p-light-1:     #D0D0DD
--p-light-2:     #E8E8F0
--p-white:       #F4F4FA    ← texte principal

/* Couleurs des 5 moteurs IA */
--p-vps:         #6C7CFF    (bleu-violet — Vital Prognosis Score)
--p-tde:         #2FD1C8    (turquoise — Therapeutic Decision)
--p-pve:         #B96BFF    (violet — Paraclinical Validation)
--p-ewe:         #FF6B8A    (rose — Early Warning)
--p-tpe:         #FFB347    (ambre — Therapeutic Prospection)

/* Sémantique alertes */
--p-critical:    #FF4757    (rouge)
--p-warning:     #FFA502    (orange)
--p-success:     #2ED573    (vert)
--p-info:        #3B82F6    (bleu)
```

### 3.2 Typographie

```
--p-font-display: 'Inter', -apple-system, sans-serif
--p-font-body:    'Inter', -apple-system, sans-serif
--p-font-mono:    'JetBrains Mono', 'Fira Code', monospace   ← pour toutes les données/codes/labels
```

Les labels de monitoring, les valeurs numériques, les noms de canaux EEG sont TOUJOURS en `var(--p-font-mono)`.

### 3.3 Espacement & Bordures

```
--p-radius-sm:   0.375rem
--p-radius-md:   0.5rem
--p-radius-lg:   0.75rem
--p-radius-xl:   1rem

--p-border: 1px solid var(--p-gray-1)
```

### 3.4 Glass morphism

```css
.glass-card {
  background: rgba(19,19,29,0.65);
  backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid rgba(108,124,255,0.1);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03);
}
```

### 3.5 Animations existantes (classes CSS disponibles)

```
.animate-breathe     → opacité 0.7 ↔ 1, 3s infinite
.dot-alive           → petit point vert pulsant (6px)
.dot-critical        → petit point rouge pulsant rapide (6px)
.animate-glow-crit   → glow rouge pulsant (critical-pulse)
.card-interactive    → hover lift -2px + shadow
```

### 3.6 Transitions

```
--p-ease: cubic-bezier(0.4, 0, 0.2, 1)
--p-duration-fast:   150ms
--p-duration-normal: 250ms
--p-duration-slow:   400ms
```

---

## 4. CE QUE LE COMPOSANT DOIT AFFICHER

Le BrainMonitor est un bloc rectangulaire divisé en zones :

### ZONE A — Barre supérieure (header patient)
- Dot "alive" animé (vert si stable, rouge si critique)
- Icône cerveau
- Nom patient en mono bold (ex: "Inès M.")
- Infos : âge · syndrome · J+X (jour d'hospitalisation)
- Badge EEG status (NORMAL en vert / RALENTISSEMENT en orange / ACTIVITÉ CRITIQUE en rouge / BURST-SUPPRESSION en rose / SUPPRIMÉ en bleu)
- Badge "NCSE ?" clignotant rouge si applicable
- Horloge temps réel HH:MM:SS

### ZONE B — EEG temps réel (partie principale, ~65% largeur)
- **6 canaux EEG animés** : Fp1-F7, F7-T3, T3-T5, T5-O1, Fp2-F8, F8-T4
- Chaque canal = Canvas animé avec requestAnimationFrame
- Labels des canaux à gauche en mono 7px
- Grille oscilloscope très subtile en fond (vert #2ED573 à ~3.5% opacité)
- Baseline centrale sur chaque canal
- Point lumineux (sweep dot) au bout de chaque tracé
- Fade-out en fin de tracé (gradient transparent → fond sombre)
- Les patterns varient selon le status EEG :
  - `normal` : oscillations alpha/beta régulières, amplitude moyenne
  - `slowing` : ondes delta lentes, grande amplitude
  - `seizure` : activité rapide haute amplitude chaotique
  - `burst_suppression` : alternance burst/flat
  - `suppressed` : quasi-plat, léger bruit de fond
- En mode seizure, certains canaux (Fp1-F7, F7-T3, F8-T4) passent en rouge #FF4757

### ZONE C — Constantes vitales (colonne droite, ~35% largeur)
4 boîtes empilées :
1. **FC** (Fréquence Cardiaque) — waveform ECG animé, couleur #FF6B8A
2. **SpO₂** — waveform plethysmo, couleur #2FD1C8
3. **TEMP** (Température) — pas de waveform complexe, couleur #B96BFF
4. **PA** (Pression Artérielle) — waveform respiration, couleur #FFB347

Chaque boîte :
- Label mono uppercase tout en haut
- Waveform animé au milieu (même Canvas que l'EEG)
- Valeur numérique en gros (20px mono bold)
- Unité en petit à côté
- Si severity=2 : bordure rouge, glow rouge, label "ALERTE" clignotant
- Si severity=1 : label "VIGIL." en orange

### ZONE D — Barre métriques (en bas de la zone EEG)
- 3 indicateurs alignés : **CRISES/H**, **GCS** (Glasgow), **VPS** (score vital)
- Chacun avec sa valeur en gros mono et code couleur (vert < seuil1 < orange < seuil2 < rouge)
- Séparateurs verticaux entre les métriques
- Bouton "Red Flags →" à droite

### EFFETS VISUELS
- **Fond ICU** : plus sombre que le reste de l'app (gradient rgba(4,4,10) → rgba(8,8,18))
- **Scanlines CRT** : lignes horizontales très subtiles (repeating-linear-gradient, ~2% opacité)
- **Grille oscilloscope** sur les tracés (vert très subtil)
- **Glow** sur les tracés (shadowBlur Canvas)
- **Flash critique** : quand VPS > 65 ou crises > 6/h, le cadre entier pulse en rouge (border + boxShadow alternent toutes les 900ms)

---

## 5. INTERFACES TypeScript (obligatoires)

```typescript
interface VitalSign {
  label: string
  value: string
  unit: string
  color: string
  icon: string
  severity: 0 | 1 | 2    // 0=normal, 1=warning, 2=critical
  waveform?: 'ecg' | 'spo2' | 'resp' | 'flat'
  numericValue?: number
  range?: [number, number]
}

interface BrainMonitorProps {
  patientName: string
  age: string
  syndrome: string
  hospDay: number
  gcs: number
  seizuresPerHour: number
  vpsScore: number
  vitals: VitalSign[]
  eegStatus: 'normal' | 'slowing' | 'seizure' | 'burst_suppression' | 'suppressed'
  eegBackground: string
  ncsePossible: boolean
  compact?: boolean     // mode mobile : constantes sous l'EEG au lieu de à droite
}
```

---

## 6. CONTRAINTES TECHNIQUES

- Le fichier doit commencer par `'use client'`
- Exporter `export default function BrainMonitor(props: BrainMonitorProps)`
- Imports autorisés :
  ```typescript
  import { useEffect, useRef, useState, useCallback } from 'react'
  import Link from 'next/link'
  import Picto from '@/components/Picto'
  ```
- **Picto** est un composant icône existant. Props : `name` (string), `size` (number), `glow` (boolean), `glowColor` (string). Noms disponibles : `brain`, `eeg`, `heart`, `lungs`, `thermo`, `blood`, `warning`, `alert`
- **Link** est le Next.js Link. Liens utilisés : `/neurocore?tab=eeg`, `/neurocore?tab=redflags`
- Canvas + requestAnimationFrame pour TOUS les tracés animés (pas SVG, trop lent)
- **Inline styles uniquement** avec les CSS variables PULSAR (ex: `fontFamily: 'var(--p-font-mono)'`, `borderRadius: 'var(--p-radius-xl)'`)
- Les classes CSS existantes (.animate-breathe, .dot-alive, .dot-critical) peuvent être utilisées via `className`
- PAS de bibliothèques externes (pas de framer-motion, three.js, etc.)
- PAS de `<style jsx>` (tout en inline)
- Hauteur totale : ~380-420px en mode desktop
- Responsive : quand `compact === true`, les constantes passent en dessous de l'EEG (gridTemplateColumns: '1fr')

---

## 7. CODE ACTUEL (à améliorer/redesigner)

Voici le code actuel du composant. Le design fonctionne mais il manque de raffinement visuel. Ton objectif est de le rendre MÉMORABLE — le genre de chose qui fait dire "putain" quand on le voit.

```tsx
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Picto from '@/components/Picto'

/* ══════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════ */
interface VitalSign {
  label: string; value: string; unit: string; color: string; icon: string
  severity: 0 | 1 | 2; waveform?: 'ecg' | 'spo2' | 'resp' | 'flat'
  numericValue?: number; range?: [number, number]
}

interface BrainMonitorProps {
  patientName: string; age: string; syndrome: string; hospDay: number
  gcs: number; seizuresPerHour: number; vpsScore: number
  vitals: VitalSign[]
  eegStatus: 'normal' | 'slowing' | 'seizure' | 'burst_suppression' | 'suppressed'
  eegBackground: string; ncsePossible: boolean; compact?: boolean
}

/* ══════════════════════════════════════════════════════════════
   WAVEFORM GENERATORS
   ══════════════════════════════════════════════════════════════ */
function genEEG(status: string, len: number, seed: number): number[] {
  const d: number[] = []
  const s = seed * 1000
  for (let i = 0; i < len; i++) {
    const t = (i + s) / len
    let v = 0
    switch (status) {
      case 'normal':
        v = Math.sin(t * 28 + seed) * 0.25 + Math.sin(t * 55 + seed * 2) * 0.12
          + Math.sin(t * 90 + seed * 3) * 0.06 + (Math.random() - 0.5) * 0.08
        break
      case 'slowing':
        v = Math.sin(t * 8 + seed) * 0.55 + Math.sin(t * 4 + seed * 2) * 0.35
          + Math.sin(t * 16 + seed) * 0.1 + (Math.random() - 0.5) * 0.1
        break
      case 'seizure':
        v = Math.sin(t * 70 + Math.sin(t * 6 + seed) * 4) * 0.75
          + Math.sin(t * 130 + seed * 3) * 0.35
          + Math.sin(t * 200 + seed * 5) * 0.15
          + (Math.random() - 0.5) * 0.25
        break
      case 'burst_suppression': {
        const bp = ((t * 3 + seed * 0.3) % 1)
        v = bp < 0.25
          ? (Math.sin(t * 90 + seed) * 0.65 + (Math.random() - 0.5) * 0.4)
          : (Math.random() - 0.5) * 0.03
        break
      }
      case 'suppressed':
        v = (Math.random() - 0.5) * 0.04 + Math.sin(t * 2) * 0.01
        break
    }
    d.push(v)
  }
  return d
}

function genECG(hr: number, len: number): number[] {
  const d: number[] = []
  const beatLen = len / (hr / 60 * 3)
  for (let i = 0; i < len; i++) {
    const ph = (i % beatLen) / beatLen
    let v = 0
    if (ph < 0.02) v = 0
    else if (ph < 0.04) v = -0.08
    else if (ph < 0.055) v = -0.15
    else if (ph < 0.08) v = 1.0
    else if (ph < 0.11) v = -0.25
    else if (ph < 0.14) v = 0.02
    else if (ph < 0.3) v = 0.18 * Math.sin((ph - 0.14) / 0.16 * Math.PI)
    else v = 0
    d.push(v + (Math.random() - 0.5) * 0.015)
  }
  return d
}

function genSpO2(len: number): number[] {
  const d: number[] = []
  for (let i = 0; i < len; i++) {
    const ph = ((i / len) * 8) % 1
    let v = 0
    if (ph < 0.12) v = Math.pow(Math.sin(ph / 0.12 * Math.PI * 0.5), 1.5) * 0.7
    else if (ph < 0.25) v = 0.7 * Math.exp(-(ph - 0.12) * 12)
    else if (ph < 0.45) v = 0.08 + 0.15 * Math.sin((ph - 0.25) / 0.2 * Math.PI)
    else v = 0.02 * Math.sin(ph * 10)
    d.push(v + (Math.random() - 0.5) * 0.01)
  }
  return d
}

function genResp(len: number): number[] {
  const d: number[] = []
  for (let i = 0; i < len; i++) {
    const t = i / len
    d.push(Math.sin(t * 12) * 0.4 + Math.sin(t * 24) * 0.1 + (Math.random() - 0.5) * 0.05)
  }
  return d
}

/* ══════════════════════════════════════════════════════════════
   ANIMATED CANVAS TRACE
   ══════════════════════════════════════════════════════════════ */
function Trace({ data, color, w, h, alert: isAlert, speed = 1.3 }: {
  data: number[]; color: string; w: number; h: number; alert?: boolean; speed?: number
}) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const off = useRef(0)
  const buf = useRef(data)
  useEffect(() => { buf.current = data }, [data])

  useEffect(() => {
    const c = cvs.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let id: number

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      c.width = w * dpr; c.height = h * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      /* Grid (oscilloscope feel) */
      ctx.strokeStyle = 'rgba(46,213,115,0.035)'
      ctx.lineWidth = 0.5
      for (let y = h / 4; y < h; y += h / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      for (let x = w / 8; x < w; x += w / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }

      /* Center baseline */
      ctx.strokeStyle = 'rgba(108,124,255,0.05)'
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke()

      /* Trace */
      const b = buf.current, step = w / b.length, mid = h / 2, amp = h * 0.42
      const tc = isAlert ? '#FF4757' : color
      const sweepIdx = Math.floor(off.current) % b.length

      ctx.shadowColor = tc; ctx.shadowBlur = isAlert ? 8 : 4
      ctx.strokeStyle = tc; ctx.lineWidth = isAlert ? 1.6 : 1.1; ctx.lineJoin = 'round'
      ctx.beginPath()
      for (let i = 0; i < b.length; i++) {
        const idx = (i + sweepIdx) % b.length
        const x = i * step, y = mid - b[idx] * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      /* Sweep dot */
      ctx.fillStyle = tc; ctx.shadowColor = tc; ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(w - 2, mid - b[sweepIdx] * amp, 1.8, 0, Math.PI * 2)
      ctx.fill(); ctx.shadowBlur = 0

      /* Fade-out trail */
      const gr = ctx.createLinearGradient(w - 30, 0, w, 0)
      gr.addColorStop(0, 'transparent'); gr.addColorStop(1, 'rgba(4,4,10,0.7)')
      ctx.fillStyle = gr; ctx.fillRect(w - 30, 0, 30, h)

      off.current += speed
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [w, h, color, isAlert, speed])

  return <canvas ref={cvs} style={{ width: w, height: h, display: 'block' }} />
}

/* ══════════════════════════════════════════════════════════════
   VITAL BOX
   ══════════════════════════════════════════════════════════════ */
function VitalBox({ v, w }: { v: VitalSign; w: number }) {
  const [data, setData] = useState<number[]>([])
  const gen = useCallback(() => {
    const hr = v.numericValue || 120
    if (v.waveform === 'ecg') return genECG(hr, 180)
    if (v.waveform === 'spo2') return genSpO2(180)
    if (v.waveform === 'resp') return genResp(180)
    return Array.from({ length: 180 }, () => (Math.random() - 0.5) * 0.15)
  }, [v.waveform, v.numericValue])

  useEffect(() => { setData(gen()); const iv = setInterval(() => setData(gen()), 3500); return () => clearInterval(iv) }, [gen])

  const isCrit = v.severity === 2, isWarn = v.severity === 1
  const vc = isCrit ? '#FF4757' : isWarn ? '#FFA502' : v.color

  return (
    <div style={{
      background: 'rgba(4,4,10,0.5)', borderRadius: '8px', padding: '8px 10px',
      border: `1px solid ${isCrit ? 'rgba(255,71,87,0.25)' : 'rgba(108,124,255,0.06)'}`,
      boxShadow: isCrit ? '0 0 16px rgba(255,71,87,0.1), inset 0 0 10px rgba(255,71,87,0.03)' : 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', position: 'relative' }}>
        <span style={{ fontSize: '8px', fontFamily: 'var(--p-font-mono)', color: v.color, fontWeight: 700, letterSpacing: '1.5px' }}>{v.label}</span>
        {isCrit && <span style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: '#FF4757', fontWeight: 800, letterSpacing: '1px' }} className="animate-breathe">ALERTE</span>}
        {isWarn && <span style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: '#FFA502', fontWeight: 700 }}>VIGIL.</span>}
      </div>

      {v.waveform && data.length > 0 && (
        <div style={{ margin: '2px 0', opacity: 0.85 }}>
          <Trace data={data} color={v.color} w={w - 24} h={22} alert={isCrit} speed={v.waveform === 'ecg' ? 1.5 : 1} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', position: 'relative' }}>
        <span style={{
          fontSize: '20px', fontWeight: 900, fontFamily: 'var(--p-font-mono)',
          color: vc, textShadow: isCrit ? '0 0 12px rgba(255,71,87,0.5)' : `0 0 8px ${v.color}25`,
          letterSpacing: '-0.5px',
        }}>{v.value}</span>
        <span style={{ fontSize: '9px', color: 'rgba(180,180,200,0.4)', fontFamily: 'var(--p-font-mono)' }}>{v.unit}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   METRIC CHIP
   ══════════════════════════════════════════════════════════════ */
function Metric({ label, value, suffix, th }: { label: string; value: number; suffix?: string; th: [number, number] }) {
  const c = value > th[1] ? '#FF4757' : value > th[0] ? '#FFA502' : '#2ED573'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '7px', fontFamily: 'var(--p-font-mono)', color: 'rgba(180,180,200,0.35)', letterSpacing: '1.5px', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--p-font-mono)', color: c, textShadow: `0 0 10px ${c}35`, letterSpacing: '-1px', lineHeight: 1 }}>
        {value}<span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.5 }}>{suffix}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   BRAIN MONITOR — MAIN
   ══════════════════════════════════════════════════════════════ */
const CHANNELS = [
  { label: 'Fp1-F7', seed: 0.1 }, { label: 'F7-T3', seed: 0.4 },
  { label: 'T3-T5', seed: 0.7 }, { label: 'T5-O1', seed: 1.0 },
  { label: 'Fp2-F8', seed: 1.3 }, { label: 'F8-T4', seed: 1.6 },
]
const CH_COLORS = ['#6C7CFF', '#2FD1C8', '#B96BFF', '#FFB347', '#6C7CFF', '#FF6B8A']
const STATUS: Record<string, { label: string; color: string }> = {
  normal: { label: 'NORMAL', color: '#2ED573' },
  slowing: { label: 'RALENTISSEMENT', color: '#FFA502' },
  seizure: { label: 'ACTIVITÉ CRITIQUE', color: '#FF4757' },
  burst_suppression: { label: 'BURST-SUPPRESSION', color: '#FF6B8A' },
  suppressed: { label: 'SUPPRIMÉ', color: '#6C7CFF' },
}

export default function BrainMonitor({
  patientName, age, syndrome, hospDay, gcs, seizuresPerHour, vpsScore,
  vitals, eegStatus, eegBackground, ncsePossible, compact = false,
}: BrainMonitorProps) {
  const [bufs, setBufs] = useState<number[][]>([])
  const [clock, setClock] = useState('')
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const r = () => setBufs(CHANNELS.map((ch, i) => {
      const st = (eegStatus === 'seizure' && i >= 4) ? 'seizure' : eegStatus
      return genEEG(st, 280, ch.seed + Math.random() * 0.01)
    }))
    r(); const iv = setInterval(r, 4000); return () => clearInterval(iv)
  }, [eegStatus])

  useEffect(() => {
    const t = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    t(); const iv = setInterval(t, 1000); return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (vpsScore > 65 || seizuresPerHour > 6) {
      const iv = setInterval(() => setFlash(f => !f), 900); return () => clearInterval(iv)
    }
    setFlash(false)
  }, [vpsScore, seizuresPerHour])

  const st = STATUS[eegStatus] || STATUS.normal
  const crit = eegStatus === 'seizure' || vpsScore > 65
  const trW = compact ? 260 : 440
  const trH = compact ? 18 : 24

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(4,4,10,0.97), rgba(8,8,18,0.97) 50%, rgba(6,6,14,0.97))',
      borderRadius: 'var(--p-radius-xl)', overflow: 'hidden', position: 'relative',
      border: `1px solid ${crit && flash ? 'rgba(255,71,87,0.2)' : 'rgba(108,124,255,0.08)'}`,
      boxShadow: crit
        ? `0 0 40px rgba(255,71,87,${flash ? '0.1' : '0.04'}), 0 8px 32px rgba(0,0,0,0.5)`
        : '0 8px 32px rgba(0,0,0,0.4)',
      transition: 'box-shadow 0.4s, border-color 0.4s',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.018,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.12) 1px, rgba(255,255,255,0.12) 2px)' }} />

      {/* TOP BAR */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', borderBottom: '1px solid rgba(108,124,255,0.05)',
        background: crit && flash ? 'rgba(255,71,87,0.03)' : 'rgba(108,124,255,0.015)',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="dot-alive" style={{ width: '7px', height: '7px',
            background: crit ? '#FF4757' : '#2ED573',
            boxShadow: `0 0 8px ${crit ? 'rgba(255,71,87,0.6)' : 'rgba(46,213,115,0.5)'}` }} />
          <Picto name="brain" size={16} glow glowColor="rgba(108,124,255,0.3)" />
          <span style={{ fontFamily: 'var(--p-font-mono)', fontWeight: 800, fontSize: '12px', color: 'var(--p-white)' }}>{patientName}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '10px', color: 'var(--p-text-dim)' }}>
            {age} · {syndrome} · <span style={{ color: crit ? '#FF4757' : '#6C7CFF' }}>J+{hospDay}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {ncsePossible && (
            <span className="animate-breathe" style={{
              fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, letterSpacing: '1px',
              padding: '3px 8px', borderRadius: '4px',
              background: 'rgba(255,71,87,0.1)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.2)',
            }}>NCSE ?</span>
          )}
          <span style={{
            fontFamily: 'var(--p-font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.8px',
            padding: '3px 10px', borderRadius: '6px',
            background: `${st.color}0D`, color: st.color, border: `1px solid ${st.color}20`,
          }}>{st.label}</span>
          <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '12px', color: 'rgba(108,124,255,0.6)', fontWeight: 600, letterSpacing: '1px' }}>{clock}</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 220px', position: 'relative', zIndex: 3 }}>
        {/* LEFT: EEG */}
        <div style={{ padding: '10px 12px', borderRight: compact ? 'none' : '1px solid rgba(108,124,255,0.04)', background: 'rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Picto name="eeg" size={13} glow glowColor="rgba(108,124,255,0.3)" />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 800, color: '#6C7CFF', letterSpacing: '2px' }}>cEEG CONTINU</span>
            <div style={{ width: '1px', height: '10px', background: 'rgba(108,124,255,0.12)' }} />
            <span style={{ fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'rgba(180,180,200,0.3)' }}>{eegBackground}</span>
            <Link href="/neurocore?tab=eeg" style={{ marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px', color: 'rgba(108,124,255,0.4)', textDecoration: 'none' }}>NeuroCore →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {CHANNELS.map((ch, i) => {
              const isSeiz = eegStatus === 'seizure' && (i === 0 || i === 1 || i === 5)
              return (
                <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '38px', textAlign: 'right', fontFamily: 'var(--p-font-mono)', fontSize: '7px', fontWeight: 600,
                    color: isSeiz ? 'rgba(255,71,87,0.6)' : 'rgba(180,180,200,0.25)' }}>{ch.label}</span>
                  <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '2px', overflow: 'hidden',
                    border: isSeiz ? '1px solid rgba(255,71,87,0.12)' : '1px solid rgba(108,124,255,0.025)' }}>
                    {bufs[i] && <Trace data={bufs[i]} color={isSeiz ? '#FF4757' : CH_COLORS[i]} w={trW} h={trH} alert={isSeiz} speed={1.2 + i * 0.08} />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom metrics */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', padding: '8px 12px',
            background: crit ? 'rgba(255,71,87,0.03)' : 'rgba(108,124,255,0.015)',
            borderRadius: 'var(--p-radius-md)', border: `1px solid ${crit ? 'rgba(255,71,87,0.08)' : 'rgba(108,124,255,0.04)'}`,
          }}>
            <Metric label="CRISES/H" value={seizuresPerHour} th={[3, 6]} />
            <div style={{ width: '1px', height: '28px', background: 'rgba(108,124,255,0.06)' }} />
            <Metric label="GCS" value={gcs} suffix="/15" th={[12, 8]} />
            <div style={{ width: '1px', height: '28px', background: 'rgba(108,124,255,0.06)' }} />
            <Metric label="VPS" value={vpsScore} th={[40, 65]} />
            <Link href="/neurocore?tab=redflags" style={{
              marginLeft: 'auto', fontFamily: 'var(--p-font-mono)', fontSize: '8px', fontWeight: 700,
              padding: '5px 12px', borderRadius: '6px', textDecoration: 'none',
              background: 'rgba(255,71,87,0.06)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.12)',
            }}>Red Flags →</Link>
          </div>
        </div>

        {/* RIGHT: VITALS */}
        {!compact && (
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: 'var(--p-font-mono)', fontSize: '7px', fontWeight: 800, color: 'rgba(255,107,138,0.5)', letterSpacing: '2px', marginBottom: '2px' }}>
              CONSTANTES VITALES
            </div>
            {vitals.map((v, i) => <VitalBox key={i} v={v} w={218} />)}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 8. COMMENT LE COMPOSANT EST INTÉGRÉ DANS LE COCKPIT

Le composant est appelé ainsi dans la page `/dashboard` :

```tsx
<BrainMonitor
  patientName="Inès M."
  age="4 ans"
  syndrome="FIRES"
  hospDay={4}
  gcs={6}
  seizuresPerHour={3.3}
  vpsScore={74}
  eegStatus="seizure"
  eegBackground="Fond sévèrement ralenti"
  ncsePossible={true}
  vitals={[
    { label: 'FC', value: '155', unit: 'bpm', color: '#FF6B8A', icon: 'heart',
      severity: 1, waveform: 'ecg', numericValue: 155, range: [60, 180] },
    { label: 'SpO₂', value: '93', unit: '%', color: '#2FD1C8', icon: 'lungs',
      severity: 1, waveform: 'spo2', numericValue: 93, range: [85, 100] },
    { label: 'TEMP', value: '38.5', unit: '°C', color: '#B96BFF', icon: 'thermo',
      severity: 1, waveform: 'flat', numericValue: 38.5, range: [36, 40] },
    { label: 'PA', value: '85/55', unit: 'mmHg', color: '#FFB347', icon: 'blood',
      severity: 0, waveform: 'resp', numericValue: 22, range: [10, 40] },
  ]}
/>
```

---

## 9. LIVRABLE ATTENDU

Produis le fichier `BrainMonitor.tsx` **complet, fonctionnel, prêt à copier-coller**.

**Critères de succès :**
- ✅ Respecte EXACTEMENT le design system PULSAR (couleurs, tokens, fonts)
- ✅ Même interfaces TypeScript et mêmes props
- ✅ Même structure (header / EEG / vitals / metrics)
- ✅ Animations Canvas fluides avec requestAnimationFrame
- ✅ Effets visuels ICU (scanlines, oscilloscope grid, glow)
- ✅ Responsive (compact mode)
- ✅ Visuellement EXCEPTIONNEL — niveau product design d'un outil médical de classe mondiale

**Ce qui peut être amélioré librement :**
- Le layout, les proportions, l'espacement
- L'esthétique des tracés (formes d'onde plus réalistes, animations plus fluides)
- Les effets visuels (nouveaux effets CRT, vignette, phosphor glow, etc.)
- La hiérarchie visuelle (taille des valeurs, contraste, poids)
- Le rendu du Canvas (antialiasing, dégradés, lignes plus élégantes)
- Tout ce qui rend le composant plus beau, plus immersif, plus professionnel

---

*Fin du brief. Produis le code.*
