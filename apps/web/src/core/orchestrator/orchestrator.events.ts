import type { PipelineStepName } from "./orchestrator.types";

export const ORCHESTRATOR_EVENTS = {
  STARTED: "orchestrator.started",
  STEP_COMPLETED: "orchestrator.step-completed",
  STEP_FAILED: "orchestrator.step-failed",
  COMPLETED: "orchestrator.completed",
  FAILED: "orchestrator.failed",
} as const;

export type OrchestratorEventName =
  (typeof ORCHESTRATOR_EVENTS)[keyof typeof ORCHESTRATOR_EVENTS];

export interface OrchestratorEventPayload {
  tenantId: string;
  companyId: string;
  messageId: string;
  step?: PipelineStepName;
  durationMs?: number;
  timestamp: string;
}

export function createOrchestratorEvent(
  name: OrchestratorEventName,
  payload: Omit<OrchestratorEventPayload, "timestamp">,
): OrchestratorEventPayload & { name: OrchestratorEventName } {
  return {
    name,
    ...payload,
    timestamp: new Date().toISOString(),
  };
}
