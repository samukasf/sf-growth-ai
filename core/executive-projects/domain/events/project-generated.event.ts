import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveProject } from "../entities";

export type ProjectGeneratedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
};

export type ProjectGeneratedEvent = DomainEvent<ProjectGeneratedPayload>;

export function createProjectGeneratedEvent(
  project: ExecutiveProject,
): ProjectGeneratedEvent {
  return createDomainEvent({
    eventType: "ProjectGenerated",
    aggregateId: project.id,
    companyId: project.companyId,
    payload: { project: project.toJSON() },
  });
}
