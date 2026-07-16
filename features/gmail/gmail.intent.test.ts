import { describe, expect, it } from "vitest";

import { parseGmailIntent } from "./gmail.intent";

describe("parseGmailIntent", () => {
  it("detects inbox listing", () => {
    const plan = parseGmailIntent("Mostra meus e-mails da inbox");
    expect(plan?.actionId).toBe("gmail_inbox");
    expect(plan?.requiresConfirmation).toBe(false);
  });

  it("detects send with recipient", () => {
    const plan = parseGmailIntent(
      'Envia um email para joao@empresa.com assunto: Olá "Tudo bem?"',
    );
    expect(plan?.actionId).toBe("gmail_send");
    expect(plan?.requiresConfirmation).toBe(true);
    expect(plan?.args.to).toBe("joao@empresa.com");
  });

  it("detects trash with message id", () => {
    const plan = parseGmailIntent("Apaga o email id:18abcXYZ");
    expect(plan?.actionId).toBe("gmail_trash");
    expect(plan?.args.messageId).toBe("18abcXYZ");
    expect(plan?.requiresConfirmation).toBe(true);
  });

  it("lists inbox when trash lacks message id", () => {
    const plan = parseGmailIntent("Apaga um email da inbox");
    expect(plan?.actionId).toBe("gmail_inbox");
  });

  it("returns null for unrelated queries", () => {
    expect(parseGmailIntent("Como está o pipeline de vendas?")).toBeNull();
  });
});
