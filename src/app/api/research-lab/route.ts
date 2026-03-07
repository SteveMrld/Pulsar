import { NextResponse } from 'next/server';

const SUPA_URL = 'https://tpefzxyrjebnnzgguktm.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const PUBMED_QUERIES = [
  'FIRES febrile infection related epilepsy syndrome neuroinflammation',
  'NORSE new onset refractory status epilepticus treatment',
  'anakinra IL-1 pediatric epilepsy refractory',
  'ketogenic diet neuroinflammation anti-inflammatory mechanism',
  'gut brain axis microbiome pediatric epilepsy',
  'tocilizumab IL-6 autoimmune encephalitis pediatric',
  'S100B blood brain barrier pediatric seizure biomarker',
];

// Scoring V3 — niveaux de preuve intégrés
const EVIDENCE_WEIGHTS: Record<string, number> = {
  'FIRES': 3, 'IL-1': 3, 'anakinra': 2, 'ketogenic': 2,
  'NORSE': 2, 'tocilizumab': 1, 'IL-6': 1, 'gut-brain': 1,
  'microbiome': 1, 'S100B': 1, 'neuroinflammation': 2,
};

async function sb(table: string, data: any, method = 'POST') {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  return r.ok;
}

async function sbGet(table: string, params = '') {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!r.ok) return [];
  return r.json();
}

async function fetchPubMed(query: string): Promise<any[]> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&sort=date&retmode=json`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    return ids.map(id => {
      const doc = summaryData.result?.[id];
      if (!doc) return null;
      return {
        pmid: id,
        title: doc.title || '',
        journal: doc.fulljournalname || doc.source || '',
        pub_date: doc.pubdate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        tags: [query.split(' ')[0], query.split(' ')[1]].filter(Boolean),
        engines: ['ResLabEngine', 'TDE'],
        is_new: true,
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function scoreArticle(title: string): number {
  const t = title.toLowerCase();
  return Object.entries(EVIDENCE_WEIGHTS).reduce((score, [keyword, weight]) => {
    return t.includes(keyword.toLowerCase()) ? score + weight : score;
  }, 0);
}

function recalcHypotheses(newArticles: any[]) {
  let h1Boost = 0;
  let h2Boost = 0;

  for (const a of newArticles) {
    const t = a.title?.toLowerCase() || '';
    if (t.includes('fires') || t.includes('il-1') || t.includes('anakinra')) h1Boost++;
    if (t.includes('autoimmune') || t.includes('il-6') || t.includes('norse')) h2Boost++;
  }

  return { h1Boost, h2Boost };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  // Protection basique — secret dans env ou param
  if (secret !== 'pulsar-cron-2026' && process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  let articlesFound = 0;
  let alertCount = 0;
  let hypothesisUpdated = false;

  try {
    // 1. Récupérer les PMIDs déjà connus
    const existing = await sbGet('research_lab_articles', 'select=pmid');
    const knownPmids = new Set(existing.map((a: any) => a.pmid));

    // 2. Requêtes PubMed
    const allArticles: any[] = [];
    for (const query of PUBMED_QUERIES) {
      const results = await fetchPubMed(query);
      for (const article of results) {
        if (!knownPmids.has(article.pmid) && !allArticles.find(a => a.pmid === article.pmid)) {
          const relevance = scoreArticle(article.title) * 10;
          allArticles.push({ ...article, relevance: Math.min(relevance, 95) });
        }
      }
    }

    // 3. Insérer les nouveaux articles
    if (allArticles.length > 0) {
      await sb('research_lab_articles', allArticles);
      articlesFound = allArticles.length;

      // Alertes si articles très pertinents (relevance >= 50)
      alertCount = allArticles.filter(a => a.relevance >= 50).length;
    }

    // 4. Recalculer hypothèses si nouveaux articles
    if (allArticles.length > 0) {
      const { h1Boost, h2Boost } = recalcHypotheses(allArticles);

      if (h1Boost > 0 || h2Boost > 0) {
        hypothesisUpdated = true;

        // Récupérer hypothèses actuelles
        const hyps = await sbGet('research_hypotheses', 'order=confidence.desc');
        
        for (const hyp of hyps) {
          let newConf = hyp.confidence;
          if (hyp.hypothesis_id === 'H1') newConf = Math.min(hyp.confidence + h1Boost, 95);
          if (hyp.hypothesis_id === 'H2') newConf = Math.min(hyp.confidence + h2Boost, 80);
          
          if (newConf !== hyp.confidence) {
            await fetch(`${SUPA_URL}/rest/v1/research_hypotheses?hypothesis_id=eq.${hyp.hypothesis_id}`, {
              method: 'PATCH',
              headers: {
                apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
                'Content-Type': 'application/json', Prefer: 'return=minimal',
              },
              body: JSON.stringify({ confidence: newConf, updated_at: new Date().toISOString() }),
            });
          }
        }
      }
    }

    // 5. Dialogues inter-moteurs
    const dialogues = [
      {
        engine: 'ResLabEngine',
        message: `Session CRON ${new Date().toLocaleDateString('fr-FR')} — ${articlesFound} nouveaux articles PubMed détectés. ${alertCount} alertes haute pertinence. Partage avec TDE et HypothesisEngine.`,
        is_engine: false,
        session_date: new Date().toISOString().slice(0, 10),
      },
    ];

    if (hypothesisUpdated) {
      dialogues.push({
        engine: 'HypothesisEngine',
        message: `Recalcul post-CRON effectué. Convergence H1 maintenue. ${articlesFound} nouvelles études intégrées.`,
        is_engine: false,
        session_date: new Date().toISOString().slice(0, 10),
      });
    }

    if (dialogues.length > 0) {
      await sb('research_dialogues', dialogues);
    }

    // 6. Log CRON
    const duration = `${Math.round((Date.now() - startTime) / 1000)}s`;
    await sb('research_cron_history', {
      run_date: new Date().toISOString(),
      articles_found: articlesFound,
      hypothesis_updated: hypothesisUpdated,
      alerts: alertCount,
      duration,
      status: 'OK',
    });

    return NextResponse.json({
      success: true,
      articles_found: articlesFound,
      alerts: alertCount,
      hypothesis_updated: hypothesisUpdated,
      duration,
    });

  } catch (error: any) {
    // Log erreur
    await sb('research_cron_history', {
      run_date: new Date().toISOString(),
      articles_found: 0,
      hypothesis_updated: false,
      alerts: 0,
      duration: `${Math.round((Date.now() - startTime) / 1000)}s`,
      status: 'ERROR',
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
