import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildChatCompletionsApiInput,
  buildResponsesApiInput,
  buildSamuelInstructions,
  extractChatCompletionsText,
  extractResponsesApiText,
  getResponsesProviderConfig,
  OpenAIResponsesProvider,
} from "./openai-responses.provider";

const completionInput = {
  payload: {
    systemContext: "Empresa: Acme",
    userQuery: "Analisa as vendas",
    fragments: ["Conversão em validação"],
    metadata: { intent: "sales" },
    conversationHistory: [
      { role: "user" as const, content: "Chamo-me Ana" },
      { role: "assistant" as const, content: "Prazer, Ana." },
    ],
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getResponsesProviderConfig", () => {
  it("uses OPENAI fallbacks when AI_GATEWAY variables are empty", () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "   ");
    vi.stubEnv("AI_GATEWAY_BASE_URL", "");
    vi.stubEnv("AI_GATEWAY_MODEL", "  ");
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.stubEnv("OPENAI_BASE_URL", "https://api.openai.com/v1");
    vi.stubEnv("OPENAI_MODEL", "gpt-test");

    const config = getResponsesProviderConfig();

    expect(config).toEqual({
      apiKey: "openai-key",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-test",
      maxOutputTokens: 1800,
      apiKind: "responses",
    });
  });
});

