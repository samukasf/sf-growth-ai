import { describe, expect, it, vi } from "vitest";

import {
  actionRequiresConfirmation,
  executeSamuelAction,
  type SamuelActionDefinition,
} from "./samuel-action-engine";

function evidence(operation: string) {
  return {
    source: "test-adapter",
    operation,
    entityId: "entity-1",
    at: new Date().toISOString(),
  };
}

describe("SamuelActionEngine", () => {
  it("runs read actions without confirmation and verifies technical evidence", async () => {
    const execute = vi.fn(async () => ({
      output: { count: 3 },
      evidence: evidence("crm.read"),
    }));
    const action: SamuelActionDefinition<Record<string, never>, { count: number }> = {
      name: "crm.list_leads",
      description: "Lista leads existentes",
      risk: "read",
      execute,
    };

    const result = await executeSamuelAction(action, {});

    expect(execute).toHaveBeenCalledOnce();
    expect(result.run.status).toBe("verified");
    expect(result.run.result).toMatchObject({ ok: true, verified: true });
    expect(result.transitions.map((item) => item.status)).toEqual([
      "pending",
      "executing",
      "verifying",
      "verified",
    ]);
  });

  it("runs prepare actions without confirmation", async () => {
    const action: SamuelActionDefinition<{ company: string }, { draft: string }> = {
      name: "sales.prepare_outreach",
      description: "Prepara uma abordagem comercial sem a enviar",
      risk: "prepare",
      execute: async ({ company }) => ({
        output: { draft: `Contato para ${company}` },
        evidence: evidence("sales.draft.created"),
      }),
    };

    const result = await executeSamuelAction(action, { company: "Acme" });

    expect(result.run.status).toBe("verified");
    expect(result.run.confirmationRequired).toBe(false);
  });

  it.each(["write", "sensitive"] as const)(
    "blocks %s actions until explicit confirmation",
    async (risk) => {
      const execute = vi.fn(async () => ({
        output: { id: "lead-1" },
        evidence: evidence("crm.lead.created"),
      }));
      const action: SamuelActionDefinition<{ name: string }, { id: string }> = {
        name: "crm.create_lead",
        description: "Cria um lead no CRM",
        risk,
        execute,
      };

      const result = await executeSamuelAction(action, { name: "Lead" });

      expect(execute).not.toHaveBeenCalled();
      expect(result.run.status).toBe("awaiting_confirmation");
      expect(result.run.result).toBeNull();
      expect(result.transitions.map((item) => item.status)).toEqual([
        "pending",
        "awaiting_confirmation",
      ]);
    },
  );

  it("executes a write action after explicit confirmation", async () => {
    const action: SamuelActionDefinition<{ name: string }, { id: string }> = {
      name: "crm.create_lead",
      description: "Cria um lead no CRM",
      risk: "write",
      execute: async () => ({
        output: { id: "lead-1" },
        evidence: evidence("crm.lead.created"),
      }),
    };

    const result = await executeSamuelAction(
      action,
      { name: "Lead" },
      { confirmed: true },
    );

    expect(result.run.status).toBe("verified");
    expect(result.run.result).toMatchObject({
      ok: true,
      verified: true,
      output: { id: "lead-1" },
    });
  });

  it("never marks an execution as verified when technical evidence is absent", async () => {
    const action: SamuelActionDefinition<Record<string, never>, { accepted: boolean }> = {
      name: "campaign.update",
      description: "Atualiza uma campanha",
      risk: "write",
      execute: async () => ({ output: { accepted: true } }),
    };

    const result = await executeSamuelAction(action, {}, { confirmed: true });

    expect(result.run.status).toBe("failed");
    expect(result.run.result).toEqual({
      ok: false,
      error: "A execução não produziu evidência verificável.",
      retryable: false,
      verified: false,
    });
    expect(result.transitions.at(-2)?.status).toBe("verifying");
    expect(result.transitions.at(-1)?.status).toBe("failed");
  });

  it("records executor failures as unverified failures", async () => {
    const action: SamuelActionDefinition<Record<string, never>, never> = {
      name: "external.send",
      description: "Executa uma alteração externa",
      risk: "sensitive",
      execute: async () => {
        throw new Error("provider unavailable");
      },
    };

    const result = await executeSamuelAction(action, {}, { confirmed: true });

    expect(result.run.status).toBe("failed");
    expect(result.run.result).toEqual({
      ok: false,
      error: "provider unavailable",
      retryable: true,
      verified: false,
    });
  });

  it("classifies only write and sensitive actions as confirmation-required", () => {
    expect(actionRequiresConfirmation("read")).toBe(false);
    expect(actionRequiresConfirmation("prepare")).toBe(false);
    expect(actionRequiresConfirmation("write")).toBe(true);
    expect(actionRequiresConfirmation("sensitive")).toBe(true);
  });
});
