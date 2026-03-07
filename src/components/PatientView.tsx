'use client';
import { useState } from 'react';
import HypothesisGauges from '@/components/HypothesisGauges';
import PatientTimeline from '@/components/PatientTimeline';
import AlertBadge from '@/components/AlertBadge';
import EngineStatusBar from '@/components/EngineStatusBar';

interface PatientData {
  id: string; name: string; age: number; admissionDate: string;
  diagnosis: string; h1Score: number; h2Score: number; h3Score: number;
  status: 'critical' | 'monitoring' | 'stable';
}

const DEMO: PatientData = {
  id: 'ALE-2025-001', name: 'Patient A.', age: 6,
  admissionDate: '2025-03-12', diagnosis: 'FIRES suspecté',
  h1Score: 81, h2Score: 39, h3Score: 23, status: 'critical',
};

const SC = { critical: '#EF4444', monitoring: '#F59E0B', stable: '#10B981' };
const SL = { critical: 'CRITIQUE', monitoring: 'SURVEILLANCE', stable: 'STABLE' };

interface Props { patient?: PatientData; }

export default function PatientView({ patient = DEMO }: Props) {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'engines'>('overview');
  const c = SC[patient.status];

  return (
    <div style={{ background: '#0A0E1A', minHeight: '100vh' }}>
      <style>{`@keyframes crit{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1E293B', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}`, animation: patient.status === 'critical' ? 'crit 2s infinite' : 'none' }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: c, letterSpacing: '0.1em' }}>{SL[patient.status]}</span>
              <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>{patient.id}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{patient.name}</h1>
            <div style={{ fontSize: 13, color: '#475569' }}>{patient.age} ans · {patient.admissionDate} · {patient.diagnosis}</div>
          </div>
          <div style={{ fontSize: 11, color: '#EF4444', background: '#EF444415', border: '1px solid #EF444430', borderRadius: 8, padding: '6px 12px', fontWeight: 700 }}>
            H1 FIRES {patient.h1Score}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
          {(['overview', 'timeline', 'engines'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', background: tab === t ? '#6C4DFF' : '#1E293B', color: tab === t ? '#FFF' : '#475569', transition: 'all 0.2s' }}>
              {t === 'overview' ? "Vue d'ensemble" : t === 'timeline' ? 'Timeline' : 'Moteurs'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AlertBadge />
            <HypothesisGauges data={[
              { id: 'H1', label: 'FIRES', score: patient.h1Score, color: '#EF4444', status: 'DOMINANT', delay: 0 },
              { id: 'H2', label: 'EAIS', score: patient.h2Score, color: '#F59E0B', status: 'CONCURRENT', delay: 0.35 },
              { id: 'H3', label: 'PIMS', score: patient.h3Score, color: '#3B82F6', status: 'MINORITAIRE', delay: 0.7 },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {[
                { label: 'Score H1', value: patient.h1Score + '%', color: '#EF4444', sub: 'FIRES' },
                { label: 'Âge', value: patient.age + ' ans', color: '#6C4DFF', sub: 'Pédiatrique' },
                { label: 'Hospitalisation', value: '18j', color: '#F59E0B', sub: 'Depuis admission' },
                { label: 'Traitements', value: '3', color: '#10B981', sub: 'En cours' },
              ].map((m, i) => (
                <div key={i} style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: '#334155' }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'timeline' && <PatientTimeline patientName={patient.name} />}
        {tab === 'engines' && <EngineStatusBar />}
      </div>
    </div>
  );
}
