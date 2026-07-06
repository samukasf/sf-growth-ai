import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveProject } from "../entities";

export type ProjectCompletedPayload = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  completedAt: string;
};

export type ProjectCompletedEvent = DomainEvent<ProjectCompletedPayload>;

export function createProjectCompletedEvent(
  project: ExecutiveProject,
): ProjectCompletedEvent {
  return createDomainEvent({
    eventType: "ProjectCompleted",
    aggregateId: project.id,
    companyId: project.companyId,
    payload: {
      project: project.toJSON(),
      completedAt: new Date().toISOString(),
    },
  });
}
