import type { OrchestratorResponse } from "../orchestrator/orchestrator.types";
import type { MockExecutiveDecision } from "./superbrain.types";
import type {
  RuntimeNextAction,
  RuntimeOpportunity,
  RuntimeRecommendation,
  RuntimeResponse,
  RuntimeRisk,
  RuntimeSection,
  SuperbrainPipelineStep,
} from "./superbrain.types";
import { MOCK_COMPANY_BRAIN } from "./superbrain.mocks";

function buildSections(orchestrator: OrchestratorResponse): RuntimeSection[] {
  const sections: RuntimeSection[] = [
    {
      id: "section-diagnosis",
      title: "Diagnóstico",
      content: orchestrator.diagnosis,
      source: "orchestrator",
    },
    {
      id: "section-intent",
      title: "Intenção detectada",
      content: `${orchestrator.intent.intent} (${orchestrator.intent.confidence}% confiança)`,
      source: "orchestrator",
    },
  ];

  const brain = orchestrator.runtime.companyBrain;
  if (brain) {
    sections.push({
      id: "section-health",
      title: "Saúde por dimensão",
      content: Object.entries(brain.health)
        .map(([key, value]) => `${key}: ${value}%`)
        .join(" · "),
      source: "company-brain",
    });
  }

  if (orchestrator.runtime.executiveCouncil) {
    sections.push({
      id: "section-council",
      title: "Parecer do Conselho",
      content: orchestrator.runtime.executiveCouncil.summary,
      source: "executive-council",
    });
  }

  return sections;
}

function buildRisks(orchestrator: OrchestratorResponse): RuntimeRisk[] {
  const brain = orchestrator.runtime.companyBrain ?? MOCK_COMPANY_BRAIN;
  const risks: RuntimeRisk[] = [];

  if ((brain.health.brand ?? 100) < 60) {
    risks.push({
      id: "risk-brand",
      title: "Posicionamento fragmentado",
      severity: "Critical",
      description: "Marca abaixo de 60% — fragmentação impede conversão de marketing.",
    });
  }

  if ((brain.health.digital ?? 100) < 50) {
    risks.push({
      id: "risk-digital",
      title: "Presença digital crítica",
      severity: "High",
      description: "Score digital abaixo de 50% — tráfego e conversão comprometidos.",
    });
  }

  if ((brain.health.sales ?? 100) < 50) {
    risks.push({
      id: "risk-sales",
      title: "Queda de vendas",
      severity: "High",
      description: "Dimensão vendas em 45% — receita abaixo da meta.",
    });
  }

  return risks;
}

function buildOpportunities(orchestrator: OrchestratorResponse): RuntimeOpportunity[] {
  const profile = orchestrator.runtime.companyBrain?.profile ?? MOCK_COMPANY_BRAIN.profile;

  return [
    {
      id: "opp-positioning",
      title: "Workshop de posicionamento",
      impact: "High",
      description: "Formalizar proposta de valor desbloqueia marketing e vendas.",
      effort: "7 dias",
    },
    {
      id: "opp-reactivation",
      title: "Reativar base inativa",
      impact: "High",
      description: `${String(profile.inactiveCustomers ?? 340)} clientes elegíveis para retargeting.`,
      effort: "14 dias",
    },
    {
      id: "opp-reviews",
      title: "Automação de reviews Google",
      impact: "Medium",
      description: "Potencial +15 reviews/mês com baixo esforço operacional.",
      effort: "3 dias",
    },
  ];
}

function buildRecommendations(decision: MockExecutiveDecision): RuntimeRecommendation[] {
  return [
    {
      id: decision.id,
      title: decision.title,
      description: decision.description,
      priority: decision.priority,
      department: decision.department,
      rationale: decision.rationale,
    },
    {
      id: "rec-quick-win",
      title: "Quick win: Google Business Profile",
      description: "Otimizar GBP como hub de conversão local imediato.",
      priority: "High",
      department: "Marketing",
      rationale: "Baixo esforço, impacto mensurável em 21 dias.",
    },
  ];
}

function buildNextActions(decision: MockExecutiveDecision): RuntimeNextAction[] {
  return [
    {
      id: "action-1",
      title: "Agendar workshop de posicionamento (2h)",
      owner: "Samuel AI + Empresário",
      deadline: "7 dias",
    },
    {
      id: "action-2",
      title: decision.title,
      owner: decision.department,
      deadline: "21 dias",
    },
    {
      id: "action-3",
      title: "Revisitar diagnóstico após workshop",
      owner: "Samuel AI",
      deadline: "30 dias",
    },
  ];
}

function buildSummary(
  orchestrator: OrchestratorResponse,
  decision: MockExecutiveDecision,
): string {
  const brain = orchestrator.runtime.companyBrain ?? MOCK_COMPANY_BRAIN;
  return [
    `${brain.companyName}: Growth Score ${brain.growthScore ?? 642}/1000.`,
    orchestrator.diagnosis,
    `Decisão prioritária: ${decision.title}.`,
    orchestrator.nextStep,
  ].join(" ");
}

export function buildRuntimeResponse(
  orchestrator: OrchestratorResponse,
  decision: MockExecutiveDecision,
  decisionStep: SuperbrainPipelineStep,
  totalDurationMs: number,
): RuntimeResponse {
  const pipeline: SuperbrainPipelineStep[] = [
    ...orchestrator.steps,
    decisionStep,
  ];

  return {
    id: `runtime-response-${Date.now()}`,
    query: orchestrator.runtime.query,
    tenantId: orchestrator.tenantId,
    companyId: orchestrator.companyId,
    sections: buildSections(orchestrator),
    recommendations: buildRecommendations(decision),
    risks: buildRisks(orchestrator),
    opportunities: buildOpportunities(orchestrator),
    nextActions: buildNextActions(decision),
    summary: buildSummary(orchestrator, decision),
    pipeline,
    decision,
    confidence: orchestrator.confidence,
    totalDurationMs,
    generatedAt: new Date().toISOString(),
  };
}
