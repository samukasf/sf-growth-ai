import type { ExecutiveDecisionTree, ExecutiveRequest } from "../entities";
import type { OrchestratorRoutingContext } from "../types";
import type { ExecutiveParticipantId } from "../../shared";

export type RoutingResult = {
  participants: ExecutiveParticipantId[];
  intent: string;
  reason: string;
  brainInformed: boolean;
  consideredFactors: string[];
};

export interface ExecutiveRoutingEngine {
  route(
    request: ExecutiveRequest,
    decisionTree: ExecutiveDecisionTree,
    routingContext: OrchestratorRoutingContext,
  ): RoutingResult;
}
