import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType } = await req.json()

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: mediaType ?? 'application/pdf', data: base64 }
            },
            {
              type: 'text',
              text: `Extrais les données cliniques de ce dossier patient PULSAR. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, avec exactement ces champs (laisse 0 ou vide si non trouvé) :
{"lastName":"","firstName":"","ageMonths":0,"sex":"male","weightKg":0,"fileNumber":"","chiefComplaint":"","symptomOnsetDays":0,"gcs":15,"seizureType":"none","seizures24h":0,"seizureDuration":0,"crp":0,"ferritin":0,"wbc":0,"temp":0,"heartRate":0,"spo2":0,"sbp":0,"map":0,"csfCells":0,"csfProtein":0,"eegDone":false,"eegResult":"","mriDone":false,"mriResult":"","ctDone":false,"ctResult":""}`
            }
          ]
        }]
      })
    })

    const data = await resp.json()
    const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '{}'

    let extracted: Record<string, any> = {}
    try { extracted = JSON.parse(text) } catch { extracted = {} }

    return NextResponse.json({ ok: true, data: extracted })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
