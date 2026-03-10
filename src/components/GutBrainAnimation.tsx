'use client'
import React from 'react'

export default function GutBrainAnimation() {
  return (
    <div style={{ width:'100%', borderRadius:12, overflow:'hidden', background:'#07111F' }}>
      <style>{`
        @keyframes gb-signal  { 0%{stroke-dashoffset:800;opacity:0} 5%{opacity:1} 90%{stroke-dashoffset:-200;opacity:1} 100%{stroke-dashoffset:-200;opacity:0} }
        @keyframes gb-signal2 { 0%{stroke-dashoffset:800;opacity:0} 5%{opacity:0.8} 90%{stroke-dashoffset:-200;opacity:0.8} 100%{stroke-dashoffset:-200;opacity:0} }
        @keyframes gb-bacteria { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.15) rotate(8deg)} }
        @keyframes gb-villus  { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06)} }
        @keyframes gb-brain   { 0%,100%{opacity:0.7;filter:drop-shadow(0 0 8px #6C7CFF)} 50%{opacity:1;filter:drop-shadow(0 0 22px #6C7CFF)} }
        @keyframes gb-cytokine { 0%{transform:translate(0,0);opacity:0.9} 100%{transform:translate(180px,-40px);opacity:0} }
        @keyframes gb-cytokine2 { 0%{transform:translate(0,0);opacity:0.9} 100%{transform:translate(200px,20px);opacity:0} }
        @keyframes gb-blood   { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-600} }
        @keyframes gb-inflate { 0%,100%{r:8;opacity:0.5} 50%{r:11;opacity:0.9} }
        @keyframes gb-scan    { 0%{transform:translateY(-2px);opacity:0.4} 90%{transform:translateY(905px);opacity:0.1} 100%{opacity:0} }
        @keyframes gb-mucosal { 0%,100%{opacity:0.5} 50%{opacity:0.85} }
        @keyframes gb-neuron  { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
      `}</style>
      <svg viewBox="0 0 1400 900" width="100%" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gb-bg" cx="50%" cy="35%"><stop offset="0%" stopColor="#07111F"/><stop offset="100%" stopColor="#04070F"/></radialGradient>
          <radialGradient id="gb-gut" cx="50%" cy="50%"><stop offset="0%" stopColor="#1A0A05"/><stop offset="100%" stopColor="#0A0705"/></radialGradient>
          <radialGradient id="gb-brain" cx="50%" cy="50%"><stop offset="0%" stopColor="#0A0519"/><stop offset="100%" stopColor="#070510"/></radialGradient>
          <linearGradient id="gb-vagus" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2FD1C8"/><stop offset="50%" stopColor="#6C7CFF"/><stop offset="100%" stopColor="#B96BFF"/></linearGradient>
          <radialGradient id="gb-bact-g" cx="40%" cy="35%"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#16A34A"/></radialGradient>
          <radialGradient id="gb-bact-r" cx="40%" cy="35%"><stop offset="0%" stopColor="#FF6B6B"/><stop offset="100%" stopColor="#DC2626"/></radialGradient>
          <filter id="gb-glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="gb-soft"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="gb-arc" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L10,4z" fill="#2FD1C8"/></marker>
          <marker id="gb-arp" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L10,4z" fill="#B96BFF"/></marker>
          <marker id="gb-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#EF4444"/></marker>
        </defs>

        <rect width="1400" height="900" fill="url(#gb-bg)"/>
        <rect x="0" y="0" width="1400" height="2" fill="rgba(47,209,200,0.6)" style={{animation:'gb-scan 9s linear infinite'}}/>

        {/* Header */}
        <text x="50" y="48" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#2FD1C8" letterSpacing="3" opacity="0.7">PULSAR · NEUROCORE · AXE MICROBIOTE-INTESTIN-CERVEAU</text>
        <text x="50" y="82" fontFamily="Arial,sans-serif" fontSize="26" fontWeight="900" fill="#FFFFFF">Axe Intestin–Cerveau · Dysbiose FIRES</text>
        <text x="50" y="108" fontFamily="Arial,sans-serif" fontSize="14" fill="rgba(255,255,255,0.4)">Nerf vague · Cytokines circulantes · Perméabilité intestinale · Microbiome</text>

        {/* ── INTESTIN (gauche) ── */}
        <ellipse cx="280" cy="490" rx="230" ry="340" fill="url(#gb-gut)" stroke="rgba(180,80,20,0.4)" strokeWidth="2.5" filter="url(#gb-soft)"/>
        <text x="280" y="155" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="rgba(180,100,40,0.9)" letterSpacing="2">INTESTIN GRÊLE</text>
        <text x="280" y="173" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="10" fill="rgba(255,255,255,0.35)">Dysbiose · Perméabilité ↑</text>

        {/* Villosités intestinales */}
        {[80,130,175,220,265,310,355,400,445].map((x,i)=>(
          <g key={i} style={{animation:`gb-villus ${1.8+i*0.2}s ease-in-out ${i*0.2}s infinite`,transformOrigin:`${x}px 370px`}}>
            <path d={`M${x},370 L${x},${290-i%3*15} Q${x+15},${270-i%2*12} ${x+22},${290-i%3*15} L${x+22},370`}
              fill={`rgba(${140+i*5},${70+i*3},${20+i*2},0.55)`} stroke={`rgba(${180+i*3},${90+i*3},${30},0.5)`} strokeWidth="1"/>
          </g>
        ))}

        {/* Mucus */}
        <ellipse cx="280" cy="368" rx="210" ry="12" fill="rgba(200,150,50,0.15)" stroke="rgba(200,150,50,0.3)" strokeWidth="1.5" style={{animation:'gb-mucosal 3s ease-in-out infinite',transformOrigin:'280px 368px'}}/>
        <text x="280" y="412" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(200,150,50,0.6)" letterSpacing="1">COUCHE MUQUEUSE</text>

        {/* Épithélium */}
        <rect x="65" y="420" width="430" height="20" rx="3" fill="rgba(180,90,30,0.3)" stroke="rgba(200,110,40,0.5)" strokeWidth="1.5"/>
        <text x="280" y="454" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(200,110,40,0.6)" letterSpacing="1">ÉPITHÉLIUM — JONCTIONS COMPROMISES</text>

        {/* Bactéries — bonnes (vert) */}
        {[[110,490],[145,530],[105,565],[155,510],[130,545]].map(([cx,cy],i)=>(
          <g key={i} transform={`translate(${cx},${cy})`} style={{animation:`gb-bacteria ${2+i*0.4}s ease-in-out ${i*0.5}s infinite`,transformOrigin:'0px 0px'}}>
            <ellipse rx="14" ry="9" fill="url(#gb-bact-g)" opacity="0.85" filter="url(#gb-soft)"/>
            <ellipse cx="-5" cy="-3" rx="5" ry="3" fill="rgba(74,222,128,0.4)"/>
            {i%2===0 && <><line x1="-14" y1="0" x2="-20" y2="-4" stroke="rgba(74,222,128,0.6)" strokeWidth="1.5"/><line x1="14" y1="0" x2="20" y2="4" stroke="rgba(74,222,128,0.6)" strokeWidth="1.5"/></>}
          </g>
        ))}
        <text x="135" y="615" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(74,222,128,0.7)">Bifidobacterium ↓</text>

        {/* Bactéries — pathogènes (rouge) */}
        {[[320,490],[360,520],[295,555],[380,498],[340,545]].map(([cx,cy],i)=>(
          <g key={i} transform={`translate(${cx},${cy})`} style={{animation:`gb-bacteria ${1.6+i*0.3}s ease-in-out ${i*0.4}s infinite`,transformOrigin:'0px 0px'}}>
            <ellipse rx="13" ry="8" fill="url(#gb-bact-r)" opacity="0.9" filter="url(#gb-soft)"/>
            <ellipse cx="-4" cy="-2" rx="4" ry="3" fill="rgba(255,107,107,0.4)"/>
            <line x1="-13" y1="0" x2="-19" y2="-5" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="13" y1="0" x2="19" y2="5" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="0" y1="-8" x2="0" y2="-14" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
          </g>
        ))}
        <text x="340" y="615" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.7)">Pathobiontes ↑</text>

        {/* Cytokines qui partent de l'intestin */}
        {[
          {cx:420,cy:460,label:'IL-6',col:'#B96BFF',kf:'gb-cytokine'},
          {cx:430,cy:510,label:'LPS',col:'#FF6B35',kf:'gb-cytokine2'},
          {cx:415,cy:555,label:'IL-1β',col:'#EF4444',kf:'gb-cytokine'},
        ].map((m,i)=>(
          <g key={i} transform={`translate(${m.cx},${m.cy})`} style={{animation:`${m.kf} 3.5s ease-out ${i*1.1}s infinite`}}>
            <circle r="10" fill={`rgba(${m.col==='#EF4444'?'239,68,68':m.col==='#B96BFF'?'185,107,255':'255,107,53'},0.35)`} stroke={m.col} strokeWidth="1.5" filter="url(#gb-soft)"/>
            <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="7" fontWeight="700" fill={m.col}>{m.label}</text>
          </g>
        ))}

        {/* ── NERF VAGUE (centre) ── */}
        <path d="M405,450 Q480,400 540,440 Q600,480 660,430 Q720,380 780,420 Q840,460 900,420 Q960,380 1000,430"
          fill="none" stroke="url(#gb-vagus)" strokeWidth="8" strokeLinecap="round" opacity="0.7" filter="url(#gb-soft)"/>
        {/* Signal ascendant animé */}
        <path d="M405,450 Q480,400 540,440 Q600,480 660,430 Q720,380 780,420 Q840,460 900,420 Q960,380 1000,430"
          fill="none" stroke="rgba(47,209,200,0.9)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray="30,600" markerEnd="url(#gb-arc)"
          style={{animation:'gb-signal 3s linear 0s infinite'}}/>
        {/* Signal descendant */}
        <path d="M1000,430 Q960,380 900,420 Q840,460 780,420 Q720,380 660,430 Q600,480 540,440 Q480,400 405,450"
          fill="none" stroke="rgba(185,107,255,0.7)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="25,600" markerEnd="url(#gb-arp)"
          style={{animation:'gb-signal2 3s linear 1.5s infinite'}}/>
        <text x="700" y="370" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="rgba(47,209,200,0.8)" letterSpacing="2">NERF VAGUE (X)</text>
        <text x="700" y="386" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.3)">Afférences 80% · Efférences 20%</text>

        {/* Vaisseau sanguin (cytokines systémiques) */}
        <path d="M420,550 Q560,550 700,550 Q840,550 1000,550" fill="none" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" opacity="0.55"/>
        <path d="M420,550 Q560,550 700,550 Q840,550 1000,550" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="14" opacity="0.3"/>
        <path d="M420,550 Q560,550 700,550 Q840,550 1000,550" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="3"
          strokeDasharray="20,580" style={{animation:'gb-blood 2s linear infinite'}}/>
        <text x="700" y="580" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.5)" letterSpacing="2">CIRCULATION SYSTÉMIQUE · LPS · IL-6 · IL-1β</text>

        {/* Ganglion entérique */}
        <g transform="translate(450,490)">
          <circle r="22" fill="rgba(108,124,255,0.2)" stroke="#6C7CFF" strokeWidth="1.5" style={{animation:'gb-neuron 2.5s ease-in-out infinite',transformOrigin:'0px 0px'}}/>
          <circle r="10" fill="rgba(108,124,255,0.4)" stroke="rgba(108,124,255,0.6)" strokeWidth="1"/>
          <text textAnchor="middle" y="-28" fontFamily="monospace" fontSize="7" fill="rgba(108,124,255,0.8)">Plexus</text>
          <text textAnchor="middle" y="-18" fontFamily="monospace" fontSize="7" fill="rgba(108,124,255,0.8)">mésentérique</text>
        </g>

        {/* ── CERVEAU (droite) ── */}
        <ellipse cx="1180" cy="490" rx="195" ry="290" fill="url(#gb-brain)" stroke="rgba(108,124,255,0.3)" strokeWidth="2" filter="url(#gb-soft)"/>
        <text x="1180" y="155" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="700" fill="rgba(108,124,255,0.9)" letterSpacing="2">CERVEAU</text>
        <text x="1180" y="173" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="10" fill="rgba(255,255,255,0.35)">Neuroinflammation · FIRES</text>

        {/* Circonvolutions cérébrales */}
        {[
          "M1010,350 Q1040,330 1070,350 Q1100,370 1130,345 Q1160,320 1190,345",
          "M1030,420 Q1065,400 1100,418 Q1135,436 1165,410 Q1195,384 1230,410",
          "M1020,490 Q1055,470 1090,490 Q1125,510 1160,488 Q1195,466 1230,490",
          "M1030,560 Q1065,540 1100,562 Q1135,584 1165,558 Q1200,532 1240,560",
          "M1045,630 Q1080,610 1115,630 Q1150,650 1180,628 Q1210,606 1245,630",
        ].map((d,i)=>(
          <path key={i} d={d} fill="none" stroke={`rgba(108,124,255,${0.3-i*0.03})`} strokeWidth="8" strokeLinecap="round"/>
        ))}

        {/* Hotspots d'inflammation */}
        {[[1090,380,14],[1160,450,12],[1110,530,16],[1200,500,10]].map(([cx,cy,r],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(239,68,68,0.25)" filter="url(#gb-glow)"
            style={{animation:`gb-inflate ${1.8+i*0.5}s ease-in-out ${i*0.6}s infinite`,transformOrigin:`${cx}px ${cy}px`}}/>
        ))}

        {/* Microglie activée */}
        {[[1150,410],[1200,480],[1130,560]].map(([cx,cy],i)=>(
          <g key={i} transform={`translate(${cx},${cy})`} filter="url(#gb-soft)"
            style={{animation:`gb-bacteria 2.5s ease-in-out ${i*0.8}s infinite`,transformOrigin:'0px 0px'}}>
            <ellipse rx="10" ry="7" fill="rgba(239,68,68,0.3)" stroke="#EF4444" strokeWidth="1.2"/>
            <line x1="10" y1="0" x2="17" y2="-4" stroke="#EF4444" strokeWidth="1.5"/>
            <line x1="-10" y1="0" x2="-17" y2="4" stroke="#EF4444" strokeWidth="1.5"/>
            <line x1="0" y1="-7" x2="2" y2="-13" stroke="#EF4444" strokeWidth="1.5"/>
          </g>
        ))}
        <text x="1180" y="640" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.7)">Microglie M1 · Neuroinflammation</text>

        {/* Neurone cible */}
        <g transform="translate(1200,700)" style={{animation:'gb-brain 3s ease-in-out infinite',transformOrigin:'1200px 700px'}}>
          <circle r="25" fill="rgba(108,124,255,0.15)" stroke="rgba(108,124,255,0.5)" strokeWidth="2"/>
          <circle r="12" fill="rgba(108,124,255,0.3)" stroke="rgba(108,124,255,0.6)" strokeWidth="1"/>
          <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="8" fill="#A78BFA">Glu↑↑</text>
        </g>
        <text x="1200" y="738" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(185,107,255,0.7)">Excitotoxicité</text>

        {/* Stat panel */}
        <rect x="560" y="680" width="280" height="155" rx="12" fill="rgba(10,14,35,0.9)" stroke="rgba(47,209,200,0.3)" strokeWidth="1.5"/>
        <text x="700" y="704" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#2FD1C8" letterSpacing="1">AXE INTESTIN–CERVEAU</text>
        <line x1="575" y1="714" x2="825" y2="714" stroke="rgba(47,209,200,0.2)" strokeWidth="1"/>
        {[{k:'Dysbiose',v:'Sévère',c:'#EF4444'},{k:'Perméabilité',v:'+240%',c:'#FF6B35'},{k:'LPS systémique',v:'↑↑',c:'#FFB347'},{k:'Nerf vague',v:'Hyperactivé',c:'#B96BFF'},{k:'Neuroinflam.',v:'Active',c:'#EF4444'}].map((r,i)=>(
          <g key={i} fontFamily="monospace" fontSize="10">
            <text x="580" y={732+i*18} fill="rgba(255,255,255,0.55)">{r.k}</text>
            <text x="750" y={732+i*18} fill={r.c} fontWeight="700">{r.v}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
