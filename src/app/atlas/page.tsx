'use client';

import { useState } from 'react';

const illustrations = [
  { id: 1, title: 'Barrière Hémato-Encéphalique', subtitle: 'BHE — FIRES vs Normal', tag: 'FIRES · Neuroinflammation' },
  { id: 2, title: 'Tempête Cytokinique', subtitle: 'Cascade inflammatoire IL-6 / TNF-α / IL-1β', tag: 'Cytokines · Immunologie' },
  { id: 3, title: 'Neurone Pyramidal', subtitle: 'Sain vs FIRES — Dépolarisation pathologique', tag: 'Neurologie · FIRES' },
  { id: 4, title: 'Microglie', subtitle: 'M0 ramifiée vs M1 amiboïde activée', tag: 'Neuroimmunologie' },
  { id: 5, title: 'Lymphocyte T CD8+', subtitle: 'Synapse immunologique — activation cytotoxique', tag: 'Immunologie · T CD8+' },
  { id: 6, title: 'Astrocyte GFAP+', subtitle: 'Homéostatique vs Réactif (gliose)', tag: 'Gliose · GFAP+' },
  { id: 7, title: 'Réseau Épileptique', subtitle: 'Foyer ictal + propagation + tracé EEG', tag: 'Épilepsie · EEG' },
  { id: 8, title: 'IRM T2 FLAIR', subtitle: 'Normal vs FIRES — Hypersignaux thalamiques', tag: 'Neuroimagerie · IRM' },
];

function IllusBHE() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <defs>
        <linearGradient id="bhe-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0f1a"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="480" height="320" fill="url(#bhe-bg)"/>
      <text x="240" y="22" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">BARRIÈRE HÉMATO-ENCÉPHALIQUE</text>
      <text x="120" y="42" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">NORMAL</text>
      <rect x="20" y="50" width="200" height="250" rx="8" fill="#1e3a5f" fillOpacity="0.2" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.4"/>
      <ellipse cx="120" cy="130" rx="35" ry="60" fill="none" stroke="#ef4444" strokeWidth="2"/>
      <ellipse cx="120" cy="130" rx="28" ry="52" fill="#7f1d1d" fillOpacity="0.4"/>
      {[0,1,2,3,4,5,6,7].map(i => {
        const angle = (i / 8) * Math.PI * 2;
        const x = 120 + 35 * Math.cos(angle);
        const y = 130 + 60 * Math.sin(angle);
        return <ellipse key={i} cx={x} cy={y} rx="5" ry="3.5" fill="#0ea5e9" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="0.5" transform={`rotate(${(angle * 180/Math.PI) + 90} ${x} ${y})`}/>;
      })}
      <text x="120" y="105" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">jonctions serrées</text>
      <ellipse cx="165" cy="115" rx="12" ry="8" fill="#a78bfa" fillOpacity="0.7" stroke="#8b5cf6" strokeWidth="1"/>
      <text x="165" y="100" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace">Péricyte</text>
      <path d="M85,175 Q70,165 65,155 Q60,145 75,140 Q90,135 95,150 Q100,165 85,175Z" fill="#10b981" fillOpacity="0.5" stroke="#10b981" strokeWidth="0.8"/>
      <text x="62" y="185" fill="#10b981" fontSize="7" fontFamily="monospace">Astrocyte</text>
      <circle cx="120" cy="215" r="18" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1"/>
      <circle cx="120" cy="215" r="8" fill="#0ea5e9" fillOpacity="0.6"/>
      <text x="120" y="250" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">Neurone protégé</text>
      <circle cx="45" cy="115" r="4" fill="#ef4444" fillOpacity="0.6"/>
      <circle cx="50" cy="140" r="4" fill="#ef4444" fillOpacity="0.6"/>
      <circle cx="48" cy="160" r="4" fill="#ef4444" fillOpacity="0.6"/>
      <text x="25" y="195" fill="#ef4444" fontSize="6.5" fontFamily="monospace">cytokines</text>
      <text x="22" y="203" fill="#ef4444" fontSize="6.5" fontFamily="monospace">bloquées</text>
      <text x="360" y="42" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="monospace">FIRES — Rupture BHE</text>
      <rect x="260" y="50" width="200" height="250" rx="8" fill="#7f1d1d" fillOpacity="0.1" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.6"/>
      <ellipse cx="360" cy="130" rx="35" ry="60" fill="none" stroke="#ef4444" strokeWidth="2"/>
      <ellipse cx="360" cy="130" rx="28" ry="52" fill="#7f1d1d" fillOpacity="0.6"/>
      {[0,1,2,3,4,5,6,7].map(i => {
        const angle = (i / 8) * Math.PI * 2;
        const jitter = (i % 3 === 0) ? 6 : 0;
        const x = 360 + (35+jitter) * Math.cos(angle);
        const y = 130 + (60+jitter) * Math.sin(angle);
        return <ellipse key={i} cx={x} cy={y} rx="5" ry="3.5" fill="#ef4444" fillOpacity="0.7" stroke="#f87171" strokeWidth="0.5" transform={`rotate(${(angle * 180/Math.PI) + 90 + (i%2===0?15:-10)} ${x} ${y})`}/>;
      })}
      <path d="M330,78 L326,88" stroke="#fbbf24" strokeWidth="2"/>
      <text x="298" y="82" fill="#fbbf24" fontSize="7" fontFamily="monospace">brèche</text>
      <circle cx="310" cy="150" r="5" fill="#f59e0b" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="0.5"/>
      <circle cx="318" cy="165" r="5" fill="#f59e0b" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="0.5"/>
      <circle cx="308" cy="178" r="5" fill="#f59e0b" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="0.5"/>
      <text x="284" y="200" fill="#f59e0b" fontSize="6.5" fontFamily="monospace">Lympho T</text>
      <circle cx="360" cy="215" r="18" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5"/>
      <circle cx="360" cy="215" r="8" fill="#ef4444" fillOpacity="0.8"/>
      <path d="M355,200 L358,205 L353,210 L357,215" stroke="#fbbf24" strokeWidth="1.5" fill="none"/>
      <text x="360" y="250" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace">Neurone activé</text>
      <circle cx="398" cy="115" r="4" fill="#ef4444" fillOpacity="0.9"/>
      <circle cx="405" cy="140" r="4" fill="#ef4444" fillOpacity="0.9"/>
      <circle cx="400" cy="160" r="4" fill="#ef4444" fillOpacity="0.9"/>
      <text x="405" y="195" fill="#ef4444" fontSize="6.5" fontFamily="monospace">cytokines</text>
      <text x="407" y="203" fill="#ef4444" fontSize="6.5" fontFamily="monospace">infiltrent</text>
    </svg>
  );
}

