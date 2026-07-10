import type { ContextFragment } from "../context/context.types";
import type {
  CompanyBrainSnapshot,
  ExecutionContext,
  LLMPayload,
  QueryIntentResult,
  RuntimeContext,
  UserMessage,
} from "./orchestrator.types";

const STRATEGIC_HINTS = [
  "estratégia",
  "estrategia",
  "strategy",
  "conselho",
  "council",
  "analis",
  "analyse",
  "analyze",
  "decisão",
  "decisao",
  "decision",
];

export function classifyQueryIntent(query: string): QueryIntentResult {
  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  let intent = "general";
  let confidence = 60;

  if (/vend|sales|receita|fatur/.test(normalized)) {
    intent = "sales";
    confidence = 85;
  } else if (/market|campanha|ads|anúncio|anuncio/.test(normalized)) {
    intent = "marketing";
    confidence = 85;
  } else if (/site|app|aplicativo|software|landing/.test(normalized)) {
    intent = "software";
    confidence = 90;
  } else if (/financ|budget|orçamento|orcamento/.test(normalized)) {
    intent = "finance";
    confidence = 85;
  } else if (/analis|diagnóst|diagnost|empresa/.test(normalized)) {
    intent = "analysis";
    confidence = 95;
  } else if (/crie|criar|create|execut/.test(normalized)) {
    intent = "execution";
    confidence = 80;
  }

  const requiresCouncil =
    intent === "analysis" ||
    intent === "strategy" ||
    STRATEGIC_HINTS.some((hint) => normalized.includes(hint));

  return { intent, confidence, requiresCouncil };
}

export function shouldConsultCouncil(intent: QueryIntentResult): boolean {
  return intent.requiresCouncil || intent.confidence < 70;
}

export function mergeExecutionContext(execution: ExecutionContext): {
  mergedFragmentCount: number;
  allFragments: ContextFragment[];
} {
  const fragmentMap = new Map<string, ContextFragment>();

  for (const result of execution.memoryResults) {
    fragmentMap.set(`memory-${result.memory.id}`, {
      id: `memory-${result.memory.id}`,
      source: "MEMORY",
      title: result.memory.title,
      content: result.memory.content,
      priority: mapMemoryImportance(result.memory.importance),
      tags: result.memory.tags,
      timestamp: result.memory.updatedAt,
    });
  }

  if (execution.contextOutput) {
    for (const fragment of execution.contextOutput.prioritizedFragments) {
      fragmentMap.set(fragment.id, fragment);
    }
  }

  if (execution.companyBrain) {
    fragmentMap.set(`brain-${execution.companyBrain.companyId}`, {
      id: `brain-${execution.companyBrain.companyId}`,
      source: "COMPANY_BRAIN",
      title: execution.companyBrain.companyName,
      content: JSON.stringify(execution.companyBrain.health),
      priority: "HIGH",
      tags: ["company-brain"],
      timestamp: execution.companyBrain.generatedAt,
    });
  }

  if (execution.executiveCouncil) {
    for (const opinion of execution.executiveCouncil.opinions) {
      fragmentMap.set(`council-${opinion.executiveId}`, {
        id: `council-${opinion.executiveId}`,
        source: "EXECUTIVE_COUNCIL",
        title: opinion.role,
        content: opinion.opinion,
        priority: "HIGH",
        tags: ["council"],
        timestamp: execution.executiveCouncil.generatedAt,
      });
    }
  }

  const allFragments = [...fragmentMap.values()];
  return { mergedFragmentCount: allFragments.length, allFragments };
}

function mapMemoryImportance(
  importance: string,
): ContextFragment["priority"] {
  if (importance === "CRITICAL" || importance === "HIGH") return "HIGH";
  if (importance === "MEDIUM") return "MEDIUM";
  return "LOW";
}

export function buildLLMPayload(
  message: UserMessage,
  intent: QueryIntentResult,
  fragments: ContextFragment[],
  companyBrain: CompanyBrainSnapshot | null,
): LLMPayload {
  return {
    systemContext: [
      "Samuel AI — Executive Digital President",
      `Tenant: ${message.tenantId}`,
      `Company: ${message.companyId}`,
      `Intent: ${intent.intent} (${intent.confidence}%)`,
      companyBrain ? `Company: ${companyBrain.companyName}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    userQuery: message.content,
    fragments: fragments.map((f) => `[${f.source}] ${f.title}: ${f.content}`),
    metadata: {
      intent: intent.intent,
      confidence: intent.confidence,
      fragmentCount: fragments.length,
    },
  };
}

export function buildRuntimeContext(
  message: UserMessage,
  execution: ExecutionContext,
  mergedFragmentCount: number,
  allFragments: ContextFragment[],
): RuntimeContext {
  return {
    id: `runtime-${Date.now()}`,
    tenantId: message.tenantId,
    companyId: message.companyId,
    query: message.content,
    intent: execution.intent,
    memorySummary: execution.memorySummary,
    contextOutput: execution.contextOutput,
    companyBrain: execution.companyBrain,
    executiveCouncil: execution.executiveCouncil,
    mergedFragmentCount,
    builtAt: new Date().toISOString(),
    llmPayload: buildLLMPayload(
      message,
      execution.intent,
      allFragments,
      execution.companyBrain,
    ),
  };
}
