'use client'
import React from 'react'

export default function NeuronAnimation() {
  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#0D1535' }}>
      <style>{`
        @keyframes n-orbit1  { 0%{transform:rotate(0deg) translateX(140px) rotate(0deg)}  100%{transform:rotate(360deg) translateX(140px) rotate(-360deg)} }
        @keyframes n-orbit2  { 0%{transform:rotate(120deg) translateX(155px) rotate(-120deg)} 100%{transform:rotate(480deg) translateX(155px) rotate(-480deg)} }
        @keyframes n-orbit3  { 0%{transform:rotate(240deg) translateX(125px) rotate(-240deg)} 100%{transform:rotate(600deg) translateX(125px) rotate(-600deg)} }
        @keyframes n-orbit4  { 0%{transform:rotate(60deg) translateX(170px) rotate(-60deg)}  100%{transform:rotate(420deg) translateX(170px) rotate(-420deg)} }
        @keyframes n-orbit5  { 0%{transform:rotate(180deg) translateX(115px) rotate(-180deg)} 100%{transform:rotate(540deg) translateX(115px) rotate(-540deg)} }
        @keyframes n-pulse   { 0%,100%{r:85;opacity:0.9} 50%{r:92;opacity:1} }
        @keyframes n-nfkb    { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes n-ap      { 0%{stroke-dashoffset:300;opacity:0} 30%{opacity:1} 100%{stroke-dashoffset:-300;opacity:0} }
        @keyframes n-ap2     { 0%{stroke-dashoffset:300;opacity:0} 30%{opacity:1} 100%{stroke-dashoffset:-300;opacity:0} }
        @keyframes n-bbb     { 0%,100%{opacity:0.5;transform:scaleX(1)} 50%{opacity:0.9;transform:scaleX(1.03)} }
        @keyframes n-mito    { 0%,100%{opacity:0.4;stroke:#10B981} 50%{opacity:0.9;stroke:#34D399} }
        @keyframes n-synvesc { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.15)} }
        @keyframes n-ranvier { 0%,100%{opacity:0.5;r:5} 50%{opacity:1;r:7} }
        @keyframes n-spine   { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes n-scan    { 0%{transform:translateY(-5px);opacity:0.5} 90%{transform:translateY(905px);opacity:0.1} 100%{transform:translateY(905px);opacity:0} }
        @keyframes n-bbbgap  { 0%,60%{opacity:0.2} 65%,75%{opacity:0.9} 80%,100%{opacity:0.2} }
        @keyframes n-detect  { 0%,100%{opacity:0.6;box-shadow:none} 50%{opacity:1} }
      `}</style>
      <svg viewBox="0 0 1400 900" width="100%" style={{ display:'block' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="n-bg" cx="50%" cy="40%"><stop offset="0%" stopColor="#0D1535"/><stop offset="100%" stopColor="#04070F"/></radialGradient>
          <radialGradient id="n-soma" cx="50%" cy="45%"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="60%" stopColor="#6C7CFF"/><stop offset="100%" stopColor="#3730A3"/></radialGradient>
          <linearGradient id="n-axon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6C7CFF"/><stop offset="100%" stopColor="#2FD1C8"/></linearGradient>
          <filter id="n-glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="n-soft"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="n-big"><feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="n-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#EF4444" opacity="0.8"/></marker>
          <marker id="n-ag" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#10B981" opacity="0.8"/></marker>
        </defs>

        {/* Fond */}
        <rect width="1400" height="900" fill="url(#n-bg)"/>
        <rect x="0" y="0" width="1400" height="2" fill="rgba(108,124,255,0.5)" style={{animation:'n-scan 7s linear infinite'}}/>

        {/* Header */}
        <text x="50" y="52" fontFamily="'JetBrains Mono',monospace" fontSize="11" fontWeight="700" fill="#6C7CFF" letterSpacing="3" opacity="0.7">PULSAR · NEUROCORE · FIRES NEUROINFLAMMATION</text>
        <text x="50" y="85" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="900" fill="#FFFFFF">Cascade neuro-inflammatoire FIRES</text>
        <text x="50" y="112" fontFamily="Arial,sans-serif" fontSize="14" fill="rgba(255,255,255,0.45)">IL-1β × 420% · BHE compromise · Activité épileptique réfractaire</text>

        {/* BHE bande */}
        <rect x="0" y="145" width="1400" height="42" fill="rgba(239,68,68,0.05)" style={{animation:'n-bbb 4s ease-in-out infinite',transformOrigin:'700px 166px'}}/>
        <text x="50" y="163" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#EF4444" letterSpacing="2" opacity="0.7">BARRIÈRE HÉMATO-ENCÉPHALIQUE — COMPROMISE</text>
        <g fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.35)" strokeWidth="1">
          {[20,90,155,230,290,370,425,496,561,636,696,766,831,886,961,1021,1101,1166,1221,1291,1351].map((x,i)=>(
            <rect key={i} x={x} y="172" width={[60,55,65,50,70,45,60,55,65,50,60,55,45,65,50,70,55,45,60,50,45][i]} height="13" rx="3"/>
          ))}
        </g>
        {/* Gaps BHE animés */}
        {[400,780,1150].map((cx,i)=>(
          <g key={i} style={{animation:`n-bbbgap ${2+i*0.7}s ease-in-out ${i*1.1}s infinite`}}>
            <circle cx={cx} cy="179" r="13" fill="rgba(239,68,68,0.4)" filter="url(#n-soft)"/>
            <line x1={cx} y1="170" x2={cx} y2="188" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3,2"/>
          </g>
        ))}

        {/* ── SOMA ── */}
        <g transform="translate(420,530)">
          <circle r="115" fill="rgba(108,124,255,0.06)" filter="url(#n-big)"/>
          <circle r="85" fill="url(#n-soma)" opacity="0.9" filter="url(#n-soft)" style={{animation:'n-pulse 3s ease-in-out infinite',transformOrigin:'0px 0px'}}/>
          <circle r="38" fill="rgba(139,92,246,0.4)" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5"/>
          <circle r="22" fill="rgba(109,40,217,0.5)" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
          <circle cx="5" cy="-5" r="9" fill="rgba(196,181,253,0.5)" stroke="rgba(196,181,253,0.6)" strokeWidth="1"/>
          <circle cx="-12" cy="8" r="4" fill="rgba(196,181,253,0.3)"/>
          <circle cx="14" cy="10" r="3" fill="rgba(196,181,253,0.25)"/>
          {/* Mitochondries animées */}
          <ellipse cx="-50" cy="45" rx="18" ry="9" fill="rgba(16,185,129,0.22)" strokeWidth="1.5" transform="rotate(-30,-50,45)" style={{animation:'n-mito 2.5s ease-in-out infinite',stroke:'#10B981'}}/>
          <ellipse cx="52" cy="40" rx="16" ry="8" fill="rgba(16,185,129,0.18)" strokeWidth="1.5" transform="rotate(20,52,40)" style={{animation:'n-mito 2.5s ease-in-out 1.2s infinite',stroke:'#10B981'}}/>
          {/* RE */}
          <path d="M-60,-20 Q-35,0 -60,20" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5"/>
          <path d="M55,-25 Q30,0 55,25" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5"/>
          {/* NF-κB */}
          <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="9" fontWeight="700" fill="rgba(239,68,68,0.9)" style={{animation:'n-nfkb 2s ease-in-out infinite',transformOrigin:'0px 0px'}}>NF-κB ↑</text>
          <text textAnchor="middle" y="105" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#A78BFA" letterSpacing="1">NEURONE</text>
        </g>

        {/* ── DENDRITES ── */}
        <path d="M345,450 Q280,390 220,320 Q180,270 155,210" fill="none" stroke="#6C7CFF" strokeWidth="7" strokeLinecap="round" opacity="0.7"/>
        <path d="M220,320 Q185,295 160,260" fill="none" stroke="#6C7CFF" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
        <path d="M340,510 Q265,490 190,480 Q145,476 100,462" fill="none" stroke="#6C7CFF" strokeWidth="6" strokeLinecap="round" opacity="0.65"/>
        <path d="M350,610 Q285,660 220,700 Q165,735 120,755" fill="none" stroke="#6C7CFF" strokeWidth="5.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M500,445 Q555,370 600,290 Q635,225 660,165" fill="none" stroke="#6C7CFF" strokeWidth="7.5" strokeLinecap="round" opacity="0.75"/>
        <path d="M600,290 Q640,265 675,245" fill="none" stroke="#6C7CFF" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
        {/* Épines dendritiques animées */}
        {[[278,393,268,378],[253,360,240,348],[554,372,565,358],[578,334,589,319],[602,296,614,280]].map(([x1,y1,x2,y2],i)=>(
          <g key={i} style={{animation:`n-spine 1.8s ease-in-out ${i*0.35}s infinite`,transformOrigin:`${x1}px ${y1}px`}}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8B5CF6" strokeWidth="2.5" opacity="0.8"/>
            <circle cx={x2} cy={y2} r="4.5" fill="#B96BFF"/>
          </g>
        ))}

        {/* ── AXONE + GAINES DE MYÉLINE ── */}
        <path d="M505,540 Q600,540 700,543 Q850,547 1000,552 Q1130,556 1300,558" fill="none" stroke="url(#n-axon)" strokeWidth="12" strokeLinecap="round" opacity="0.85" filter="url(#n-soft)"/>
        {[640,730,818,908,998,1086,1174,1262].map((cx,i)=>(
          <ellipse key={i} cx={cx} cy={545+i*1.5} rx="40" ry="18" fill="rgba(47,209,200,0.15)" stroke="rgba(47,209,200,0.5)" strokeWidth="1.5"
            style={{animation:`n-synvesc 2.2s ease-in-out ${i*0.28}s infinite`,transformOrigin:`${cx}px ${545+i*1.5}px`}}/>
        ))}
        {/* Nœuds de Ranvier */}
        {[685,773,862,951,1040,1129,1218].map((cx,i)=>(
          <circle key={i} cx={cx} cy={547+i} r="5" fill="#FFB347" filter="url(#n-soft)"
            style={{animation:`n-ranvier 1.4s ease-in-out ${i*0.2}s infinite`,transformOrigin:`${cx}px ${547+i}px`}}/>
        ))}
        <text x="850" y="595" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(47,209,200,0.6)" letterSpacing="1">AXONE MYÉLINISÉ</text>

        {/* Potentiels d'action — tirets animés le long de l'axone */}
        {[0,1,2,3].map(i=>(
          <polyline key={i} points={`${600+i*100},${525+i*2} ${610+i*100},${525+i*2} ${614+i*100},${490+i*2} ${620+i*100},${560+i*2} ${626+i*100},${525+i*2} ${636+i*100},${525+i*2}`}
            fill="none" stroke="#EF4444" strokeWidth="2.5" opacity="0.9" filter="url(#n-soft)"
            strokeDasharray="40 260" style={{animation:`n-ap 2.5s linear ${i*0.6}s infinite`}}/>
        ))}

        {/* Terminaison synaptique */}
        <ellipse cx="1340" cy="558" rx="28" ry="20" fill="rgba(47,209,200,0.2)" stroke="rgba(47,209,200,0.6)" strokeWidth="2" filter="url(#n-soft)"/>
        {[[1328,553],[1340,550],[1352,553],[1328,563],[1340,566],[1352,563]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="5" fill="rgba(47,209,200,0.55)" style={{animation:`n-synvesc 1.6s ease-in-out ${i*0.22}s infinite`,transformOrigin:`${cx}px ${cy}px`}}/>
        ))}
        <text x="1340" y="595" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(47,209,200,0.7)" letterSpacing="1">SYNAPSE</text>

        {/* ── MOLÉCULES EN ORBITE AUTOUR DU SOMA ── */}
        {/* IL-1β ×5 */}
        {[
          {delay:'0s',dur:'8s',r:140,color:'#EF4444',fill:'rgba(239,68,68,0.3)',label:'IL-1β',kf:'n-orbit1'},
          {delay:'-2.5s',dur:'9s',r:155,color:'#EF4444',fill:'rgba(239,68,68,0.28)',label:'IL-1β',kf:'n-orbit2'},
          {delay:'-5s',dur:'7.5s',r:125,color:'#EF4444',fill:'rgba(239,68,68,0.25)',label:'IL-1β',kf:'n-orbit3'},
          {delay:'-1s',dur:'10s',r:170,color:'#FFB347',fill:'rgba(255,179,71,0.28)',label:'TNF-α',kf:'n-orbit4'},
          {delay:'-3s',dur:'8.5s',r:115,color:'#B96BFF',fill:'rgba(185,107,255,0.22)',label:'IL-6',kf:'n-orbit5'},
        ].map((m,i)=>(
          <g key={i} transform="translate(420,530)" style={{animation:`${m.kf} ${m.dur} linear ${m.delay} infinite`}}>
            <polygon points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7" fill={m.fill} stroke={m.color} strokeWidth="1.8" filter="url(#n-soft)"/>
            <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="7" fontWeight="700" fill={m.color}>{m.label}</text>
          </g>
        ))}

        {/* Panel stats */}
        <rect x="820" y="240" width="270" height="260" rx="14" fill="rgba(10,14,35,0.88)" stroke="rgba(239,68,68,0.25)" strokeWidth="1.5"/>
        <text x="955" y="272" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#EF4444" letterSpacing="2">BIOMARQUEURS FIRES</text>
        <line x1="840" y1="282" x2="1070" y2="282" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
        {[
          {label:'IL-1β',pct:133,color:'#EF4444',val:'+420%'},
          {label:'BBB perm.',pct:126,color:'#FF6B35',val:'+340%'},
          {label:'Crises/24h',pct:110,color:'#B96BFF',val:'×8'},
          {label:'Microglie',pct:98,color:'#FFB347',val:'ACTIF'},
          {label:'Mort neuro.',pct:80,color:'#6C7CFF',val:'CRITIQUE'},
        ].map((s,i)=>(
          <g key={i} fontFamily="monospace" fontSize="10">
            <text x="845" y={308+i*26} fill="rgba(255,255,255,0.6)">{s.label}</text>
            <rect x="910" y={295+i*26} width="140" height="12" rx="6" fill="rgba(255,255,255,0.06)"/>
            <rect x="910" y={295+i*26} width={s.pct} height="12" rx="6" fill={s.color} opacity="0.75"/>
            <text x="1055" y={307+i*26} fill={s.color} fontWeight="700">{s.val}</text>
          </g>
        ))}
        <rect x="840" y="440" width="210" height="48" rx="9" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5"/>
        <text x="855" y="461" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#EF4444">⚡ STATUS EPILEPTICUS</text>
        <text x="855" y="478" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.5)">Réfractaire · FIRES confirmé</text>

        {/* Alerte PULSAR */}
        <rect x="950" y="680" width="230" height="55" rx="10" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5"/>
        <text x="1065" y="703" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#10B981">✦ PULSAR DETECT</text>
        <text x="1065" y="720" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.5)">Seuil IL-1β franchi · Alerte J+0</text>
        <text x="1065" y="733" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(16,185,129,0.6)">Anakinra recommandé — Fenêtre: 6h</text>
      </svg>
    </div>
  )
}
