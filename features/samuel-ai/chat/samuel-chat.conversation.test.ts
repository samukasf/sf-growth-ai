import { describe, expect, it } from "vitest";

import type { ChatMessage } from "../types";
import {
  buildSamuelFallbackAnswer,
  selectConversationHistory,
} from "./samuel-chat.conversation";
import type { SamuelChatRuntimeSummary } from "./samuel-chat.types";

function message(
  role: ChatMessage["role"],
  content: string,
  index: number,
): ChatMessage {
  return {
    id: `message-${index}`,
    role,
    content,
    timestamp: `2026-07-14T10:00:${String(index).padStart(2, "0")}.000Z`,
    status: "complete",
  };
}

const runtimeSummary: SamuelChatRuntimeSummary = {
  intent: "general",
  confidence: 80,
  diagnosis: "Dados insuficientes.",
  recommendation: "Recolher dados.",
  nextStep: "Validar contexto.",
  pipeline: [],
};

describe("selectConversationHistory", () => {
  it("preserves chronological roles and the most recent messages", () => {
    const history = [
      message("user", "primeira", 1),
      message("assistant", "segunda", 2),
      message("user", "terceira", 3),
    ];

    expect(selectConversationHistory(history, 2, 100)).toEqual([
      { role: "assistant", content: "segunda" },
      { role: "user", content: "terceira" },
    ]);
  });

  it("enforces a total character budget starting with the newest context", () => {
    const history = [
      message("user", "11111", 1),
      message("assistant", "22222", 2),
      message("user", "33333", 3),
    ];

    expect(selectConversationHistory(history, 20, 8)).toEqual([
      { role: "assistant", content: "222" },
      { role: "user", content: "33333" },
    ]);
  });
});

describe("buildSamuelFallbackAnswer", () => {
  it("responds naturally to a greeting without forcing an executive format", () => {
    const answer = buildSamuelFallbackAnswer("Olá, tudo bem?", runtimeSummary);

    expect(answer).toContain("Olá!");
    expect(answer).not.toContain("Diagnóstico");
  });

  it("is explicit when generative intelligence is unavailable", () => {
    const answer = buildSamuelFallbackAnswer(
      "Explica a teoria da relatividade",
      runtimeSummary,
    );

    expect(answer).toContain("OPENAI_API_KEY");
    expect(answer).not.toContain("Dados insuficientes");
  });

  it("keeps the deterministic runtime answer for business intents", () => {
    const answer = buildSamuelFallbackAnswer("Analisa as vendas", {
      ...runtimeSummary,
      intent: "sales",
    });

    expect(answer).toContain("Diagnóstico\nDados insuficientes.");
    expect(answer).toContain("Próximo passo\nValidar contexto.");
  });
});
