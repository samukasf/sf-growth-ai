import type {
  LLMCompletionInput,
  LLMCompletionResult,
  LLMProviderPort,
} from "./orchestrator.types";

export type ResponsesProviderConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxOutputTokens: number;
};

type ResponsesApiEnvelope = {
  id?: string;
  error?: { message?: string };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getResponsesProviderConfig(): ResponsesProviderConfig | null {
  const apiKey =
    process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const rawMaxTokens = Number.parseInt(
    process.env.SAMUEL_AI_MAX_OUTPUT_TOKENS ?? "1800",
    10,
  );

  return {
    apiKey,
    baseUrl: normalizeBaseUrl(
      process.env.AI_GATEWAY_BASE_URL ??
        process.env.OPENAI_BASE_URL ??
        "https://api.openai.com/v1",
    ),
    model:
      process.env.AI_GATEWAY_MODEL ??
      process.env.OPENAI_MODEL ??
      "gpt-5.4-mini",
    maxOutputTokens:
      Number.isFinite(rawMaxTokens) && rawMaxTokens > 0
        ? Math.min(rawMaxTokens, 16_000)
        : 1800,
  };
}

export function extractResponsesApiText(payload: ResponsesApiEnvelope): string {
  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text ?? "")
    .join("");
}

function buildInstructions(input: LLMCompletionInput): string {
  return [
    "Você é Samuel AI, Presidente Executivo Digital do SF Growth AI.",
    "Responda em português claro, direto e profissional.",
    "Baseie afirmações nos dados fornecidos. Diferencie fatos, inferências e lacunas.",
    "Não invente métricas, integrações, resultados ou ações já executadas.",
    "Quando houver risco, gargalo ou premissa frágil, sinalize explicitamente.",
    "Termine com a próxima ação mais útil quando isso fizer sentido.",
    "",
    input.payload.systemContext,
  ].join("\n");
}

function buildInput(input: LLMCompletionInput): string {
  const fragments = input.payload.fragments
    .slice(0, 40)
    .map((fragment) => `- ${fragment}`)
    .join("\n");

  return [
    "DADOS E EVIDÊNCIAS DO RUNTIME",
    fragments || "Nenhuma evidência adicional disponível.",
    "",
    "DIRETRIZ DO UTILIZADOR",
    input.payload.userQuery,
  ].join("\n");
}

async function readError(response: Response): Promise<string> {
  try {
    const payload = await response.json() as ResponsesApiEnvelope;
    return payload.error?.message ?? `AI Gateway respondeu ${response.status}.`;
  } catch {
    return `AI Gateway respondeu ${response.status}.`;
  }
}

export class OpenAIResponsesProvider implements LLMProviderPort {
  readonly providerId: string;

  constructor(private readonly config: ResponsesProviderConfig) {
    this.providerId = config.baseUrl.includes("api.openai.com")
      ? "openai-responses"
      : "ai-gateway-responses";
  }

  get model() {
    return this.config.model;
  }

  async complete(input: LLMCompletionInput): Promise<LLMCompletionResult> {
    const response = await fetch(`${this.config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model ?? this.config.model,
        instructions: buildInstructions(input),
        input: buildInput(input),
        max_output_tokens: this.config.maxOutputTokens,
      }),
    });

    if (!response.ok) throw new Error(await readError(response));

    const payload = await response.json() as ResponsesApiEnvelope;
    const content = extractResponsesApiText(payload);
    if (!content) throw new Error("AI Gateway não devolveu texto.");

    return {
      content,
      providerId: this.providerId,
      model: input.model ?? this.config.model,
      generatedAt: new Date().toISOString(),
    };
  }

  async stream(
    input: LLMCompletionInput,
    onDelta: (delta: string) => void,
    signal?: AbortSignal,
  ): Promise<LLMCompletionResult> {
    const model = input.model ?? this.config.model;
    const response = await fetch(`${this.config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: buildInstructions(input),
        input: buildInput(input),
        max_output_tokens: this.config.maxOutputTokens,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) throw new Error(await readError(response));
    if (!response.body) throw new Error("AI Gateway não iniciou o stream.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";

    const processFrame = (frame: string) => {
      const data = frame
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("\n");

      if (!data || data === "[DONE]") return;

      const event = JSON.parse(data) as {
        type?: string;
        delta?: string;
        error?: { message?: string };
      };

      if (event.type === "response.output_text.delta" && event.delta) {
        content += event.delta;
        onDelta(event.delta);
      }

      if (event.type === "response.failed") {
        throw new Error(event.error?.message ?? "A geração da resposta falhou.");
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";
      for (const frame of frames) processFrame(frame);
    }

    buffer += decoder.decode();
    if (buffer.trim()) processFrame(buffer);

    if (!content.trim()) {
      throw new Error("AI Gateway concluiu sem devolver texto.");
    }

    return {
      content,
      providerId: this.providerId,
      model,
      generatedAt: new Date().toISOString(),
    };
  }
}

export function createConfiguredResponsesProvider() {
  const config = getResponsesProviderConfig();
  return config ? new OpenAIResponsesProvider(config) : null;
}
