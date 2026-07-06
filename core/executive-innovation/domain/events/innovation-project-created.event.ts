import { createDomainEvent, type DomainEvent } from "../../shared";
import type { InnovationProject } from "../entities";

export type InnovationProjectCreatedPayload = {
  project: ReturnType<InnovationProject["toJSON"]>;
};

export type InnovationProjectCreatedEvent = DomainEvent<InnovationProjectCreatedPayload>;

export function createInnovationProjectCreatedEvent(
  project: InnovationProject,
): InnovationProjectCreatedEvent {
  return createDomainEvent({
    eventType: "InnovationProjectCreated",
    aggregateId: project.opportunityId,
    companyId: project.companyId,
    payload: { project: project.toJSON() },
  });
}
