import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildResponsesApiInput,
  buildSamuelInstructions,
  extractResponsesApiText,
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
});
