import type { ExecutiveBrainStatus } from "../../executive-brain/types";
import type { OrchestratorPhase } from "../../services/executive-orchestrator.types";
import { detectConversationIntents } from "../../services/executive-conversation-orchestrator.service";
import { formatConversationIntent } from "../../utils/build-samuel-ceo-response";

export type ExecutiveExperienceState =
  | "idle"
  | "receiving"
  | "analyzing"
  | "consulting-executives"
  | "building-consensus"
  | "preparing-action-plan"
  | "ready";

export const EXPERIENCE_STATE_ORDER: ExecutiveExperienceState[] = [
  "receiving",
  "analyzing",
  "consulting-executives",
  "building-consensus",
  "preparing-action-plan",
  "ready",
];

export const EXPERIENCE_STATE_LABELS: Record<ExecutiveExperienceState, string> = {
  idle: "Aguardando",
  receiving: "Receiving",
  analyzing: "Analyzing",
  "consulting-executives": "Consulting Executives",
  "building-consensus": "Building Consensus",
  "preparing-action-plan": "Preparing Action Plan",
  ready: "Ready",
};

const STATE_RANK: Record<ExecutiveExperienceState, number> = {
  idle: -1,
  receiving: 0,
  analyzing: 1,
  "consulting-executives": 2,
  "building-consensus": 3,
  "preparing-action-plan": 4,
  ready: 5,
};

export function mapPhaseToExperienceState(
  isProcessing: boolean,
  brainStatus: ExecutiveBrainStatus,
  phase: OrchestratorPhase | null | undefined,
  hasQuestion: boolean,
): ExecutiveExperienceState {
  if (!hasQuestion && brainStatus === "idle") {
    return "idle";
  }

  if (brainStatus === "ready" && !isProcessing) {
    return "ready";
  }

  if (!phase && isProcessing) {
    return "receiving";
  }

  switch (phase) {
    case "building_context":
      return "analyzing";
    case "selecting_executives":
    case "running_analysis":
      return "consulting-executives";
    case "building_consensus":
      return "building-consensus";
    case "building_action_plan":
      return "preparing-action-plan";
    case "complete":
      return "ready";
    default:
      return isProcessing ? "receiving" : "idle";
  }
}

export function isExperienceStateAtLeast(
  current: ExecutiveExperienceState,
  minimum: ExecutiveExperienceState,
): boolean {
  return STATE_RANK[current] >= STATE_RANK[minimum];
}

export function formatDetectedIntents(question: string): string {
  return detectConversationIntents(question)
    .map((intent) => formatConversationIntent(intent))
    .join(" · ");
}
