import type { ExecutiveDecisionTree, ExecutiveRequest } from "../entities";
import type { ExecutiveParticipantId } from "../../shared";

export type RoutingResult = {
  participants: ExecutiveParticipantId[];
  intent: string;
  reason: string;
};

export interface ExecutiveRoutingEngine {
  route(request: ExecutiveRequest, decisionTree: ExecutiveDecisionTree): RoutingResult;
}