function IllusCytokines() {
  const cytokines = [
    { angle: 0,   label: 'IL-6',   color: '#f59e0b', dist: 100 },
    { angle: 45,  label: 'TNF-α',  color: '#ef4444', dist: 110 },
    { angle: 90,  label: 'IL-1β',  color: '#f87171', dist: 105 },
    { angle: 135, label: 'IFN-γ',  color: '#a78bfa', dist: 108 },
    { angle: 180, label: 'IL-17',  color: '#38bdf8', dist: 100 },
    { angle: 225, label: 'IL-18',  color: '#34d399', dist: 112 },
    { angle: 270, label: 'CXCL10', color: '#fb923c', dist: 105 },
    { angle: 315, label: 'MCP-1',  color: '#e879f9', dist: 100 },
  ];
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <rect width="480" height="320" fill="#1a0a0a"/>
      <text x="240" y="18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">TEMPÊTE CYTOKINIQUE — CASCADE INFLAMMATOIRE</text>
      <circle cx="240" cy="165" r="80" fill="#ef4444" fillOpacity="0.15"/>
      <circle cx="240" cy="165" r="30" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="240" y="161" textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="monospace">Foyer</text>
      <text x="240" y="172" textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="monospace">inflamm.</text>
      {cytokines.map(({ angle, label, color, dist }) => {
        const rad = angle * Math.PI / 180;
        const x1 = 240 + 32 * Math.cos(rad);
        const y1 = 165 + 32 * Math.sin(rad);
        const x2 = 240 + dist * Math.cos(rad);
        const y2 = 165 + dist * Math.sin(rad);
        const lx = 240 + (dist + 22) * Math.cos(rad);
        const ly = 165 + (dist + 22) * Math.sin(rad);
        return (
          <g key={label}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.8"/>
            <circle cx={x2} cy={y2} r="5" fill={color} fillOpacity="0.85"/>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="8.5" fontFamily="monospace" fontWeight="bold">{label}</text>
          </g>
        );
      })}
      <ellipse cx="110" cy="80" rx="22" ry="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5"/>
      <circle cx="110" cy="80" r="7" fill="#f59e0b" fillOpacity="0.6"/>
      <text x="110" y="65" textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontFamily="monospace">Macrophage M1</text>
      <circle cx="370" cy="80" r="18" fill="#1e293b" stroke="#a78bfa" strokeWidth="1.5"/>
      <circle cx="370" cy="80" r="8" fill="#a78bfa" fillOpacity="0.6"/>
      <text x="370" y="62" textAnchor="middle" fill="#a78bfa" fontSize="7.5" fontFamily="monospace">Lympho T Th17</text>
      <rect x="66" y="232" width="80" height="28" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5"/>
      <text x="106" y="247" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">Endothélium</text>
      <text x="106" y="257" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">↑ ICAM-1</text>
      <circle cx="375" cy="255" r="20" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5"/>
      <circle cx="375" cy="255" r="9" fill="#ef4444" fillOpacity="0.7"/>
      <text x="375" y="282" textAnchor="middle" fill="#ef4444" fontSize="7.5" fontFamily="monospace">Neurone hyperexcitable</text>
      <rect x="175" y="272" width="130" height="42" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1"/>
      <text x="240" y="284" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">EFFETS SYSTÉMIQUES</text>
      <text x="240" y="295" textAnchor="middle" fill="#ef4444" fontSize="6.5" fontFamily="monospace">↑ Perméab. BHE · ↑ Excitabilité</text>
      <text x="240" y="306" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontFamily="monospace">Boucle auto-amplificatrice</text>
    </svg>
  );
}

