import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyProject } from "../entities";

export type ProjectStartedPayload = {
  project: ReturnType<AgencyProject["toJSON"]>;
};

export type ProjectStartedEvent = DomainEvent<ProjectStartedPayload>;

export function createProjectStartedEvent(project: AgencyProject): ProjectStartedEvent {
  return createDomainEvent({
    eventType: "ProjectStarted",
    aggregateId: project.id,
    organizationId: project.organizationId,
    agencyId: project.agencyId,
    payload: { project: project.toJSON() },
  });
}
