export type SamuelInteractionMode = "text" | "voice";

export type SamuelLifecyclePhase =
  | "idle"
  | "listening"
  | "understanding"
  | "planning"
  | "awaiting_confirmation"
  | "executing"
  | "verifying"
  | "responding"
  | "completed"
  | "failed";

export type SamuelActionRisk = "read" | "draft" | "mutate" | "sensitive";

export type SamuelVerificationStatus =
  | "not_required"
  | "pending"
  | "verified"
  | "failed";

export type SamuelOrchestratorError = {
  code: string;
  message: string;
};

export type SamuelActiveAction = {
  actionId: string;
  requestId: string;
  risk: SamuelActionRisk;
  requiresConfirmation: boolean;
  confirmationApprovedAt?: string;
  verificationStatus: SamuelVerificationStatus;
};

export type SamuelOrchestratorState = {
  sessionId: string;
  turnId: string | null;
  mode: SamuelInteractionMode;
  phase: SamuelLifecyclePhase;
  activeAction: SamuelActiveAction | null;
  error: SamuelOrchestratorError | null;
  updatedAt: string;
};

export type SamuelOrchestratorEvent =
  | { type: "turn_started"; turnId: string; mode: SamuelInteractionMode }
  | { type: "input_ready" }
  | { type: "understanding_completed" }
  | {
      type: "plan_ready";
      action?: Omit<SamuelActiveAction, "verificationStatus">;
    }
  | { type: "action_confirmed"; approvedAt: string }
  | { type: "execution_started" }
  | { type: "execution_completed"; verificationRequired: boolean }
  | { type: "verification_passed" }
  | { type: "verification_failed"; code: string; message: string }
  | { type: "response_started" }
  | { type: "response_completed" }
  | { type: "failed"; code: string; message: string }
  | { type: "reset" };

export type SamuelTelemetryOutcome = "started" | "success" | "failed" | "blocked";

export type SamuelTelemetryEvent = {
  event:
    | "turn.phase_changed"
    | "action.started"
    | "action.blocked"
    | "action.executed"
    | "action.verified"
    | "action.failed";
  sessionId: string;
  turnId: string | null;
  companyId?: string;
  userId?: string;
  actionId?: string;
  requestId?: string;
  risk?: SamuelActionRisk;
  phase?: SamuelLifecyclePhase;
  outcome: SamuelTelemetryOutcome;
  durationMs?: number;
  errorCode?: string;
  timestamp: string;
};

export interface SamuelTelemetrySink {
  emit(event: SamuelTelemetryEvent): void | Promise<void>;
}