function IllusNeurone() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <rect width="480" height="320" fill="#050c18"/>
      <text x="240" y="18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">NEURONE PYRAMIDAL — Sain vs FIRES</text>
      <text x="115" y="35" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">NORMAL</text>
      <line x1="115" y1="80" x2="115" y2="45" stroke="#0ea5e9" strokeWidth="1.5"/>
      <line x1="115" y1="65" x2="95" y2="50" stroke="#0ea5e9" strokeWidth="1"/>
      <line x1="115" y1="65" x2="135" y2="50" stroke="#0ea5e9" strokeWidth="1"/>
      <polygon points="115,80 95,125 135,125" fill="#1e3a5f" stroke="#0ea5e9" strokeWidth="1.5"/>
      <circle cx="115" cy="108" r="12" fill="#0a2240" stroke="#38bdf8" strokeWidth="1"/>
      <circle cx="115" cy="108" r="5" fill="#0ea5e9" fillOpacity="0.7"/>
      <line x1="115" y1="125" x2="85" y2="148" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.7"/>
      <line x1="115" y1="125" x2="100" y2="148" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.7"/>
      <line x1="115" y1="125" x2="115" y2="148" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.7"/>
      <line x1="115" y1="125" x2="130" y2="148" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.7"/>
      <line x1="115" y1="125" x2="145" y2="148" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.7"/>
      <line x1="115" y1="148" x2="115" y2="200" stroke="#38bdf8" strokeWidth="1.5"/>
      <ellipse cx="115" cy="158" rx="7" ry="3" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="115" cy="170" rx="7" ry="3" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="115" cy="182" rx="7" ry="3" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="115" cy="194" rx="7" ry="3" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5"/>
      <circle cx="105" cy="210" r="4" fill="#0ea5e9" fillOpacity="0.7"/>
      <circle cx="115" cy="215" r="4" fill="#0ea5e9" fillOpacity="0.7"/>
      <circle cx="125" cy="210" r="4" fill="#0ea5e9" fillOpacity="0.7"/>
      <text x="50" y="168" fill="#38bdf8" fontSize="7" fontFamily="monospace">PA normal</text>
      <polyline points="50,180 55,180 60,165 65,195 70,180 80,180" fill="none" stroke="#38bdf8" strokeWidth="1.5"/>
      <rect x="75" y="94" width="12" height="20" rx="2" fill="#0ea5e9" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="0.8"/>
      <text x="81" y="120" textAnchor="middle" fill="#38bdf8" fontSize="6" fontFamily="monospace">Na+</text>
      <rect x="140" y="94" width="12" height="20" rx="2" fill="#10b981" fillOpacity="0.4" stroke="#34d399" strokeWidth="0.8"/>
      <text x="146" y="120" textAnchor="middle" fill="#34d399" fontSize="6" fontFamily="monospace">K+</text>
      <text x="115" y="240" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">Inhibition GABA efficace ✓</text>
      <line x1="235" y1="25" x2="235" y2="310" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="365" y="35" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="monospace">FIRES — Hyperexcitabilité</text>
      <line x1="365" y1="80" x2="365" y2="45" stroke="#ef4444" strokeWidth="2"/>
      <line x1="365" y1="65" x2="345" y2="50" stroke="#ef4444" strokeWidth="1.5"/>
      <line x1="365" y1="65" x2="385" y2="50" stroke="#ef4444" strokeWidth="1.5"/>
      <circle cx="348" cy="58" r="3" fill="#ef4444" fillOpacity="0.8"/>
      <circle cx="382" cy="62" r="3" fill="#ef4444" fillOpacity="0.8"/>
      <polygon points="365,80 345,125 385,125" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2"/>
      <circle cx="365" cy="108" r="12" fill="#450a0a" stroke="#f87171" strokeWidth="1.5"/>
      <circle cx="365" cy="108" r="5" fill="#ef4444" fillOpacity="0.9"/>
      <path d="M360,85 L363,92 L357,99 L361,106" stroke="#fbbf24" strokeWidth="2" fill="none"/>
      <line x1="365" y1="125" x2="330" y2="148" stroke="#ef4444" strokeWidth="1" opacity="0.9"/>
      <line x1="365" y1="125" x2="347" y2="148" stroke="#ef4444" strokeWidth="1" opacity="0.9"/>
      <line x1="365" y1="125" x2="365" y2="148" stroke="#ef4444" strokeWidth="1" opacity="0.9"/>
      <line x1="365" y1="125" x2="383" y2="148" stroke="#ef4444" strokeWidth="1" opacity="0.9"/>
      <line x1="365" y1="125" x2="400" y2="148" stroke="#ef4444" strokeWidth="1" opacity="0.9"/>
      <line x1="365" y1="148" x2="365" y2="200" stroke="#ef4444" strokeWidth="2"/>
      <ellipse cx="365" cy="158" rx="7" ry="3" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6"/>
      <ellipse cx="365" cy="170" rx="7" ry="3" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6"/>
      <ellipse cx="365" cy="182" rx="7" ry="3" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6"/>
      <ellipse cx="365" cy="194" rx="7" ry="3" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6"/>
      <circle cx="355" cy="210" r="5" fill="#ef4444" fillOpacity="0.9"/>
      <circle cx="365" cy="215" r="5" fill="#ef4444" fillOpacity="0.9"/>
      <circle cx="375" cy="210" r="5" fill="#ef4444" fillOpacity="0.9"/>
      <text x="295" y="168" fill="#f87171" fontSize="7" fontFamily="monospace">PA répétitifs</text>
      <polyline points="295,180 298,180 301,160 304,200 307,160 310,200 313,160 316,200 319,180 330,180" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
      <rect x="325" y="94" width="12" height="20" rx="2" fill="#ef4444" fillOpacity="0.6" stroke="#f87171" strokeWidth="1"/>
      <text x="327" y="120" fill="#f87171" fontSize="6" fontFamily="monospace">↑Na+</text>
      <rect x="390" y="94" width="12" height="20" rx="2" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1"/>
      <text x="392" y="120" fill="#fbbf24" fontSize="6" fontFamily="monospace">↓K+</text>
      <text x="365" y="240" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace">Déficit GABA · Excès Glutamate</text>
    </svg>
  );
}

