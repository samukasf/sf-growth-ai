import { createEnterpriseBrainRuntime } from "@/core/enterprise-brain-runtime";
import { createExecutiveCouncil } from "@/core/executive-council";
import { createExecutiveOrchestrator } from "@/core/executive-orchestrator";
import {
  generateOrchestratorResponse,
  orchestratorResultToBrain,
  runExecutiveOrchestration,
} from "@/features/samuel-ai/services/executive-orchestrator.service";
import {
  emptyConversationMemorySummary,
  getConversationMemoryStore,
  renderConversationContext,
  toConversationMemorySummary,
} from "@/features/samuel-conversation-memory";
import { classifyIntent } from "@/features/samuel-intent-router";
import { createGoalPlanner } from "@/features/samuel-goal-planner";
import {
  createMultiToolTaskOrchestrator,
  isMultiToolTaskOrchestratorEnabled,
  planMultiToolTask,
} from "@/features/samuel-multi-tool-task-orchestrator";
import type { MultiToolTaskExecutionResult } from "@/features/samuel-multi-tool-task-orchestrator";
import { createToolOrchestrator } from "@/features/samuel-tool-orchestrator";
import { interpretMultiToolTaskResults, interpretToolResult } from "@/features/samuel-tool-interpreter";

import { generateNarrativeViaAIGateway } from "./ai-gateway-narrative.adapter";
import { createToolPlanner } from "./tool-planner";

import type { ConversationState } from "@/features/samuel-conversation-memory";

import type {
  RunSamuelRuntimeInput,
  RuntimeCompanyBrainView,
  RuntimeConversationMemoryView,
  RuntimeCouncilView,
  RuntimeDecisionView,
  RuntimeGoalPlanView,
  RuntimeMemoryView,
  RuntimeMultiToolTaskView,
  RuntimePhase,
  RuntimePipelineStep,
  RuntimeResponse,
  RuntimeToolExecutionView,
} from "./types";

const PIPELINE_DEFINITION: Array<{ id: RuntimePhase; label: string }> = [
  { id: "intent", label: "Intent Router" },
  { id: "goal_planning", label: "Goal Planner" },
  { id: "conversation_memory", label: "Conversation Memory" },
  { id: "orchestrator", label: "Samuel Orchestrator" },
  { id: "memory", label: "Memory" },
  { id: "context", label: "Context" },
  { id: "company_brain", label: "Company Brain" },
  { id: "executive_council", label: "Executive Council" },
  { id: "decision", label: "Decision" },
  { id: "tooling", label: "Tool Planning" },
  { id: "response", label: "Response" },
];

const PHASE_DELAYS: Partial<Record<RuntimePhase, number>> = {
  intent: 150,
  goal_planning: 100,
  conversation_memory: 100,
  orchestrator: 400,
  memory: 300,
  context: 300,
  company_brain: 500,
  executive_council: 600,
  decision: 400,
  tooling: 150,
  response: 300,
};

/**
 * Kill-switch da Sprint 80: permite desligar a fase de Tool Planning sem
 * deploy (ex.: `SAMUEL_TOOL_CALLING_ENABLED=false`), revertendo o Samuel ao
 * comportamento anterior a esta sprint — a fase ainda ocorre no pipeline
 * (observabilidade), mas nenhuma ferramenta é planejada/executada.
 */
function isToolCallingEnabled(): boolean {
  return process.env.SAMUEL_TOOL_CALLING_ENABLED !== "false";
}

/**
 * Kill-switch da Sprint 81: desliga a leitura/escrita da Conversation
 * Memory sem deploy. A fase `conversation_memory` continua no pipeline
 * (observabilidade), mas nenhuma consulta/gravação ocorre — equivalente ao
 * comportamento anterior a esta sprint.
 */
function isConversationMemoryEnabled(): boolean {
  return process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED !== "false";
}

/**
 * Kill-switch da Sprint 82: desliga o planejamento de objetivo sem deploy. A
 * fase `goal_planning` continua no pipeline (observabilidade), mas devolve
 * um plano vazio — nenhuma fase downstream depende do Goal Plan nesta
 * sprint, então desligá-lo não altera o comportamento de mais nada.
 */
function isGoalPlannerEnabled(): boolean {
  return process.env.SAMUEL_GOAL_PLANNER_ENABLED !== "false";
}

function emptyGoalPlan(finalObjective: string): RuntimeGoalPlanView {
  return { finalObjective, steps: [], priority: "low" };
}

function buildMultiToolResultSummary(multiToolTask: RuntimeMultiToolTaskView): string | null {
  if (!multiToolTask.attempted || !multiToolTask.steps?.length) return null;

  const lines = multiToolTask.steps
    .filter((step) => step.status === "success")
    .map((step) => {
      switch (step.toolName) {
        case "google-contacts":
          return "👤 Contato consultado com sucesso.";
        case "google-calendar":
          return "📅 Evento criado no calendário.";
        case "gmail":
          return "📧 Convite enviado por e-mail.";
        default:
          return `✓ ${step.toolName}: concluído.`;
      }
    });

  if (lines.length === 0) return null;
  return lines.join("\n");
}

