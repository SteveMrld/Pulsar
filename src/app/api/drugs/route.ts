// ============================================================
// PULSAR API — /api/drugs
// Recherche temps réel dans OpenFDA (FAERS) + BDPM (ANSM)
// Retourne le profil de sécurité complet d'un médicament
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { getDrugSafetyProfile, batchDrugSafetyCheck } from '@/lib/engines/DrugDatabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const drug = searchParams.get('drug')
  const batch = searchParams.get('batch') // comma-separated list

  if (!drug && !batch) {
    return NextResponse.json({ error: 'Paramètre "drug" ou "batch" requis' }, { status: 400 })
  }

  try {
    if (batch) {
      // Batch mode: check multiple drugs
      const drugNames = batch.split(',').map(d => d.trim()).filter(Boolean)
      if (drugNames.length > 20) {
        return NextResponse.json({ error: 'Maximum 20 médicaments par requête' }, { status: 400 })
      }
      const results = await batchDrugSafetyCheck(drugNames)
      return NextResponse.json({
        count: results.size,
        drugs: Object.fromEntries(results),
        source: 'OpenFDA FAERS + BDPM ANSM',
        timestamp: new Date().toISOString(),
      })
    }

    // Single drug mode
    const profile = await getDrugSafetyProfile(drug!)
    if (!profile) {
      return NextResponse.json({ 
        error: `Aucun résultat pour "${drug}"`,
        suggestion: 'Essayez le nom générique international (ex: "phenytoin" au lieu de "Dilantin")',
      }, { status: 404 })
    }

    return NextResponse.json({
      drug: profile,
      source: 'OpenFDA FAERS + BDPM ANSM',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Drug API error:', err)
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 })
  }
}
