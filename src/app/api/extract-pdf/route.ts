import { NextRequest, NextResponse } from 'next/server'

// Rate limiting simple — 1 requête / 20s par IP
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 20_000

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const now = Date.now()
  const last = rateLimitMap.get(ip) || 0
  if (now - last < RATE_LIMIT_MS) {
    return NextResponse.json({ ok: false, error: 'Trop de requêtes — attends 20 secondes' }, { status: 429 })
  }
  rateLimitMap.set(ip, now)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Clé API manquante' }, { status: 500 })
  }

  try {
    const { base64, mediaType } = await req.json()
    if (!base64) return NextResponse.json({ ok: false, error: 'Pas de fichier' }, { status: 400 })

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: mediaType || 'application/pdf', data: base64 }
            },
            {
              type: 'text',
              text: `Tu es un extracteur de données médicales. Lis ce document et extrais les informations cliniques. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks. Si une valeur est absente, mets 0 ou "".

{
  "lastName": "",
  "firstName": "",
  "ageMonths": 0,
  "sex": "male",
  "weightKg": 0,
  "fileNumber": "",
  "chiefComplaint": "",
  "symptomOnsetDays": 0,
  "gcs": 15,
  "seizureType": "none",
  "seizures24h": 0,
  "crp": 0,
  "ferritin": 0,
  "wbc": 0,
  "temp": 0,
  "heartRate": 0,
  "spo2": 0,
  "sbp": 0,
  "map": 0,
  "csfCells": 0,
  "csfProtein": 0,
  "eegDone": false,
  "eegNormal": true,
  "eegDetail": "",
  "mriDone": false,
  "mriNormal": true,
  "mriDetail": "",
  "ctDone": false,
  "ctNormal": true,
  "ctDetail": "",
  "otherInfection": "",
  "familyHistory": "",
  "currentMedications": "",
  "allergies": ""
}`
            }
          ]
        }]
      })
    })

    const data = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ ok: false, error: data.error?.message || 'Erreur API' }, { status: 500 })
    }

    const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '{}'
    let extracted: Record<string, any> = {}
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      extracted = JSON.parse(clean)
    } catch {
      extracted = {}
    }

    return NextResponse.json({ ok: true, data: extracted })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
