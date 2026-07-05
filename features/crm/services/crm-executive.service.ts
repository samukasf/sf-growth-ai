import { supabase } from "@/lib/supabase/client";

export type CrmContactRecord = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  status: string | null;
  updated_at: string;
};

export type CrmLeadRecord = {
  id: string;
  company_id: string;
  contact_id: string | null;
  source: string | null;
  stage: string | null;
  score: number | null;
  value: number | null;
  updated_at: string;
};

export type CrmDealRecord = {
  id: string;
  company_id: string;
  lead_id: string | null;
  title: string;
  stage: string | null;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  updated_at: string;
};

export type CrmContactInsight = {
  id: string;
  name: string;
  reason: string;
};

export type CrmInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type CrmRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type CrmExecutive = {
  crmHealthScore: number;
  totalContacts: number;
  totalLeads: number;
  activeLeads: number;
  lostLeads: number;
  wonDeals: number;
  openDeals: number;
  pipelineValue: number;
  conversionRate: number;
  inactiveContacts: number;
  highPotentialContacts: CrmContactInsight[];
  atRiskContacts: CrmContactInsight[];
  crmRisks: CrmInsightItem[];
  crmOpportunities: CrmInsightItem[];
  crmRecommendations: CrmRecommendation[];
  crmExecutiveSummary: string;
};

export type CrmExecutiveInput = {
  contacts?: CrmContactRecord[];
  leads?: CrmLeadRecord[];
  deals?: CrmDealRecord[];
  companyName?: string;
};

const INACTIVE_DAYS = 30;

const MOCK_CONTACTS: CrmContactRecord[] = [
  {
    id: "ct-1",
    company_id: "mock",
    first_name: "Ana",
    last_name: "Silva",
    email: "ana@techcorp.com",
    status: "customer",
    updated_at: new Date().toISOString(),
  },
  {
    id: "ct-2",
    company_id: "mock",
    first_name: "Bruno",
    last_name: "Costa",
    email: "bruno@startup.io",
    status: "lead",
    updated_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "ct-3",
    company_id: "mock",
    first_name: "Carla",
    last_name: "Mendes",
    email: "carla@enterprise.com",
    status: "lead",
    updated_at: new Date().toISOString(),
  },
];

const MOCK_LEADS: CrmLeadRecord[] = [
  {
    id: "ld-1",
    company_id: "mock",
    contact_id: "ct-1",
    source: "Indicação",
    stage: "qualified",
    score: 82,
    value: 15000,
    updated_at: new Date().toISOString(),
  },
  {
    id: "ld-2",
    company_id: "mock",
    contact_id: "ct-2",
    source: "LinkedIn",
    stage: "new",
    score: 45,
    value: 8000,
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "ld-3",
    company_id: "mock",
    contact_id: "ct-3",
    source: "Website",
    stage: "proposal",
    score: 76,
    value: 22000,
    updated_at: new Date().toISOString(),
  },
  {
    id: "ld-4",
    company_id: "mock",
    contact_id: null,
    source: "Evento",
    stage: "lost",
    score: 30,
    value: 5000,
    updated_at: new Date().toISOString(),
  },
];

const MOCK_DEALS: CrmDealRecord[] = [
  {
    id: "dl-1",
    company_id: "mock",
    lead_id: "ld-1",
    title: "Plano Enterprise — TechCorp",
    stage: "negotiation",
    amount: 45000,
    probability: 70,
    expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] ?? null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-2",
    company_id: "mock",
    lead_id: "ld-3",
    title: "Consultoria Estratégica — Enterprise Co",
    stage: "proposal",
    amount: 28000,
    probability: 55,
    expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] ?? null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "dl-3",
    company_id: "mock",
    lead_id: null,
    title: "Retainer Anual — Cliente A",
    stage: "won",
    amount: 62000,
    probability: 100,
    expected_close_date: null,
    updated_at: new Date().toISOString(),
  },
];

function normalizeStage(stage: string | null): string {
  return (stage ?? "new").toLowerCase();
}

function isLostStage(stage: string): boolean {
  return stage.includes("lost") || stage.includes("perdido");
}

function isWonStage(stage: string): boolean {
  return stage.includes("won") || stage.includes("ganho") || stage.includes("closed_won");
}

function isActiveLeadStage(stage: string): boolean {
  return !isLostStage(stage) && !isWonStage(stage);
}

function isOpenDealStage(stage: string): boolean {
  return !isLostStage(stage) && !isWonStage(stage);
}

