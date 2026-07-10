import type {
  OrchestratorResponse,
  PipelineStep,
  RuntimeContext,
  UserMessage,
} from "./orchestrator.types";

export function prepareOrchestratorResponse(
  message: UserMessage,
  runtime: RuntimeContext,
  steps: PipelineStep[],
  generatedText: string | null = null,
): OrchestratorResponse {
  const diagnosis = buildDiagnosis(runtime);
  const recommendation = buildRecommendation(runtime);
  const nextStep = buildNextStep(runtime);
  const confidence = computeConfidence(runtime, steps);

  return {
    id: `response-${Date.now()}`,
    messageId: message.id,
    tenantId: message.tenantId,
    companyId: message.companyId,
    intent: runtime.intent,
    diagnosis,
    recommendation,
    nextStep,
    confidence,
    runtime,
    steps,
    generatedText,
    generatedAt: new Date().toISOString(),
  };
}

function buildDiagnosis(runtime: RuntimeContext): string {
  const parts: string[] = [];

  if (runtime.companyBrain) {
    const healthEntries = Object.entries(runtime.companyBrain.health);
    if (healthEntries.length > 0) {
      const weakest = healthEntries.sort((a, b) => a[1] - b[1])[0];
      parts.push(
        `Dimensão mais crítica: ${weakest[0]} (${weakest[1]}%).`,
      );
    }
    if (runtime.companyBrain.growthScore !== undefined) {
      parts.push(`Growth Score: ${runtime.companyBrain.growthScore}/1000.`);
    }
  }

  if (runtime.memorySummary && runtime.memorySummary.totalMemories > 0) {
    parts.push(
      `${runtime.memorySummary.totalMemories} memórias relevantes consultadas.`,
    );
  }

  if (runtime.executiveCouncil) {
    parts.push(`Conselho consultado: ${runtime.executiveCouncil.summary}`);
  }

  if (parts.length === 0) {
    return "Contexto inicial carregado. Dados limitados disponíveis para diagnóstico.";
  }

  return parts.join(" ");
}

function buildRecommendation(runtime: RuntimeContext): string {
  if (runtime.executiveCouncil?.opinions.length) {
    return runtime.executiveCouncil.opinions[0].opinion;
  }

  const topFragment = runtime.contextOutput?.prioritizedFragments[0];
  if (topFragment) {
    return `Prioridade identificada: ${topFragment.title} — ${topFragment.content}`;
  }

  switch (runtime.intent.intent) {
    case "sales":
      return "Revisar canais de aquisição e reativar base de clientes inativos.";
    case "marketing":
      return "Avaliar campanhas pausadas e canais subutilizados.";
    case "software":
      return "Definir escopo mínimo viável antes de desenvolver.";
    case "analysis":
      return "Completar diagnóstico por dimensão e priorizar blockers.";
    default:
      return "Consultar dados adicionais antes de recomendar ação específica.";
  }
}

function buildNextStep(runtime: RuntimeContext): string {
  switch (runtime.intent.intent) {
    case "sales":
    case "marketing":
      return "Deseja que eu gere um plano de ação detalhado para aprovação?";
    case "software":
      return "Confirme o escopo (landing page, PWA ou app nativo) para iniciar o briefing.";
    case "execution":
      return "Confirme a ação para que eu prepare o plano de execução.";
    case "analysis":
      return "Deseja aprofundar alguma dimensão específica do diagnóstico?";
    default:
      return "Como posso ajudar a avançar neste tema?";
  }
}

function computeConfidence(runtime: RuntimeContext, steps: PipelineStep[]): number {
  let score = runtime.intent.confidence;

  if (runtime.companyBrain) score += 10;
  if (runtime.memorySummary && runtime.memorySummary.totalMemories > 0) score += 10;
  if (runtime.contextOutput && runtime.contextOutput.prioritizedFragments.length > 0) {
    score += 10;
  }
  if (runtime.executiveCouncil) score += 5;

  const failedSteps = steps.filter((s) => s.status === "failed").length;
  score -= failedSteps * 15;

  return Math.max(0, Math.min(100, score));
}
