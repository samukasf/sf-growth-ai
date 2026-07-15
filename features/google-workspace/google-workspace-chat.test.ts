import { describe, expect, it } from "vitest";

import { createGoogleWorkspaceChatSignal } from "./google-workspace-chat";
import type { GoogleWorkspaceSummary } from "./google-workspace.types";

const summary: GoogleWorkspaceSummary = {
  connected: true,
  accountLabel: "sa•••@example.com",
  updatedAt: "2026-07-15T20:00:00.000Z",
  gmail: { connected: true, count: 23 },
  calendar: { connected: false, count: null, error: "403" },
  drive: { connected: true, count: 8 },
  contacts: { connected: true, count: null },
};

describe("createGoogleWorkspaceChatSignal", () => {
  it("ignores conversations unrelated to Google Workspace", () => {
    expect(createGoogleWorkspaceChatSignal("Explique a nossa estratégia", summary)).toEqual({
      relevant: false,
      fragments: [],
      fallbackAnswer: null,
    });
  });

  it("returns live Gmail data without exposing message content", () => {
    const signal = createGoogleWorkspaceChatSignal("Quantos e-mails não lidos tenho?", summary);

    expect(signal.relevant).toBe(true);
    expect(signal.fallbackAnswer).toContain("23 e-mail(s) não lido(s)");
    expect(signal.fragments.join(" ")).not.toContain("example.com");
  });

  it("reports a Calendar authorization problem honestly", () => {
    const signal = createGoogleWorkspaceChatSignal("Como está minha agenda hoje?", summary);

    expect(signal.fallbackAnswer).toContain("precisa de reautorização");
  });

  it("never claims a requested external action was executed", () => {
    const signal = createGoogleWorkspaceChatSignal("Responda meus e-mails", summary);

    expect(signal.fallbackAnswer).toContain("nenhuma ação externa foi executada");
  });
});