function contactName(contact: CrmContactRecord): string {
  return [contact.first_name, contact.last_name].filter(Boolean).join(" ");
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveInput(input: CrmExecutiveInput): Required<CrmExecutiveInput> {
  const contacts = input.contacts ?? [];
  const leads = input.leads ?? [];
  const deals = input.deals ?? [];

  if (contacts.length === 0 && leads.length === 0 && deals.length === 0) {
    return {
      contacts: MOCK_CONTACTS,
      leads: MOCK_LEADS,
      deals: MOCK_DEALS,
      companyName: input.companyName ?? "Empresa",
    };
  }

  return {
    contacts,
    leads,
    deals,
    companyName: input.companyName ?? "Empresa",
  };
}

function buildHighPotentialContacts(
  contacts: CrmContactRecord[],
  leads: CrmLeadRecord[],
): CrmContactInsight[] {
  const insights: CrmContactInsight[] = [];

  for (const lead of leads.filter((l) => (l.score ?? 0) >= 70 && isActiveLeadStage(normalizeStage(l.stage)))) {
    const contact = contacts.find((c) => c.id === lead.contact_id);
    insights.push({
      id: lead.id,
      name: contact ? contactName(contact) : `Lead ${lead.id.slice(0, 6)}`,
      reason: `Score ${lead.score}/100 · Valor ${formatCurrency(Number(lead.value ?? 0))}`,
    });
  }

  return insights.slice(0, 5);
}

function buildAtRiskContacts(
  contacts: CrmContactRecord[],
  leads: CrmLeadRecord[],
): CrmContactInsight[] {
  const insights: CrmContactInsight[] = [];

  for (const contact of contacts.filter((c) => daysSince(c.updated_at) >= INACTIVE_DAYS)) {
    insights.push({
      id: contact.id,
      name: contactName(contact),
      reason: `Sem interação há ${daysSince(contact.updated_at)} dias`,
    });
  }

  for (const lead of leads.filter(
    (l) => isActiveLeadStage(normalizeStage(l.stage)) && daysSince(l.updated_at) >= 21,
  )) {
    const contact = contacts.find((c) => c.id === lead.contact_id);
    insights.push({
      id: lead.id,
      name: contact ? contactName(contact) : `Lead ${lead.id.slice(0, 6)}`,
      reason: `Lead parado em ${normalizeStage(lead.stage)} há ${daysSince(lead.updated_at)} dias`,
    });
  }

  return insights.slice(0, 5);
}

function buildCrmRisks(
  conversionRate: number,
  inactiveContacts: number,
  lostLeads: number,
  openDeals: number,
): CrmInsightItem[] {
  const risks: CrmInsightItem[] = [];
  let index = 0;

  if (conversionRate < 15) {
    risks.push({
      id: `risk-${index++}`,
      title: "Conversão abaixo do ideal",
      description: `Taxa de conversão em ${conversionRate}% — funil comercial precisa de otimização.`,
      severity: conversionRate < 8 ? "critical" : "high",
    });
  }

  if (inactiveContacts >= 3) {
    risks.push({
      id: `risk-${index++}`,
      title: "Contatos inativos acumulados",
      description: `${inactiveContacts} contato(s) sem interação nos últimos ${INACTIVE_DAYS} dias.`,
      severity: inactiveContacts >= 5 ? "high" : "medium",
    });
  }

  if (lostLeads >= 2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Perda de leads",
      description: `${lostLeads} lead(s) perdido(s) — revisar qualificação e follow-up.`,
      severity: "medium",
    });
  }

  if (openDeals === 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Pipeline vazio",
      description: "Nenhum deal aberto — risco de queda de receita no curto prazo.",
      severity: "critical",
    });
  }

  return risks;
}

function buildCrmOpportunities(
  highPotential: CrmContactInsight[],
  pipelineValue: number,
  activeLeads: number,
): CrmInsightItem[] {
  const opportunities: CrmInsightItem[] = [];
  let index = 0;

  if (pipelineValue > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Pipeline comercial ativo",
      description: `Pipeline de ${formatCurrency(pipelineValue)} em negociação.`,
      severity: "high",
    });
  }

  if (activeLeads >= 3) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Base de leads qualificável",
      description: `${activeLeads} leads ativos para nutrição e conversão.`,
      severity: "medium",
    });
  }

  for (const contact of highPotential.slice(0, 2)) {
    opportunities.push({
      id: `opp-${index++}`,
      title: `Alto potencial: ${contact.name}`,
      description: contact.reason,
      severity: "high",
    });
  }

  return opportunities;
}