function IllusMicroglie() {
  const procNorm = [
    [120,160,80,100],[120,160,60,130],[120,160,65,170],
    [120,160,80,210],[120,160,120,220],[120,160,165,215],
    [120,160,175,175],[120,160,178,140],[120,160,163,105],[120,160,140,90],
  ];
  const procMids = [
    [92,118],[75,138],[75,162],[92,198],[120,210],
    [150,205],[162,172],[162,148],[148,118],[132,102],
  ];
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <rect width="480" height="320" fill="#050f0a"/>
      <text x="240" y="18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">MICROGLIE — M0 Ramifiée vs M1 Amiboïde</text>
      <text x="120" y="38" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">M0 — RAMIFIÉE</text>
      <text x="120" y="50" textAnchor="middle" fill="#6b7280" fontSize="7.5" fontFamily="monospace">état de surveillance</text>
      <ellipse cx="120" cy="160" rx="18" ry="16" fill="#052e16" stroke="#10b981" strokeWidth="1.5"/>
      <ellipse cx="120" cy="160" rx="8" ry="7" fill="#10b981" fillOpacity="0.5"/>
      {procNorm.map(([x1,y1,x2,y2], i) => (
        <g key={i}>
          <path d={`M${x1},${y1} Q${procMids[i][0]},${procMids[i][1]} ${x2},${y2}`} fill="none" stroke="#10b981" strokeWidth="1" opacity="0.7"/>
          <circle cx={x2} cy={y2} r="2.5" fill="#34d399" opacity="0.8"/>
        </g>
      ))}
      <rect x="55" y="258" width="130" height="52" rx="4" fill="#052e16" stroke="#10b981" strokeWidth="0.8"/>
      <text x="120" y="270" textAnchor="middle" fill="#34d399" fontSize="7.5" fontFamily="monospace">Morphologie ramifiée</text>
      <text x="120" y="281" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">Processus fins · surveillance</text>
      <text x="120" y="292" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">Faible sécrétion cytokinique</text>
      <text x="120" y="303" textAnchor="middle" fill="#10b981" fontSize="6.5" fontFamily="monospace">↔ Phagocytose basale</text>
      <line x1="235" y1="25" x2="235" y2="315" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="240" y="155" textAnchor="middle" fill="#f59e0b" fontSize="9">→</text>
      <text x="240" y="167" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontFamily="monospace">activation FIRES</text>
      <text x="360" y="38" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="monospace">M1 — AMIBOÏDE</text>
      <text x="360" y="50" textAnchor="middle" fill="#6b7280" fontSize="7.5" fontFamily="monospace">état inflammatoire actif</text>
      <ellipse cx="360" cy="155" rx="35" ry="30" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2"/>
      <ellipse cx="360" cy="155" rx="16" ry="14" fill="#ef4444" fillOpacity="0.6"/>
      <circle cx="360" cy="155" r="7" fill="#fca5a5" fillOpacity="0.5"/>
      {[0,60,120,180,240,300].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <path key={i} d={`M${360+35*Math.cos(rad)},${155+30*Math.sin(rad)} L${360+42*Math.cos(rad)},${155+37*Math.sin(rad)}`} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>;
      })}
      {[
        [310,100,'IL-6'],[395,95,'TNF-α'],[420,145,'IL-1β'],
        [415,180,'NO·'],[310,185,'ROS'],[330,95,'IL-12'],
      ].map(([x,y,label]) => (
        <g key={String(label)}>
          <circle cx={Number(x)} cy={Number(y)} r="5" fill="#f59e0b" fillOpacity="0.7" stroke="#fbbf24" strokeWidth="0.5"/>
          <text x={Number(x)} y={Number(y)+11} textAnchor="middle" fill="#fbbf24" fontSize="6.5" fontFamily="monospace">{label}</text>
        </g>
      ))}
      <rect x="295" y="258" width="130" height="52" rx="4" fill="#450a0a" stroke="#ef4444" strokeWidth="0.8"/>
      <text x="360" y="270" textAnchor="middle" fill="#f87171" fontSize="7.5" fontFamily="monospace">Corps arrondi amiboïde</text>
      <text x="360" y="281" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">Pseudopodes rétractés</text>
      <text x="360" y="292" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontFamily="monospace">↑↑ TNF-α · IL-6 · ROS</text>
      <text x="360" y="303" textAnchor="middle" fill="#ef4444" fontSize="6.5" fontFamily="monospace">Neurotoxicité ++</text>
    </svg>
  );
}

