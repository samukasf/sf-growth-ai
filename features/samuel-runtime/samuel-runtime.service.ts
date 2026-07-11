import { createEnterpriseBrainRuntime } from "@/core/enterprise-brain-runtime";
import { createExecutiveCouncil } from "@/core/executive-council";
import { createExecutiveOrchestrator } from "@/core/executive-orchestrator";
import {
  generateOrchestratorResponse,
  orchestratorResultToBrain,
  runExecutiveOrchestration,
} from "@/features/samuel-ai/services/executive-orchestrator.service";

import { generateNarrativeViaAIGateway } from "./ai-gateway-narrative.adapter";

import type {
  RunSamuelRuntimeInput,
  RuntimeCompanyBrainView,
  RuntimeCouncilView,
  RuntimeDecisionView,
  RuntimeMemoryView,
  RuntimePhase,
  RuntimePipelineStep,
  RuntimeResponse,
} from "./types";

const PIPELINE_DEFINITION: Array<{ id: RuntimePhase; label: string }> = [
  { id: "orchestrator", label: "Samuel Orchestrator" },
  { id: "memory", label: "Memory" },
  { id: "context", label: "Context" },
  { id: "company_brain", label: "Company Brain" },
  { id: "executive_council", label: "Executive Council" },
  { id: "decision", label: "Decision" },
  { id: "response", label: "Response" },
];

const PHASE_DELAYS: Partial<Record<RuntimePhase, number>> = {
  orchestrator: 400,
  memory: 300,
  context: 300,
  company_brain: 500,
  executive_council: 600,
  decision: 400,
  response: 300,
};

