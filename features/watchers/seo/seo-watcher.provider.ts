import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";

import type {
  GrowingKeyword,
  SeoAlert,
  SeoMetricsSnapshot,
  SeoOpportunity,
  SeoRecommendation,
  SeoRisk,
  SeoSeverity,
  SeoSignal,
  SeoWatcherInput,
} from "./seo-watcher.types";

const NOW = new Date().toISOString();

function toSeoSeverity(value: "critical" | "high" | "medium" | "low"): SeoSeverity {
  const map: Record<string, SeoSeverity> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return map[value] ?? "Medium";
}

function signal(
  type: SeoSignal["type"],
  title: string,
  description: string,
  severity: SeoSeverity,
  confidence: number,
  source: string,
  metric?: string,
  value?: number,
  threshold?: number,
): SeoSignal {
  return {
    id: `seo-signal-${type}-${title.slice(0, 24).replace(/\s/g, "-").toLowerCase()}`,
    type,
    title,
    description,
    severity,
    confidence,
    source,
    detectedAt: NOW,
    metric,
    value,
    threshold,
  };
}

export type SeoWatcherProviderData = {
  signals: SeoSignal[];
  alerts: SeoAlert[];
  opportunities: SeoOpportunity[];
  risks: SeoRisk[];
  recommendations: SeoRecommendation[];
  metrics: SeoMetricsSnapshot;
  growingKeywords: GrowingKeyword[];
  pagesAtRisk: SeoRisk[];
  dataSource: "google-search-console" | "mock";
};

function buildRecommendation(
  id: string,
  title: string,
  description: string,
  priority: SeoSeverity,
  responsibleArea = "SEO",
): SeoRecommendation {
  return { id, title, description, priority, responsibleArea };
}

