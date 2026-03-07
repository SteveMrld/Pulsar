'use client';

interface Engine {
  id: string;
  name: string;
  group: 'ANALYSER' | 'RAISONNER' | 'DÉCOUVRIR';
  active: boolean;
  score?: number;
}

const ENGINES: Engine[] = [
  { id: 'VPS', name: 'VPS', group: 'ANALYSER', active: true, score: 94 },
  { id: 'IA', name: 'IntakeAnalyzer', group: 'ANALYSER', active: true, score: 88 },
  { id: 'PVE', name: 'PVE', group: 'ANALYSER', active: true, score: 76 },
  { id: 'TDE', name: 'TDE', group: 'RAISONNER', active: true, score: 91 },
  { id: 'EWE', name: 'EWE', group: 'RAISONNER', active: true, score: 83 },
  { id: 'CAE', name: 'CAE', group: 'RAISONNER', active: true, score: 79 },
  { id: 'TPE', name: 'TPE', group: 'RAISONNER', active: true, score: 85 },
  { id: 'L1', name: 'PatternMiner', group: 'DÉCOUVRIR', active: true, score: 72 },
  { id: 'L2', name: 'LitScanner', group: 'DÉCOUVRIR', active: true, score: 68 },
  { id: 'L3', name: 'HypothesisEng', group: 'DÉCOUVRIR', active: true, score: 81 },
  { id: 'L4', name: 'PathFinder', group: 'DÉCOUVRIR', active: false, score: 0 },
  { id: 'RLE', name: 'ResLabEngine', group: 'DÉCOUVRIR', active: true, score: 74 },
];

const GROUP_COLOR: Record<string, string> = {
  ANALYSER: '#3B82F6',
  RAISONNER: '#6C4DFF',
  'DÉCOUVRIR': '#10B981',
};

const GROUPS = ['ANALYSER', 'RAISONNER', 'DÉCOUVRIR'] as const;

export default function EngineStatusBar() {
  const grouped = GROUPS.map(g => ({ name: g, engines: ENGINES.filter(e => e.group === g) }));
  return (
    <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 16, padding: '20px' }}>
      <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Moteurs actifs · 12 engines</div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {grouped.map(group => (
          <div key={group.name} style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GROUP_COLOR[group.name], letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GROUP_COLOR[group.name]}30` }}>
              {group.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.engines.map(engine => (
                <div key={engine.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: engine.active ? GROUP_COLOR[engine.group] : '#1E293B',
                    boxShadow: engine.active ? `0 0 6px ${GROUP_COLOR[engine.group]}80` : 'none',
                    flexShrink: 0
                  }}/>
                  <span style={{ fontSize: 11, color: engine.active ? '#94A3B8' : '#334155', flex: 1 }}>{engine.name}</span>
                  {engine.active && engine.score && (
                    <span style={{ fontSize: 10, color: GROUP_COLOR[engine.group], fontFamily: 'monospace' }}>{engine.score}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
