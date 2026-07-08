import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyProject } from "../entities";

export type ProjectCompletedPayload = {
  project: ReturnType<AgencyProject["toJSON"]>;
};

export type ProjectCompletedEvent = DomainEvent<ProjectCompletedPayload>;

export function createProjectCompletedEvent(
  project: AgencyProject,
): ProjectCompletedEvent {
  return createDomainEvent({
    eventType: "ProjectCompleted",
    aggregateId: project.id,
    organizationId: project.organizationId,
    agencyId: project.agencyId,
    payload: { project: project.toJSON() },
  });
}
