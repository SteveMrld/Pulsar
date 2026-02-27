'use client'
import Picto from '@/components/Picto';

export default function FamillePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-2)' }}>
        <div style={{ width: '8px', height: '32px', borderRadius: '4px', background: 'var(--p-tde)' }} />
        <h1 style={{ fontSize: 'var(--p-text-xl)', fontWeight: 800, color: 'var(--p-text)' }}>Espace Famille</h1>
      </div>
      <p style={{ color: 'var(--p-text-dim)', fontSize: 'var(--p-text-sm)', marginBottom: 'var(--p-space-6)' }}>Informations accessibles pour les parents — Langage simple, pas de jargon</p>

      {/* Welcome card */}
      <div style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-xl)', padding: 'var(--p-space-6)', marginBottom: 'var(--p-space-5)' }}>
        <div style={{ marginBottom: 'var(--p-space-3)' }}><Picto name="family" size={36} glow glowColor="rgba(255,107,138,0.5)" /></div>
        <h2 style={{ fontSize: 'var(--p-text-lg)', fontWeight: 700, color: 'var(--p-text)', marginBottom: 'var(--p-space-3)' }}>Chers parents,</h2>
        <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 1.8 }}>
          Votre enfant est pris en charge par notre équipe. Cette page vous explique simplement ce qui se passe,
          les examens réalisés, les traitements donnés, et les prochaines étapes. N&apos;hésitez pas à poser vos questions
          à l&apos;équipe médicale.
        </p>
      </div>

      {/* Sections */}
      {[
        { icon: 'heart', title: 'Ce qui se passe', content: 'Votre enfant présente des crises (convulsions) accompagnées de fièvre. Ces crises sont provoquées par une inflammation dans le cerveau. Ce n\'est pas contagieux et ce n\'est pas de votre faute.' },
        { icon: 'virus', title: 'Les examens', content: 'Nous avons réalisé des prises de sang pour vérifier l\'inflammation, une ponction lombaire (prélèvement dans le dos, sous anesthésie locale) pour analyser le liquide autour du cerveau, et une IRM (photo du cerveau sans douleur).' },
        { icon: 'blood', title: 'Les traitements', content: 'Votre enfant reçoit des médicaments contre les crises (antiépileptiques) et des traitements pour calmer l\'inflammation (corticoïdes, immunoglobulines). Ces traitements sont administrés par perfusion.' },
        { icon: 'brain', title: 'Les prochaines étapes', content: 'Nous surveillons votre enfant en continu. Un contrôle IRM est prévu dans quelques jours. L\'équipe vous tiendra informés de l\'évolution et des résultats.' },
        { icon: 'eeg', title: 'Questions fréquentes', content: 'Combien de temps ? Chaque enfant est différent, mais la prise en charge dure généralement plusieurs semaines. Puis-je rester ? Oui, votre présence est importante pour votre enfant. Quand pourra-t-il sortir ? Quand les crises seront contrôlées et l\'inflammation calmée.' },
      ].map((s, i) => (
        <div key={i} className="animate-in" style={{ background: 'var(--p-bg-card)', border: 'var(--p-border)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-5)', marginBottom: 'var(--p-space-3)', animationDelay: `${i * 80}ms` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-3)', marginBottom: 'var(--p-space-3)' }}>
            <Picto name={s.icon} size={28} glow />
            <h3 style={{ fontSize: 'var(--p-text-base)', fontWeight: 700, color: 'var(--p-text)' }}>{s.title}</h3>
          </div>
          <p style={{ fontSize: 'var(--p-text-sm)', color: 'var(--p-text-muted)', lineHeight: 1.8 }}>{s.content}</p>
        </div>
      ))}

      {/* Contact */}
      <div style={{ background: 'var(--p-info-bg)', border: '1px solid var(--p-info)', borderRadius: 'var(--p-radius-lg)', padding: 'var(--p-space-4)', marginTop: 'var(--p-space-4)' }}>
        <div style={{ fontSize: 'var(--p-text-sm)', fontWeight: 600, color: 'var(--p-info)' }}>📞 Contact équipe médicale</div>
        <div style={{ fontSize: 'var(--p-text-xs)', color: 'var(--p-text-muted)', marginTop: '4px' }}>N&apos;hésitez pas à nous appeler ou à demander à parler au médecin de garde à tout moment.</div>
      </div>
    </div>
  )
}