function buildCrmRecommendations(
  risks: CrmInsightItem[],
  opportunities: CrmInsightItem[],
  conversionRate: number,
): CrmRecommendation[] {
  const recs: CrmRecommendation[] = [];
  let index = 0;

  if (conversionRate < 20) {
    recs.push({
      id: `rec-${index++}`,
      title: "Otimizar funil de conversão",
      description: "Revisar etapas do funil, scripts comerciais e tempo de resposta a leads.",
      priority: conversionRate < 10 ? "critical" : "high",
    });
  }

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const opp of opportunities.slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Capturar: ${opp.title}`,
      description: opp.description,
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter ritmo comercial",
      description: "Continuar monitoramento de pipeline e follow-up proativo.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function calculateCrmHealthScore(
  conversionRate: number,
  activeLeads: number,
  openDeals: number,
  inactiveContacts: number,
  totalContacts: number,
): number {
  let score = 35;

  score += Math.min(25, conversionRate * 1.2);
  score += Math.min(15, activeLeads * 3);
  score += Math.min(15, openDeals * 5);
  score += Math.min(10, totalContacts * 2);

  const inactiveRatio = totalContacts > 0 ? inactiveContacts / totalContacts : 0;
  score -= Math.min(20, Math.round(inactiveRatio * 40));

  return clampScore(score);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  pipelineValue: number,
  conversionRate: number,
  activeLeads: number,
): string {
  return `${companyName} — CRM executivo com saúde ${healthScore}/100. Pipeline ${formatCurrency(pipelineValue)} · ${activeLeads} leads ativos · Conversão ${conversionRate}%. Fonte comercial integrada ao CEO Digital Samuel AI™.`;
}

export function buildCrmExecutive(input: CrmExecutiveInput = {}): CrmExecutive {
  const { contacts, leads, deals, companyName } = resolveInput(input);

  const totalContacts = contacts.length;
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => isActiveLeadStage(normalizeStage(l.stage))).length;
  const lostLeads = leads.filter((l) => isLostStage(normalizeStage(l.stage))).length;
  const wonDeals = deals.filter((d) => isWonStage(normalizeStage(d.stage))).length;
  const openDeals = deals.filter((d) => isOpenDealStage(normalizeStage(d.stage))).length;

  const pipelineValue = deals
    .filter((d) => isOpenDealStage(normalizeStage(d.stage)))
    .reduce((sum, d) => sum + Number(d.amount ?? 0), 0);

  const convertedLeads = leads.filter((l) => isWonStage(normalizeStage(l.stage))).length + wonDeals;
  const conversionRate =
    totalLeads > 0 ? clampScore(Math.round((convertedLeads / totalLeads) * 100)) : 0;

  const inactiveContacts = contacts.filter((c) => daysSince(c.updated_at) >= INACTIVE_DAYS).length;
  const highPotentialContacts = buildHighPotentialContacts(contacts, leads);
  const atRiskContacts = buildAtRiskContacts(contacts, leads);

  const crmRisks = buildCrmRisks(conversionRate, inactiveContacts, lostLeads, openDeals);
  const crmOpportunities = buildCrmOpportunities(highPotentialContacts, pipelineValue, activeLeads);
  const crmRecommendations = buildCrmRecommendations(crmRisks, crmOpportunities, conversionRate);

  const crmHealthScore = calculateCrmHealthScore(
    conversionRate,
    activeLeads,
    openDeals,
    inactiveContacts,
    totalContacts,
  );

  return {
    crmHealthScore,
    totalContacts,
    totalLeads,
    activeLeads,
    lostLeads,
    wonDeals,
    openDeals,
    pipelineValue,
    conversionRate,
    inactiveContacts,
    highPotentialContacts,
    atRiskContacts,
    crmRisks,
    crmOpportunities,
    crmRecommendations,
    crmExecutiveSummary: buildSummary(
      companyName,
      crmHealthScore,
      pipelineValue,
      conversionRate,
      activeLeads,
    ),
  };
}

export async function fetchCrmExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<CrmExecutiveInput> {
  const [contactsResult, leadsResult, dealsResult] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, company_id, first_name, last_name, email, status, updated_at")
      .eq("company_id", companyId),
    supabase
      .from("leads")
      .select("id, company_id, contact_id, source, stage, score, value, updated_at")
      .eq("company_id", companyId),
    supabase
      .from("deals")
      .select(
        "id, company_id, lead_id, title, stage, amount, probability, expected_close_date, updated_at",
      )
      .eq("company_id", companyId),
  ]);

  if (contactsResult.error) throw contactsResult.error;
  if (leadsResult.error) throw leadsResult.error;
  if (dealsResult.error) throw dealsResult.error;

  return {
    contacts: (contactsResult.data ?? []) as CrmContactRecord[],
    leads: (leadsResult.data ?? []) as CrmLeadRecord[],
    deals: (dealsResult.data ?? []) as CrmDealRecord[],
    companyName,
  };
}

export async function buildCrmExecutiveForCompany(
  companyId: string,
  companyName?: string,
): Promise<CrmExecutive> {
  const input = await fetchCrmExecutiveInput(companyId, companyName);
  return buildCrmExecutive(input);
}
