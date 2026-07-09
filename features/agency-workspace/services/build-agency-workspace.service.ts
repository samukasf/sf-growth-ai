import { createAgencyCore } from "@/core/agency-core";
import { createBusinessOperating } from "@/core/business-operating";
import { createEnterpriseAssessment } from "@/core/enterprise-assessment";
import { createEnterpriseBrainRuntime } from "@/core/enterprise-brain-runtime";
import { createExecutiveCouncil } from "@/core/executive-council";
import { ExecutiveMission } from "@/core/executive-missions/domain";
import { createExecutiveOpportunity } from "@/core/executive-opportunity";
import { createExecutiveProjectEngine } from "@/core/executive-projects";
import { createSoftwareFactory } from "@/core/software-factory";

import type { AgencyWorkspaceData, ClientDisplayMeta, CompanyBrainSnapshot } from "../types/agency-workspace.types";

const INFLUENCE_ORG_ID = "org-influence";

const DEMO_CLIENTS = [
  { companyId: "company-grafgil", name: "Grafgil", industry: "Gráfica" },
  { companyId: "company-prime-house", name: "Prime House", industry: "Imobiliária" },
  { companyId: "company-praia-do-sol", name: "Praia do Sol", industry: "Mudanças" },
];

const DEMO_CLIENT_DISPLAY: Record<string, ClientDisplayMeta> = {
  "company-grafgil": { segment: "Gráfica", city: "Lisboa", lifecycleLabel: "Saudável" },
  "company-prime-house": { segment: "Imobiliária", city: "Flórida", lifecycleLabel: "Novo Cliente" },
  "company-praia-do-sol": { segment: "Mudanças", city: "Lisboa", lifecycleLabel: "Em Onboarding" },
};

