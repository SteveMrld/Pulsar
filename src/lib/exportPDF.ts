'use client';

export async function exportPatientPDF(patientName: string, patientData: Record<string, unknown>) {
  // Detect language from localStorage (set by LangToggle) or browser
  let lang: 'fr' | 'en' = 'en';
  try {
    const stored = localStorage.getItem('pulsar-lang');
    if (stored === 'fr') lang = 'fr';
    else if (stored === 'en') lang = 'en';
    else if (navigator.language?.toLowerCase().startsWith('fr')) lang = 'fr';
  } catch { lang = 'en'; }

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const date = new Date().toLocaleDateString(locale, {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>PULSAR — ${patientName}</title>
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
    <p>${t('Dossier clinique — Aide à la décision pédiatrique neuro-inflammatoire', 'Clinical Record — Pediatric Neuro-Inflammatory Decision Support')}</p>
  </div>
  <div class="header-right">
    ${t('Exporté le', 'Exported on')} ${date}<br/>
    PULSAR v21.4 · ${t('Version bêta', 'Beta version')}<br/>
    <span style="color:#dc2626">${t('Confidentiel — Usage clinique interne', 'Confidential — Internal clinical use')}</span>
  </div>
</div>

<div class="section">
  <div class="section-title">${t('Identité patient', 'Patient Identity')}</div>
  <div class="grid">
    <div class="field"><div class="field-label">${t('Nom', 'Name')}</div><div class="field-val">${patientName}</div></div>
    <div class="field"><div class="field-label">${t('Priorité', 'Priority')}</div><div class="field-val"><span class="badge badge-p1">${String(patientData.priority || 'P1')}</span></div></div>
    <div class="field"><div class="field-label">${t('Service', 'Department')}</div><div class="field-val">${String(patientData.service || t('Réa Neuro Pédiatrique', 'Pediatric Neuro ICU'))}</div></div>
    <div class="field"><div class="field-label">${t('Phase', 'Phase')}</div><div class="field-val">${String(patientData.phase || t('Phase aiguë', 'Acute phase'))}</div></div>
    <div class="field"><div class="field-label">${t('Diagnostic suspecté', 'Suspected Diagnosis')}</div><div class="field-val"><span class="badge badge-fires">${String(patientData.diagnostic || t('En cours d\'évaluation', 'Under evaluation'))}</span></div></div>
    <div class="field"><div class="field-label">${t('Âge', 'Age')}</div><div class="field-val">${String(patientData.age || '—')} · ${String(patientData.sexe || '—')} · ${String(patientData.poids || '—')}</div></div>
    <div class="field"><div class="field-label">${t('Jour d\'hospitalisation', 'Hospital Day')}</div><div class="field-val">D+${String(patientData.jour || '—')}</div></div>
    <div class="field"><div class="field-label">GCS</div><div class="field-val">${String(patientData.gcs || '—')}/15</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">${t('Scores PULSAR', 'PULSAR Scores')}</div>
  <div class="grid">
    <div class="field">
      <div class="field-label">VPS — ${t('Sévérité globale', 'Global Severity')}</div>
      <div class="field-val" style="font-size:18px;font-weight:900;color:${Number(patientData.vpsScore) >= 70 ? '#8B5CF6' : Number(patientData.vpsScore) >= 50 ? '#FFA502' : '#2ED573'}">${String(patientData.vpsScore || 0)}<span style="font-size:11px;color:#888">/100</span></div>
    </div>
    <div class="field">
      <div class="field-label">${t('Alertes critiques', 'Critical Alerts')}</div>
      <div class="field-val" style="font-size:18px;font-weight:900;color:${Number(patientData.alertesCritiques) > 0 ? '#8B5CF6' : '#2ED573'}">${String(patientData.alertesCritiques || 0)}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">${t('Hypothèses diagnostiques — PULSAR N3', 'Diagnostic Hypotheses — PULSAR N3')}</div>
  <div class="hypothesis">
    <span class="h-score">74%</span>
    <div class="h-name">FIRES — Febrile Infection-Related Epilepsy Syndrome</div>
    <div class="h-desc">${t('IL-6 élevé · EEG burst-suppression · Fièvre réfractaire · Critères FIRES J+5 remplis', 'Elevated IL-6 · EEG burst-suppression · Refractory fever · FIRES criteria D+5 met')}</div>
  </div>
  <div class="hypothesis" style="background:#eff6ff;border-color:#bfdbfe">
    <span class="h-score" style="color:#2563eb">18%</span>
    <div class="h-name" style="color:#1e40af">${t('Encéphalite Anti-NMDAR', 'Anti-NMDAR Encephalitis')}</div>
    <div class="h-desc">${t('Ac anti-NMDAR à confirmer · Mouvements anormaux · Instabilité autonomique', 'Anti-NMDAR Ab to confirm · Abnormal movements · Autonomic instability')}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">${t('Recommandations thérapeutiques — PULSAR N4', 'Therapeutic Recommendations — PULSAR N4')}</div>
  <div class="grid">
    <div class="field" style="border-color:#fca5a5;background:#fef2f2">
      <div class="field-label" style="color:#dc2626">⚠️ URGENT — Anakinra</div>
      <div class="field-val">2–8 mg/kg/d SC · ${t('Fenêtre J+3–J+5', 'Window D+3–D+5')}</div>
    </div>
    <div class="field">
      <div class="field-label">${t('Régime Cétogène', 'Ketogenic Diet')}</div>
      <div class="field-val">${t('Initiation J+5 · Monitoring glycémie', 'Initiation D+5 · Blood glucose monitoring')}</div>
    </div>
    <div class="field">
      <div class="field-label">Tocilizumab</div>
      <div class="field-val">${t('Si NMDAR confirmé · 8–12 mg/kg IV', 'If NMDAR confirmed · 8–12 mg/kg IV')}</div>
    </div>
    <div class="field">
      <div class="field-label">IVIg</div>
      <div class="field-val">${t('Déjà administré J+3', 'Already administered D+3')}</div>
    </div>
  </div>
</div>

<div class="disclaimer">
  <strong>${t('Avertissement', 'Warning')} :</strong> ${t(
    'Ce document est généré par PULSAR v21.4 (bêta), un outil d\'aide à la décision clinique non validé réglementairement. Il ne constitue pas une prescription médicale. Toute décision thérapeutique relève exclusivement de la responsabilité du praticien en charge du patient. Document à usage interne — ne pas diffuser.',
    'This document is generated by PULSAR v21.4 (beta), a clinical decision support tool not yet regulatory-approved. It does not constitute a medical prescription. All therapeutic decisions remain the sole responsibility of the treating clinician. For internal use only — do not distribute.'
  )}
</div>

<div class="footer">PULSAR v21.4 · ${t('Collaboration Pierre Sonigo (ex-INSERM) · Confidentiel', 'In collaboration with Pierre Sonigo (ex-INSERM) · Confidential')}</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 500);
}
