import { createDomainEvent, type DomainEvent } from "../../shared";
import type { LearningExperience } from "../entities";

export type ExperienceRecordedPayload = {
  experience: ReturnType<LearningExperience["toJSON"]>;
};

export type ExperienceRecordedEvent = DomainEvent<ExperienceRecordedPayload>;

export function createExperienceRecordedEvent(
  experience: LearningExperience,
): ExperienceRecordedEvent {
  return createDomainEvent({
    eventType: "ExperienceRecorded",
    aggregateId: experience.recordId,
    companyId: experience.companyId,
    payload: { experience: experience.toJSON() },
  });
}