describe("OpenAIResponsesProvider", () => {
  it("extracts text from a Responses API envelope", () => {
    expect(
      extractResponsesApiText({
        output: [
          {
            type: "message",
            content: [
              { type: "output_text", text: "Diagnóstico" },
              { type: "output_text", text: " concluído" },
            ],
          },
        ],
      }),
    ).toBe("Diagnóstico concluído");
  });

  it("extracts text from an OpenAI-compatible Chat Completions envelope", () => {
    expect(
      extractChatCompletionsText({
        choices: [{ message: { content: "Resposta Kimi" } }],
      }),
    ).toBe("Resposta Kimi");
  });

  it("selects Kimi K3 when requested through the text provider env", () => {
    vi.stubEnv("SAMUEL_AI_TEXT_PROVIDER", "kimi");
    vi.stubEnv("MOONSHOT_API_KEY", "moon-test-key");

    const config = getResponsesProviderConfig();

    expect(config).toMatchObject({
      apiKind: "chat_completions",
      apiKey: "moon-test-key",
      baseUrl: "https://api.moonshot.ai/v1",
      model: "kimi-k3",
      providerId: "kimi-chat-completions",
      chatReasoningEffort: "max",
    });
  });

  it("builds fluid instructions and structured conversation history", () => {
    const instructions = buildSamuelInstructions(completionInput);
    const input = buildResponsesApiInput(completionInput);

    expect(instructions).toContain("qualquer tema legítimo");
    expect(instructions).toContain("Não force formatos executivos");
    expect(instructions).toContain("Sr. Samuel");
    expect(instructions).toContain("eventos reais");
    expect(instructions).toContain("Não pergunte genericamente");
    expect(input).toHaveLength(3);
    expect(input[0]).toEqual({ role: "user", content: "Chamo-me Ana" });
    expect(input[1]).toEqual({ role: "assistant", content: "Prazer, Ana." });
    expect(input[2]).toMatchObject({ role: "user" });
    expect(input[2].content).toContain("MENSAGEM ATUAL DO UTILIZADOR");
    expect(input[2].content).toContain("Analisa as vendas");
    expect(input[2].content).toContain("Conversão em validação");
  });

  it("does not inject business runtime fragments into general conversation", () => {
    const input = buildResponsesApiInput({
      payload: {
        ...completionInput.payload,
        userQuery: "Escreve um poema sobre o mar",
        metadata: { intent: "creative" },
      },
    });

    expect(input.at(-1)).toEqual({
      role: "user",
      content: "Escreve um poema sobre o mar",
    });
  });

  it("uses dedicated instructions for Samuel Studio", () => {
    const instructions = buildSamuelInstructions({
      payload: {
        ...completionInput.payload,
        metadata: { intent: "creative", product: "samuel-studio" },
      },
    });

    expect(instructions).toContain("motor de geração de código");
    expect(instructions).toContain("objeto estruturado");
    expect(instructions).not.toContain("assistente executivo masculino");
  });

  it("builds system-first Chat Completions messages for compatible providers", () => {
    const messages = buildChatCompletionsApiInput(completionInput);

    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("Samuel AI");
    expect(messages[1]).toEqual({ role: "user", content: "Chamo-me Ana" });
    expect(messages.at(-1)?.content).toContain("Analisa as vendas");
  });

  it("sends JSON schema and reasoning controls when configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({
        output: [{ content: [{ type: "output_text", text: '{"ok":true}' }] }],
      }), { status: 200 })),
    );
    const textFormat = {
      type: "json_schema" as const,
      name: "studio",
      strict: true,
      schema: {
        type: "object",
        properties: { ok: { type: "boolean" } },
        required: ["ok"],
        additionalProperties: false,
      },
    };
    const provider = new OpenAIResponsesProvider({
      apiKey: "test-key",
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      model: "openai/gpt-oss-20b",
      maxOutputTokens: 8000,
      textFormat,
      reasoningEffort: "low",
    });

    await provider.complete({
      payload: {
        ...completionInput.payload,
        metadata: { intent: "creative", product: "samuel-studio" },
      },
    });

    const request = vi.mocked(fetch).mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(request?.body)) as {
      text?: { format?: unknown };
      reasoning?: { effort?: string };
    };
    expect(requestBody.text?.format).toEqual(textFormat);
    expect(requestBody.reasoning?.effort).toBe("low");
    expect(requestBody).not.toHaveProperty("store");
  });

  it("injects live Google Workspace data even when the intent is general", () => {
    const input = buildResponsesApiInput({
      payload: {
        ...completionInput.payload,
        userQuery: "Quantos e-mails não lidos tenho?",
        fragments: ["[GOOGLE WORKSPACE — DADO AO VIVO] Gmail: 23 e-mail(s) não lido(s)"],
        metadata: { intent: "general" },
      },
    });

    expect(input.at(-1)?.content).toContain("DADO AO VIVO");
    expect(input.at(-1)?.content).toContain("23 e-mail(s) não lido(s)");
  });

  it("streams semantic text deltas", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"response.output_text.delta","delta":"Olá"}\n\n',
          ),
        );
        controller.enqueue(
          encoder.encode(
            'data: {"type":"response.output_text.delta","delta":" mundo"}\n\n',
          ),
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 200 })),
    );

    const provider = new OpenAIResponsesProvider({
      apiKey: "test-key",
      baseUrl: "https://api.openai.com/v1",
      model: "test-model",
      maxOutputTokens: 200,
    });
    const deltas: string[] = [];
    const result = await provider.stream(completionInput, (delta) => deltas.push(delta));

    expect(deltas).toEqual(["Olá", " mundo"]);
    expect(result.content).toBe("Olá mundo");
    expect(result.providerId).toBe("openai-responses");
    const fetchMock = vi.mocked(fetch);
    const request = fetchMock.mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(request?.body)) as {
      input: Array<{ role: string; content: string }>;
      store: boolean;
    };
    expect(requestBody.input[0]).toEqual({ role: "user", content: "Chamo-me Ana" });
    expect(requestBody.store).toBe(false);
  });

  it("streams OpenAI-compatible Chat Completions deltas for Kimi", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode('data: {"choices":[{"delta":{"content":"Bom"}}]}\n\n'),
        );
        controller.enqueue(
          encoder.encode('data: {"choices":[{"delta":{"content":" dia"}}]}\n\n'),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 200 })),
    );

    const provider = new OpenAIResponsesProvider({
      apiKey: "moon-test-key",
      baseUrl: "https://api.moonshot.ai/v1",
      model: "kimi-k3",
      maxOutputTokens: 200,
      apiKind: "chat_completions",
      providerId: "kimi-chat-completions",
      chatReasoningEffort: "max",
    });
    const deltas: string[] = [];
    const result = await provider.stream(completionInput, (delta) => deltas.push(delta));

    expect(deltas).toEqual(["Bom", " dia"]);
    expect(result.content).toBe("Bom dia");
    expect(result.providerId).toBe("kimi-chat-completions");
    const requestUrl = vi.mocked(fetch).mock.calls[0]?.[0];
    const request = vi.mocked(fetch).mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(request?.body)) as {
      messages: Array<{ role: string; content: string }>;
      reasoning_effort?: string;
      stream: boolean;
    };
    expect(String(requestUrl)).toBe("https://api.moonshot.ai/v1/chat/completions");
    expect(requestBody.messages[0]?.role).toBe("system");
    expect(requestBody.reasoning_effort).toBe("max");
    expect(requestBody.stream).toBe(true);
  });

  it("omits store when streaming through Groq", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"type":"response.output_text.delta","delta":"Olá"}\n\n',
          ),
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 200 })),
    );

    const provider = new OpenAIResponsesProvider({
      apiKey: "groq-key",
      baseUrl: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
      maxOutputTokens: 200,
    });
    await provider.stream(completionInput, () => {});

    const fetchMock = vi.mocked(fetch);
    const request = fetchMock.mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(request?.body)) as Record<string, unknown>;
    expect(requestBody).not.toHaveProperty("store");
    expect(requestBody.stream).toBe(true);
    expect(provider.providerId).toBe("ai-gateway-responses");
  });

  it("includes store: false when completing through OpenAI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Resposta" }],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const provider = new OpenAIResponsesProvider({
      apiKey: "openai-key",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-test",
      maxOutputTokens: 200,
    });
    await provider.complete(completionInput);

    const fetchMock = vi.mocked(fetch);
    const request = fetchMock.mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(request?.body)) as Record<string, unknown>;
    expect(requestBody.store).toBe(false);
  });

  it("omits store when completing through Groq", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            output: [
              {
                type: "message",
                content: [{ type: "output_text", text: "Resposta" }],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const provider = new OpenAIResponsesProvider({
      apiKey: "groq-key",
      baseUrl: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
      maxOutputTokens: 200,
    });
    await provider.complete(completionInput);

    const fetchMock = vi.mocked(fetch);
    const request = fetchMock.mock.calls[0]?.[1];
    const requestBody = JSON.parse(String(request?.body)) as Record<string, unknown>;
    expect(requestBody).not.toHaveProperty("store");
  });
});
