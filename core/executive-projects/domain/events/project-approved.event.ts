import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveProject } from "../entities";

export type ProjectApprovedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  approvedAt: string;
};

export type ProjectApprovedEvent = DomainEvent<ProjectApprovedPayload>;

export function createProjectApprovedEvent(project: ExecutiveProject): ProjectApprovedEvent {
  return createDomainEvent({
    eventType: "ProjectApproved",
    aggregateId: project.id,
    companyId: project.companyId,
    payload: {
      project: project.toJSON(),
      approvedAt: new Date().toISOString(),
    },
  });
}
