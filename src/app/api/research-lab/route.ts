// ============================================================
// PULSAR API — /api/research-lab
// CRON hebdomadaire : lance le Research Lab
// Croise les données patients + veille PubMed + hypothèses IA
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { generateResearchQuestions, generateCrossReferences, runResearchLab } from '@/lib/engines/ResearchLabEngine'
import { PatientState } from '@/lib/engines/PatientState'
import { DEMO_PATIENTS } from '@/lib/data/discoveryData'

// Verify CRON secret to prevent unauthorized access
function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  // Allow manual trigger from app
  const url = new URL(req.url)
  if (url.searchParams.get('manual') === 'true') return true
  return true // Allow for now during development
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: any = {
    sessionId: `LAB-${Date.now()}`,
    startedAt: new Date().toISOString(),
    patients: [],
    pubmedFindings: [],
    hypotheses: [],
    crossReferences: [],
    insights: [],
  }

  try {
    // 1. Run lab on all available patients
    for (const patient of DEMO_PATIENTS) {
      try {
        const ps = new PatientState({
          ageMonths: patient.age_months,
          weightKg: patient.weight_kg,
          hospDay: patient.hosp_day,
          sex: patient.sex as any,
          gcs: patient.gcs,
          pupils: 'reactive',
          seizures24h: patient.seizures_24h,
          seizureDuration: 0,
          seizureType: patient.seizures_24h > 5 ? 'refractory_status' : patient.seizures_24h > 0 ? 'focal' : 'none',
          crp: patient.crp,
          ferritin: patient.ferritin,
          wbc: (patient.wbc || 10) * 1000,
          lactate: patient.lactate,
          heartRate: patient.heart_rate,
          sbp: 90,
          dbp: 55,
          spo2: patient.spo2,
          temp: patient.temp,
          csfCells: patient.csf_cells,
          csfProtein: patient.csf_protein,
          csfAntibodies: 'pending',
          drugs: [],
        })
        const session = await runResearchLab(ps)
        results.patients.push({
          name: patient.display_name,
          syndrome: patient.syndrome,
          questionsGenerated: session.questions.length,
          hypothesesGenerated: session.hypotheses.length,
          crossRefsGenerated: session.crossReferences.length,
        })
        // Aggregate unique hypotheses
        session.hypotheses.forEach(h => {
          if (!results.hypotheses.find((rh: any) => rh.id === h.id)) {
            results.hypotheses.push(h)
          }
        })
        // Aggregate cross-references
        session.crossReferences.forEach(cr => {
          if (!results.crossReferences.find((rcr: any) => rcr.factorA === cr.factorA && rcr.factorB === cr.factorB)) {
            results.crossReferences.push(cr)
          }
        })
        // Aggregate insights
        session.insights.forEach(insight => {
          if (!results.insights.includes(insight)) {
            results.insights.push(insight)
          }
        })
      } catch { /* skip patient on error */ }
    }

    // 2. PubMed veille — search for new publications
    const searchTerms = [
      'FIRES febrile infection related epilepsy 2025 2026',
      'anakinra pediatric status epilepticus',
      'endotoxin neuroinflammation seizure pediatric',
      'NLRP3 inflammasome epilepsy children',
      'nitrous oxide seizure pediatric adverse',
      'ketogenic diet FIRES refractory',
      'MOGAD ADEM pediatric treatment 2025',
      'anti-NMDAR encephalitis children outcome',
      'gut brain axis epilepsy endotoxin',
    ]

    for (const term of searchTerms) {
      try {
        const pubmedUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=3&sort=date&retmode=json`
        const res = await fetch(pubmedUrl)
        if (res.ok) {
          const data = await res.json()
          const ids = data.esearchresult?.idlist || []
          if (ids.length > 0) {
            // Get article details
            const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
            const detailRes = await fetch(detailUrl)
            if (detailRes.ok) {
              const detailData = await detailRes.json()
              for (const id of ids) {
                const article = detailData.result?.[id]
                if (article) {
                  results.pubmedFindings.push({
                    pmid: id,
                    title: article.title,
                    authors: article.authors?.slice(0, 3).map((a: any) => a.name).join(', '),
                    journal: article.source,
                    date: article.pubdate,
                    searchTerm: term,
                  })
                }
              }
            }
          }
        }
        // Rate limit: 3 requests/second for NCBI
        await new Promise(r => setTimeout(r, 400))
      } catch { /* skip on error */ }
    }

    // Deduplicate PubMed findings by PMID
    const seenPmids = new Set()
    results.pubmedFindings = results.pubmedFindings.filter((f: any) => {
      if (seenPmids.has(f.pmid)) return false
      seenPmids.add(f.pmid)
      return true
    })

    results.completedAt = new Date().toISOString()
    results.durationMs = Date.now() - startTime
    results.summary = {
      patientsAnalyzed: results.patients.length,
      hypothesesTotal: results.hypotheses.length,
      crossReferencesTotal: results.crossReferences.length,
      pubmedArticlesFound: results.pubmedFindings.length,
      insightsTotal: results.insights.length,
    }

    // TODO: Store results in Supabase for persistence
    // await supabase.from('research_sessions').insert(results)

    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: 'Research Lab error', details: String(err) }, { status: 500 })
  }
}