function IllusLymphoT() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <rect width="480" height="320" fill="#0a0f1a"/>
      <text x="240" y="18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">LYMPHOCYTE T CD8+ — Synapse Immunologique</text>
      <ellipse cx="240" cy="165" rx="160" ry="120" fill="#7c3aed" fillOpacity="0.08"/>
      <ellipse cx="360" cy="165" rx="75" ry="65" fill="#1a0f0f" stroke="#ef4444" strokeWidth="1.5"/>
      <ellipse cx="360" cy="165" rx="45" ry="38" fill="#7f1d1d" fillOpacity="0.5"/>
      <circle cx="360" cy="165" r="18" fill="#450a0a" stroke="#f87171" strokeWidth="1"/>
      <text x="360" y="163" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace">Neurone</text>
      <text x="360" y="174" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">FIRES</text>
      {[[-30,0],[20,-25],[30,20],[-10,30]].map(([dx,dy],i) => (
        <g key={i}>
          <rect x={360+dx-6} y={165+dy-4} width="12" height="8" rx="2" fill="#fbbf24" fillOpacity="0.7" stroke="#f59e0b" strokeWidth="0.5"/>
          <text x={360+dx} y={165+dy+11} textAnchor="middle" fill="#fbbf24" fontSize="5.5" fontFamily="monospace">MHC-I</text>
        </g>
      ))}
      <circle cx="145" cy="165" r="52" fill="#1e1245" stroke="#8b5cf6" strokeWidth="2"/>
      <circle cx="145" cy="165" r="32" fill="#2d1b69" fillOpacity="0.8"/>
      <circle cx="145" cy="165" r="16" fill="#7c3aed" fillOpacity="0.6"/>
      <circle cx="145" cy="162" r="7" fill="#a78bfa" fillOpacity="0.7"/>
      <text x="145" y="148" textAnchor="middle" fill="#c4b5fd" fontSize="7.5" fontFamily="monospace">T CD8+</text>
      <text x="145" y="159" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontFamily="monospace">CTL</text>
      <ellipse cx="240" cy="165" rx="25" ry="55" fill="#1e1b4b" stroke="#6d28d9" strokeWidth="1.5" strokeDasharray="3,2"/>
      <text x="240" y="108" textAnchor="middle" fill="#818cf8" fontSize="7" fontFamily="monospace">Synapse IS</text>
      {[[218,145],[225,160],[220,175],[232,150],[228,168]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#f59e0b" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="0.5"/>
      ))}
      <text x="195" y="200" fill="#fbbf24" fontSize="6.5" fontFamily="monospace">Perforine</text>
      <text x="198" y="208" fill="#fbbf24" fontSize="6.5" fontFamily="monospace">Granzymes</text>
      <line x1="230" y1="155" x2="268" y2="155" stroke="#f59e0b" strokeWidth="1.5"/>
      <line x1="231" y1="165" x2="268" y2="165" stroke="#f59e0b" strokeWidth="1.5"/>
      <line x1="230" y1="175" x2="268" y2="175" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="318" y="108" fill="#ef4444" fontSize="7" fontFamily="monospace">Apoptose · Caspase 3/9</text>
      <line x1="20" y1="300" x2="460" y2="300" stroke="#1e293b" strokeWidth="0.5"/>
      <text x="240" y="314" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="monospace">TCR reconnaît peptide MHC-I · Dégranulation cytotoxique · Mort cellulaire programmée</text>
    </svg>
  );
}

function IllusAstrocyte() {
  const procHomeo = [
    {angle:0,len:50},{angle:30,len:58},{angle:60,len:52},{angle:90,len:55},
    {angle:120,len:48},{angle:150,len:56},{angle:180,len:50},{angle:210,len:54},
    {angle:240,len:58},{angle:270,len:50},{angle:300,len:52},{angle:330,len:55},
  ];
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <rect width="480" height="320" fill="#050f0a"/>
      <text x="240" y="18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">ASTROCYTE GFAP+ — Homéostatique vs Réactif</text>
      <text x="120" y="38" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">HOMÉOSTATIQUE</text>
      <circle cx="120" cy="150" r="22" fill="#052e16" stroke="#10b981" strokeWidth="1.5"/>
      <circle cx="120" cy="150" r="10" fill="#10b981" fillOpacity="0.4"/>
      <text x="120" y="153" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontFamily="monospace">GFAP</text>
      {procHomeo.map(({angle, len}, i) => {
        const rad = angle * Math.PI / 180;
        const x2 = 120 + len * Math.cos(rad);
        const y2 = 150 + len * Math.sin(rad);
        const mx = 120 + len * 0.5 * Math.cos(rad) + Math.cos(rad + Math.PI/2) * 8;
        const my = 150 + len * 0.5 * Math.sin(rad) + Math.sin(rad + Math.PI/2) * 8;
        return (
          <g key={i}>
            <path d={`M120,150 Q${mx},${my} ${x2},${y2}`} fill="none" stroke="#10b981" strokeWidth={i % 2 === 0 ? 1.2 : 0.8} opacity="0.7"/>
            <circle cx={x2} cy={y2} r="2" fill="#34d399" opacity="0.6"/>
          </g>
        );
      })}
      <circle cx="78" cy="115" r="8" fill="#1e3a5f" stroke="#0ea5e9" strokeWidth="1"/>
      <circle cx="164" cy="120" r="8" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1"/>
      <path d="M86,115 Q120,100 156,120" stroke="#34d399" strokeWidth="1.2" fill="none" strokeDasharray="3,1"/>
      <rect x="55" y="238" width="130" height="60" rx="4" fill="#052e16" stroke="#10b981" strokeWidth="0.8"/>
      <text x="120" y="250" textAnchor="middle" fill="#34d399" fontSize="7.5" fontFamily="monospace">Fonctions protectrices</text>
      <text x="120" y="261" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">↔ Glutamate recapture</text>
      <text x="120" y="271" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">↔ K⁺ tamponnage</text>
      <text x="120" y="281" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">↔ Synaptogenèse</text>
      <text x="120" y="291" textAnchor="middle" fill="#10b981" fontSize="6.5" fontFamily="monospace">✓ BHE maintenance</text>
      <line x1="235" y1="25" x2="235" y2="310" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="360" y="38" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="monospace">RÉACTIF — Gliose A1</text>
      <circle cx="360" cy="150" r="30" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2"/>
      <circle cx="360" cy="150" r="15" fill="#ef4444" fillOpacity="0.5"/>
      <text x="360" y="147" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace">GFAP↑↑</text>
      <text x="360" y="158" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">S100β↑</text>
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <path key={i} d={`M${360+28*Math.cos(rad)},${150+28*Math.sin(rad)} L${360+40*Math.cos(rad)},${150+38*Math.sin(rad)}`} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>;
      })}
      {[[310,95,'C3'],[395,90,'LCN2'],[420,145,'CXCL10'],[305,170,'IL-33']].map(([x,y,label]) => (
        <g key={String(label)}>
          <ellipse cx={Number(x)} cy={Number(y)} rx="14" ry="9" fill="#7f1d1d" stroke="#f87171" strokeWidth="1" opacity="0.8"/>
          <text x={Number(x)} y={Number(y)+3} textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">{label}</text>
        </g>
      ))}
      <rect x="295" y="238" width="130" height="60" rx="4" fill="#450a0a" stroke="#ef4444" strokeWidth="0.8"/>
      <text x="360" y="250" textAnchor="middle" fill="#f87171" fontSize="7.5" fontFamily="monospace">Dysfonctions</text>
      <text x="360" y="261" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">↑ Glutamate synaptique</text>
      <text x="360" y="271" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">↑ Perméabilité BHE</text>
      <text x="360" y="281" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontFamily="monospace">↑ Neuroinflamm. C3</text>
      <text x="360" y="291" textAnchor="middle" fill="#ef4444" fontSize="6.5" fontFamily="monospace">✗ Soutien synaptique ↓</text>
    </svg>
  );
}

