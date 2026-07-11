import { describe, expect, it } from "vitest";

import { HeuristicConversationSummarizer } from "./heuristic-conversation-summarizer";

describe("HeuristicConversationSummarizer", () => {
  it("resume o número de perguntas do usuário e os principais tópicos", () => {
    const summarizer = new HeuristicConversationSummarizer();

    const summary = summarizer.summarize({
      conversationId: "conv-1",
      previousSummary: null,
      messagesToCompress: [
        { role: "user", content: "Explique SEO para minha empresa.", timestamp: "t1" },
        { role: "assistant", content: "SEO é...", timestamp: "t1" },
        { role: "user", content: "Quanto custa uma campanha de SEO?", timestamp: "t2" },
        { role: "assistant", content: "Depende...", timestamp: "t2" },
      ],
    });

    expect(summary).toContain("2 pergunta(s) anteriores");
    expect(summary).toContain("SEO");
  });

  it("acumula sobre um resumo anterior em vez de substituí-lo", () => {
    const summarizer = new HeuristicConversationSummarizer();

    const summary = summarizer.summarize({
      conversationId: "conv-1",
      previousSummary: "Resumo automático de 2 pergunta(s) anteriores sobre SEO.",
      messagesToCompress: [
        { role: "user", content: "E sobre marketing de conteúdo?", timestamp: "t3" },
        { role: "assistant", content: "Marketing de conteúdo é...", timestamp: "t3" },
      ],
    });

    expect(summary.startsWith("Resumo automático de 2 pergunta(s) anteriores sobre SEO.")).toBe(true);
    expect(summary).toContain("1 pergunta(s) anteriores");
  });

  it("não quebra quando não há tópicos identificáveis", () => {
    const summarizer = new HeuristicConversationSummarizer();

    const summary = summarizer.summarize({
      conversationId: "conv-1",
      previousSummary: null,
      messagesToCompress: [{ role: "user", content: "analise minha empresa", timestamp: "t1" }],
    });

    expect(summary).toBe("Resumo automático de 1 pergunta(s) anteriores.");
  });
});
