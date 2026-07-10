import type { ContextOutput } from "../context/context.types";
import type { MemorySearchResult, MemorySummary } from "../memory/memory.types";

export type PipelineStepName =
  | "load_memory"
  | "load_context"
  | "load_company_brain"
  | "load_executive_council"
  | "merge_context"
  | "build_runtime"
  | "prepare_response";

export type PipelineStepStatus = "pending" | "running" | "success" | "skipped" | "failed";

export interface UserMessage {
  id: string;
  tenantId: string;
  companyId: string;
  userId: string;
  content: string;
  sessionId?: string;
  receivedAt: string;
}

export interface QueryIntentResult {
  intent: string;
  confidence: number;
  requiresCouncil: boolean;
}

export interface CompanyBrainSnapshot {
  tenantId: string;
  companyId: string;
  companyName: string;
  growthScore?: number;
  health: Record<string, number>;
  profile: Record<string, unknown>;
  generatedAt: string;
}

export interface ExecutiveOpinion {
  executiveId: string;
  role: string;
  opinion: string;
}

export interface ExecutiveCouncilSnapshot {
  sessionId: string;
  tenantId: string;
  companyId: string;
  topic: string;
  opinions: ExecutiveOpinion[];
  consensus: boolean;
  summary: string;
  generatedAt: string;
}

export interface PipelineStep {
  name: PipelineStepName;
  status: PipelineStepStatus;
  durationMs: number;
  result: Record<string, unknown>;
  error?: string;
}

export interface ExecutionContext {
  message: UserMessage;
  intent: QueryIntentResult;
  memoryResults: MemorySearchResult[];
  memorySummary: MemorySummary | null;
  contextOutput: ContextOutput | null;
  companyBrain: CompanyBrainSnapshot | null;
  executiveCouncil: ExecutiveCouncilSnapshot | null;
  steps: PipelineStep[];
}

export interface RuntimeContext {
  id: string;
  tenantId: string;
  companyId: string;
  query: string;
  intent: QueryIntentResult;
  memorySummary: MemorySummary | null;
  contextOutput: ContextOutput | null;
  companyBrain: CompanyBrainSnapshot | null;
  executiveCouncil: ExecutiveCouncilSnapshot | null;
  mergedFragmentCount: number;
  builtAt: string;
  /** Structured payload for future LLM providers (OpenAI, Anthropic, Gemini). */
  llmPayload: LLMPayload;
}

export interface LLMPayload {
  systemContext: string;
  userQuery: string;
  fragments: string[];
  metadata: Record<string, unknown>;
}

export interface LLMCompletionInput {
  payload: LLMPayload;
  model?: string;
  temperature?: number;
}

export interface LLMCompletionResult {
  content: string;
  providerId: string;
  model: string;
  generatedAt: string;
}

export interface OrchestratorResponse {
  id: string;
  messageId: string;
  tenantId: string;
  companyId: string;
  intent: QueryIntentResult;
  diagnosis: string;
  recommendation: string;
  nextStep: string;
  confidence: number;
  runtime: RuntimeContext;
  steps: PipelineStep[];
  /** Reserved for future LLM-generated prose. Empty until a provider is connected. */
  generatedText: string | null;
  generatedAt: string;
}

export interface CompanyBrainPort {
  loadSnapshot(tenantId: string, companyId: string): Promise<CompanyBrainSnapshot>;
}

export interface ExecutiveCouncilPort {
  consult(input: {
    tenantId: string;
    companyId: string;
    topic: string;
    query: string;
  }): Promise<ExecutiveCouncilSnapshot | null>;
}

export interface LLMProviderPort {
  readonly providerId: string;
  complete(input: LLMCompletionInput): Promise<LLMCompletionResult>;
}

export interface OrchestratorDependencies {
  memoryService: import("../memory/memory.service").MemoryService;
  contextService: import("../context/context.service").ContextService;
  companyBrain: CompanyBrainPort;
  executiveCouncil: ExecutiveCouncilPort;
  llmProvider?: LLMProviderPort | null;
  logger?: OrchestratorLoggerPort;
}

export interface OrchestratorLoggerPort {
  log(entry: StructuredLogEntry): void;
}

export interface StructuredLogEntry {
  level: "info" | "warn" | "error";
  step?: PipelineStepName;
  message: string;
  durationMs?: number;
  status?: PipelineStepStatus;
  result?: Record<string, unknown>;
  tenantId?: string;
  companyId?: string;
  timestamp: string;
}
