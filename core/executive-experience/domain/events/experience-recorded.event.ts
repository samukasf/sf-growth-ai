import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveExperience } from "../entities";

export type ExperienceRecordedPayload = {
  experience: ReturnType<ExecutiveExperience["toJSON"]>;
};

export type ExperienceRecordedEvent = DomainEvent<ExperienceRecordedPayload>;

export function createExperienceRecordedEvent(
  experience: ExecutiveExperience,
): ExperienceRecordedEvent {
  return createDomainEvent({
    eventType: "ExperienceRecorded",
    aggregateId: experience.id,
    companyId: experience.companyId,
    payload: { experience: experience.toJSON() },
  });
}
