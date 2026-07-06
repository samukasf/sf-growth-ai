import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveProject } from "../entities";

export type ProjectStartedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  startedAt: string;
};

export type ProjectStartedEvent = DomainEvent<ProjectStartedPayload>;

export function createProjectStartedEvent(project: ExecutiveProject): ProjectStartedEvent {
  return createDomainEvent({
    eventType: "ProjectStarted",
    aggregateId: project.id,
    companyId: project.companyId,
    payload: {
      project: project.toJSON(),
      startedAt: new Date().toISOString(),
    },
  });
}
