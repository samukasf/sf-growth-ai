import type {
  AIClassifyInput,
  AIProviderInput,
  AIProviderResult,
  AIStructuredInput,
  AITranslateInput,
} from "../domain/ports/ai-provider.port";
import { AIProviderRequestError, AIProviderUnavailableError } from "../shared/errors/ai-provider.errors";
import type { AIProviderType } from "../shared";
import { BaseAIProvider } from "./base-ai-provider";
import { registerAIProviderBlueprint } from "./provider-catalog";

const API_KEY_ENV_VAR = "GEMINI_API_KEY";
const MODEL_ENV_VAR = "GEMINI_MODEL";
const DEFAULT_MODEL = "gemini-1.5-flash";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
};

export class GeminiProvider extends BaseAIProvider {
  readonly id = "gemini";
  readonly type: AIProviderType = "gemini";
  readonly name = "Google Gemini";

  isAvailable(): boolean {
    return super.isAvailable() && Boolean(this.readApiKey());
  }

  async generateText(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.generateContent(input, input.prompt);
  }

  async summarize(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.generateContent(
      input,
      `Resuma o conteúdo abaixo de forma clara e objetiva, em português:\n\n${input.prompt}`,
    );
  }

  async analyze(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.generateContent(
      input,
      `Analise o conteúdo abaixo e destaque os pontos mais relevantes, em português:\n\n${input.prompt}`,
    );
  }

  async reason(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.generateContent(
      input,
      `Raciocine passo a passo sobre o problema abaixo antes de concluir, em português:\n\n${input.prompt}`,
    );
  }

  async classify(input: AIClassifyInput): Promise<AIProviderResult<string>> {
    return this.generateContent(
      input,
      `Classifique o texto abaixo em exatamente uma destas categorias: ${input.categories.join(", ")}.\n` +
        `Responda apenas com o nome exato da categoria escolhida.\n\nTexto: ${input.prompt}`,
    );
  }

  async translate(input: AITranslateInput): Promise<AIProviderResult<string>> {
    const target = input.targetLanguage;
    const source = input.sourceLanguage ? ` (idioma de origem: ${input.sourceLanguage})` : "";
    return this.generateContent(input, `Traduza o texto abaixo para ${target}${source}:\n\n${input.prompt}`);
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

    const result = await this.generateContent(input, prompt);
    const parsed = this.tryParseJson(result.content) ?? {};
    return { ...result, content: parsed, structuredOutput: parsed };
  }

  async extractEntities(
    input: AIProviderInput,
  ): Promise<AIProviderResult<Record<string, unknown>>> {
    const prompt =
      `Extraia entidades relevantes (pessoas, empresas, valores, datas) do texto abaixo. ` +
      `Responda estritamente em JSON no formato {"entities": [...]}, sem markdown.\n\nTexto: ${input.prompt}`;

    const result = await this.generateContent(input, prompt);
    const parsed = this.tryParseJson(result.content) ?? { entities: [] };
    return { ...result, content: parsed, structuredOutput: parsed };
  }

  private readApiKey(): string | undefined {
    return process.env[API_KEY_ENV_VAR];
  }

  private resolveModel(input: AIProviderInput): string {
    return input.model ?? process.env[MODEL_ENV_VAR] ?? DEFAULT_MODEL;
  }

  private async generateContent(
    input: AIProviderInput,
    promptOverride: string,
  ): Promise<AIProviderResult<string>> {
    const apiKey = this.readApiKey();
    if (!apiKey) {
      throw new AIProviderUnavailableError(this.id);
    }

    const model = this.resolveModel(input);
    const startedAt = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptOverride }] }],
          generationConfig: {
            temperature: input.temperature ?? 0.4,
            maxOutputTokens: input.maxTokens ?? 800,
          },
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

    const data = (await response.json()) as GeminiGenerateContentResponse;
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    const promptTokens = data.usageMetadata?.promptTokenCount ?? this.estimateTokens(promptOverride);
    const completionTokens = data.usageMetadata?.candidatesTokenCount ?? this.estimateTokens(content);
    const finishReason = candidate?.finishReason ?? "STOP";

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
  type: "gemini",
  label: "Google Gemini",
  create: () => new GeminiProvider(),
});
