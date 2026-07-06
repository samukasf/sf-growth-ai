import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveWorkflow } from "../entities";

export type ExecutiveWorkflowStartedPayload = {
  workflow: ReturnType<ExecutiveWorkflow["toJSON"]>;
};

export type ExecutiveWorkflowStartedEvent = DomainEvent<ExecutiveWorkflowStartedPayload>;

export function createExecutiveWorkflowStartedEvent(
  workflow: ExecutiveWorkflow,
): ExecutiveWorkflowStartedEvent {
  return createDomainEvent({
    eventType: "ExecutiveWorkflowStarted",
    aggregateId: workflow.requestId,
    companyId: workflow.companyId,
    payload: { workflow: workflow.toJSON() },
  });
}
