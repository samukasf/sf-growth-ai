import { describe, expect, it } from "vitest";

import {
  MAX_CHAT_HISTORY_MESSAGES,
  encodeChatEvent,
  parseChatEventLine,
  parseSamuelChatRequest,
} from "./samuel-chat.protocol";

describe("Samuel chat protocol", () => {
  it("validates and sanitizes an incoming request", () => {
    const history = Array.from({ length: MAX_CHAT_HISTORY_MESSAGES + 5 }, (_, index) => ({
      id: `message-${index}`,
      role: index % 2 ? "assistant" : "user",
      content: `message ${index}`,
      timestamp: "2026-07-14T12:00:00.000Z",
    }));

    const request = parseSamuelChatRequest({
      query: "  Analisa o crescimento  ",
      companyId: "company-1",
      history,
    });

    expect(request.query).toBe("Analisa o crescimento");
    expect(request.history).toHaveLength(MAX_CHAT_HISTORY_MESSAGES);
    expect(request.history?.at(0)?.id).toBe("message-5");
  });

  it("rejects missing messages and invalid companies", () => {
    expect(() => parseSamuelChatRequest({ query: "", companyId: "company-1" })).toThrow(
      "mensagem é obrigatória",
    );
    expect(() => parseSamuelChatRequest({ query: "Olá", companyId: "" })).toThrow(
      "Empresa inválida",
    );
  });

  it("round-trips NDJSON events", () => {
    const event = {
      type: "warning" as const,
      code: "DEGRADED",
      message: "Fallback ativo",
    };
    const line = new TextDecoder().decode(encodeChatEvent(event));
    expect(parseChatEventLine(line)).toEqual(event);
    expect(parseChatEventLine("\n")).toBeNull();
  });
});
