import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessWorkflow } from "../entities";

export type WorkflowCompletedPayload = {
  workflow: ReturnType<BusinessWorkflow["toJSON"]>;
};
export type WorkflowCompletedEvent = DomainEvent<WorkflowCompletedPayload>;

export function createWorkflowCompletedEvent(
  workflow: BusinessWorkflow,
): WorkflowCompletedEvent {
  return createDomainEvent({
    eventType: "WorkflowCompleted",
    aggregateId: workflow.id,
    organizationId: workflow.organizationId,
    payload: { workflow: workflow.toJSON() },
  });
}
