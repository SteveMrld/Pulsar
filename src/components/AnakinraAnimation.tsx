'use client'
import React from 'react'

export default function AnakinraAnimation() {
  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#080F1F' }}>
      <style>{`
        @keyframes a-descend  { 0%{transform:translateY(-90px);opacity:0} 15%{opacity:1} 70%{transform:translateY(0px);opacity:1} 85%,100%{transform:translateY(0px);opacity:1} }
        @keyframes a-il1-atk  { 0%,30%{transform:translateY(0px);opacity:0.9} 60%{transform:translateY(30px);opacity:0.6} 80%,100%{transform:translateY(30px);opacity:0.15} }
        @keyframes a-il1-block { 0%,60%{transform:translateY(0);opacity:0.7} 80%,100%{transform:translateY(-25px);opacity:0.2} }
        @keyframes a-nfkb-on  { 0%,40%{fill:rgba(239,68,68,0.9)} 70%,100%{fill:rgba(16,185,129,0.5)} }
        @keyframes a-cascade  { 0%,40%{opacity:0.9;stroke:rgba(239,68,68,0.8)} 70%,100%{opacity:0.2;stroke:rgba(255,255,255,0.1)} }
        @keyframes a-outcome-bad {0%,40%{opacity:1} 70%,100%{opacity:0.15}}
        @keyframes a-outcome-ok {0%,60%{opacity:0} 70%,100%{opacity:1}}
        @keyframes a-rotate   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes a-breathe  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes a-arrow-dash { 0%{stroke-dashoffset:80} 100%{stroke-dashoffset:0} }
        @keyframes a-scan     { 0%{transform:translateY(-2px);opacity:0.5} 90%{transform:translateY(905px);opacity:0.1} 100%{transform:translateY(905px);opacity:0} }
        @keyframes a-pulse-g  { 0%,100%{filter:drop-shadow(0 0 6px #10B981)} 50%{filter:drop-shadow(0 0 18px #10B981)} }
        @keyframes a-shake    { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
      `}</style>
      <svg viewBox="0 0 1400 900" width="100%" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="a-bg" cx="50%" cy="30%"><stop offset="0%" stopColor="#080F1F"/><stop offset="100%" stopColor="#04070F"/></radialGradient>
          <linearGradient id="a-mem" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3730A3"/><stop offset="40%" stopColor="#4C1D95"/><stop offset="60%" stopColor="#6D28D9"/><stop offset="100%" stopColor="#3730A3"/></linearGradient>
          <radialGradient id="a-il1g" cx="40%" cy="35%"><stop offset="0%" stopColor="#FF8C47"/><stop offset="100%" stopColor="#DC2626"/></radialGradient>
          <radialGradient id="a-anag" cx="40%" cy="35%"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#059669"/></radialGradient>
          <filter id="a-glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="a-soft"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="a-ar" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L10,4z" fill="#EF4444" opacity="0.85"/></marker>
          <marker id="a-ag" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L10,4z" fill="#10B981" opacity="0.85"/></marker>
        </defs>

        <rect width="1400" height="900" fill="url(#a-bg)"/>
        <rect x="0" y="0" width="1400" height="2" fill="rgba(16,185,129,0.6)" style={{animation:'a-scan 8s linear infinite'}}/>

        {/* Header */}
        <text x="50" y="48" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#10B981" letterSpacing="3" opacity="0.75">PULSAR · TPE · THERAPEUTIC PROSPECTION ENGINE</text>
        <text x="50" y="80" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="900" fill="#FFFFFF">Mécanisme d'action — Anakinra</text>
        <text x="50" y="108" fontFamily="Arial,sans-serif" fontSize="14" fill="rgba(255,255,255,0.45)">Inhibiteur IL-1R · Blocage cascade neuro-inflammatoire · Score PULSAR : 94/100</text>

        {/* ── PANEL GAUCHE : SANS ANAKINRA ── */}
        <text x="210" y="155" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="rgba(239,68,68,0.85)" letterSpacing="2">SANS ANAKINRA</text>
        <text x="210" y="172" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="11" fill="rgba(255,255,255,0.35)">Cascade inflammatoire active</text>

        {/* Membrane */}
        <path d="M50,260 Q120,250 200,258 Q280,264 360,256" fill="none" stroke="url(#a-mem)" strokeWidth="28" strokeLinecap="round" filter="url(#a-soft)"/>
        <text x="205" y="240" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(139,92,246,0.7)" letterSpacing="1">MEMBRANE</text>

        {/* Récepteur IL-1R gauche — non bloqué */}
        <rect x="168" y="245" width="15" height="50" rx="4" fill="rgba(139,92,246,0.6)" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5"/>
        <path d="M175,245 L155,195 M175,245 L195,195" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M155,195 L140,170 M155,195 L165,168" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M195,195 L185,168 M195,195 L210,170" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M145,175 Q175,158 205,175" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="2" strokeDasharray="4,3"/>
        <path d="M168,295 L150,340 M183,295 L200,340" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="6" strokeLinecap="round"/>
        <path d="M150,340 L140,380 M200,340 L210,380" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="4" strokeLinecap="round"/>
        <text x="175" y="395" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(139,92,246,0.6)">IL-1R</text>

        {/* IL-1β attaque — animée gauche */}
        <g transform="translate(175,120)" style={{animation:'a-il1-atk 4s ease-in-out 0s infinite'}}>
          <ellipse rx="32" ry="28" fill="url(#a-il1g)" opacity="0.9" filter="url(#a-soft)"/>
          <ellipse cx="-10" cy="-8" rx="12" ry="10" fill="rgba(255,140,70,0.4)" opacity="0.8"/>
          <text textAnchor="middle" y="5" fontFamily="monospace" fontSize="10" fontWeight="900" fill="#fff">IL-1β</text>
        </g>
        <line x1="175" y1="152" x2="175" y2="170" stroke="#EF4444" strokeWidth="3" markerEnd="url(#a-ar)" filter="url(#a-soft)"
          style={{animation:'a-cascade 4s ease-in-out 0s infinite'}}/>

        {/* NF-κB gauche — allumé */}
        <rect x="125" y="415" width="100" height="38" rx="8" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" filter="url(#a-soft)" style={{animation:'a-shake 0.4s ease-in-out 0s infinite'}}/>
        <text x="175" y="432" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#EF4444">NF-κB</text>
        <text x="175" y="446" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.7)">ACTIVÉ ↑↑↑</text>
        <line x1="175" y1="395" x2="175" y2="413" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#a-ar)"
          style={{animation:'a-cascade 4s ease-in-out 0s infinite'}}/>

        {/* Cascades gauche */}
        <g transform="translate(175,500)">
          {[-50,0,50].map((dx,i)=>(
            <line key={i} x1={dx} y1="0" x2={dx} y2="40" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5" strokeDasharray="3,3"
              style={{animation:'a-cascade 4s ease-in-out 0s infinite'}}/>
          ))}
          {[{x:-50,label:'IL-6 ↑',sub:'+280%'},{x:0,label:'TNF-α ↑',sub:'+340%'},{x:50,label:'COX-2 ↑',sub:'→ Pain'}].map((b,i)=>(
            <g key={i}>
              <rect x={b.x-35} y="40" width="70" height="35" rx="6" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1" style={{animation:'a-cascade 4s ease-in-out 0s infinite'}}/>
              <text x={b.x} y="57" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="700" fill="#EF4444">{b.label}</text>
              <text x={b.x} y="70" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="rgba(239,68,68,0.6)">{b.sub}</text>
            </g>
          ))}
        </g>

        {/* Outcome gauche */}
        <rect x="105" y="620" width="140" height="50" rx="10" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.5)" strokeWidth="2" filter="url(#a-soft)" style={{animation:'a-outcome-bad 4s ease-in-out 0s infinite'}}/>
        <text x="175" y="643" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#EF4444">⚡ STATUS</text>
        <text x="175" y="659" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(239,68,68,0.7)">EPILEPTICUS</text>

        {/* Séparateurs */}
        <line x1="420" y1="140" x2="420" y2="840" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <line x1="980" y1="140" x2="980" y2="840" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

        {/* Flèches traitement */}
        <path d="M430,440 Q560,440 560,440" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="3" markerEnd="url(#a-ag)" strokeDasharray="8,5"
          style={{animation:'a-arrow-dash 1.5s linear infinite'}}/>
        <text x="495" y="425" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(16,185,129,0.7)" fontWeight="700">TRAITEMENT</text>
        <path d="M845,440 Q960,440 960,440" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="3" markerEnd="url(#a-ag)" strokeDasharray="8,5"
          style={{animation:'a-arrow-dash 1.5s linear 0.75s infinite'}}/>

        {/* ── CENTRE : MOLÉCULE ANAKINRA ── */}
        <text x="700" y="155" textAnchor="middle" fontFamily="monospace" fontSize="13" fontWeight="700" fill="#10B981" letterSpacing="2">ANAKINRA</text>
        <text x="700" y="174" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="11" fill="rgba(255,255,255,0.35)">Antagoniste recombinant IL-1R · 153 aa</text>
        <g transform="translate(700,440)" filter="url(#a-glow)" style={{animation:'a-breathe 3s ease-in-out infinite',transformOrigin:'700px 440px'}}>
          <ellipse rx="90" ry="72" fill="url(#a-anag)" opacity="0.88"/>
          <ellipse cx="-35" cy="-25" rx="22" ry="10" fill="rgba(52,211,153,0.4)" stroke="rgba(110,231,183,0.6)" strokeWidth="1.5" transform="rotate(-25,-35,-25)"/>
          <ellipse cx="35" cy="-20" rx="20" ry="9" fill="rgba(52,211,153,0.35)" stroke="rgba(110,231,183,0.5)" strokeWidth="1.5" transform="rotate(20,35,-20)"/>
          <ellipse cx="0" cy="28" rx="25" ry="10" fill="rgba(52,211,153,0.3)" stroke="rgba(110,231,183,0.5)" strokeWidth="1.5"/>
          <path d="M-70,10 L-50,-15 L-30,0 L-50,15Z" fill="rgba(52,211,153,0.35)" stroke="rgba(110,231,183,0.5)" strokeWidth="1"/>
          <path d="M50,5 L70,-20 L80,0 L70,20Z" fill="rgba(52,211,153,0.3)" stroke="rgba(110,231,183,0.4)" strokeWidth="1"/>
          <path d="M-25,-55 L-15,-40 M0,-60 L0,-44 M25,-55 L15,-40" fill="none" stroke="rgba(110,231,183,0.7)" strokeWidth="3" strokeLinecap="round"/>
          <text textAnchor="middle" y="-72" fontFamily="monospace" fontSize="8" fill="rgba(110,231,183,0.8)" letterSpacing="1">SITE DE LIAISON IL-1R</text>
          <text textAnchor="middle" y="5" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#fff">ANAKINRA</text>
          <text textAnchor="middle" y="20" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.6)">IL-1Ra recombinant</text>
          {/* Halo rotatif */}
          <circle r="110" fill="none" stroke="rgba(52,211,153,0.15)" strokeWidth="2" strokeDasharray="12,8"
            style={{animation:'a-rotate 10s linear infinite',transformOrigin:'0px 0px'}}/>
        </g>
        {/* Info box */}
        <rect x="560" y="580" width="280" height="130" rx="12" fill="rgba(10,14,35,0.9)" stroke="rgba(16,185,129,0.4)" strokeWidth="2"/>
        <text x="700" y="603" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#10B981" letterSpacing="1">PARAMÈTRES CLINIQUES</text>
        <line x1="575" y1="612" x2="825" y2="612" stroke="rgba(16,185,129,0.2)" strokeWidth="1"/>
        {[{k:'Posologie',v:'2–4 mg/kg/j IV',c:'#10B981'},{k:'Fenêtre',v:'6h post-alerte',c:'#FFB347'},{k:'Onset',v:'12–24h',c:'#2FD1C8'},{k:'Score PULSAR',v:'94 / 100',c:'#10B981'},{k:'Indication',v:'FIRES réfractaire',c:'rgba(255,255,255,0.5)'}].map((r,i)=>(
          <g key={i} fontFamily="monospace" fontSize="10">
            <text x="580" y={632+i*18} fill="rgba(255,255,255,0.6)">{r.k}</text>
            <text x="720" y={632+i*18} fill={r.c} fontWeight="700">{r.v}</text>
          </g>
        ))}

        {/* ── PANEL DROIT : AVEC ANAKINRA ── */}
        <text x="1190" y="155" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="rgba(16,185,129,0.85)" letterSpacing="2">AVEC ANAKINRA</text>
        <text x="1190" y="172" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="11" fill="rgba(255,255,255,0.35)">Cascade bloquée</text>

        <path d="M1010,260 Q1090,250 1170,258 Q1250,264 1350,256" fill="none" stroke="url(#a-mem)" strokeWidth="28" strokeLinecap="round" filter="url(#a-soft)" opacity="0.8"/>

        {/* Récepteur bloqué par Anakinra */}
        <rect x="1138" y="245" width="15" height="50" rx="4" fill="rgba(139,92,246,0.5)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5"/>
        <path d="M1145,245 L1125,195 M1145,245 L1165,195" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M1125,195 L1110,170 M1125,195 L1135,168" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M1165,195 L1155,168 M1165,195 L1180,170" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="5" strokeLinecap="round"/>
        {/* Anakinra qui descend et se verrouille */}
        <g style={{animation:'a-descend 4s ease-in-out 0s infinite'}}>
          <ellipse cx="1145" cy="165" rx="34" ry="28" fill="url(#a-anag)" opacity="0.92" filter="url(#a-soft)" style={{animation:'a-pulse-g 2s ease-in-out infinite'}}/>
          <text x="1145" y="160" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#fff">ANA</text>
          <text x="1145" y="173" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.8)">BLOCKED</text>
        </g>
        {/* IL-1β repoussée */}
        <g transform="translate(1095,120)" style={{animation:'a-il1-block 4s ease-in-out 0s infinite'}}>
          <ellipse rx="30" ry="24" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="2"/>
          <text textAnchor="middle" y="5" fontFamily="monospace" fontSize="9" fill="rgba(239,68,68,0.8)">IL-1β</text>
        </g>
        <text x="1113" y="142" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" fill="rgba(239,68,68,0.85)" filter="url(#a-soft)">⊗</text>

        {/* Signalisation intérieure amortie */}
        <path d="M1138,295 L1120,340 M1153,295 L1170,340" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="6" strokeLinecap="round"/>
        <path d="M1120,340 L1110,380 M1170,340 L1180,380" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="4" strokeLinecap="round"/>
        <rect x="1095" y="415" width="100" height="38" rx="8" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"/>
        <text x="1145" y="432" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#10B981" style={{animation:'n-nfkb 2.5s ease-in-out 2s infinite',transformOrigin:'1145px 432px'}}>NF-κB</text>
        <text x="1145" y="446" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(16,185,129,0.7)">INHIBÉ ✓</text>
        <line x1="1145" y1="395" x2="1145" y2="413" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4,3"/>
        <text x="1145" y="405" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="18" fill="rgba(16,185,129,0.7)">⊘</text>

        {/* Cascades droite — atténuées */}
        <g transform="translate(1145,500)">
          {[-50,0,50].map((dx,i)=>(
            <line key={i} x1={dx} y1="0" x2={dx} y2="40" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" strokeDasharray="3,3"/>
          ))}
          {[{x:-50,label:'IL-6 ↓',sub:'−85%'},{x:0,label:'TNF-α ↓',sub:'−72%'},{x:50,label:'COX-2 ↓',sub:'→ Ctrl'}].map((b,i)=>(
            <g key={i}>
              <rect x={b.x-35} y="40" width="70" height="35" rx="6" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
              <text x={b.x} y="57" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="700" fill="#10B981">{b.label}</text>
              <text x={b.x} y="70" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="rgba(16,185,129,0.6)">{b.sub}</text>
            </g>
          ))}
        </g>

        {/* Outcome droit */}
        <rect x="1075" y="620" width="140" height="50" rx="10" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.4)" strokeWidth="2" filter="url(#a-soft)" style={{animation:'a-outcome-ok 4s ease-in-out 0s infinite'}}/>
        <text x="1145" y="643" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#10B981">✓ CRISES</text>
        <text x="1145" y="659" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(16,185,129,0.7)">CONTRÔLÉES</text>

        {/* Légende footer */}
        <rect x="50" y="810" width="1300" height="60" rx="10" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        <g transform="translate(80,835)" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.4)">
          <ellipse cx="15" cy="0" rx="20" ry="12" fill="rgba(239,68,68,0.2)" stroke="#EF4444" strokeWidth="1.5"/><text x="42" y="4">IL-1β</text>
          <ellipse cx="245" cy="0" rx="20" ry="12" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="1.5"/><text x="272" y="4">Anakinra</text>
          <rect x="485" y="-8" width="30" height="18" rx="5" fill="rgba(139,92,246,0.3)" stroke="#8B5CF6" strokeWidth="1.5"/><text x="522" y="4">IL-1R</text>
          <rect x="655" y="-8" width="30" height="18" rx="5" fill="rgba(239,68,68,0.15)" stroke="#EF4444" strokeWidth="1.5"/><text x="692" y="4">NF-κB</text>
        </g>
        <text x="700" y="862" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.15)">PULSAR · Réf: Dinarello CA, NEJM 2018 · NCT03936504 · FIRES consensus 2018</text>
      </svg>
    </div>
  )
}
