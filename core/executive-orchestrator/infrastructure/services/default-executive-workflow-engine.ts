import {
  ExecutiveWorkflow,
  type ExecutiveRequest,
  type ExecutiveWorkflowEngine,
} from "../../domain";
import type { ExecutiveParticipantId } from "../../shared";

export class DefaultExecutiveWorkflowEngine implements ExecutiveWorkflowEngine {
  createWorkflow(
    request: ExecutiveRequest,
    participants: ExecutiveParticipantId[],
  ): ExecutiveWorkflow {
    return ExecutiveWorkflow.create({
      companyId: request.companyId,
      requestId: request.id,
      participants,
    });
  }

  start(workflow: ExecutiveWorkflow): ExecutiveWorkflow {
    return workflow.start();
  }

  complete(workflow: ExecutiveWorkflow): ExecutiveWorkflow {
    return workflow.complete();
  }
}
