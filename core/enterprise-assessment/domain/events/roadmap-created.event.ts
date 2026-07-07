import type { CompanyId, OrganizationId } from "../../shared";
import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AssessmentRoadmap } from "../entities";

export type RoadmapCreatedPayload = {
  roadmap: ReturnType<AssessmentRoadmap["toJSON"]>;
};

export type RoadmapCreatedEvent = DomainEvent<RoadmapCreatedPayload>;

export function createRoadmapCreatedEvent(
  roadmap: AssessmentRoadmap,
  organizationId: OrganizationId,
  companyId: CompanyId,
): RoadmapCreatedEvent {
  return createDomainEvent({
    eventType: "RoadmapCreated",
    aggregateId: roadmap.assessmentId,
    organizationId,
    companyId,
    payload: { roadmap: roadmap.toJSON() },
  });
}
