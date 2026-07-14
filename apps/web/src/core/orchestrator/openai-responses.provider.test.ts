import { afterEach, describe, expect, it, vi } from "vitest";

import {
  extractResponsesApiText,
  OpenAIResponsesProvider,
} from "./openai-responses.provider";

const completionInput = {
  payload: {
    systemContext: "Empresa: Acme",
    userQuery: "Analisa as vendas",
    fragments: ["Conversão em validação"],
    metadata: {},
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
  });
});