function buildFromSearchConsole(
  gsc: SearchConsoleExecutive,
  marketing?: MarketingExecutive | null,
): SeoWatcherProviderData {
  const source = "google-search-console";
  const signals: SeoSignal[] = [];
  const alerts: SeoAlert[] = [];
  const opportunities: SeoOpportunity[] = [];
  const risks: SeoRisk[] = [];
  const recommendations: SeoRecommendation[] = [];

  const metrics: SeoMetricsSnapshot = {
    clicks: gsc.clicks,
    impressions: gsc.impressions,
    ctr: gsc.ctr,
    averagePosition: gsc.averagePosition,
    seoHealthScore: gsc.seoHealthScore,
    organicTrafficScore: gsc.organicTrafficScore,
    coreWebVitalsScore: gsc.coreWebVitalsScore,
    ctrScore: gsc.ctrScore,
  };

  if (gsc.organicTrafficScore < 55) {
    signals.push(
      signal(
        "clicks_drop",
        "Queda de cliques orgânicos",
        `Tráfego orgânico com score ${gsc.organicTrafficScore}/100 — ${gsc.clicks.toLocaleString("pt-BR")} cliques no período.`,
        "High",
        82,
        source,
        "organic_traffic_score",
        gsc.organicTrafficScore,
        55,
      ),
    );
  }

  if (gsc.impressions > 0 && gsc.organicTrafficScore < 60) {
    signals.push(
      signal(
        "impressions_drop",
        "Impressões com conversão baixa",
        `${gsc.impressions.toLocaleString("pt-BR")} impressões com cliques abaixo do potencial.`,
        "Medium",
        76,
        source,
        "impressions",
        gsc.impressions,
        80000,
      ),
    );
  }

  if (gsc.ctrScore < 50 || gsc.ctr < 3) {
    signals.push(
      signal(
        "ctr_drop",
        "Queda de CTR orgânico",
        `CTR em ${gsc.ctr}% (score ${gsc.ctrScore}/100) — otimizar titles e meta descriptions.`,
        gsc.ctr < 2 ? "High" : "Medium",
        80,
        source,
        "ctr_percent",
        gsc.ctr,
        3,
      ),
    );
  }

  if (gsc.averagePosition > 12) {
    signals.push(
      signal(
        "position_loss",
        "Perda de posições médias",
        `Posição média ${gsc.averagePosition} — conteúdo abaixo da primeira página.`,
        gsc.averagePosition > 18 ? "High" : "Medium",
        78,
        source,
        "average_position",
        gsc.averagePosition,
        12,
      ),
    );
  }

  for (const issue of gsc.indexingIssues) {
    const severity = toSeoSeverity(issue.severity);
    signals.push(
      signal(
        "indexing_issue",
        `Problema de indexação: ${issue.type}`,
        issue.description,
        severity,
        85,
        source,
        "indexing_issues",
        issue.affectedUrls,
        0,
      ),
    );
  }

  for (const vital of gsc.coreWebVitals) {
    if (vital.status !== "good") {
      signals.push(
        signal(
          "core_web_vitals",
          `Core Web Vitals: ${vital.label}`,
          `${vital.label} em ${vital.value} (${vital.status}) — score ${vital.score}/100.`,
          vital.status === "poor" ? "High" : "Medium",
          74,
          source,
          `cwv_${vital.id}`,
          vital.score,
          75,
        ),
      );
    }
  }

  for (const keyword of gsc.keywordOpportunities) {
    opportunities.push({
      id: `seo-opp-${keyword.query.replace(/\s/g, "-")}`,
      title: `Oportunidade: ${keyword.query}`,
      description: `${keyword.impressions.toLocaleString("pt-BR")} impressões na posição ${keyword.position}.`,
      severity: keyword.potentialClicks >= 200 ? "High" : "Medium",
      confidence: 77,
      growthPotential: `+${keyword.potentialClicks} cliques estimados`,
      source,
      query: keyword.query,
    });
    signals.push(
      signal(
        "keyword_opportunity",
        `Nova oportunidade: ${keyword.query}`,
        `Potencial de ${keyword.potentialClicks} cliques adicionais.`,
        "Medium",
        77,
        source,
      ),
    );
  }

  const growingKeywords: GrowingKeyword[] = gsc.topQueries.slice(0, 5).map((query, index) => ({
    id: `kw-${index}`,
    query: query.query,
    clicks: query.clicks,
    impressions: query.impressions,
    position: query.position,
    growthPercent: Math.max(5, Math.round((query.ctr / query.position) * 10)),
  }));

  const pagesAtRisk: SeoRisk[] = gsc.topPages
    .filter((page) => page.ctr < 4 || page.position > 15)
    .slice(0, 4)
    .map((page, index) => ({
      id: `page-risk-${index}`,
      title: `Página em risco: ${page.path}`,
      description: `CTR ${page.ctr}% · posição ${page.position} · ${page.impressions.toLocaleString("pt-BR")} impressões.`,
      severity: page.position > 18 ? "High" : "Medium",
      confidence: 72,
      impact: "Perda de tráfego orgânico e conversões",
      source,
      page: page.path,
    }));

  for (const page of gsc.topPages.filter((p) => p.ctr >= 5 && p.position <= 12).slice(0, 3)) {
    signals.push(
      signal(
        "page_growth_potential",
        `Potencial de crescimento: ${page.path}`,
        `CTR ${page.ctr}% na posição ${page.position} — candidata a otimização.`,
        "Medium",
        70,
        source,
      ),
    );
    opportunities.push({
      id: `seo-page-opp-${page.path.replace(/\//g, "-")}`,
      title: `Página com potencial: ${page.path}`,
      description: `${page.clicks.toLocaleString("pt-BR")} cliques · CTR ${page.ctr}%.`,
      severity: "Medium",
      confidence: 70,
      growthPotential: "Expansão de conteúdo e internal linking",
      source,
      page: page.path,
    });
  }

  for (const risk of gsc.searchConsoleRisks) {
    risks.push({
      id: risk.id,
      title: risk.title,
      description: risk.description,
      severity: toSeoSeverity(risk.severity),
      confidence: 80,
      impact: "Impacto direto em visibilidade orgânica",
      source,
    });
    pagesAtRisk.push({
      id: `gsc-risk-${risk.id}`,
      title: risk.title,
      description: risk.description,
      severity: toSeoSeverity(risk.severity),
      confidence: 80,
      impact: "Risco SEO orgânico",
      source,
    });
  }

  if (marketing && marketing.marketingHealthScore < 60) {
    signals.push(
      signal(
        "competitor_position_gain",
        "Concorrentes ganhando visibilidade",
        `Marketing score ${marketing.marketingHealthScore}/100 — pressão competitiva em SERPs.`,
        "Medium",
        68,
        source,
      ),
    );
    risks.push({
      id: "seo-competitor-pressure",
      title: "Pressão competitiva em SERPs",
      description: "Concorrentes podem estar ganhando posição em keywords estratégicas.",
      severity: "Medium",
      confidence: 68,
      impact: "Erosão de share orgânico",
      source,
    });
  }

  for (const rec of gsc.searchConsoleRecommendations) {
    recommendations.push(
      buildRecommendation(
        rec.id,
        rec.title,
        rec.description,
        toSeoSeverity(rec.priority),
      ),
    );
  }

  for (const risk of risks.filter((r) => r.severity === "Critical" || r.severity === "High").slice(0, 3)) {
    const rec =
      recommendations.find((r) => r.priority === "Critical" || r.priority === "High") ??
      buildRecommendation(
        `rec-${risk.id}`,
        "Corrigir risco SEO prioritário",
        risk.description,
        risk.severity,
      );
    alerts.push({
      id: `alert-${risk.id}`,
      title: risk.title,
      description: risk.description,
      severity: risk.severity,
      source,
      expectedImpact: risk.impact,
      recommendation: rec,
      responsibleArea: "SEO",
      confidence: risk.confidence,
      status: "active",
      createdAt: NOW,
    });
  }

  for (const issue of gsc.indexingIssues.filter((i) => i.severity === "critical" || i.severity === "high")) {
    alerts.push({
      id: `alert-idx-${issue.id}`,
      title: `Indexação: ${issue.type}`,
      description: issue.description,
      severity: toSeoSeverity(issue.severity),
      source,
      expectedImpact: `${issue.affectedUrls} URL(s) afetada(s)`,
      recommendation:
        recommendations[0] ??
        buildRecommendation(
          "rec-indexing",
          "Corrigir indexação",
          "Revisar canonical, sitemap e qualidade das páginas afetadas.",
          "High",
        ),
      responsibleArea: "SEO",
      confidence: 85,
      status: "active",
      createdAt: NOW,
    });
  }

  return {
    signals,
    alerts,
    opportunities,
    risks,
    recommendations,
    metrics,
    growingKeywords,
    pagesAtRisk,
    dataSource: source,
  };
}