const reseauNodes = [
  {x:100,y:90,r:12,c:'#ef4444'},{x:190,y:75,r:9,c:'#f59e0b'},
  {x:280,y:85,r:8,c:'#f59e0b'},{x:160,y:120,r:7,c:'#f97316'},
  {x:250,y:115,r:7,c:'#f97316'},{x:340,y:90,r:8,c:'#fbbf24'},
  {x:380,y:110,r:7,c:'#fbbf24'},{x:310,y:125,r:6,c:'#fbbf24'},
  {x:420,y:85,r:6,c:'#a3e635'},
];
const reseauEdges: number[][] = [[0,1],[0,3],[1,2],[1,3],[2,4],[3,4],[4,5],[4,6],[5,6],[5,7],[6,7],[7,8],[5,8]];

function IllusReseau() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <rect width="480" height="320" fill="#050810"/>
      <text x="240" y="18" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">RÉSEAU ÉPILEPTIQUE + TRACÉ EEG — FIRES</text>
      <path d="M30,35 Q80,25 150,35 Q220,45 240,38 Q280,28 360,35 Q420,40 450,35 L450,140 Q420,160 360,155 Q300,148 240,155 Q180,162 120,155 Q70,150 30,140 Z" fill="#0a1628" stroke="#1e3a5f" strokeWidth="1" opacity="0.8"/>
      <text x="240" y="52" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">CORTEX CÉRÉBRAL</text>
      {reseauEdges.map(([a,b],i) => {
        const na = reseauNodes[a], nb = reseauNodes[b];
        return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={na.c} strokeWidth={a===0||b===0?2:1.2} opacity="0.5" strokeDasharray={a===0?"0":"3,2"}/>;
      })}
      {reseauNodes.map((n,i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.c} fillOpacity={i===0?0.9:0.6} stroke={n.c} strokeWidth="1"/>
          {i===0 && <circle cx={n.x} cy={n.y} r={n.r+6} fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeDasharray="2,1"/>}
        </g>
      ))}
      <text x="100" y="78" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace">Foyer ictal</text>
      <path d="M112,90 Q150,80 178,76" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="4,2"/>
      <rect x="30" y="148" width="160" height="52" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8"/>
      <circle cx="44" cy="159" r="5" fill="#ef4444"/>
      <text x="52" y="162" fill="#ef4444" fontSize="7" fontFamily="monospace">Foyer ictal primaire</text>
      <circle cx="44" cy="172" r="5" fill="#f59e0b"/>
      <text x="52" y="175" fill="#f59e0b" fontSize="7" fontFamily="monospace">Zone irritante</text>
      <circle cx="44" cy="185" r="5" fill="#f97316"/>
      <text x="52" y="188" fill="#f97316" fontSize="7" fontFamily="monospace">Propagation secondaire</text>
      <circle cx="150" cy="185" r="5" fill="#fbbf24"/>
      <text x="158" y="188" fill="#fbbf24" fontSize="7" fontFamily="monospace">Distant</text>
      <rect x="30" y="215" width="420" height="90" rx="6" fill="#050c18" stroke="#1e293b" strokeWidth="1"/>
      <text x="44" y="228" fill="#64748b" fontSize="7.5" fontFamily="monospace">TRACÉ EEG — FIRES</text>
      <text x="38" y="248" fill="#475569" fontSize="6.5" fontFamily="monospace">C3-C4</text>
      <polyline points="70,248 80,248 85,244 90,252 95,248 120,248" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.7"/>
      <text x="38" y="264" fill="#475569" fontSize="6.5" fontFamily="monospace">F3-F4</text>
      <polyline points="70,264 78,264 82,258 86,270 90,264 95,261 99,267 103,264 120,264" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.7"/>
      <text x="38" y="284" fill="#475569" fontSize="6.5" fontFamily="monospace">T3-T4</text>
      <polyline points="70,284 130,284 135,260 140,308 143,255 147,310 150,258 154,308 157,256 161,308 164,260 168,308 171,262 175,308 178,265 182,308 185,265 188,308 191,268 280,284 290,284" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="135" y="248" fill="#ef4444" fontSize="7" fontFamily="monospace">← décharge généralisée FIRES →</text>
      <text x="292" y="264" fill="#475569" fontSize="6.5" fontFamily="monospace">Pz-Oz</text>
      <polyline points="315,264 330,264 335,258 338,270 342,264 350,264 360,264 365,254 370,274 374,264 390,264 420,264 440,264" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.7"/>
      <rect x="292" y="272" width="148" height="28" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5"/>
      <text x="366" y="283" textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">Burst-suppression alternant</text>
      <text x="366" y="293" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontFamily="monospace">Pointe-ondes 2–3 Hz continu</text>
    </svg>
  );
}

