import type {
  SamuelActionRisk,
  SamuelLifecyclePhase,
  SamuelOrchestratorEvent,
  SamuelOrchestratorState,
} from "./samuel-orchestration.types";

const ALLOWED_TRANSITIONS: Record<SamuelLifecyclePhase, readonly SamuelLifecyclePhase[]> = {
  idle: ["listening", "understanding", "failed"],
  listening: ["understanding", "failed"],
  understanding: ["planning", "failed"],
  planning: ["awaiting_confirmation", "executing", "responding", "failed"],
  awaiting_confirmation: ["executing", "responding", "failed"],
  executing: ["verifying", "responding", "failed"],
  verifying: ["responding", "failed"],
  responding: ["completed", "failed"],
  completed: ["idle", "listening", "understanding"],
  failed: ["idle", "listening", "understanding"],
};

export class SamuelOrchestratorTransitionError extends Error {
  constructor(from: SamuelLifecyclePhase, to: SamuelLifecyclePhase) {
    super(`Transição inválida do Samuel Orchestrator: ${from} -> ${to}.`);
    this.name = "SamuelOrchestratorTransitionError";
  }
}

export function actionRiskRequiresConfirmation(risk: SamuelActionRisk) {
  return risk === "mutate" || risk === "sensitive";
}

export function createSamuelOrchestratorState(input: {
  sessionId: string;
  mode?: SamuelOrchestratorState["mode"];
  now?: string;
}): SamuelOrchestratorState {
  return {
    sessionId: input.sessionId,
    turnId: null,
    mode: input.mode ?? "text",
    phase: "idle",
    activeAction: null,
    error: null,
    updatedAt: input.now ?? new Date().toISOString(),
  };
}

function moveTo(
  state: SamuelOrchestratorState,
  phase: SamuelLifecyclePhase,
  now: string,
): SamuelOrchestratorState {
  if (!ALLOWED_TRANSITIONS[state.phase].includes(phase)) {
    throw new SamuelOrchestratorTransitionError(state.phase, phase);
  }
  return { ...state, phase, updatedAt: now };
}

export function reduceSamuelOrchestrator(
  state: SamuelOrchestratorState,
  event: SamuelOrchestratorEvent,
  now = new Date().toISOString(),
): SamuelOrchestratorState {
  switch (event.type) {
    case "turn_started": {
      const phase = event.mode === "voice" ? "listening" : "understanding";
      const next = moveTo(state, phase, now);
      return {
        ...next,
        turnId: event.turnId,
        mode: event.mode,
        activeAction: null,
        error: null,
      };
    }
    case "input_ready":
      return moveTo(state, "understanding", now);
    case "understanding_completed":
      return moveTo(state, "planning", now);
    case "plan_ready": {
      if (event.action) {
        const requiresConfirmation =
          event.action.requiresConfirmation || actionRiskRequiresConfirmation(event.action.risk);
        const phase = requiresConfirmation ? "awaiting_confirmation" : "executing";
        const next = moveTo(state, phase, now);
        return {
          ...next,
          activeAction: {
            ...event.action,
            requiresConfirmation,
            verificationStatus: "pending",
          },
        };
      }
      return moveTo(state, "responding", now);
    }
    case "action_confirmed": {
      if (!state.activeAction || state.phase !== "awaiting_confirmation") {
        throw new SamuelOrchestratorTransitionError(state.phase, "executing");
      }
      const next = moveTo(state, "executing", now);
      return {
        ...next,
        activeAction: {
          ...state.activeAction,
          confirmationApprovedAt: event.approvedAt,
        },
      };
    }
    case "execution_started":
      if (state.phase === "executing") return { ...state, updatedAt: now };
      return moveTo(state, "executing", now);
    case "execution_completed": {
      if (!state.activeAction) {
        throw new Error("Execução concluída sem ação ativa.");
      }
      if (event.verificationRequired) {
        const next = moveTo(state, "verifying", now);
        return {
          ...next,
          activeAction: { ...state.activeAction, verificationStatus: "pending" },
        };
      }
      const next = moveTo(state, "responding", now);
      return {
        ...next,
        activeAction: { ...state.activeAction, verificationStatus: "not_required" },
      };
    }
    case "verification_passed": {
      if (!state.activeAction) throw new Error("Verificação sem ação ativa.");
      const next = moveTo(state, "responding", now);
      return {
        ...next,
        activeAction: { ...state.activeAction, verificationStatus: "verified" },
      };
    }
    case "verification_failed": {
      if (!state.activeAction) throw new Error("Verificação sem ação ativa.");
      const next = moveTo(state, "failed", now);
      return {
        ...next,
        activeAction: { ...state.activeAction, verificationStatus: "failed" },
        error: { code: event.code, message: event.message },
      };
    }
    case "response_started":
      if (state.phase === "responding") return { ...state, updatedAt: now };
      return moveTo(state, "responding", now);
    case "response_completed":
      return moveTo(state, "completed", now);
    case "failed": {
      const next = moveTo(state, "failed", now);
      return { ...next, error: { code: event.code, message: event.message } };
    }
    case "reset": {
      const next = moveTo(state, "idle", now);
      return {
        ...next,
        turnId: null,
        activeAction: null,
        error: null,
      };
    }
  }
}

export function canSamuelClaimActionCompleted(state: SamuelOrchestratorState) {
  const action = state.activeAction;
  if (!action) return false;
  if (action.risk === "read" || action.risk === "draft") {
    return action.verificationStatus === "not_required" || action.verificationStatus === "verified";
  }
  return action.verificationStatus === "verified";
}
