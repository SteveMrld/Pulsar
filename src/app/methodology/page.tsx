import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PULSAR — Architecture Méthodologique',
  description: 'Comment les quatre moteurs de PULSAR travaillent ensemble pour guider la décision clinique.',
};

export default function MethodologyPage() {
  return (
    <div style={{width:'100%',height:'100vh',border:'none',overflow:'hidden'}}>
      <iframe
        src="/methodology-doc.html"
        style={{width:'100%',height:'100%',border:'none'}}
        title="PULSAR Methodology"
      />
    </div>
  );
}
