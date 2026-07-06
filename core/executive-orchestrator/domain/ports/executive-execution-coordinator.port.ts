import type { ExecutiveConsensus, ExecutiveExecutionPlan, ExecutiveRequest } from "../entities";
import type { ExecutiveParticipantId } from "../../shared";

export interface ExecutiveExecutionCoordinator {
  coordinate(
    request: ExecutiveRequest,
    consensus: ExecutiveConsensus,
    participants: ExecutiveParticipantId[],
  ): ExecutiveExecutionPlan;
}
