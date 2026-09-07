import { describe, expect, it } from "vitest";

import {
  InMemorySamuelTelemetrySink,
  SamuelActionConfirmationRequiredError,
  SamuelActionEngine,
  SamuelActionIdempotencyRequiredError,
} from "./samuel-action-engine";

const context = {
  sessionId: "session-1",
  turnId: "turn-1",
  tenantId: "tenant-1",
  companyId: "company-1",
  userId: "user-1",
  requestId: "request-1",
};

describe("SamuelActionEngine", () => {
  it("executes a read action without confirmation and allows completion", async () => {
    const telemetry = new InMemorySamuelTelemetrySink();
    const engine = new SamuelActionEngine(telemetry).register({
      actionId: "crm_read",
      risk: "read",
      execute: async (_context, input: { leadId: string }) => ({
        leadId: input.leadId,
        found: true,
      }),
    });

    const result = await engine.execute<{ leadId: string }, { leadId: string; found: boolean }>({
      actionId: "crm_read",
      input: { leadId: "lead-1" },
      context,
    });

    expect(result.status).toBe("verified");
    expect(result.canClaimCompletion).toBe(true);
    expect(telemetry.events.map((event) => event.event)).toEqual([
      "action.started",
      "action.executed",
    ]);
  });

  it("blocks mutation actions without explicit confirmation", async () => {
    const telemetry = new InMemorySamuelTelemetrySink();
    const engine = new SamuelActionEngine(telemetry).register({
      actionId: "gmail_send",
      risk: "mutate",
      execute: async () => ({ messageId: "message-1" }),
      verify: async () => ({ verified: true }),
    });

    await expect(
      engine.execute({
        actionId: "gmail_send",
        input: { to: "cliente@example.com" },
        context: { ...context, idempotencyKey: "idem-1" },
      }),
    ).rejects.toBeInstanceOf(SamuelActionConfirmationRequiredError);

    expect(telemetry.events.at(-1)?.errorCode).toBe("CONFIRMATION_REQUIRED");
  });

  it("requires idempotency for mutation actions", async () => {
    const engine = new SamuelActionEngine().register({
      actionId: "calendar_create",
      risk: "mutate",
      execute: async () => ({ eventId: "event-1" }),
      verify: async () => ({ verified: true }),
    });

    await expect(
      engine.execute({
        actionId: "calendar_create",
        input: { title: "Reunião" },
        context,
        confirmation: {
          approved: true,
          approvedAt: "2026-09-07T16:00:00.000Z",
          approvedBy: "user-1",
        },
      }),
    ).rejects.toBeInstanceOf(SamuelActionIdempotencyRequiredError);
  });

  it("does not claim a mutation completed when no verifier exists", async () => {
    const engine = new SamuelActionEngine().register({
      actionId: "crm_update",
      risk: "mutate",
      execute: async () => ({ updated: true }),
    });

    const result = await engine.execute({
      actionId: "crm_update",
      input: { leadId: "lead-1" },
      context: { ...context, idempotencyKey: "idem-2" },
      confirmation: {
        approved: true,
        approvedAt: "2026-09-07T16:00:00.000Z",
        approvedBy: "user-1",
      },
    });

    expect(result.status).toBe("executed_unverified");
    expect(result.canClaimCompletion).toBe(false);
  });

  it("allows completion only after a mutation verifier confirms evidence", async () => {
    const telemetry = new InMemorySamuelTelemetrySink();
    const engine = new SamuelActionEngine(telemetry).register({
      actionId: "calendar_create",
      risk: "mutate",
      execute: async () => ({ eventId: "event-1" }),
      verify: async (_context, _input, output) => ({
        verified: output.eventId === "event-1",
        evidence: { eventId: output.eventId },
      }),
    });

    const result = await engine.execute({
      actionId: "calendar_create",
      input: { title: "Reunião" },
      context: { ...context, idempotencyKey: "idem-3" },
      confirmation: {
        approved: true,
        approvedAt: "2026-09-07T16:00:00.000Z",
        approvedBy: "user-1",
      },
    });

    expect(result.status).toBe("verified");
    expect(result.canClaimCompletion).toBe(true);
    expect(result.evidence).toEqual({ eventId: "event-1" });
    expect(telemetry.events.at(-1)?.event).toBe("action.verified");
  });

  it("converts execution exceptions into a failed auditable result", async () => {
    const telemetry = new InMemorySamuelTelemetrySink();
    const engine = new SamuelActionEngine(telemetry).register({
      actionId: "crm_read",
      risk: "read",
      execute: async () => {
        throw new Error("CRM indisponível");
      },
    });

    const result = await engine.execute({
      actionId: "crm_read",
      input: {},
      context,
    });

    expect(result.status).toBe("failed");
    expect(result.canClaimCompletion).toBe(false);
    expect(result.error).toEqual({
      code: "EXECUTION_FAILED",
      message: "CRM indisponível",
    });
    expect(telemetry.events.at(-1)?.event).toBe("action.failed");
  });
});
