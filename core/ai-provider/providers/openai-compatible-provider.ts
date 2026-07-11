import type {
  AIClassifyInput,
  AIProviderInput,
  AIProviderResult,
  AIStructuredInput,
  AITranslateInput,
} from "../domain/ports/ai-provider.port";
import { AIProviderRequestError, AIProviderUnavailableError } from "../shared/errors/ai-provider.errors";
import { BaseAIProvider } from "./base-ai-provider";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
};

/**
 * Base para providers que expõem uma API compatível com o formato
 * "chat completions" da OpenAI (OpenAI, DeepSeek, xAI/Grok, entre outros
 * gateways OpenAI-compatíveis). Concentra a chamada HTTP; cada subclasse só
 * declara endpoint, variável de ambiente da chave e modelo padrão.
 */
export abstract class OpenAICompatibleProvider extends BaseAIProvider {
  protected abstract readonly apiKeyEnvVar: string;
  protected abstract readonly baseUrl: string;
  protected abstract readonly defaultModel: string;
  protected abstract readonly modelEnvVar: string;

  isAvailable(): boolean {
    return super.isAvailable() && Boolean(this.readApiKey());
  }

  async generateText(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chatComplete(input, input.prompt);
  }

  async summarize(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chatComplete(
      input,
      `Resuma o conteúdo abaixo de forma clara e objetiva, em português:\n\n${input.prompt}`,
    );
  }

  async analyze(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chatComplete(
      input,
      `Analise o conteúdo abaixo e destaque os pontos mais relevantes, em português:\n\n${input.prompt}`,
    );
  }

  async reason(input: AIProviderInput): Promise<AIProviderResult<string>> {
    return this.chatComplete(
      input,
      `Raciocine passo a passo sobre o problema abaixo antes de concluir, em português:\n\n${input.prompt}`,
    );
  }

  async classify(input: AIClassifyInput): Promise<AIProviderResult<string>> {
    return this.chatComplete(
      input,
      `Classifique o texto abaixo em exatamente uma destas categorias: ${input.categories.join(", ")}.\n` +
        `Responda apenas com o nome exato da categoria escolhida.\n\nTexto: ${input.prompt}`,
    );
  }

  async translate(input: AITranslateInput): Promise<AIProviderResult<string>> {
    const target = input.targetLanguage;
    const source = input.sourceLanguage ? ` (idioma de origem: ${input.sourceLanguage})` : "";
    return this.chatComplete(input, `Traduza o texto abaixo para ${target}${source}:\n\n${input.prompt}`);
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

    const result = await this.chatComplete(input, prompt);
    const parsed = this.tryParseJson(result.content) ?? {};
    return { ...result, content: parsed, structuredOutput: parsed };
  }

  async extractEntities(
    input: AIProviderInput,
  ): Promise<AIProviderResult<Record<string, unknown>>> {
    const prompt =
      `Extraia entidades relevantes (pessoas, empresas, valores, datas) do texto abaixo. ` +
      `Responda estritamente em JSON no formato {"entities": [...]}, sem markdown.\n\nTexto: ${input.prompt}`;

    const result = await this.chatComplete(input, prompt);
    const parsed = this.tryParseJson(result.content) ?? { entities: [] };
    return { ...result, content: parsed, structuredOutput: parsed };
  }

  protected readApiKey(): string | undefined {
    return process.env[this.apiKeyEnvVar];
  }

  protected resolveModel(input: AIProviderInput): string {
    return input.model ?? process.env[this.modelEnvVar] ?? this.defaultModel;
  }

  protected async chatComplete(
    input: AIProviderInput,
    promptOverride: string,
  ): Promise<AIProviderResult<string>> {
    const apiKey = this.readApiKey();
    if (!apiKey) {
      throw new AIProviderUnavailableError(this.id);
    }

    const model = this.resolveModel(input);
    const startedAt = Date.now();

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: promptOverride }],
          temperature: input.temperature ?? 0.4,
          max_tokens: input.maxTokens ?? 800,
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

    const data = (await response.json()) as ChatCompletionResponse;
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";
    const promptTokens = data.usage?.prompt_tokens ?? this.estimateTokens(promptOverride);
    const completionTokens = data.usage?.completion_tokens ?? this.estimateTokens(content);
    const finishReason = choice?.finish_reason ?? "stop";

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
