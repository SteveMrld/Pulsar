import { NextRequest, NextResponse } from 'next/server'

// Parser regex — format exact des PDFs générés par PULSAR
function parseField(text: string, ...labels: string[]): string {
  for (const label of labels) {
    const re = new RegExp(`${label}[:\\s]+([^\\n]{1,80})`, 'i')
    const m = text.match(re)
    if (m) return m[1].trim()
  }
  return ''
}

function parseNum(text: string, ...labels: string[]): number {
  const val = parseField(text, ...labels)
  const n = parseFloat(val.replace(',', '.').replace(/[^\d.]/g, ''))
  return isNaN(n) ? 0 : n
}

function extractData(text: string) {
  // Nom / Prénom
  const nomLine = parseField(text, 'Nom / Prénom', 'Nom/Prénom', 'NOM.*PRÉNOM')
  const nameParts = nomLine.split(/\s{2,}/)
  const lastName  = nameParts[0]?.trim() ?? ''
  const firstName = nameParts[1]?.trim() ?? ''

  // Âge
  let ageMonths = 0
  const ageMatch = text.match(/(\d+)\s*ans?\s*(\d+)?\s*mois?/i)
  if (ageMatch) {
    ageMonths = parseInt(ageMatch[1]) * 12 + (parseInt(ageMatch[2] ?? '0') || 0)
  }
  if (!ageMonths) ageMonths = parseNum(text, 'Âge.*mois', 'Age.*mois')

  // Sexe
  const sexLine = parseField(text, 'Sexe')
  const sex = /f[ée]m/i.test(sexLine) ? 'female' : 'male'

  // Poids
  const weightKg = parseNum(text, 'Poids')

  // N° dossier
  const fileNumber = parseField(text, 'N° dossier', 'Dossier')

  // Motif
  const chiefComplaint = parseField(text, 'Motif principal', 'Motif d\'admission')

  // Délai symptômes
  const onsetMatch = text.match(/depuis\s+J[-−](\d+)/i) || text.match(/J[-−](\d+)/i)
  const symptomOnsetDays = onsetMatch ? parseInt(onsetMatch[1]) : 0

  // GCS
  const gcs = parseNum(text, 'Glasgow') || 15

  // Crises
  const seizures24h = parseNum(text, 'Crises\s*/\s*24h', 'Crises.*24')
  const seizureDuration = parseNum(text, 'Durée.*crise', 'dernière crise')

  // Type de crise
  let seizureType = 'none'
  if (/réfractaire|super.réfractaire/i.test(text)) seizureType = 'refractory_status'
  else if (/status epilepticus|état de mal/i.test(text)) seizureType = 'status'
  else if (/généralisée|tonico/i.test(text)) seizureType = 'generalized_tonic_clonic'
  else if (/focale|focal/i.test(text)) seizureType = 'focal_impaired'
  else if (seizures24h === 0) seizureType = 'none'

  // Biologie
  const crp      = parseNum(text, 'CRP')
  const ferritin = parseNum(text, 'Ferritine', 'Ferrit')
  const wbc      = parseNum(text, 'Leucocytes')
  const temp     = parseNum(text, 'Température', 'Temp')
  const heartRate= parseNum(text, 'FC')
  const spo2     = parseNum(text, 'SpO2')
  const sbp      = parseNum(text, 'TA systolique', 'PAM.*système')
  const map      = parseNum(text, 'PAM')

  // LCR
  const csfCells   = parseNum(text, 'Leucocytes LCR', 'LCR.*leucocytes')
  const csfProtein = parseNum(text, 'Protéinorachie', 'Protéine.*LCR')

  // EEG
  const eegDone   = /EEG/i.test(text)
  const eegMatch  = text.match(/Conclusion EEG[:\s]+([^\n]{1,120})/i)
  const eegResult = eegMatch ? eegMatch[1].trim() : ''

  // IRM
  const mriDone   = /IRM/i.test(text)
  const mriMatch  = text.match(/Conclusion imagerie[:\s]+([^\n]{1,120})/i)
  const mriResult = mriMatch ? mriMatch[1].trim() : ''

  // Scanner
  const ctDone   = /scanner/i.test(text)
  const ctMatch  = text.match(/Résultat scanner[:\s]+([^\n]{1,120})/i)
  const ctResult = ctMatch ? ctMatch[1].trim() : ''

  return {
    lastName, firstName, ageMonths, sex, weightKg, fileNumber,
    chiefComplaint, symptomOnsetDays,
    gcs, seizureType, seizures24h, seizureDuration,
    crp, ferritin, wbc, temp, heartRate, spo2, sbp, map,
    csfCells, csfProtein,
    eegDone, eegResult, mriDone, mriResult, ctDone, ctResult,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { base64 } = await req.json()

    // Décoder le base64 en Buffer
    const pdfBuffer = Buffer.from(base64, 'base64')

    // Extraire le texte avec pdf-parse
    const pdfParse = (await import('pdf-parse')).default
    const parsed = await pdfParse(pdfBuffer)
    const text = parsed.text

    const data = extractData(text)

    return NextResponse.json({ ok: true, data, raw: text.slice(0, 200) })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