/**
 * Resumo determinístico e curto do resultado de uma ferramenta bem-sucedida,
 * prefixado à narrativa final quando o Tool Interpreter está desligado.
 * Nunca é chamado em caso de erro/`attempted: false` — nesses casos a
 * narrativa permanece idêntica à de antes desta sprint.
 */
function buildToolResultSummary(tooling: RuntimeToolExecutionView): string | null {
  if (!tooling.attempted || tooling.status !== "success") return null;

  switch (tooling.toolName) {
    case "calculator": {
      const output = tooling.output as { result?: number } | undefined;
      return output?.result != null ? `🧮 Resultado do cálculo: ${output.result}.` : null;
    }
    case "date-time": {
      const output = tooling.output as { value?: string } | undefined;
      return output?.value ? `🕒 Data/hora atual: ${output.value}.` : null;
    }
    case "uuid": {
      const output = tooling.output as { uuids?: string[] } | undefined;
      return output?.uuids?.length ? `🆔 UUID gerado: ${output.uuids.join(", ")}.` : null;
    }
    case "json-formatter": {
      const output = tooling.output as { formatted?: string } | undefined;
      return output?.formatted ? `🧾 JSON formatado:\n${output.formatted}` : null;
    }
    case "supabase-query": {
      const output = tooling.output as { summary?: string } | undefined;
      return output?.summary ? `📊 ${output.summary}` : null;
    }
    case "gmail": {
      const output = tooling.output as { summary?: string; data?: { preview?: string } } | undefined;
      if (!output?.summary) return null;
      return output.data?.preview
        ? `📧 ${output.summary}\n${output.data.preview}`
        : `📧 ${output.summary}`;
    }
    case "google-calendar": {
      const output = tooling.output as { summary?: string; data?: { preview?: string } } | undefined;
      if (!output?.summary) return null;
      return output.data?.preview
        ? `📅 ${output.summary}\n${output.data.preview}`
        : `📅 ${output.summary}`;
    }
    case "google-contacts": {
      const output = tooling.output as { summary?: string; data?: { preview?: string } } | undefined;
      if (!output?.summary) return null;
      return output.data?.preview
        ? `👤 ${output.summary}\n${output.data.preview}`
        : `👤 ${output.summary}`;
    }
    case "google-drive": {
      const output = tooling.output as {
        summary?: string;
        data?: { preview?: string; hasContent?: boolean };
      } | undefined;
      if (!output?.summary) return null;
      return output.data?.preview
        ? `📁 ${output.summary}\n${output.data.preview}`
        : `📁 ${output.summary}`;
    }
    default:
      return null;
  }
}

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
  const conversationId = input.conversationId ?? `${organizationId}:${companyId}`;
  const query = input.query.trim();
  const pipeline = createPipeline();
  const shouldAnimate = input.animate !== false;
  const conversationMemoryEnabled = isConversationMemoryEnabled();

  /**
   * Observabilidade (Sprint 76): rastreia a fase atualmente "em execução"
   * para medir sua duração real. `advancePhase` finaliza a fase anterior
   * (registrando `completedAt`/`durationMs` com o tempo decorrido desde seu
   * início) antes de iniciar a próxima — assim a duração cobre o trabalho
   * real da fase (não só o delay de animação), sem alterar a ordem, o
   * conteúdo ou o resultado de nenhuma fase.
   */
  let activePhase: { id: RuntimePhase; startedAt: number } | null = null;

  function finalizeActivePhase() {
    if (!activePhase) return;
    const step = pipeline.find((item) => item.id === activePhase!.id);
    if (step) {
      const completedAt = Date.now();
      step.completedAt = new Date(completedAt).toISOString();
      step.durationMs = completedAt - activePhase.startedAt;
      step.status = "complete";
    }
    activePhase = null;
  }

  async function advancePhase(phaseId: RuntimePhase) {
    finalizeActivePhase();

    const step = pipeline.find((item) => item.id === phaseId);
    if (!step) return;

    const startedAt = Date.now();
    step.status = "running";
    step.startedAt = new Date(startedAt).toISOString();
    activePhase = { id: phaseId, startedAt };

    input.onPhase?.(phaseId, pipeline.map((item) => ({ ...item })));

    if (shouldAnimate && PHASE_DELAYS[phaseId]) {
      await delay(PHASE_DELAYS[phaseId]!);
    }
  }

  await advancePhase("intent");
  const intent = classifyIntent(query);

  await advancePhase("goal_planning");
  const goalPlan: RuntimeGoalPlanView = isGoalPlannerEnabled()
    ? createGoalPlanner().plan({
        query,
        intentCategory: intent.category,
        intentConfidence: intent.confidence,
      })
    : emptyGoalPlan(query);

  await advancePhase("conversation_memory");
  const priorConversationState: ConversationState | null = conversationMemoryEnabled
    ? getConversationMemoryStore().get(conversationId)
    : null;
  const conversationContext = priorConversationState
    ? renderConversationContext(priorConversationState) ?? undefined
    : undefined;

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

  await advancePhase("tooling");
  let tooling: RuntimeToolExecutionView = { attempted: false };
  let multiToolTask: RuntimeMultiToolTaskView = {
    enabled: isMultiToolTaskOrchestratorEnabled(),
    attempted: false,
  };
  let multiToolExecution: MultiToolTaskExecutionResult | null = null;

  if (isToolCallingEnabled()) {
    const multiToolEnabled = isMultiToolTaskOrchestratorEnabled();
    if (multiToolEnabled) {
      const multiPlan = planMultiToolTask(query);
      if (multiPlan.selected) {
        multiToolExecution = await createMultiToolTaskOrchestrator().execute(multiPlan, {
          organizationId,
          companyId,
        });
        multiToolTask = {
          enabled: true,
          attempted: true,
          overallStatus: multiToolExecution.overallStatus,
          summary: multiToolExecution.summary,
          steps: multiToolExecution.steps.map((step) => ({
            id: step.id,
            toolName: step.toolName,
            actionId: step.actionId,
            reason: step.reason,
            status: step.status,
            durationMs: step.durationMs,
            error: step.error,
          })),
          totalDurationMs: multiToolExecution.totalDurationMs,
        };
      }
    }

    if (!multiToolTask.attempted) {
      const toolPlan = createToolPlanner().plan(query);
      if (toolPlan.selected) {
        const toolResult = await createToolOrchestrator().execute(toolPlan.toolName, toolPlan.input, {
          organizationId,
          companyId,
        });
        tooling = {
          attempted: true,
          toolName: toolPlan.toolName,
          reason: toolPlan.reason,
          input: toolPlan.input,
          output: toolResult.output,
          status: toolResult.status,
          error: toolResult.error,
          durationMs: toolResult.durationMs,
        };
      }
    }
  }

  await advancePhase("response");
  const brain = orchestratorResultToBrain(query, orchestratorResult);
  const heuristicNarrative =
    councilResult.response ||
    generateOrchestratorResponse(brain, input.companyContext ?? undefined);

  const toolInterpretation = multiToolExecution?.attempted
    ? interpretMultiToolTaskResults({
        steps: multiToolExecution.steps.map((step) => ({
          toolName: step.toolName,
          actionId: step.actionId,
          toolInput: step.input,
          toolOutput: step.output,
          status: step.status === "pending" ? "skipped" : step.status,
        })),
        intent,
        conversationContext,
        userQuery: query,
      })
    : tooling.attempted && tooling.status === "success" && tooling.toolName
      ? interpretToolResult({
          toolName: tooling.toolName,
          toolInput: tooling.input,
          toolOutput: tooling.output,
          intent,
          conversationContext,
          userQuery: query,
        })
      : interpretToolResult(null);

  const gatewayConversationContext = [
    conversationContext,
    toolInterpretation.used ? toolInterpretation.contextForAi : undefined,
  ]
    .filter((block): block is string => Boolean(block))
    .join("\n\n");

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
    conversationContext: gatewayConversationContext || undefined,
  });
  const baseNarrative = gatewayResult?.narrative ?? heuristicNarrative;

  let narrative = baseNarrative;
  if (toolInterpretation.enabled && toolInterpretation.used) {
    if (!gatewayResult?.narrative && toolInterpretation.humanFallback) {
      narrative = `${toolInterpretation.humanFallback}\n\n${baseNarrative}`;
    }
  } else {
    const toolResultSummary = multiToolTask.attempted
      ? buildMultiToolResultSummary(multiToolTask)
      : buildToolResultSummary(tooling);
    narrative = toolResultSummary ? `${toolResultSummary}\n\n${baseNarrative}` : baseNarrative;
  }

  const aiGateway = gatewayResult?.metadata ?? { used: false };

  const headline =
    query.toLowerCase().includes("empresa") || query.toLowerCase().includes("analise")
      ? `Análise de ${companyName} concluída`
      : "Análise executiva concluída";

  let conversationMemory: RuntimeConversationMemoryView = emptyConversationMemorySummary(conversationId);
  if (conversationMemoryEnabled) {
    const updatedConversationState = getConversationMemoryStore().recordTurn({
      conversationId,
      organizationId,
      companyId,
      userMessage: query,
      assistantMessage: narrative,
      activeContextObjective: orchestratorResult.context.detectedObjective,
      intent: { category: intent.category, confidence: intent.confidence, justification: intent.justification },
      tool: tooling.attempted
        ? {
            toolName: tooling.toolName!,
            status: tooling.status!,
            output: tooling.output,
            error: tooling.error,
          }
        : null,
    });
    conversationMemory = toConversationMemorySummary(updatedConversationState);
  }

  // Fecha a medição da última fase ("response"), que só termina aqui —
  // depois da geração da narrativa, da chamada ao AI Gateway e da
  // gravação da Conversation Memory.
  finalizeActivePhase();

  return {
    query,
    pipeline: pipeline.map((item) => ({ ...item })),
    intent,
    goalPlan,
    memory,
    context: {
      objective: orchestratorResult.context.detectedObjective,
      fields: contextFields,
    },
    companyBrain,
    executiveCouncil,
    decision,
    tooling,
    multiToolTask,
    conversationMemory,
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
