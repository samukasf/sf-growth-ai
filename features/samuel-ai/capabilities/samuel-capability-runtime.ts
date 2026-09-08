import { getSamuelCapability } from "./samuel-capability-registry";
import type {
  SamuelCapabilityExecutionPlan,
  SamuelCapabilityExecutionRequest,
} from "./samuel-capability.types";

function blockedPlan(
  request: SamuelCapabilityExecutionRequest,
  reason: string,
): SamuelCapabilityExecutionPlan {
  return {
    capabilityId: request.capabilityId,
    companyId: request.companyId,
    status: "blocked",
    reason,
    executionClass: null,
    evidencePolicy: null,
    executor: null,
    payload: {},
    timeoutMs: null,
    cancellable: false,
  };
}

export function buildSamuelCapabilityExecutionPlan(
  request: SamuelCapabilityExecutionRequest,
): SamuelCapabilityExecutionPlan {
  const capability = getSamuelCapability(request.capabilityId);
  if (!capability) return blockedPlan(request, "Unknown capability");

  const base = {
    capabilityId: capability.id,
    companyId: request.companyId,
    executionClass: capability.executionClass,
    evidencePolicy: capability.evidencePolicy,
    executor: capability.executor,
    payload: { companyId: request.companyId, ...(request.input ?? {}) },
    timeoutMs: capability.timeoutMs,
    cancellable: capability.cancellable,
  } satisfies Omit<SamuelCapabilityExecutionPlan, "status" | "reason">;

  if (capability.availability === "planned") {
    return {
      ...base,
      status: "planned",
      reason: `Capability is registered but has no verified production executor yet. Requirements: ${capability.requirements.join(", ") || "none"}`,
    };
  }

  if (capability.availability === "configuration_required") {
    return {
      ...base,
      status: "configuration_required",
      reason: `Capability requires configuration before execution. Requirements: ${capability.requirements.join(", ") || "provider configuration"}`,
    };
  }

  if (!capability.executor) {
    return {
      ...base,
      status: "blocked",
      reason: "Connected capability is missing a verified executor",
    };
  }

  if (request.autonomy < capability.minimumAutonomy) {
    return {
      ...base,
      status: "approval_required",
      reason: `Requires autonomy level ${capability.minimumAutonomy} or higher`,
    };
  }

  if (capability.requiresApproval && !request.approved) {
    return {
      ...base,
      status: "approval_required",
      reason: "Human approval required",
    };
  }

  return {
    ...base,
    status: "ready",
    reason: "Verified capability executor available",
  };
}

export function canSamuelExecuteCapability(request: SamuelCapabilityExecutionRequest) {
  return buildSamuelCapabilityExecutionPlan(request).status === "ready";
}