function IllusIRM() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full">
      <defs>
        <radialGradient id="irm-bg-l" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#555"/>
          <stop offset="60%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#111"/>
        </radialGradient>
        <radialGradient id="irm-bg-r" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#4a4a4a"/>
          <stop offset="60%" stopColor="#222"/>
          <stop offset="100%" stopColor="#0d0d0d"/>
        </radialGradient>
        <radialGradient id="irm-thal-n" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#888"/>
          <stop offset="100%" stopColor="#555"/>
        </radialGradient>
        <radialGradient id="irm-thal-f" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="50%" stopColor="#e0e0e0"/>
          <stop offset="100%" stopColor="#aaa"/>
        </radialGradient>
        <filter id="irm-blur">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>
      <rect width="480" height="320" fill="#111"/>
      <rect width="480" height="28" fill="#000"/>
      <text x="12" y="10" fill="#888" fontSize="7" fontFamily="monospace">SIEMENS MAGNETOM · T2 FLAIR · TR:9000ms · TE:100ms · TI:2500ms · FOV:230mm · 3T</text>
      <text x="12" y="20" fill="#888" fontSize="7" fontFamily="monospace">COUPES AXIALES · THALAMI · COMPARAISON NORMALE / FIRES</text>
      <text x="120" y="42" textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">NORMAL</text>
      <ellipse cx="120" cy="155" rx="90" ry="100" fill="url(#irm-bg-l)"/>
      <ellipse cx="120" cy="155" rx="65" ry="72" fill="#333"/>
      <ellipse cx="120" cy="155" rx="50" ry="55" fill="#555" opacity="0.6"/>
      <ellipse cx="108" cy="145" rx="10" ry="16" fill="#1a1a1a"/>
      <ellipse cx="132" cy="145" rx="10" ry="16" fill="#1a1a1a"/>
      <ellipse cx="108" cy="168" rx="13" ry="10" fill="url(#irm-thal-n)" opacity="0.85"/>
      <ellipse cx="132" cy="168" rx="13" ry="10" fill="url(#irm-thal-n)" opacity="0.85"/>
      <text x="120" y="188" textAnchor="middle" fill="#999" fontSize="7" fontFamily="monospace">Thalami — signal normal</text>
      <path d="M80,125 Q120,118 160,125" fill="none" stroke="#888" strokeWidth="3" opacity="0.5"/>
      <ellipse cx="120" cy="155" rx="90" ry="100" fill="none" stroke="#777" strokeWidth="1.5" opacity="0.4"/>
      <rect x="30" y="262" width="180" height="50" rx="3" fill="#0a0a0a" stroke="#222" strokeWidth="0.8"/>
      <text x="120" y="273" textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">T2 FLAIR normal</text>
      <text x="120" y="283" textAnchor="middle" fill="#555" fontSize="6.5" fontFamily="monospace">Thalami : signal intermédiaire ✓</text>
      <text x="120" y="293" textAnchor="middle" fill="#555" fontSize="6.5" fontFamily="monospace">LCR supprimé (signal nul) ✓</text>
      <text x="120" y="303" textAnchor="middle" fill="#555" fontSize="6.5" fontFamily="monospace">Pas hypersignal pathologique ✓</text>
      <line x1="235" y1="28" x2="235" y2="315" stroke="#333" strokeWidth="1"/>
      <text x="360" y="42" textAnchor="middle" fill="#aaa" fontSize="8" fontFamily="monospace">FIRES — Semaine 2</text>
      <ellipse cx="360" cy="155" rx="90" ry="100" fill="url(#irm-bg-r)"/>
      <ellipse cx="360" cy="155" rx="65" ry="72" fill="#2a2a2a"/>
      <ellipse cx="346" cy="143" rx="14" ry="20" fill="#0d0d0d"/>
      <ellipse cx="374" cy="143" rx="14" ry="20" fill="#0d0d0d"/>
      <ellipse cx="344" cy="170" rx="16" ry="12" fill="url(#irm-thal-f)" filter="url(#irm-blur)" opacity="0.95"/>
      <ellipse cx="376" cy="170" rx="16" ry="12" fill="url(#irm-thal-f)" filter="url(#irm-blur)" opacity="0.95"/>
      <ellipse cx="344" cy="170" rx="20" ry="16" fill="#fff" opacity="0.12" filter="url(#irm-blur)"/>
      <ellipse cx="376" cy="170" rx="20" ry="16" fill="#fff" opacity="0.12" filter="url(#irm-blur)"/>
      <line x1="302" y1="158" x2="326" y2="168" stroke="#fff" strokeWidth="1"/>
      <line x1="418" y1="158" x2="394" y2="168" stroke="#fff" strokeWidth="1"/>
      <text x="280" y="155" fill="#fff" fontSize="6.5" fontFamily="monospace">HS ←</text>
      <text x="400" y="155" fill="#fff" fontSize="6.5" fontFamily="monospace">→ HS</text>
      <text x="360" y="195" textAnchor="middle" fill="#ccc" fontSize="7" fontFamily="monospace">Hypersignaux thalamiques bilatéraux</text>
      <ellipse cx="360" cy="155" rx="90" ry="100" fill="none" stroke="#ddd" strokeWidth="2.5" opacity="0.5" strokeDasharray="4,2"/>
      <text x="283" y="78" fill="#999" fontSize="6.5" fontFamily="monospace">méninges rehaussées</text>
      <ellipse cx="300" cy="100" rx="8" ry="5" fill="#ccc" opacity="0.5" filter="url(#irm-blur)"/>
      <ellipse cx="415" cy="115" rx="6" ry="4" fill="#ccc" opacity="0.4" filter="url(#irm-blur)"/>
      <rect x="270" y="262" width="180" height="50" rx="3" fill="#0a0a0a" stroke="#444" strokeWidth="0.8"/>
      <text x="360" y="273" textAnchor="middle" fill="#bbb" fontSize="7" fontFamily="monospace">T2 FLAIR FIRES — Pathologique</text>
      <text x="360" y="283" textAnchor="middle" fill="#eee" fontSize="6.5" fontFamily="monospace">↑↑ Hypersignal thalami bilatéraux</text>
      <text x="360" y="293" textAnchor="middle" fill="#999" fontSize="6.5" fontFamily="monospace">Ventricules dilatés · LCR ↓</text>
      <text x="360" y="303" textAnchor="middle" fill="#aaa" fontSize="6.5" fontFamily="monospace">Rehaussement méningé · Sillons effacés</text>
    </svg>
  );
}

