import type { AIProviderType } from "../../shared";

export type AIProviderInput = {
  organizationId: string;
  model?: string;
  prompt: string;
  context?: Record<string, string>;
  temperature?: number;
  maxTokens?: number;
};

export type AIStructuredInput = AIProviderInput & {
  schema: Record<string, string>;
};

export type AIClassifyInput = AIProviderInput & {
  categories: string[];
};

export type AITranslateInput = AIProviderInput & {
  targetLanguage: string;
  sourceLanguage?: string;
};

/**
 * Metadados estruturados de toda resposta do AI Gateway. Consumidores futuros
 * (Samuel, Executive Council, Analytics, Cost Dashboard, Auditoria, otimização
 * automática de modelos) devem ler estes campos em vez de inferir a partir do
 * conteúdo textual.
 */
export type AIProviderResponseMetadata = {
  provider: { id: string; type: AIProviderType; name: string };
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Estimativa em USD a partir de uma tabela de preços aproximada por provider — não é fatura real. */
  estimatedCostUsd: number;
  /** ISO 8601, momento em que a resposta foi produzida. */
  timestamp: string;
  organizationId?: string;
};

export type AIProviderResult<T = string> = {
  content: T;
  structuredOutput?: Record<string, unknown>;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  finishReason: string;
  metadata: AIProviderResponseMetadata;
};

export interface AIProvider {
  readonly id: string;
  readonly type: AIProviderType;
  readonly name: string;
  isAvailable(): boolean;
  generateText(input: AIProviderInput): Promise<AIProviderResult<string>>;
  generateStructuredOutput(input: AIStructuredInput): Promise<AIProviderResult<Record<string, unknown>>>;
  summarize(input: AIProviderInput): Promise<AIProviderResult<string>>;
  classify(input: AIClassifyInput): Promise<AIProviderResult<string>>;
  extractEntities(input: AIProviderInput): Promise<AIProviderResult<Record<string, unknown>>>;
  analyze(input: AIProviderInput): Promise<AIProviderResult<string>>;
  translate(input: AITranslateInput): Promise<AIProviderResult<string>>;
  reason(input: AIProviderInput): Promise<AIProviderResult<string>>;
}
