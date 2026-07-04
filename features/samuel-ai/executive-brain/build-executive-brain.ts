import {
  buildOrchestratorSnapshot,
  generateOrchestratorResponse,
  runExecutiveOrchestrationToBrain,
  snapshotToBrain,
} from "../services/executive-orchestrator.service";
import type { ExecutiveContext as CompanyExecutiveContext } from "@/services/executive-context.service";
import { DEFAULT_EXECUTIVE_BRAIN } from "./mock-data";
import type { ExecutiveBrain } from "./types";

export { generateOrchestratorResponse as generateSimulatedResponse } from "../services/executive-orchestrator.service";

export function buildExecutiveBrain(
  userQuery: string,
  companyContext?: CompanyExecutiveContext | null,
): ExecutiveBrain {
  return runExecutiveOrchestrationToBrain(userQuery, companyContext);
}

export function buildExecutiveBrainInProgress(userQuery: string): ExecutiveBrain {
  const snapshot = buildOrchestratorSnapshot(userQuery, "running_analysis");

  if (!snapshot.context || !snapshot.analysis) {
    return {
      ...DEFAULT_EXECUTIVE_BRAIN,
      id: `brain-${crypto.randomUUID()}`,
      builtAt: new Date().toISOString(),
      userQuery,
      context: snapshot.context ?? DEFAULT_EXECUTIVE_BRAIN.context,
    };
  }

  return {
    id: `brain-${crypto.randomUUID()}`,
    builtAt: new Date().toISOString(),
    userQuery,
    context: snapshot.context,
    memory: DEFAULT_EXECUTIVE_BRAIN.memory,
    reasoning: snapshot.analysis.reasoning,
    actionPlan: DEFAULT_EXECUTIVE_BRAIN.actionPlan,
  };
}

export function buildExecutiveBrainFromSnapshot(
  userQuery: string,
  phase: Parameters<typeof buildOrchestratorSnapshot>[1],
  companyContext?: CompanyExecutiveContext | null,
): ExecutiveBrain {
  const snapshot = buildOrchestratorSnapshot(userQuery, phase, companyContext);

  if (phase !== "complete") {
    if (!snapshot.context) {
      return {
        ...DEFAULT_EXECUTIVE_BRAIN,
        id: `brain-${crypto.randomUUID()}`,
        builtAt: new Date().toISOString(),
        userQuery,
      };
    }

    return {
      id: `brain-${crypto.randomUUID()}`,
      builtAt: new Date().toISOString(),
      userQuery,
      context: snapshot.context,
      memory: snapshot.memory ?? DEFAULT_EXECUTIVE_BRAIN.memory,
      reasoning:
        snapshot.analysis?.reasoning ?? DEFAULT_EXECUTIVE_BRAIN.reasoning,
      actionPlan:
        snapshot.actionPlan ?? DEFAULT_EXECUTIVE_BRAIN.actionPlan,
    };
  }

  return snapshotToBrain(snapshot);
}

export { generateOrchestratorResponse };