const svgComponents = [IllusBHE, IllusCytokines, IllusNeurone, IllusMicroglie, IllusLymphoT, IllusAstrocyte, IllusReseau, IllusIRM];

export default function AtlasPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const IllusComponent = selected !== null ? svgComponents[selected] : null;

  return (
    <div className="min-h-screen bg-[#050c18] text-white">
      <div className="border-b border-white/5 bg-[#07111f]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"/>
              <h1 className="text-sm font-mono tracking-widest text-[#10B981] uppercase">Atlas Médical</h1>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 ml-5">PULSAR V21.2 · 8 illustrations · Neurologie pédiatrique · FIRES</p>
          </div>
          {selected !== null && (
            <button onClick={() => setSelected(null)} className="text-xs font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded transition-all">
              ← Retour grille
            </button>
          )}
        </div>
      </div>

      {selected !== null && IllusComponent && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6">
            <span className="text-[10px] font-mono text-[#10B981] tracking-widest uppercase">{illustrations[selected].tag}</span>
            <h2 className="text-2xl font-light text-white mt-1">{illustrations[selected].title}</h2>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{illustrations[selected].subtitle}</p>
          </div>
          <div className="bg-[#07111f] border border-white/5 rounded-xl p-6 aspect-video flex items-center justify-center">
            <div className="w-full h-full"><IllusComponent /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setSelected(Math.max(0, selected - 1))} disabled={selected === 0} className="text-xs font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded disabled:opacity-30 transition-all">← Précédent</button>
            <span className="text-xs font-mono text-slate-600 flex items-center px-3">{selected + 1} / {illustrations.length}</span>
            <button onClick={() => setSelected(Math.min(illustrations.length - 1, selected + 1))} disabled={selected === illustrations.length - 1} className="text-xs font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded disabled:opacity-30 transition-all">Suivant →</button>
          </div>
        </div>
      )}

      {selected === null && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-light text-white">Bibliothèque d&apos;illustrations</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">Illustrations SVG médicales — FIRES · Neuroinflammation · Immunologie</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {illustrations.map((illus, i) => {
              const Comp = svgComponents[i];
              return (
                <button key={illus.id} onClick={() => setSelected(i)} className="group bg-[#07111f] border border-white/5 hover:border-[#10B981]/30 rounded-xl overflow-hidden text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]">
                  <div className="relative h-48 bg-[#050c18] overflow-hidden">
                    <div className="w-full h-full"><Comp /></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07111f]/40 group-hover:opacity-0 transition-opacity"/>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-mono bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded">Agrandir</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-mono text-[#10B981] uppercase tracking-wider mb-0.5">#{illus.id.toString().padStart(2,'0')} · {illus.tag.split(' · ')[0]}</p>
                    <h3 className="text-sm font-medium text-white leading-tight">{illus.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono leading-tight">{illus.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 flex items-center gap-6 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"/>8 illustrations SVG validées</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"/>PULSAR V21.2</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600]"/>In memoriam Alejandro R. 2019–2025</span>
          </div>
        </div>
      )}
    </div>
  );
}
