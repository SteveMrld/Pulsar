'use client';

export async function exportPatientPDF(patientName: string, patientData: Record<string, unknown>) {
  // Génération HTML structuré pour impression PDF
  const date = new Date().toLocaleDateString('fr-FR', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>PULSAR — Dossier ${patientName}</title>
<style>
  @page { margin: 20mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; font-size: 11px; line-height: 1.6; }
  .header { border-bottom: 2px solid #10B981; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header-left h1 { font-size: 22px; color: #10B981; font-weight: 700; letter-spacing: -0.5px; }
  .header-left p { font-size: 10px; color: #666; margin-top: 2px; }
  .header-right { text-align: right; font-size: 10px; color: #888; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 12px; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 10px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .field { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; }
  .field-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
  .field-val { font-size: 11px; color: #1a1a2e; font-weight: 500; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .badge-p1 { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .badge-fires { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .disclaimer { margin-top: 30px; padding: 10px 14px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; font-size: 9px; color: #92400e; line-height: 1.6; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #aaa; padding: 6px; border-top: 1px solid #e5e7eb; }
  .hypothesis { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  .h-score { font-size: 16px; font-weight: 700; color: #10B981; float: right; }
  .h-name { font-weight: 600; font-size: 12px; color: #065f46; }
  .h-desc { font-size: 10px; color: #555; margin-top: 3px; }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <h1>PULSAR</h1>
    <p>Dossier clinique — Aide à la décision pédiatrique neuro-inflammatoire</p>
  </div>
  <div class="header-right">
    Exporté le ${date}<br/>
    PULSAR v21.4 · Version bêta<br/>
    <span style="color:#dc2626">Confidentiel — Usage clinique interne</span>
  </div>
</div>

<div class="section">
  <div class="section-title">Identité patient</div>
  <div class="grid">
    <div class="field"><div class="field-label">Nom</div><div class="field-val">${patientName}</div></div>
    <div class="field"><div class="field-label">Priorité</div><div class="field-val"><span class="badge badge-p1">${String(patientData.priority || 'P1')}</span></div></div>
    <div class="field"><div class="field-label">Service</div><div class="field-val">${String(patientData.service || 'Réa Neuro')}</div></div>
    <div class="field"><div class="field-label">Phase</div><div class="field-val">${String(patientData.phase || 'Phase aiguë')}</div></div>
    <div class="field"><div class="field-label">Diagnostic suspecté</div><div class="field-val"><span class="badge badge-fires">${String(patientData.diagnostic || 'FIRES')}</span></div></div>
    <div class="field"><div class="field-label">Jour J+</div><div class="field-val">${String(patientData.jour || '—')}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Hypothèses diagnostiques — PULSAR N3</div>
  <div class="hypothesis">
    <span class="h-score">74%</span>
    <div class="h-name">FIRES — Febrile Infection-Related Epilepsy Syndrome</div>
    <div class="h-desc">IL-6 élevé · EEG burst-suppression · Fièvre réfractaire · Critères FIRES J+5 remplis</div>
  </div>
  <div class="hypothesis" style="background:#eff6ff;border-color:#bfdbfe">
    <span class="h-score" style="color:#2563eb">18%</span>
    <div class="h-name" style="color:#1e40af">Encéphalite Anti-NMDAR</div>
    <div class="h-desc">Ac anti-NMDAR à confirmer · Mouvements anormaux · Instabilité autonomique</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Recommandations thérapeutiques — PULSAR N4</div>
  <div class="grid">
    <div class="field" style="border-color:#fca5a5;background:#fef2f2">
      <div class="field-label" style="color:#dc2626">⚠️ URGENT — Anakinra</div>
      <div class="field-val">2–8 mg/kg/j SC · Fenêtre J+3–J+5</div>
    </div>
    <div class="field">
      <div class="field-label">Régime Cétogène</div>
      <div class="field-val">Initiation J+5 · Monitoring glycémie</div>
    </div>
    <div class="field">
      <div class="field-label">Tocilizumab</div>
      <div class="field-val">Si NMDAR confirmé · 8–12 mg/kg IV</div>
    </div>
    <div class="field">
      <div class="field-label">IVIG</div>
      <div class="field-val">Déjà administré J+3</div>
    </div>
  </div>
</div>

<div class="disclaimer">
  <strong>Avertissement :</strong> Ce document est généré par PULSAR v21.4 (bêta), un outil d'aide à la décision clinique non validé réglementairement. 
  Il ne constitue pas une prescription médicale. Toute décision thérapeutique relève exclusivement de la responsabilité du praticien en charge du patient. 
  Document à usage interne — ne pas diffuser.
</div>

<div class="footer">PULSAR v21.4 · Collaboration Pierre Sonigo (ex-INSERM) · Jabrilia Éditions · Confidentiel</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 500);
}
