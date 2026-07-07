import type {
  AIClassifyInput,
  AIProvider,
  AIProviderInput,
  AIProviderResult,
  AIStructuredInput,
  AITranslateInput,
} from "../domain/ports/ai-provider.port";
import type { AIProviderType } from "../shared";

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
    return {
      content: output,
      structuredOutput: output,
      promptTokens: this.estimateTokens(input.prompt),
      completionTokens: 50,
      latencyMs: 120,
      finishReason: "stop",
    };
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
    return {
      content: { entities: [{ type: "simulated", value: input.prompt.slice(0, 30) }] },
      structuredOutput: { entities: [{ type: "simulated", value: input.prompt.slice(0, 30) }] },
      promptTokens: this.estimateTokens(input.prompt),
      completionTokens: 30,
      latencyMs: 100,
      finishReason: "stop",
    };
  }

  async analyze(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.simulate(input, `[${this.name} Analysis] Context keys: ${Object.keys(input.context ?? {}).length}`);
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
    return {
      content,
      promptTokens: this.estimateTokens(input.prompt),
      completionTokens: this.estimateTokens(content),
      latencyMs: 80 + Math.floor(Math.random() * 40),
      finishReason: "stop",
    };
  }

  protected estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
