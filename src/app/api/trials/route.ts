// ============================================================
// PULSAR V19 — ClinicalTrials.gov API Route
// Proxy pour ClinicalTrials.gov v2 API
// GET /api/trials?query=FIRES+NORSE+pediatric&max=10
// GET /api/trials?nct=NCT06123456
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

const CT_BASE = 'https://clinicaltrials.gov/api/v2'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')
  const nct = searchParams.get('nct')
  const max = searchParams.get('max') || '10'

  try {
    // ── Mode 1: Search trials ──
    if (query) {
      const url = `${CT_BASE}/studies?query.term=${encodeURIComponent(query)}&pageSize=${max}&format=json`
      const res = await fetch(url)
      if (!res.ok) {
        return NextResponse.json({ error: 'ClinicalTrials.gov search failed', status: res.status }, { status: 502 })
      }
      const data = await res.json()
      const studies = (data.studies || []).map(parseStudy)

      return NextResponse.json({
        trials: studies,
        totalCount: data.totalCount || 0,
        query,
      })
    }

    // ── Mode 2: Fetch single trial by NCT ──
    if (nct) {
      const url = `${CT_BASE}/studies/${nct}?format=json`
      const res = await fetch(url)
      if (!res.ok) {
        return NextResponse.json({ error: `Trial ${nct} not found`, status: res.status }, { status: 404 })
      }
      const data = await res.json()
      return NextResponse.json({ trial: parseStudy(data) })
    }

    return NextResponse.json({ error: 'Provide ?query= or ?nct= parameter' }, { status: 400 })

  } catch (err: any) {
    console.error('[ClinicalTrials API]', err)
    return NextResponse.json({ error: 'ClinicalTrials.gov API error', message: err.message }, { status: 500 })
  }
}

// ── Parse ClinicalTrials.gov study into clean format ──

function parseStudy(study: any) {
  const proto = study.protocolSection || {}
  const id = proto.identificationModule || {}
  const status = proto.statusModule || {}
  const design = proto.designModule || {}
  const eligibility = proto.eligibilityModule || {}
  const desc = proto.descriptionModule || {}
  const conditions = proto.conditionsModule || {}
  const interventions = proto.armsInterventionsModule || {}
  const contacts = proto.contactsLocationsModule || {}

  return {
    nctId: id.nctId || 'Unknown',
    title: id.officialTitle || id.briefTitle || 'Untitled',
    briefTitle: id.briefTitle || '',
    status: status.overallStatus || 'Unknown',
    startDate: status.startDateStruct?.date || null,
    completionDate: status.completionDateStruct?.date || null,
    phase: (design.phases || []).join(', ') || 'N/A',
    studyType: design.studyType || 'Unknown',
    enrollment: design.enrollmentInfo?.count || null,
    conditions: conditions.conditions || [],
    keywords: conditions.keywords || [],
    interventions: (interventions.interventions || []).map((i: any) => ({
      type: i.type,
      name: i.name,
      description: i.description,
    })),
    eligibility: {
      criteria: eligibility.eligibilityCriteria || '',
      minAge: eligibility.minimumAge || null,
      maxAge: eligibility.maximumAge || null,
      sex: eligibility.sex || 'All',
      healthyVolunteers: eligibility.healthyVolunteers || false,
    },
    briefSummary: desc.briefSummary || '',
    locations: (contacts.locations || []).slice(0, 5).map((l: any) => ({
      facility: l.facility?.name || 'Unknown',
      city: l.facility?.address?.city || '',
      country: l.facility?.address?.country || '',
    })),
  }
}
