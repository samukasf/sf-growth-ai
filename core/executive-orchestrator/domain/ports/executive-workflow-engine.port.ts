import type { ExecutiveParticipantId } from "../../shared";
import type { ExecutiveRequest, ExecutiveWorkflow } from "../entities";

export interface ExecutiveWorkflowEngine {
  createWorkflow(
    request: ExecutiveRequest,
    participants: ExecutiveParticipantId[],
  ): ExecutiveWorkflow;
  start(workflow: ExecutiveWorkflow): ExecutiveWorkflow;
  complete(workflow: ExecutiveWorkflow): ExecutiveWorkflow;
}