function buildMockData(input: SeoWatcherInput): SeoWatcherProviderData {
  const source = "seo-mock-provider";
  const company = input.companyName ?? "Empresa";

  const metrics: SeoMetricsSnapshot = {
    clicks: 4820,
    impressions: 128400,
    ctr: 3.76,
    averagePosition: 14.2,
    seoHealthScore: 68,
    organicTrafficScore: 62,
    coreWebVitalsScore: 78,
    ctrScore: 58,
  };

  const signals: SeoSignal[] = [
    signal(
      "clicks_drop",
      "Queda de cliques orgânicos",
      `Cliques caíram 12% vs. período anterior para ${company}.`,
      "High",
      84,
      source,
      "clicks_change_percent",
      -12,
      -8,
    ),
    signal(
      "impressions_drop",
      "Queda de impressões",
      "Impressões orgânicas reduziram 8% nas últimas 4 semanas.",
      "Medium",
      79,
      source,
      "impressions_change_percent",
      -8,
      -5,
    ),
    signal(
      "ctr_drop",
      "Queda de CTR",
      "CTR orgânico caiu de 4.1% para 3.76%.",
      "High",
      81,
      source,
      "ctr_percent",
      3.76,
      4,
    ),
    signal(
      "position_loss",
      "Perda de posições",
      "Posição média subiu de 12.8 para 14.2.",
      "High",
      83,
      source,
      "average_position",
      14.2,
      13,
    ),
    signal(
      "indexing_issue",
      "Problemas de indexação",
      "12 URLs rastreadas sem indexação detectadas.",
      "High",
      86,
      source,
      "indexing_errors",
      12,
      5,
    ),
    signal(
      "core_web_vitals",
      "Core Web Vitals — INP",
      "INP em 220ms (needs improvement) no mobile.",
      "Medium",
      74,
      source,
      "cwv_inp_score",
      72,
      75,
    ),
    signal(
      "keyword_opportunity",
      "Oportunidade: automação vendas",
      "5.180 impressões na posição 12.1 com potencial de +259 cliques.",
      "Medium",
      77,
      source,
    ),
    signal(
      "page_growth_potential",
      "Potencial: /samuel-ai",
      "CTR 5.65% na posição 9.6 — candidata a featured snippet.",
      "Medium",
      72,
      source,
    ),
    signal(
      "page_at_risk",
      "Risco: /contact",
      "Posição 16.2 com CTR abaixo da média do site.",
      "Medium",
      70,
      source,
    ),
    signal(
      "competitor_position_gain",
      "Concorrente ganhando posição",
      "Competidor subiu 3 posições em 'growth marketing b2b'.",
      "High",
      80,
      source,
    ),
  ];

  const growingKeywords: GrowingKeyword[] = [
    { id: "kw-1", query: "growth marketing b2b", clicks: 420, impressions: 8420, position: 8.2, growthPercent: 18 },
    { id: "kw-2", query: "inteligência artificial empresas", clicks: 312, impressions: 6240, position: 11.4, growthPercent: 14 },
    { id: "kw-3", query: "automação vendas", clicks: 248, impressions: 5180, position: 12.1, growthPercent: 22 },
  ];

  const opportunities: SeoOpportunity[] = [
    {
      id: "seo-opp-automacao",
      title: "Automação vendas",
      description: "5.180 impressões na posição 12.1.",
      severity: "High",
      confidence: 77,
      growthPotential: "+259 cliques estimados",
      source,
      query: "automação vendas",
    },
    {
      id: "seo-opp-crm",
      title: "CRM executivo",
      description: "3.920 impressões na posição 15.6.",
      severity: "Medium",
      confidence: 74,
      growthPotential: "+196 cliques estimados",
      source,
      query: "crm executivo",
    },
    {
      id: "seo-opp-samuel",
      title: "Página /samuel-ai",
      description: "CTR 5.65% — otimizar para featured snippet.",
      severity: "Medium",
      confidence: 72,
      growthPotential: "Expansão de conteúdo e schema markup",
      source,
      page: "/samuel-ai",
    },
  ];

  const pagesAtRisk: SeoRisk[] = [
    {
      id: "page-risk-contact",
      title: "Página em risco: /contact",
      description: "Posição 16.2 · CTR 5.94% · 6.400 impressões.",
      severity: "Medium",
      confidence: 72,
      impact: "Perda de leads orgânicos",
      source,
      page: "/contact",
    },
    {
      id: "page-risk-pricing",
      title: "Página em risco: /pricing",
      description: "Posição 14.1 · CTR 4.32% — abaixo do benchmark.",
      severity: "Medium",
      confidence: 70,
      impact: "Queda de conversão orgânica",
      source,
      page: "/pricing",
    },
  ];

  const risks: SeoRisk[] = [
    {
      id: "seo-risk-indexing",
      title: "Erros de indexação",
      description: "12 URLs rastreadas sem indexação.",
      severity: "High",
      confidence: 86,
      impact: "Páginas invisíveis no Google",
      source,
    },
    {
      id: "seo-risk-ctr",
      title: "CTR orgânico em queda",
      description: "CTR abaixo de 4% no período.",
      severity: "High",
      confidence: 81,
      impact: "Menos cliques com mesmas impressões",
      source,
    },
    {
      id: "seo-risk-competitor",
      title: "Concorrente ganhando posição",
      description: "Perda de share em keyword principal B2B.",
      severity: "High",
      confidence: 80,
      impact: "Erosão de tráfego qualificado",
      source,
    },
  ];

  const recommendations: SeoRecommendation[] = [
    buildRecommendation(
      "rec-indexing",
      "Corrigir indexação prioritária",
      "Revisar canonical e qualidade das 12 URLs não indexadas.",
      "Critical",
    ),
    buildRecommendation(
      "rec-ctr",
      "Otimizar titles e meta descriptions",
      "Testar variações em páginas com CTR abaixo de 4%.",
      "High",
    ),
    buildRecommendation(
      "rec-keywords",
      "Atacar keywords em ascensão",
      "Criar conteúdo hub para 'automação vendas' e 'crm executivo'.",
      "High",
    ),
    buildRecommendation(
      "rec-cwv",
      "Melhorar INP mobile",
      "Reduzir JavaScript bloqueante nas landing pages principais.",
      "Medium",
    ),
  ];

  const alerts: SeoAlert[] = [
    {
      id: "alert-clicks-drop",
      title: "Alerta: queda de cliques orgânicos",
      description: signals[0].description,
      severity: "High",
      source,
      expectedImpact: "Redução de tráfego qualificado em 12%",
      recommendation: recommendations[1],
      responsibleArea: "SEO",
      confidence: 84,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-indexing",
      title: "Alerta: problemas de indexação",
      description: signals[4].description,
      severity: "High",
      source,
      expectedImpact: "12 URLs invisíveis no Google",
      recommendation: recommendations[0],
      responsibleArea: "SEO",
      confidence: 86,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-competitor",
      title: "Alerta: concorrente ganhando posição",
      description: signals[9].description,
      severity: "High",
      source,
      expectedImpact: "Perda de share em keyword principal",
      recommendation: recommendations[2],
      responsibleArea: "Marketing",
      confidence: 80,
      status: "active",
      createdAt: NOW,
    },
    {
      id: "alert-ctr",
      title: "Alerta: queda de CTR",
      description: signals[2].description,
      severity: "High",
      source,
      expectedImpact: "Menos cliques por impressão",
      recommendation: recommendations[1],
      responsibleArea: "SEO",
      confidence: 81,
      status: "active",
      createdAt: NOW,
    },
  ];

  return {
    signals,
    alerts,
    opportunities,
    risks,
    recommendations,
    metrics,
    growingKeywords,
    pagesAtRisk,
    dataSource: "mock",
  };
}

export function fetchSeoWatcherData(input: SeoWatcherInput = {}): SeoWatcherProviderData {
  if (input.searchConsoleExecutive) {
    return buildFromSearchConsole(
      input.searchConsoleExecutive,
      input.marketingExecutive,
    );
  }

  return buildMockData(input);
}
