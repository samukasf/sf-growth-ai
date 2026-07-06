import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveProject } from "../entities";

export type ProjectRejectedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  rejectedAt: string;
};

export type ProjectRejectedEvent = DomainEvent<ProjectRejectedPayload>;

export function createProjectRejectedEvent(project: ExecutiveProject): ProjectRejectedEvent {
  return createDomainEvent({
    eventType: "ProjectRejected",
    aggregateId: project.id,
    companyId: project.companyId,
    payload: {
      project: project.toJSON(),
      rejectedAt: new Date().toISOString(),
    },
  });
}
