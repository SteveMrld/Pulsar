'use client'

import React from 'react'

/* ═══════════════════════════════════════════════════════════════
   PULSAR · BBB ANIMATION — Barrière Hémato-Encéphalique FIRES
   SVG React animé — globules, leucocytes, molécules, diapédèse
   ═══════════════════════════════════════════════════════════════ */

export default function BBBAnimation({ compact = false }: { compact?: boolean }) {
  const vb = '0 0 1400 900'
  const scale = compact ? 0.6 : 1

  return (
    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#04070F' }}>
      <style>{`
        @keyframes flowRight {
          0%   { transform: translateX(-80px); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(1480px); opacity: 0; }
        }
        @keyframes flowRight2 {
          0%   { transform: translateX(-80px); opacity: 0; }
          8%   { opacity: 0.85; }
          92%  { opacity: 0.85; }
          100% { transform: translateX(1480px); opacity: 0; }
        }
        @keyframes dropMolecule {
          0%   { transform: translateY(0px);  opacity: 0.9; }
          80%  { transform: translateY(60px); opacity: 0.8; }
          100% { transform: translateY(70px); opacity: 0; }
        }
        @keyframes diapedesis {
          0%   { transform: translateY(0px) scaleX(1);   opacity: 0; }
          5%   { opacity: 0.9; }
          40%  { transform: translateY(-40px) scaleX(1.15); opacity: 0.9; }
          70%  { transform: translateY(-78px) scaleX(1.2);  opacity: 0.8; }
          90%  { transform: translateY(-90px) scaleX(1);   opacity: 0.4; }
          100% { transform: translateY(-95px) scaleX(1);   opacity: 0; }
        }
        @keyframes leukRoll {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(180px); }
        }
        @keyframes gliaPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.12); }
        }
        @keyframes tjGap {
          0%, 30% { stroke-dashoffset: 0;  stroke: rgba(139,92,246,0.8); }
          50%     { stroke-dashoffset: 8;  stroke: rgba(239,68,68,0.5); }
          70%     { stroke-dashoffset: 16; stroke: rgba(239,68,68,0.2); }
          100%    { stroke-dashoffset: 0;  stroke: rgba(139,92,246,0.8); }
        }
        @keyframes moleculePulse {
          0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
          50%       { filter: drop-shadow(0 0 12px currentColor); }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-2px); opacity: 0.6; }
          85%  { transform: translateY(900px); opacity: 0.15; }
          100% { transform: translateY(900px); opacity: 0; }
        }
        @keyframes neuronFire {
          0%, 80%, 100% { opacity: 0.15; }
          85%            { opacity: 0.9; }
        }
        @keyframes vcamBounce {
          0%, 100% { r: 4; opacity: 0.5; }
          50%       { r: 5.5; opacity: 0.9; }
        }
        @keyframes astroRetract {
          0%, 100% { opacity: 0.45; transform: scaleX(1);    }
          50%       { opacity: 0.25; transform: scaleX(0.85); }
        }
        @keyframes pericyteContract {
          0%, 100% { transform: scaleX(1); }
          50%       { transform: scaleX(0.88); }
        }
      `}</style>

      <svg viewBox={vb} width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="bbb-bg" cx="50%" cy="35%">
            <stop offset="0%" stopColor="#07101F"/>
            <stop offset="100%" stopColor="#04070F"/>
          </radialGradient>
          <linearGradient id="bbb-vessel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9"/>
            <stop offset="50%" stopColor="#EF4444" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.9"/>
          </linearGradient>
          <filter id="bbb-glow">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="bbb-soft">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="bbb-bigred">
            <feGaussianBlur stdDeviation="16" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="bbb-arrR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" opacity="0.85"/>
          </marker>
          <marker id="bbb-arrG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#10B981" opacity="0.85"/>
          </marker>
          {/* Globule rouge shape */}
          <g id="rbc">
            <ellipse rx="16" ry="10" fill="rgba(220,38,38,0.75)" stroke="rgba(239,68,68,0.9)" strokeWidth="1.2"/>
            <ellipse rx="7" ry="4" fill="rgba(150,0,0,0.4)"/>
          </g>
          {/* Petite molécule générique */}
          <g id="mol-il1b">
            <polygon points="0,-10 9,-4 9,6 0,11 -9,6 -9,-4" fill="rgba(239,68,68,0.6)" stroke="#EF4444" strokeWidth="1.5"/>
            <text textAnchor="middle" y="3" fontFamily="monospace" fontSize="6" fill="#fff">IL-1β</text>
          </g>
          <clipPath id="bbb-lumen-clip">
            <rect x="60" y="270" width="1280" height="350"/>
          </clipPath>
        </defs>

        {/* Fond */}
        <rect width="1400" height="900" fill="url(#bbb-bg)"/>

        {/* Scanline animée */}
        <rect x="0" y="0" width="1400" height="2"
          fill="linear-gradient(90deg,transparent,rgba(108,124,255,0.4),rgba(47,209,200,0.5),rgba(108,124,255,0.4),transparent)"
          style={{ animation: 'scanLine 6s linear infinite' }}/>

        {/* ── HEADER ── */}
        <text x="50" y="48" fontFamily="'JetBrains Mono', monospace" fontSize="11" fontWeight="700"
          fill="#EF4444" letterSpacing="3" opacity="0.75">
          PULSAR · NEUROCORE · BARRIÈRE HÉMATO-ENCÉPHALIQUE
        </text>
        <text x="50" y="80" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="#FFFFFF">
          BHE — Architecture &amp; Compromission FIRES
        </text>
        <text x="50" y="108" fontFamily="Arial, sans-serif" fontSize="14" fill="rgba(255,255,255,0.45)">
          Jonctions serrées · Pied astrocytaire · Péricyte · LPS · IL-1β · Infiltration leucocytaire
        </text>

        {/* ── VAISSEAU ── */}
        <rect x="60" y="180" width="1280" height="90" fill="url(#bbb-vessel)" opacity="0.8"/>
        <rect x="60" y="620" width="1280" height="90" fill="url(#bbb-vessel)" opacity="0.8"/>
        <rect x="60" y="270" width="1280" height="350" fill="rgba(150,0,0,0.06)"/>

        {/* Lignes de flux sanguin statiques */}
        <path d="M60,345 Q350,330 700,350 Q1050,370 1340,345" fill="none" stroke="rgba(239,68,68,0.07)" strokeWidth="22"/>
        <path d="M60,420 Q350,405 700,420 Q1050,440 1340,420" fill="none" stroke="rgba(239,68,68,0.07)" strokeWidth="22"/>
        <path d="M60,495 Q350,480 700,500 Q1050,520 1340,495" fill="none" stroke="rgba(239,68,68,0.06)" strokeWidth="20"/>

        {/* Label lumen */}
        <text x="700" y="448" textAnchor="middle" fontFamily="monospace" fontSize="13" fontWeight="700"
          fill="rgba(239,68,68,0.25)" letterSpacing="4">LUMEN SANGUIN</text>
        <text x="700" y="465" textAnchor="middle" fontFamily="monospace" fontSize="9"
          fill="rgba(239,68,68,0.15)">LPS · Cytokines · Leucocytes · VEGF</text>

        {/* ════ GLOBULES ROUGES ANIMÉS ════ */}
        {/* Ligne haute */}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={`rbc-h-${i}`} transform={`translate(0, 320)`}
            style={{ animation: `flowRight ${3.5 + i * 0.7}s linear ${i * -1.2}s infinite` }}>
            <use href="#rbc" transform={`translate(${180 + i * 60}, 0) rotate(${i % 2 === 0 ? 10 : -8})`}/>
          </g>
        ))}
        {/* Ligne centrale */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={`rbc-m-${i}`} transform={`translate(0, 410)`}
            style={{ animation: `flowRight2 ${4 + i * 0.6}s linear ${i * -0.9}s infinite` }}>
            <use href="#rbc" transform={`translate(${100 + i * 70}, 0) rotate(${i % 2 === 0 ? -5 : 15})`}/>
          </g>
        ))}
        {/* Ligne basse */}
        {[0, 1, 2, 3].map(i => (
          <g key={`rbc-l-${i}`} transform={`translate(0, 500)`}
            style={{ animation: `flowRight ${3 + i * 0.8}s linear ${i * -1.5}s infinite` }}>
            <use href="#rbc" transform={`translate(${250 + i * 90}, 0) rotate(${i % 2 === 0 ? 20 : -12})`}/>
          </g>
        ))}

        {/* ════ CELLULES ENDOTHÉLIALES ════ */}
        {/* Zone normale (gauche) */}
        <g opacity="0.95">
          <path d="M80,260 Q115,250 150,255 Q160,257 160,270 L160,200 Q160,188 150,185 Q115,180 80,188 Q68,192 68,205 Z"
            fill="rgba(139,92,246,0.3)" stroke="rgba(139,92,246,0.6)" strokeWidth="1.8"/>
          <ellipse cx="115" cy="225" rx="18" ry="10" fill="rgba(109,40,217,0.45)" stroke="rgba(139,92,246,0.5)" strokeWidth="1.2"/>

          <path d="M160,260 Q198,250 235,255 Q246,257 246,270 L246,200 Q246,188 235,185 Q198,180 160,188 Q148,192 148,205 Z"
            fill="rgba(139,92,246,0.28)" stroke="rgba(139,92,246,0.55)" strokeWidth="1.8"/>
          <ellipse cx="198" cy="225" rx="18" ry="10" fill="rgba(109,40,217,0.4)" stroke="rgba(139,92,246,0.45)" strokeWidth="1.2"/>

          <path d="M246,260 Q282,250 318,255 Q330,257 330,270 L330,200 Q330,188 318,185 Q282,180 246,188 Q234,192 234,205 Z"
            fill="rgba(139,92,246,0.28)" stroke="rgba(139,92,246,0.55)" strokeWidth="1.8"/>
          <ellipse cx="282" cy="225" rx="18" ry="10" fill="rgba(109,40,217,0.38)" stroke="rgba(139,92,246,0.45)" strokeWidth="1.2"/>

          {/* Tight junctions — animées zone normale */}
          {[68, 160, 246, 330].map((x, i) => (
            <line key={i} x1={x} y1="200" x2={x} y2="270"
              stroke="rgba(139,92,246,0.85)" strokeWidth="3"
              style={{ animation: `tjGap 8s ease-in-out ${i * 1.5}s infinite` }}/>
          ))}

          {/* Glycocalyx (cils) zone normale */}
          <g stroke="rgba(47,209,200,0.5)" strokeWidth="1">
            {[85,95,105,115,125,135,145,166,178,190,202,214,226,238,252,264,276,288,300,312,324].map((x,i)=>(
              <line key={i} x1={x} y1="270" x2={x-5} y2="287"/>
            ))}
          </g>
        </g>

        {/* Labels zone intacte */}
        <rect x="80" y="148" width="270" height="28" rx="6" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5"/>
        <text x="215" y="167" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#10B981">
          ✓ ZONE INTACTE — TJ fonctionnelles
        </text>

        {/* ════ ZONE FIRES — PERTURBÉE ════ */}
        <rect x="380" y="140" width="620" height="620" fill="rgba(239,68,68,0.035)" filter="url(#bbb-bigred)"/>

        {/* Cellule activée 1 */}
        <path d="M340,265 Q378,248 415,257 Q430,260 432,275 L432,195 Q432,182 415,178 Q378,172 340,180 Q326,184 326,198 Z"
          fill="rgba(239,68,68,0.25)" stroke="rgba(239,68,68,0.6)" strokeWidth="2" filter="url(#bbb-soft)"/>
        <ellipse cx="378" cy="224" rx="19" ry="11" fill="rgba(185,28,28,0.4)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5"/>
        <text x="378" y="228" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="rgba(239,68,68,0.9)"
          style={{ animation: 'moleculePulse 2s ease-in-out infinite' }}>NFκB</text>

        {/* GAP — jonctions rompues */}
        <rect x="430" y="155" width="50" height="125" rx="4" fill="rgba(239,68,68,0.08)"
          stroke="rgba(239,68,68,0.6)" strokeWidth="2.5" strokeDasharray="6,4"
          style={{ animation: 'moleculePulse 3s ease-in-out infinite' }}/>
        <text x="455" y="175" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#EF4444">GAP</text>
        <text x="455" y="190" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="rgba(239,68,68,0.7)">TJ ↓↓</text>

        {/* ── MOLÉCULES QUI TOMBENT À TRAVERS LE GAP ── */}
        {/* IL-1β */}
        <g style={{ animation: 'dropMolecule 2.8s ease-in 0s infinite' }}>
          <polygon points="455,198 465,208 462,223 455,228 448,223 445,208"
            fill="rgba(239,68,68,0.7)" stroke="#EF4444" strokeWidth="1.5"/>
          <text x="455" y="218" textAnchor="middle" fontFamily="monospace" fontSize="6.5" fill="#fff">IL-1β</text>
          <line x1="455" y1="230" x2="455" y2="268" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#bbb-arrR)"/>
        </g>

        {/* LPS */}
        <g style={{ animation: 'dropMolecule 3.2s ease-in 1.1s infinite' }}>
          <circle cx="510" cy="210" r="14" fill="rgba(255,107,53,0.5)" stroke="#FF6B35" strokeWidth="1.5"/>
          <text x="510" y="214" textAnchor="middle" fontFamily="monospace" fontSize="7.5" fill="#fff">LPS</text>
          <line x1="510" y1="225" x2="510" y2="265" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#bbb-arrR)"/>
        </g>

        {/* TNF-α */}
        <g style={{ animation: 'dropMolecule 2.5s ease-in 1.9s infinite' }}>
          <polygon points="575,200 585,208 585,220 575,226 565,220 565,208"
            fill="rgba(255,179,71,0.5)" stroke="#FFB347" strokeWidth="1.5"/>
          <text x="575" y="217" textAnchor="middle" fontFamily="monospace" fontSize="6.5" fill="#fff">TNF-α</text>
          <line x1="575" y1="228" x2="575" y2="268" stroke="#FFB347" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#bbb-arrR)"/>
        </g>

        {/* Cellule activée 2 — VCAM-1 */}
        <path d="M545,268 Q583,248 620,257 Q638,261 640,278 L640,196 Q640,183 620,178 Q583,172 545,181 Q530,185 530,200 Z"
          fill="rgba(239,68,68,0.22)" stroke="rgba(239,68,68,0.55)" strokeWidth="2" filter="url(#bbb-soft)"/>
        <ellipse cx="583" cy="226" rx="20" ry="12" fill="rgba(185,28,28,0.38)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5"/>
        {/* VCAM-1 dots animés */}
        {[548,560,572,584,596,608,620,632].map((cx,i)=>(
          <circle key={i} cx={cx} cy={272+(i%2)*2} r="4"
            fill="rgba(239,68,68,0.6)" stroke="rgba(239,68,68,0.8)" strokeWidth="1"
            style={{ animation: `vcamBounce 1.6s ease-in-out ${i*0.18}s infinite` }}/>
        ))}
        <text x="590" y="295" textAnchor="middle" fontFamily="monospace" fontSize="7.5" fill="rgba(239,68,68,0.8)">
          VCAM-1 ↑
        </text>

        {/* ── NEUTROPHILE ROLLING ── */}
        <g style={{ animation: 'leukRoll 6s linear 0s infinite' }}>
          <ellipse cx="500" cy="365" rx="22" ry="16" fill="rgba(185,107,255,0.4)" stroke="#B96BFF" strokeWidth="2" filter="url(#bbb-soft)"/>
          <circle cx="490" cy="363" r="7" fill="rgba(109,40,217,0.5)" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5"/>
          <circle cx="505" cy="360" r="6" fill="rgba(109,40,217,0.5)" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5"/>
          <circle cx="516" cy="365" r="5.5" fill="rgba(109,40,217,0.5)" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5"/>
        </g>
        <text x="590" y="405" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(185,107,255,0.7)">Neutrophile · Rolling</text>

        {/* ── MONOCYTE DIAPÉDÈSE ANIMÉE ── */}
        <g style={{ animation: 'diapedesis 5s ease-in-out 0s infinite' }}>
          <ellipse cx="800" cy="308" rx="25" ry="20" fill="rgba(239,68,68,0.45)" stroke="#EF4444" strokeWidth="2.5" filter="url(#bbb-soft)"/>
          <ellipse cx="800" cy="308" rx="12" ry="9" fill="rgba(185,28,28,0.5)" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5"/>
        </g>
        <text x="800" y="350" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.8)">Monocyte</text>
        <text x="820" y="230" fontFamily="monospace" fontSize="8" fontWeight="700" fill="rgba(239,68,68,0.7)">DIAPÉDÈSE</text>

        {/* Labels zone FIRES */}
        <rect x="380" y="140" width="350" height="28" rx="6" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.45)" strokeWidth="1.5"/>
        <text x="555" y="159" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#EF4444">
          ✗ ZONE FIRES — BHE COMPROMISE
        </text>

        {/* ════ PIEDS ASTROCYTAIRES ════ */}
        <text x="700" y="658" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700"
          fill="rgba(255,179,71,0.7)" letterSpacing="2">PIEDS ASTROCYTAIRES</text>

        {/* Pieds normaux */}
        <g fill="rgba(255,179,71,0.18)" stroke="rgba(255,179,71,0.45)" strokeWidth="1.8">
          <path d="M80,620 Q130,638 160,630 Q180,623 185,614 L185,620 Q185,622 180,625 Q160,632 130,640 Q100,648 80,630 Z"/>
          <path d="M185,620 Q240,638 270,630 Q290,623 295,614 L295,620 Q295,622 290,625 Q270,632 240,640 Q205,648 185,630 Z"/>
          <path d="M295,620 Q348,638 378,630 Q398,623 403,614 L403,620 Q403,622 398,625 Q378,632 348,640 Q310,648 295,630 Z"/>
          {/* Pieds rétractés zone FIRES — animation */}
          <path d="M403,620 Q458,642 488,630 Q512,620 518,612 L518,620 Q516,625 510,628 Q488,636 458,644 Q418,652 403,632 Z"
            fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)"
            style={{ animation: 'astroRetract 4s ease-in-out 0s infinite', transformOrigin: '460px 630px' }}/>
          <path d="M518,620 Q568,645 600,630 Q625,618 630,608 L630,616 Q627,622 620,626 Q598,636 568,646 Q530,656 518,635 Z"
            fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.35)"
            style={{ animation: 'astroRetract 4s ease-in-out 0.8s infinite', transformOrigin: '574px 630px' }}/>
          <path d="M630,622 Q680,648 710,635 Q738,622 742,612 L742,620 Q738,626 728,630 Q706,640 675,650 Q640,660 630,640 Z"
            fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" strokeDasharray="4,3"
            style={{ animation: 'astroRetract 4s ease-in-out 1.6s infinite', transformOrigin: '686px 635px' }}/>
        </g>
        <text x="686" y="678" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.6)">
          Pieds rétractés ↓ — Perte soutien vasculaire
        </text>

        {/* ── PÉRICYTE ANIMÉ ── */}
        <g style={{ animation: 'pericyteContract 5s ease-in-out 0s infinite', transformOrigin: '900px 640px' }}>
          <ellipse cx="900" cy="640" rx="40" ry="18" fill="rgba(47,209,200,0.18)" stroke="rgba(47,209,200,0.5)" strokeWidth="2" filter="url(#bbb-soft)"/>
          <path d="M860,640 Q820,630 785,635" fill="none" stroke="rgba(47,209,200,0.45)" strokeWidth="3" strokeLinecap="round"/>
          <path d="M940,640 Q975,632 1008,637" fill="none" stroke="rgba(47,209,200,0.45)" strokeWidth="3" strokeLinecap="round"/>
          <path d="M900,622 Q905,600 912,580" fill="none" stroke="rgba(47,209,200,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
          <text x="900" y="644" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="700" fill="rgba(47,209,200,0.9)">Péricyte</text>
        </g>
        <text x="900" y="718" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.35)">
          Contraction · PDGF-β ↓
        </text>

        {/* ════ PARENCHYME ════ */}
        <rect x="60" y="710" width="1280" height="150" fill="rgba(108,124,255,0.025)"/>
        <text x="700" y="745" textAnchor="middle" fontFamily="monospace" fontSize="11"
          fill="rgba(108,124,255,0.18)" letterSpacing="4">PARENCHYME CÉRÉBRAL</text>

        {/* Microglie M1 activée — pulsation */}
        <g transform="translate(300,775)" filter="url(#bbb-soft)"
          style={{ animation: 'gliaPulse 2.2s ease-in-out 0s infinite', transformOrigin: '0px 0px' }}>
          <ellipse rx="15" ry="11" fill="rgba(239,68,68,0.35)" stroke="#EF4444" strokeWidth="1.5"/>
          <line x1="15" y1="0" x2="27" y2="-5" stroke="#EF4444" strokeWidth="2"/>
          <line x1="15" y1="0" x2="27" y2="5" stroke="#EF4444" strokeWidth="2"/>
          <line x1="-15" y1="0" x2="-27" y2="-4" stroke="#EF4444" strokeWidth="2"/>
          <line x1="0" y1="-11" x2="3" y2="-22" stroke="#EF4444" strokeWidth="2"/>
          <line x1="0" y1="11" x2="-3" y2="22" stroke="#EF4444" strokeWidth="2"/>
          <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="6.5" fill="#fff">MG</text>
        </g>
        <text x="300" y="812" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.6)">
          Microglie M1 activée
        </text>

        {/* Neurone excitotoxique — flash */}
        <g transform="translate(700,770)"
          style={{ animation: 'neuronFire 3s ease-in-out 0.5s infinite', transformOrigin: '0px 0px' }}>
          <circle r="22" fill="rgba(255,179,71,0.2)" stroke="rgba(255,179,71,0.5)" strokeWidth="2"/>
          <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="8" fill="rgba(255,179,71,0.9)">Glu↑↑</text>
        </g>
        <text x="700" y="810" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(255,179,71,0.6)">
          Excitotoxicité
        </text>

        {/* IL-1β dans parenchyme */}
        <g transform="translate(1100,775)" filter="url(#bbb-soft)"
          style={{ animation: 'gliaPulse 3s ease-in-out 1s infinite', transformOrigin: '0px 0px' }}>
          <polygon points="0,-14 12,-5 12,7 0,14 -12,7 -12,-5" fill="rgba(239,68,68,0.35)" stroke="#EF4444" strokeWidth="1.5"/>
          <text textAnchor="middle" y="4" fontFamily="monospace" fontSize="7" fill="#fff">IL-1β</text>
        </g>
        <text x="1100" y="810" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(239,68,68,0.6)">
          Neuroinflammation
        </text>

        {/* ════ STATS MARQUEURS ════ */}
        <rect x="900" y="148" width="460" height="110" rx="12" fill="rgba(10,14,35,0.92)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5"/>
        <text x="1130" y="172" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#EF4444">
          MARQUEURS BHE — FIRES
        </text>
        <line x1="915" y1="180" x2="1345" y2="180" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
        <g fontFamily="monospace" fontSize="9" fill="rgba(255,255,255,0.55)">
          <text x="920" y="198">Claudine-5</text>
          <text x="1060" y="198" fill="#EF4444" fontWeight="700">−68% ↓↓</text>
          <rect x="1100" y="189" width="230" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
          <rect x="1100" y="189" width="74" height="10" rx="5" fill="#EF4444" opacity="0.7"/>

          <text x="920" y="216">Occludine</text>
          <text x="1060" y="216" fill="#EF4444" fontWeight="700">−55% ↓↓</text>
          <rect x="1100" y="207" width="230" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
          <rect x="1100" y="207" width="103" height="10" rx="5" fill="#FF6B35" opacity="0.7"/>

          <text x="920" y="234">ZO-1</text>
          <text x="1060" y="234" fill="#EF4444" fontWeight="700">−42% ↓↓</text>
          <rect x="1100" y="225" width="230" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
          <rect x="1100" y="225" width="133" height="10" rx="5" fill="#FFB347" opacity="0.7"/>

          <text x="920" y="252">VCAM-1</text>
          <text x="1060" y="252" fill="#10B981" fontWeight="700">+380% ↑↑</text>
          <rect x="1100" y="243" width="230" height="10" rx="5" fill="rgba(255,255,255,0.04)"/>
          <rect x="1100" y="243" width="215" height="10" rx="5" fill="rgba(16,185,129,0.55)"/>
        </g>
      </svg>
    </div>
  )
}