export async function buildAgencyWorkspace(): Promise<AgencyWorkspaceData> {
  const agencyCore = createAgencyCore();
  const businessOperating = createBusinessOperating();
  const companyBrainRuntime = createEnterpriseBrainRuntime();
  const executiveCouncil = createExecutiveCouncil();
  const executiveOpportunity = createExecutiveOpportunity();
  const executiveProjects = createExecutiveProjectEngine();
  const enterpriseAssessment = createEnterpriseAssessment();
  const softwareFactory = createSoftwareFactory();

  const agency = await agencyCore.createAgency({
    organizationId: INFLUENCE_ORG_ID,
    name: "Influence Publicidade",
    slug: "influence-publicidade",
  });

  const clientRecords = [];
  for (const client of DEMO_CLIENTS) {
    const record = await agencyCore.addClient({
      organizationId: INFLUENCE_ORG_ID,
      agencyId: agency.id,
      companyId: client.companyId,
      name: client.name,
      industry: client.industry,
    });
    clientRecords.push(record.toJSON());
  }

  const [agencyBrain, agencyDashboard, agencyHealth, agencyMetrics] = await Promise.all([
    agencyCore.buildContext(INFLUENCE_ORG_ID, agency.id),
    agencyCore.buildDashboard(INFLUENCE_ORG_ID, agency.id),
    agencyCore.analyzeHealth(INFLUENCE_ORG_ID, agency.id),
    agencyCore.computeMetrics(INFLUENCE_ORG_ID, agency.id),
  ]);

  const selectedClient = DEMO_CLIENTS[0];

  const businessDay = await businessOperating.startBusinessDay({
    organizationId: INFLUENCE_ORG_ID,
    companyId: selectedClient.companyId,
    agencyId: agency.id,
  });

  const [routines, priorities, businessHealth, businessReview] = await Promise.all([
    businessOperating.planRoutines(
      INFLUENCE_ORG_ID,
      selectedClient.companyId,
      businessDay.id,
      agency.id,
    ),
    businessOperating.calculatePriorities(
      INFLUENCE_ORG_ID,
      selectedClient.companyId,
      businessDay.id,
      agency.id,
    ),
    businessOperating.analyzeHealth(INFLUENCE_ORG_ID, selectedClient.companyId),
    businessOperating.buildReview(
      INFLUENCE_ORG_ID,
      selectedClient.companyId,
      businessDay.id,
      agency.id,
    ),
  ]);

  const companyBrains: CompanyBrainSnapshot[] = [];
  for (const client of DEMO_CLIENTS) {
    const snapshot = await companyBrainRuntime.buildSnapshot(INFLUENCE_ORG_ID, client.companyId);
    const health = await companyBrainRuntime.analyzeHealth(INFLUENCE_ORG_ID, client.companyId);
    companyBrains.push({
      companyId: client.companyId,
      companyName: client.name,
      summary: snapshot.organizationSummary.toJSON().headline,
      healthScore: health.overallScore,
      signals: health.issues,
    });
  }

  const council = await executiveCouncil.process({
    organizationId: INFLUENCE_ORG_ID,
    companyId: selectedClient.companyId,
    requestId: `council-${businessDay.id}`,
    query: "Quais são as prioridades operacionais da agência para hoje?",
    priorities: priorities.map((p) => p.title),
    opportunities: ["Expansão social media", "Portal de reporting"],
  });

  const opportunitiesResult = await executiveOpportunity.detectOpportunities({
    organizationId: INFLUENCE_ORG_ID,
    companyId: selectedClient.companyId,
    industry: selectedClient.industry,
  });

  await executiveProjects.generateProject({
    companyId: selectedClient.companyId,
    businessProblem: "Reporting manual para clientes consome 12h/semana",
    title: "Portal de Reporting Automático",
    projectType: "dashboard",
    expectedImpact: 85,
    estimatedROI: 24000,
  });

  const projects = await executiveProjects.listProjects(selectedClient.companyId);

  const assessmentStart = await enterpriseAssessment.startAssessment({
    organizationId: INFLUENCE_ORG_ID,
    companyId: selectedClient.companyId,
    companyName: selectedClient.name,
    initiatedBy: "Samuel AI",
    industry: selectedClient.industry,
  });

  const assessmentRun = await enterpriseAssessment.runAssessment({
    assessmentId: assessmentStart.assessment.id,
    industry: selectedClient.industry,
  });

  const softwareProject = await softwareFactory.requestSoftwareProject({
    organizationId: INFLUENCE_ORG_ID,
    companyId: selectedClient.companyId,
    title: "Client Reporting Hub",
    description: "Dashboard white-label para clientes da Influence",
    projectType: "dashboard",
    businessProblem: "Relatórios manuais consomem tempo operacional",
    businessGoals: ["Automatizar reporting", "Reduzir tempo operacional"],
    functionalRequirements: ["Dashboard por cliente", "Export PDF"],
    technicalRequirements: ["Next.js", "Multi-tenant"],
    estimatedCost: 12000,
    estimatedTime: 30,
    estimatedROI: 36000,
    priority: "high",
  });

  const missions = priorities.slice(0, 3).map((priority, index) =>
    ExecutiveMission.create({
      organizationId: INFLUENCE_ORG_ID,
      companyId: selectedClient.companyId,
      title: priority.title,
      description: `Missão derivada da prioridade operacional #${priority.rank}`,
      category: "operational_excellence",
      objective: {
        id: `obj-priority-${priority.id}`,
        title: priority.title,
        description: `Executar ${priority.title}`,
        successCriteria: ["Entregue no prazo", "KPI impactado"],
      },
      priority:
        priority.level === "critical"
          ? "critical"
          : priority.level === "high"
            ? "high"
            : "medium",
      frequency: "daily",
      owner: "Samuel AI",
      expectedImpact: priority.score,
      estimatedROI: 5000 + index * 1000,
      relatedDepartments: [priority.department],
    }).toJSON(),
  );

  return {
    organizationId: INFLUENCE_ORG_ID,
    agencyId: agency.id,
    agencyName: agency.name,
    selectedClientId: selectedClient.companyId,
    agencyBrain: agencyBrain.toJSON(),
    agencyDashboard: agencyDashboard.toJSON(),
    agencyHealth: agencyHealth.toJSON(),
    agencyMetrics: agencyMetrics.toJSON(),
    clients: clientRecords,
    clientProfiles: {},
    clientDisplay: DEMO_CLIENT_DISPLAY,
    businessDay,
    routines: routines.map((r) => r.toJSON()),
    priorities: priorities.map((p) => p.toJSON()),
    businessHealth,
    businessReview: businessReview.toJSON(),
    companyBrains,
    companyDashboards: [],
    council,
    executiveCeoSummary: {
      headline: businessReview.title,
      healthScore: businessReview.summary.healthScore,
      topPriorities: businessReview.summary.topPriorities,
      recommendations: businessReview.recommendations,
    },
    missions,
    opportunities: opportunitiesResult.opportunities,
    projects,
    assessments: [assessmentRun],
    softwareProjects: [softwareProject],
  };
}
