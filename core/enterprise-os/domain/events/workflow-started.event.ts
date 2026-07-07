import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessWorkflow } from "../entities";

export type WorkflowStartedPayload = {
  workflow: ReturnType<BusinessWorkflow["toJSON"]>;
};
export type WorkflowStartedEvent = DomainEvent<WorkflowStartedPayload>;

export function createWorkflowStartedEvent(
  workflow: BusinessWorkflow,
): WorkflowStartedEvent {
  return createDomainEvent({
    eventType: "WorkflowStarted",
    aggregateId: workflow.id,
    organizationId: workflow.organizationId,
    payload: { workflow: workflow.toJSON() },
  });
}
