import type {
  AIClassifyInput,
  AIProviderInput,
  AIProviderResult,
  AIStructuredInput,
  AITranslateInput,
} from "../domain/ports/ai-provider.port";
import { AIProviderRequestError } from "../shared/errors/ai-provider.errors";
import type { AIProviderType } from "../shared";
import { BaseAIProvider } from "./base-ai-provider";
import { registerAIProviderBlueprint } from "./provider-catalog";

const BASE_URL_ENV_VAR = "OLLAMA_BASE_URL";
const MODEL_ENV_VAR = "OLLAMA_MODEL";
const ENABLED_ENV_VAR = "OLLAMA_ENABLED";
const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.1";

type OllamaChatResponse = {
  message?: { content?: string };
  prompt_eval_count?: number;
  eval_count?: number;
  done_reason?: string;
};

/**
 * Ollama roda localmente (ou em servidor próprio) e não exige API key —
 * "disponível" por padrão, assumindo um servidor auto-hospedado. Pode ser
 * desligado explicitamente com `OLLAMA_ENABLED=false`.
 */
export class OllamaProvider extends BaseAIProvider {
  readonly id = "ollama";
  readonly type: AIProviderType = "ollama";
  readonly name = "Ollama (local)";

  isAvailable(): boolean {
    return super.isAvailable() && process.env[ENABLED_ENV_VAR] !== "false";
  }

  async generateText(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chat(input, input.prompt);
  }

  async summarize(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chat(
      input,
      `Resuma o conteúdo abaixo de forma clara e objetiva, em português:\n\n${input.prompt}`,
    );
  }

  async analyze(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chat(
      input,
      `Analise o conteúdo abaixo e destaque os pontos mais relevantes, em português:\n\n${input.prompt}`,
    );
  }

  async reason(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chat(
      input,
      `Raciocine passo a passo sobre o problema abaixo antes de concluir, em português:\n\n${input.prompt}`,
    );
  }

  async classify(input: AIClassifyInput): Promise<AIProviderResult<string>> {
    return this.chat(
      input,
      `Classifique o texto abaixo em exatamente uma destas categorias: ${input.categories.join(", ")}.\n` +
        `Responda apenas com o nome exato da categoria escolhida.\n\nTexto: ${input.prompt}`,
    );
  }

  async translate(input: AITranslateInput): Promise<AIProviderResult<string>> {
    const target = input.targetLanguage;
    const source = input.sourceLanguage ? ` (idioma de origem: ${input.sourceLanguage})` : "";
    return this.chat(input, `Traduza o texto abaixo para ${target}${source}:\n\n${input.prompt}`);
  }

  async generateStructuredOutput(
    input: AIStructuredInput,
  ): Promise<AIProviderResult<Record<string, unknown>>> {
    const schemaDescription = Object.entries(input.schema)
      .map(([key, description]) => `- ${key}: ${description}`)
      .join("\n");
    const prompt =
      `Responda estritamente em JSON válido (sem markdown, sem comentários), com exatamente estas chaves:\n${schemaDescription}\n\n` +
      `Contexto: ${input.prompt}`;

    const result = await this.chat(input, prompt);
    const parsed = this.tryParseJson(result.content) ?? {};
    return { ...result, content: parsed, structuredOutput: parsed };
  }

  async extractEntities(
    input: AIProviderInput,
  ): Promise<AIProviderResult<Record<string, unknown>>> {
    const prompt =
      `Extraia entidades relevantes (pessoas, empresas, valores, datas) do texto abaixo. ` +
      `Responda estritamente em JSON no formato {"entities": [...]}, sem markdown.\n\nTexto: ${input.prompt}`;

    const result = await this.chat(input, prompt);
    const parsed = this.tryParseJson(result.content) ?? { entities: [] };
    return { ...result, content: parsed, structuredOutput: parsed };
  }

  private resolveBaseUrl(): string {
    return process.env[BASE_URL_ENV_VAR] ?? DEFAULT_BASE_URL;
  }

  private resolveModel(input: AIProviderInput): string {
    return input.model ?? process.env[MODEL_ENV_VAR] ?? DEFAULT_MODEL;
  }

  private async chat(input: AIProviderInput, promptOverride: string): Promise<AIProviderResult<string>> {
    const model = this.resolveModel(input);
    const startedAt = Date.now();

    let response: Response;
    try {
      response = await fetch(`${this.resolveBaseUrl()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: promptOverride }],
          stream: false,
          options: { temperature: input.temperature ?? 0.4 },
        }),
      });
    } catch (error) {
      throw new AIProviderRequestError(
        this.id,
        0,
        error instanceof Error ? error.message : String(error),
      );
    }

    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new AIProviderRequestError(this.id, response.status, details.slice(0, 300));
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content ?? "";
    const promptTokens = data.prompt_eval_count ?? this.estimateTokens(promptOverride);
    const completionTokens = data.eval_count ?? this.estimateTokens(content);
    const finishReason = data.done_reason ?? "stop";

    return this.buildResult({
      content,
      promptTokens,
      completionTokens,
      latencyMs,
      finishReason,
      model,
      organizationId: input.organizationId,
    });
  }

  private tryParseJson(text: string): Record<string, unknown> | null {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }
}

registerAIProviderBlueprint({
  type: "ollama",
  label: "Ollama (local)",
  create: () => new OllamaProvider(),
});
