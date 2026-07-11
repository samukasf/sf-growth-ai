import {
  CompanyProfile,
  DiscoveryGap,
  DiscoveryOpportunity,
  DiscoveryScore,
  DiscoverySession,
  type DiscoveryReport,
} from "@/core/company-discovery";
import type { DiscoveryResult } from "./company-brain.types";

export function createSampleDiscoveryResult(): DiscoveryResult {
  const now = new Date().toISOString();

  const session = DiscoverySession.create({
    id: "dsess-sample-001",
    organizationId: "org-sample",
    companyId: "company-sample-001",
    companyName: "Acme Growth Labs",
    status: "completed",
    sourceTypes: ["documents", "questionnaires"],
    initiatedBy: "debug-user",
    startedAt: now,
    completedAt: now,
    findingsCount: 24,
    gapsCount: 1,
    opportunitiesCount: 1,
    profileCompleteness: 72,
  });

  let profile = CompanyProfile.create({
    id: "cprof-sample-001",
    organizationId: "org-sample",
    companyId: "company-sample-001",
    name: "Acme Growth Labs",
    industry: "SaaS B2B",
    description: "Plataforma de crescimento para PMEs.",
  });

  const sections = [
    {
      key: "identity",
      label: "Identity",
      confidence: 85,
      lastUpdatedAt: now,
      data: {
        mission: "Acelerar o crescimento previsível de PMEs.",
        vision: "Ser a plataforma de referência em growth para empresas em expansão.",
        values: ["Transparência", "Resultado", "Inovação"],
        goals: ["Aumentar MRR em 30%", "Expandir para 3 novos mercados"],
      },
    },
    {
      key: "products",
      label: "Products",
      confidence: 78,
      lastUpdatedAt: now,
      data: {
        products: ["Growth OS", "Executive Dashboard"],
      },
    },
    {
      key: "customers",
      label: "Customers",
      confidence: 70,
      lastUpdatedAt: now,
      data: {
        target_audience: ["PMEs de tecnologia", "Scale-ups B2B"],
      },
    },
    {
      key: "operations",
      label: "Operations",
      confidence: 65,
      lastUpdatedAt: now,
      data: {
        operations_summary: "Operação remota com squads por vertical.",
        processes: ["Onboarding", "Customer Success", "RevOps"],
      },
    },
    {
      key: "finance",
      label: "Finance",
      confidence: 60,
      lastUpdatedAt: now,
      data: {
        financial_summary: "Receita recorrente em crescimento com margem estável.",
        revenue_streams: ["Assinaturas", "Serviços premium"],
      },
    },
    {
      key: "commercial",
      label: "Commercial",
      confidence: 68,
      lastUpdatedAt: now,
      data: {
        marketing_summary: "Marketing inbound com foco em conteúdo executivo.",
        services: ["Consultoria de growth", "Implementação"],
        competitors: ["HubSpot", "Salesforce"],
        channels: ["LinkedIn", "Webinars", "Parcerias"],
      },
    },
    {
      key: "technology",
      label: "Technology",
      confidence: 74,
      lastUpdatedAt: now,
      data: {
        digital_summary: "Stack cloud-native com integrações CRM.",
        platforms: ["Next.js", "Supabase"],
        digital_channels: ["Website", "App", "API"],
      },
    },
  ] as const;

  for (const section of sections) {
    profile = profile.withSection(section);
  }

  profile = profile.withCompleteness(72, session.id);

  const score = DiscoveryScore.create({
    id: "dscore-sample-001",
    sessionId: session.id,
    dimensions: [
      { key: "identity", label: "Identidade", score: 85, weight: 1 },
      { key: "operations", label: "Operações", score: 65, weight: 1.2 },
      { key: "commercial", label: "Comercial", score: 68, weight: 1.2 },
      { key: "finance", label: "Finanças", score: 60, weight: 1 },
    ],
    profileCompleteness: 72,
    dataQuality: 70,
    readinessScore: 71,
    calculatedAt: now,
  });

  const gaps = [
    DiscoveryGap.create({
      id: "dgap-001",
      sessionId: session.id,
      area: "finance",
      title: "Projeção de caixa incompleta",
      description: "Faltam dados de fluxo de caixa para 12 meses.",
      severity: "high",
      impact: "Risco de decisões financeiras com baixa previsibilidade.",
      recommendation: "Consolidar projeção de caixa trimestral.",
      detectedAt: now,
    }),
  ];

  const opportunities = [
    DiscoveryOpportunity.create({
      id: "dopp-001",
      sessionId: session.id,
      area: "commercial",
      title: "Programa de parcerias B2B",
      description: "Parceiros podem acelerar aquisição em novos mercados.",
      priority: "high",
      estimatedImpact: "Aumento de 15% na taxa de aquisição.",
      estimatedRoi: "3.2x",
      detectedAt: now,
    }),
  ];

  const report: DiscoveryReport = {
    session: session.toJSON(),
    profile: profile.toJSON(),
    score: score.toJSON(),
    gaps: gaps.map((gap) => gap.toJSON()),
    opportunities: opportunities.map((opportunity) => opportunity.toJSON()),
    summary:
      "Descoberta empresarial concluída para Acme Growth Labs. Perfil 72% completo. Score geral: 71/100.",
    nextSteps: [
      "Consolidar projeção de caixa trimestral.",
      "Avaliar: Programa de parcerias B2B",
      "Sincronizar perfil com Enterprise Brain e Executive Knowledge.",
    ],
    generatedAt: now,
  };

  return {
    session,
    profile,
    report,
  };
}
