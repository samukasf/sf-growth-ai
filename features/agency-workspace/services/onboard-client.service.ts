import { createAgencyCore } from "@/core/agency-core";
import { createBusinessOperating } from "@/core/business-operating";
import { createCompanyDiscovery } from "@/core/company-discovery";
import { createEnterpriseAssessment } from "@/core/enterprise-assessment";
import { createEnterpriseBrainRuntime } from "@/core/enterprise-brain-runtime";
import { createExecutiveCouncil } from "@/core/executive-council";
import { createExecutiveOpportunity } from "@/core/executive-opportunity";
import { createExecutiveProjectEngine } from "@/core/executive-projects";
import { createMultiTenant } from "@/core/multi-tenant";
import { registerExecutiveMemory, listExecutiveMemoryRecords } from "@/features/executive-memory-engine";
import { buildMarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import { buildOperationsExecutive } from "@/features/operations/services/operations-executive.service";
import { buildSalesExecutive } from "@/features/sales/services/sales-executive.service";
import { buildExecutiveTimeline } from "@/features/samuel-ai/components/executive-timeline/build-executive-timeline";
import { buildExecutiveCEO } from "@/features/samuel-ai/services/executive-ceo.service";
import { buildExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import { buildExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";
import type { ExecutiveContext } from "@/services/executive-context.service";

import type {
  ClientOnboardingResult,
  NewClientFormInput,
  OnboardClientContext,
} from "../types/client-onboarding.types";
import type { AgencyWorkspaceData } from "../types/agency-workspace.types";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildCompanyId(name: string): string {
  return `company-${slugify(name)}-${Date.now().toString(36)}`;
}

function buildOnboardingContext(input: NewClientFormInput, companyId: string): ExecutiveContext {
  return {
    company: {
      id: companyId,
      name: input.companyName,
      industry: input.segment,
      city: input.city,
      country: "Portugal",
      description: input.objectives,
      website: input.website || null,
      business_stage: null,
      annual_revenue: null,
    },
    businessProfile: {
      id: `bp-${companyId}`,
      company_id: companyId,
      segment: input.segment,
      positioning: null,
      differentiators: null,
      objectives: input.objectives,
      mission: null,
      vision: null,
      value_proposition: null,
    },
    memories: [],
    summary: `${input.companyName} · ${input.segment} · ${input.city}`,
  };
}

function collectRisks(
  marketing: ReturnType<typeof buildMarketingExecutive>,
  sales: ReturnType<typeof buildSalesExecutive>,
  operations: ReturnType<typeof buildOperationsExecutive>,
): string[] {
  return [
    ...marketing.marketingRisks.map((r) => r.title),
    ...sales.salesRisks.map((r) => r.title),
    ...operations.operationalRisks.map((r) => r.title),
  ]
    .filter(Boolean)
    .slice(0, 5);
}

export async function onboardNewClient(
  input: NewClientFormInput,
  context: OnboardClientContext,
): Promise<ClientOnboardingResult> {
  const companyId = buildCompanyId(input.companyName);
  const slug = slugify(input.companyName);

  const multiTenant = createMultiTenant();
  const agencyCore = createAgencyCore();
  const companyBrainRuntime = createEnterpriseBrainRuntime();
  const companyDiscovery = createCompanyDiscovery();
  const enterpriseAssessment = createEnterpriseAssessment();
  const businessOperating = createBusinessOperating();
  const executiveCouncil = createExecutiveCouncil();
  const executiveOpportunity = createExecutiveOpportunity();
  const executiveProjects = createExecutiveProjectEngine();

  const tenant = await multiTenant.createTenant({
    organizationId: context.organizationId,
    agencyId: context.agencyId,
    companyId,
    name: input.companyName,
    slug,
  });

  await multiTenant.activateTenant(tenant.id);

  const client = await agencyCore.addClient({
    organizationId: context.organizationId,
    agencyId: context.agencyId,
    companyId,
    name: input.companyName,
    industry: input.segment,
  });

  const profileContent = [
    `Website: ${input.website || "—"}`,
    `Instagram: ${input.instagram || "—"}`,
    `Facebook: ${input.facebook || "—"}`,
    `Google Business: ${input.googleBusiness || "—"}`,
    `Telefone: ${input.phone || "—"}`,
    `Email: ${input.email || "—"}`,
    `Cidade: ${input.city}`,
    `Objetivos: ${input.objectives}`,
  ].join("\n");

  await registerExecutiveMemory({
    companyId,
    category: "onboarding",
    context: "Cadastro inicial Influence Publicidade",
    content: profileContent,
    origin: "agency-workspace",
    responsibleEngine: "Agency Core",
    importanceLevel: 90,
    confidenceLevel: 85,
    tags: ["onboarding", "client", input.segment],
    memoryKind: "business",
    title: `Perfil inicial — ${input.companyName}`,
  });

  const [brainSnapshot, brainHealth] = await Promise.all([
    companyBrainRuntime.buildSnapshot(context.organizationId, companyId),
    companyBrainRuntime.analyzeHealth(context.organizationId, companyId),
  ]);

  const discoveryStart = await companyDiscovery.startDiscovery({
    organizationId: context.organizationId,
    companyId,
    companyName: input.companyName,
    initiatedBy: "Influence Publicidade",
    context: {
      industry: input.segment,
      website: input.website,
      city: input.city,
      objectives: input.objectives,
    },
  });

  const discoveryRun = await companyDiscovery.runDiscovery({
    sessionId: discoveryStart.session.id,
    context: { segment: input.segment },
  });

  const assessmentStart = await enterpriseAssessment.startAssessment({
    organizationId: context.organizationId,
    companyId,
    companyName: input.companyName,
    initiatedBy: "Supercérebro SF Growth AI",
    discoverySessionId: discoveryStart.session.id,
    industry: input.segment,
  });

  const assessment = await enterpriseAssessment.runAssessment({
    assessmentId: assessmentStart.assessment.id,
    industry: input.segment,
  });

  const businessDay = await businessOperating.startBusinessDay({
    organizationId: context.organizationId,
    companyId,
    agencyId: context.agencyId,
  });

  const businessHealth = await businessOperating.analyzeHealth(
    context.organizationId,
    companyId,
  );

  const executiveContext = buildOnboardingContext(input, companyId);
  const executiveIntelligence = buildExecutiveIntelligence(executiveContext);
  const executiveStrategy = buildExecutiveStrategy({
    context: executiveContext,
    intelligence: executiveIntelligence,
  });

  const marketingExecutive = buildMarketingExecutive({
    companyName: input.companyName,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
  });
  const salesExecutive = buildSalesExecutive({
    companyName: input.companyName,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    marketingExecutive,
  });
  const operationsExecutive = buildOperationsExecutive({
    companyName: input.companyName,
    strategy: executiveStrategy,
    intelligence: executiveIntelligence,
    marketingExecutive,
    salesExecutive,
  });

  const council = await executiveCouncil.process({
    organizationId: context.organizationId,
    companyId,
    requestId: `onboard-council-${businessDay.id}`,
    query: `Análise inicial de ${input.companyName}: Marketing, Comercial, Operações e Tecnologia.`,
    suggestedRoles: ["marketing", "sales", "operations", "innovation"],
    priorities: input.objectives.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean),
    opportunities: executiveIntelligence.opportunities,
    context: {
      segment: input.segment,
      city: input.city,
      discoverySummary: discoveryRun.report?.summary,
    },
  });

  const opportunitiesResult = await executiveOpportunity.detectOpportunities({
    organizationId: context.organizationId,
    companyId,
    industry: input.segment,
  });

  const projectSeeds = [
    "Presença digital integrada",
    "Automação de reporting para clientes",
    "CRM comercial estruturado",
    "Dashboard executivo multi-canal",
    "Programa de conteúdo segmentado",
  ];

  for (const [index, title] of projectSeeds.entries()) {
    await executiveProjects.generateProject({
      companyId,
      title,
      businessProblem: `Necessidade identificada no onboarding de ${input.companyName}`,
      projectType: index % 2 === 0 ? "dashboard" : "automation",
      expectedImpact: 70 + index * 4,
      estimatedROI: 12000 + index * 3000,
    });
  }

  const projects = await executiveProjects.listProjects(companyId);

  const executiveCeo =
    buildExecutiveCEO({
      context: executiveContext,
      intelligence: executiveIntelligence,
      strategy: executiveStrategy,
      marketingExecutive,
      salesExecutive,
      operationsExecutive,
    }) ?? {
      executiveSummary: `Onboarding concluído para ${input.companyName}.`,
      companyHealth: { score: assessment.score.overallScore, status: "fair" as const, summary: "" },
      executiveScore: 50,
      growthScore: 50,
      riskScore: 50,
      opportunityScore: 50,
      executiveDecision: "",
      executiveRecommendation: "",
      topPriorities: [],
      nextActions: [],
      ceoMessage: "",
    };

  const plan90Days = [
    ...(executiveStrategy?.growthPlan90d.actions.slice(0, 3) ?? []),
    ...assessment.roadmap.phases
      .flatMap((phase) => phase.items.map((item) => item.title))
      .slice(0, 2),
    ...council.recommendations.slice(0, 2).map((rec) => rec.title),
  ]
    .filter(Boolean)
    .slice(0, 5);

  const now = Date.now();
  const executiveTimeline = buildExecutiveTimeline({
    brainStatus: "ready",
    isProcessing: false,
    executiveContext,
    executiveIntelligence,
    executiveStrategy,
    executiveCeo,
    marketingExecutive,
    salesExecutive,
    operationsExecutive,
    analysisStartedAt: now - 8000,
    analysisCompletedAt: now,
  });

  const memoryRecords = listExecutiveMemoryRecords(companyId);

  const companyDashboard = {
    companyId,
    companyName: input.companyName,
    healthScore: businessHealth.overallScore,
    maturityScore: assessment.assessment.enterpriseMaturityScore,
    automationScore: assessment.assessment.automationScore,
    aiReadinessScore: assessment.assessment.aiReadinessScore,
    activeProjects: projects.length,
    opportunities: opportunitiesResult.opportunities.length,
    memoryRecords: memoryRecords.length,
    timelineSteps: executiveTimeline.steps.length,
    councilReady: council.recommendations.length > 0,
  };

  const provisioning = {
    tenant: Boolean(tenant.id),
    companyBrain: brainHealth.overallScore >= 0,
    executiveMemory: memoryRecords.length > 0,
    executiveTimeline: executiveTimeline.steps.length > 0,
    executiveDashboard: companyDashboard.healthScore >= 0,
    executiveCouncil: council.recommendations.length > 0,
    executiveWorkspace: true,
  };

  return {
    companyId,
    tenantId: tenant.id,
    client: client.toJSON(),
    companyBrain: {
      companyId,
      companyName: input.companyName,
      summary: brainSnapshot.organizationSummary.toJSON().headline,
      healthScore: brainHealth.overallScore,
      signals: brainHealth.issues,
    },
    companyDashboard,
    discoverySummary:
      discoveryRun.report?.summary ??
      `Discovery concluído para ${input.companyName} no segmento ${input.segment}.`,
    assessment,
    businessHealth,
    council,
    executiveCeo,
    executiveTimeline,
    provisioning,
    opportunities: opportunitiesResult.opportunities
      .map((result) => result.opportunity.title)
      .slice(0, 5),
    risks: collectRisks(marketingExecutive, salesExecutive, operationsExecutive),
    recommendedProjects: projects.map((project) => project.title).slice(0, 5),
    plan90Days,
    scores: {
      businessHealth: assessment.assessment.businessHealthScore,
      enterpriseMaturity: assessment.assessment.enterpriseMaturityScore,
      automation: assessment.assessment.automationScore,
      aiReadiness: assessment.assessment.aiReadinessScore,
    },
    opportunityResults: opportunitiesResult.opportunities,
    projects,
  };
}

export function mergeOnboardingIntoWorkspace(
  data: AgencyWorkspaceData,
  result: ClientOnboardingResult,
): AgencyWorkspaceData {
  const clients = data.clients.some((client) => client.companyId === result.companyId)
    ? data.clients.map((client) =>
        client.companyId === result.companyId ? result.client : client,
      )
    : [...data.clients, result.client];

  const companyBrains = [
    ...data.companyBrains.filter((brain) => brain.companyId !== result.companyId),
    result.companyBrain,
  ];

  const companyDashboards = [
    ...data.companyDashboards.filter((dashboard) => dashboard.companyId !== result.companyId),
    result.companyDashboard,
  ];

  const agencyDashboard = data.agencyDashboard
    ? {
        ...data.agencyDashboard,
        sections: data.agencyDashboard.sections.map((section) => {
          if (section.key !== "clients") return section;
          return {
            ...section,
            metrics: {
              ...section.metrics,
              total: clients.length,
              active: clients.filter((client) => client.status === "active").length,
            },
          };
        }),
      }
    : data.agencyDashboard;

  return {
    ...data,
    clients,
    companyBrains,
    companyDashboards,
    selectedClientId: result.companyId,
    businessHealth: result.businessHealth,
    council: result.council,
    opportunities: result.opportunityResults,
    projects: result.projects,
    assessments: [result.assessment, ...data.assessments.filter((a) => a.assessment.companyId !== result.companyId)],
    agencyDashboard,
    executiveCeoSummary: {
      headline: result.executiveCeo.executiveSummary,
      healthScore: result.executiveCeo.companyHealth.score,
      topPriorities: result.executiveCeo.topPriorities.slice(0, 5),
      recommendations: result.plan90Days,
    },
  };
}
