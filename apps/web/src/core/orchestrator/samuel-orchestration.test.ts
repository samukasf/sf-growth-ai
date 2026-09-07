import { describe, expect, it } from "vitest";

import {
  canSamuelClaimActionCompleted,
  createSamuelOrchestratorState,
  reduceSamuelOrchestrator,
  SamuelOrchestratorTransitionError,
} from "./samuel-orchestration";

describe("Samuel premium lifecycle", () => {
  it("uses the same semantic lifecycle for text and voice turns", () => {
    const base = createSamuelOrchestratorState({
      sessionId: "session-1",
      now: "2026-09-07T16:00:00.000Z",
    });

    const text = reduceSamuelOrchestrator(base, {
      type: "turn_started",
      turnId: "turn-text",
      mode: "text",
    });
    const voice = reduceSamuelOrchestrator(base, {
      type: "turn_started",
      turnId: "turn-voice",
      mode: "voice",
    });

    expect(text.phase).toBe("understanding");
    expect(voice.phase).toBe("listening");
    expect(reduceSamuelOrchestrator(voice, { type: "input_ready" }).phase).toBe(
      "understanding",
    );
  });

  it("forces mutation actions through confirmation and verification", () => {
    let state = createSamuelOrchestratorState({ sessionId: "session-1" });
    state = reduceSamuelOrchestrator(state, {
      type: "turn_started",
      turnId: "turn-1",
      mode: "text",
    });
    state = reduceSamuelOrchestrator(state, { type: "understanding_completed" });
    state = reduceSamuelOrchestrator(state, {
      type: "plan_ready",
      action: {
        actionId: "gmail_send",
        requestId: "request-1",
        risk: "mutate",
        requiresConfirmation: false,
      },
    });

    expect(state.phase).toBe("awaiting_confirmation");
    expect(state.activeAction?.requiresConfirmation).toBe(true);
    expect(canSamuelClaimActionCompleted(state)).toBe(false);

    state = reduceSamuelOrchestrator(state, {
      type: "action_confirmed",
      approvedAt: "2026-09-07T16:01:00.000Z",
    });
    state = reduceSamuelOrchestrator(state, {
      type: "execution_completed",
      verificationRequired: true,
    });

    expect(state.phase).toBe("verifying");
    expect(canSamuelClaimActionCompleted(state)).toBe(false);

    state = reduceSamuelOrchestrator(state, { type: "verification_passed" });
    expect(state.phase).toBe("responding");
    expect(canSamuelClaimActionCompleted(state)).toBe(true);
  });

  it("does not allow impossible lifecycle jumps", () => {
    const state = createSamuelOrchestratorState({ sessionId: "session-1" });

    expect(() =>
      reduceSamuelOrchestrator(state, { type: "response_completed" }),
    ).toThrow(SamuelOrchestratorTransitionError);
  });

  it("fails the turn when an execution cannot be verified", () => {
    let state = createSamuelOrchestratorState({ sessionId: "session-1" });
    state = reduceSamuelOrchestrator(state, {
      type: "turn_started",
      turnId: "turn-1",
      mode: "text",
    });
    state = reduceSamuelOrchestrator(state, { type: "understanding_completed" });
    state = reduceSamuelOrchestrator(state, {
      type: "plan_ready",
      action: {
        actionId: "calendar_create",
        requestId: "request-2",
        risk: "mutate",
        requiresConfirmation: true,
      },
    });
    state = reduceSamuelOrchestrator(state, {
      type: "action_confirmed",
      approvedAt: "2026-09-07T16:02:00.000Z",
    });
    state = reduceSamuelOrchestrator(state, {
      type: "execution_completed",
      verificationRequired: true,
    });
    state = reduceSamuelOrchestrator(state, {
      type: "verification_failed",
      code: "CALENDAR_NOT_FOUND",
      message: "Evento não confirmado após criação.",
    });

    expect(state.phase).toBe("failed");
    expect(state.activeAction?.verificationStatus).toBe("failed");
    expect(canSamuelClaimActionCompleted(state)).toBe(false);
  });
});