const ROLE_LABELS: Record<string, string> = {
  ceo: "CEO",
  finance: "Financeiro",
  marketing: "Marketing",
  sales: "Vendas",
  operations: "Operações",
  hr: "RH",
  legal: "Jurídico",
  crm: "CRM",
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createPipeline(): RuntimePipelineStep[] {
  return PIPELINE_DEFINITION.map((step) => ({
    ...step,
    status: "pending",
  }));
}

function priorityLabel(priority: string): string {
  if (priority === "critical") return "crítica";
  if (priority === "high") return "alta";
  if (priority === "medium") return "média";
  return "estratégica";
}

function confidenceLevel(score: number): string {
  if (score >= 80) return "alta";
  if (score >= 60) return "média";
  return "baixa";
}

function buildMemoryView(
  orchestratorResult: ReturnType<typeof runExecutiveOrchestration>,
): RuntimeMemoryView {
  const recent = orchestratorResult.memory.recentDecisions[0]?.summary;
  const summary =
    recent ??
    "Memória executiva carregada com padrões históricos e decisões anteriores da organização.";

  return {
    summary,
    insights: orchestratorResult.memory.relevantPatterns,
  };
}

function buildCompanyBrainView(
  headline: string,
  priorities: string[],
  risks: string[],
  confidence: number,
): RuntimeCompanyBrainView {
  const facts = [...priorities.slice(0, 3), ...risks.slice(0, 2)].filter(Boolean);

  return {
    status: "active",
    headline,
    facts: facts.length > 0 ? facts : ["Contexto corporativo indexado e pronto para consulta."],
    confidence,
  };
}

function buildCouncilView(
  councilResult: Awaited<ReturnType<ReturnType<typeof createExecutiveCouncil>["process"]>>,
): RuntimeCouncilView {
  return {
    status: "ready",
    memberCount: councilResult.members.length,
    consensus: councilResult.consensus.consolidatedSummary,
    specialists: councilResult.opinions.slice(0, 4).map((opinion) => ({
      role: ROLE_LABELS[opinion.role] ?? opinion.role,
      name:
        councilResult.members.find((member) => member.id === opinion.memberId)?.name ??
        opinion.role,
      summary: opinion.summary,
    })),
  };
}

function buildDecisionView(
  councilResult: Awaited<ReturnType<ReturnType<typeof createExecutiveCouncil>["process"]>>,
): RuntimeDecisionView {
  const recommendation = councilResult.recommendations[0];

  return {
    title: recommendation?.title ?? "Decisão executiva",
    rationale: councilResult.decision.rationale,
    priority: recommendation ? "alta" : "estratégica",
    nextAction:
      recommendation?.actionItems[0] ??
      councilResult.decision.decision,
    confidence: councilResult.decision.confidence,
  };
}

export async function runSamuelRuntime(
  input: RunSamuelRuntimeInput,
): Promise<RuntimeResponse> {
  const organizationId = input.organizationId ?? "default-org";
  const companyId = input.companyId ?? "default-company";
  const companyName = input.companyName ?? "sua empresa";
  const query = input.query.trim();
  const pipeline = createPipeline();
  const shouldAnimate = input.animate !== false;

  async function advancePhase(phaseId: RuntimePhase) {
    const step = pipeline.find((item) => item.id === phaseId);
    if (!step) return;

    step.status = "running";
    input.onPhase?.(phaseId, pipeline.map((item) => ({ ...item })));

    if (shouldAnimate && PHASE_DELAYS[phaseId]) {
      await delay(PHASE_DELAYS[phaseId]!);
    }

    step.status = "complete";
  }

  await advancePhase("orchestrator");
  const orchestratorResult = runExecutiveOrchestration(query, input.companyContext);
  await createExecutiveOrchestrator({ companyId, organizationId }).processRequest({
    organizationId,
    companyId,
    query,
    metadata: { source: "samuel-runtime" },
  });

  await advancePhase("memory");
  const memory = buildMemoryView(orchestratorResult);

  await advancePhase("context");
  const contextFields = orchestratorResult.context.fields.map((field) => ({
    label: field.label,
    value: field.value,
  }));

  await advancePhase("company_brain");
  const brainRuntime = createEnterpriseBrainRuntime();
  const snapshot = await brainRuntime.buildSnapshot(organizationId, companyId);
  const companyBrain = buildCompanyBrainView(
    snapshot.organizationSummary.headline,
    snapshot.priorities,
    snapshot.risks,
    snapshot.confidence,
  );

  await advancePhase("executive_council");
  const councilRuntime = createExecutiveCouncil();
  const councilResult = await councilRuntime.process({
    organizationId,
    companyId,
    requestId: `runtime-${Date.now()}`,
    query,
    brainSnapshotId: snapshot.id,
    risks: snapshot.risks,
    opportunities: snapshot.opportunities,
    priorities: snapshot.priorities,
    context: { companyName, source: "samuel-runtime" },
  });

  await advancePhase("decision");
  const decision = buildDecisionView(councilResult);
  const executiveCouncil = buildCouncilView(councilResult);

  await advancePhase("response");
  const brain = orchestratorResultToBrain(query, orchestratorResult);
  const heuristicNarrative =
    councilResult.response ||
    generateOrchestratorResponse(brain, input.companyContext ?? undefined);
  const gatewayResult = await generateNarrativeViaAIGateway({
    organizationId,
    companyId,
    companyName,
    query,
    priorities: snapshot.priorities,
    risks: snapshot.risks,
    opportunities: snapshot.opportunities,
    councilConsensus: councilResult.consensus.consolidatedSummary,
    decisionRationale: councilResult.decision.rationale,
    operation: input.aiGatewayOperation,
  });
  const narrative = gatewayResult?.narrative ?? heuristicNarrative;
  const aiGateway = gatewayResult?.metadata ?? { used: false };

  const headline =
    query.toLowerCase().includes("empresa") || query.toLowerCase().includes("analise")
      ? `Análise de ${companyName} concluída`
      : "Análise executiva concluída";

  return {
    query,
    pipeline: pipeline.map((item) => ({ ...item })),
    memory,
    context: {
      objective: orchestratorResult.context.detectedObjective,
      fields: contextFields,
    },
    companyBrain,
    executiveCouncil,
    decision,
    response: {
      headline,
      narrative,
      actionPlanSummary: orchestratorResult.actionPlan.summary,
      actions: orchestratorResult.actionPlan.actions.map((action) => ({
        title: action.title,
        description: action.description,
        priority: priorityLabel(action.priority),
        timeframe: action.timeframe,
        impact: action.impactDescription,
      })),
      confidence: {
        score: orchestratorResult.confidence.score,
        level: confidenceLevel(orchestratorResult.confidence.score),
        rationale: orchestratorResult.confidence.rationale,
      },
    },
    aiGateway,
    generatedAt: new Date().toISOString(),
  };
}
