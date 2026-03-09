import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PULSAR — À propos',
  description: 'PULSAR v21.4 — Outil d'aide à la décision clinique pédiatrique neuro-inflammatoire.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px', color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#10B981', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          À propos de PULSAR
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
          PULSAR v21.4
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8, maxWidth: 560 }}>
          Outil d'aide à la décision clinique pour les urgences neuro-inflammatoires pédiatriques.
          Né du cas Alejandro R. (2019–2025), développé en collaboration avec Pierre Sonigo.
        </p>
      </div>

      {/* Grid infos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Version', val: 'PULSAR v21.4 · Discovery Engine v4.0' },
          { label: 'Statut', val: 'Bêta clinique — évaluation en cours' },
          { label: 'Stack technique', val: 'Next.js 14 · TypeScript · Supabase · Vercel' },
          { label: 'Moteurs', val: '4 niveaux · 4 662 lignes · 12 fichiers' },
          { label: 'Collaboration', val: 'Pierre Sonigo — ex-directeur INSERM' },
          { label: 'Mise à jour', val: 'Chaque dimanche — revue littérature + recalibration' },
          { label: 'Langues', val: 'Français · English (i18n complet)' },
          { label: 'Dernière mise à jour', val: 'Mars 2026' },
        ].map(function(item) {
          return (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>{item.val}</div>
            </div>
          );
        })}
      </div>

      {/* Équipe */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>Équipe</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'Steve Moradel', role: 'Fondateur · Développement · Direction éditoriale', org: 'Jabrilia Éditions · ESSEC · INSEEC · Audencia' },
            { name: 'Pierre Sonigo', role: 'Collaboration scientifique · Validation médicale', org: 'Chercheur — ancien directeur de recherche INSERM · Neuroimmunologie pédiatrique' },
          ].map(function(p) {
            return (
              <div key={p.name} style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#10B981', marginBottom: 4 }}>{p.role}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{p.org}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alejandro */}
      <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '28px 32px', marginBottom: 40 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#f87171', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>In Memoriam · 2019–2025</p>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#fff', marginBottom: 10 }}>Alejandro R. — Patient Zéro</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
          PULSAR a été construit à partir de l'analyse rétrospective de sa trajectoire clinique. 
          FIRES diagnostiqué à J+5, Anakinra administré à J+10 — cinq jours trop tard. 
          Chaque algorithme de PULSAR porte la trace de cette chronologie. 
          L'objectif : qu'aucun enfant ne soit pris en charge trop tard faute d'un outil de convergence diagnostique.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '18px 22px' }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#f59e0b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Avertissement médical</p>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.75 }}>
          PULSAR est un outil d'aide à la décision clinique. Il ne remplace pas le jugement du médecin, 
          ne constitue pas une prescription médicale, et n'a pas fait l'objet d'une validation clinique 
          formelle (marquage CE, FDA). Son utilisation engage la responsabilité du praticien.
        </p>
      </div>

    </div>
  );
}
