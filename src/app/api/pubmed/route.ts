// ============================================================
// PULSAR V19 — PubMed E-utilities API Route
// Proxy pour éviter CORS côté client
// GET /api/pubmed?query=FIRES+NORSE&max=10
// GET /api/pubmed?ids=12345678,23456789 (fetch abstracts)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const TOOL = 'pulsar-discovery'
const EMAIL = 'contact@pulsar-neuro.app' // Required by NCBI

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')
  const ids = searchParams.get('ids')
  const max = searchParams.get('max') || '10'

  try {
    // ── Mode 1: Search (esearch) ──
    if (query) {
      const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${max}&retmode=json&tool=${TOOL}&email=${EMAIL}`
      const searchRes = await fetch(searchUrl)
      if (!searchRes.ok) {
        return NextResponse.json({ error: 'PubMed search failed', status: searchRes.status }, { status: 502 })
      }
      const searchData = await searchRes.json()
      const pmids: string[] = searchData?.esearchresult?.idlist || []

      if (pmids.length === 0) {
        return NextResponse.json({ articles: [], count: 0, query })
      }

      // Fetch summaries for found PMIDs
      const articles = await fetchSummaries(pmids)
      return NextResponse.json({
        articles,
        count: parseInt(searchData?.esearchresult?.count || '0'),
        query,
        returnedMax: pmids.length,
      })
    }

    // ── Mode 2: Fetch by PMIDs (efetch/esummary) ──
    if (ids) {
      const pmids = ids.split(',').map(id => id.trim()).filter(Boolean)
      if (pmids.length === 0) {
        return NextResponse.json({ error: 'No valid PMIDs provided' }, { status: 400 })
      }
      const articles = await fetchSummaries(pmids)
      return NextResponse.json({ articles, count: articles.length })
    }

    return NextResponse.json({ error: 'Provide ?query= or ?ids= parameter' }, { status: 400 })

  } catch (err: any) {
    console.error('[PubMed API]', err)
    return NextResponse.json({ error: 'PubMed API error', message: err.message }, { status: 500 })
  }
}

// ── Fetch article summaries + abstracts from PMIDs ──

async function fetchSummaries(pmids: string[]) {
  const idStr = pmids.join(',')

  // ESummary for metadata
  const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=pubmed&id=${idStr}&retmode=json&tool=${TOOL}&email=${EMAIL}`
  const summaryRes = await fetch(summaryUrl)
  const summaryData = await summaryRes.json()
  const results = summaryData?.result || {}

  // EFetch for abstracts (XML)
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${idStr}&rettype=abstract&retmode=xml&tool=${TOOL}&email=${EMAIL}`
  const fetchRes = await fetch(fetchUrl)
  const xmlText = await fetchRes.text()

  // Parse abstracts from XML (simple regex — robust enough for PubMed output)
  const abstractMap = new Map<string, string>()
  const articleBlocks = xmlText.split('<PubmedArticle>')
  for (const block of articleBlocks) {
    const pmidMatch = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)
    const abstractMatch = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)
    if (pmidMatch && abstractMatch) {
      const cleanAbstract = abstractMatch
        .map(a => a.replace(/<[^>]+>/g, '').trim())
        .join(' ')
      abstractMap.set(pmidMatch[1], cleanAbstract)
    }
  }

  // Build article objects
  const articles = pmids.map(pmid => {
    const meta = results[pmid]
    if (!meta || meta.error) return null

    const authors = meta.authors
      ? meta.authors.map((a: any) => a.name).slice(0, 5).join(', ')
      : 'Unknown'

    return {
      pmid,
      title: meta.title || 'Untitled',
      authors,
      journal: meta.source || meta.fulljournalname || 'Unknown',
      year: parseInt(meta.pubdate?.substring(0, 4)) || 0,
      abstract: abstractMap.get(pmid) || '',
      doi: (meta.elocationid || '').replace('doi: ', '') || null,
      pubDate: meta.pubdate || null,
    }
  }).filter(Boolean)

  return articles
}
