import type {
  AIClassifyInput,
  AIProvider,
  AIProviderInput,
  AIProviderResult,
  AIStructuredInput,
  AITranslateInput,
} from "../domain/ports/ai-provider.port";
import type { AIProviderType } from "../shared";

/**
 * Tabela de preços aproximada (USD por 1K tokens, entrada/saída separadas).
 * São valores de referência para estimativa relativa de custo entre
 * providers — não substituem a fatura real de cada provedor e devem ser
 * revisados periodicamente. Providers desconhecidos custam 0 por padrão.
 */
const DEFAULT_PROVIDER_PRICING_PER_1K: Record<string, { input: number; output: number }> = {
  openai: { input: 0.005, output: 0.015 },
  anthropic: { input: 0.003, output: 0.015 },
  gemini: { input: 0.00035, output: 0.0014 },
  deepseek: { input: 0.00027, output: 0.0011 },
  grok: { input: 0.002, output: 0.01 },
  ollama: { input: 0, output: 0 },
  local: { input: 0, output: 0 },
  azure_openai: { input: 0.005, output: 0.015 },
  aws_bedrock: { input: 0.003, output: 0.015 },
  custom: { input: 0, output: 0 },
};

type BuildResultParams<T> = {
  content: T;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  finishReason: string;
  model: string;
  organizationId?: string;
  structuredOutput?: Record<string, unknown>;
};

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: string;
  abstract readonly type: AIProviderType;
  abstract readonly name: string;

  private _available = true;

  isAvailable(): boolean {
    return this._available;
  }

  setAvailable(available: boolean): void {
    this._available = available;
  }

  async generateText(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.simulate(input, `[${this.name}] ${input.prompt.slice(0, 100)}`);
  }

  async generateStructuredOutput(
    input: AIStructuredInput,
  ): Promise<AIProviderResult<Record<string, unknown>>> {
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input.schema)) {
      output[key] = `simulated_${key}`;
    }
    return this.buildResult({
      content: output,
      structuredOutput: output,
      promptTokens: this.estimateTokens(input.prompt),
      completionTokens: 50,
      latencyMs: 120,
      finishReason: "stop",
      model: input.model ?? "simulated",
      organizationId: input.organizationId,
    });
  }

  async summarize(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.simulate(input, `[${this.name} Summary] ${input.prompt.slice(0, 80)}...`);
  }

  async classify(input: AIClassifyInput): Promise<AIProviderResult<string>> {
    const category = input.categories[0] ?? "unknown";
    return this.simulate(input, category);
  }

  async extractEntities(
    input: AIProviderInput,
  ): Promise<AIProviderResult<Record<string, unknown>>> {
    const entities = { entities: [{ type: "simulated", value: input.prompt.slice(0, 30) }] };
    return this.buildResult({
      content: entities,
      structuredOutput: entities,
      promptTokens: this.estimateTokens(input.prompt),
      completionTokens: 30,
      latencyMs: 100,
      finishReason: "stop",
      model: input.model ?? "simulated",
      organizationId: input.organizationId,
    });
  }

  async analyze(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.simulate(
      input,
      `[${this.name} Analysis] Context keys: ${Object.keys(input.context ?? {}).length}`,
    );
  }

  async translate(input: AITranslateInput): Promise<AIProviderResult<string>> {
    return this.simulate(
      input,
      `[${this.name} → ${input.targetLanguage}] ${input.prompt.slice(0, 80)}`,
    );
  }

  async reason(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.simulate(input, `[${this.name} Reasoning] Based on: ${input.prompt.slice(0, 60)}`);
  }

  protected simulate(input: AIProviderInput, content: string): AIProviderResult<string> {
    return this.buildResult({
      content,
      promptTokens: this.estimateTokens(input.prompt),
      completionTokens: this.estimateTokens(content),
      latencyMs: 80 + Math.floor(Math.random() * 40),
      finishReason: "stop",
      model: input.model ?? "simulated",
      organizationId: input.organizationId,
    });
  }

  protected estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /** Estimativa de custo em USD a partir da tabela aproximada por tipo de provider. */
  protected estimateCost(promptTokens: number, completionTokens: number): number {
    const pricing = DEFAULT_PROVIDER_PRICING_PER_1K[this.type] ?? { input: 0, output: 0 };
    const cost = (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;
    return Number(cost.toFixed(6));
  }

  /**
   * Monta o resultado final com os metadados estruturados exigidos do Gateway
   * (provider, model, latência, tokens, custo estimado, timestamp,
   * organizationId). Usado tanto pelo modo simulado quanto pelos providers
   * reais, garantindo o mesmo formato de resposta para todos os consumidores.
   */
  protected buildResult<T>(params: BuildResultParams<T>): AIProviderResult<T> {
    const estimatedCostUsd = this.estimateCost(params.promptTokens, params.completionTokens);

    return {
      content: params.content,
      structuredOutput: params.structuredOutput,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      latencyMs: params.latencyMs,
      finishReason: params.finishReason,
      metadata: {
        provider: { id: this.id, type: this.type, name: this.name },
        model: params.model,
        latencyMs: params.latencyMs,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.promptTokens + params.completionTokens,
        estimatedCostUsd,
        timestamp: new Date().toISOString(),
        organizationId: params.organizationId,
      },
    };
  }
}
