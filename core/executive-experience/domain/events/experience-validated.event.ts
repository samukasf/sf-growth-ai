import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveExperience } from "../entities";

export type ExperienceValidatedPayload = {
  experience: ReturnType<ExecutiveExperience["toJSON"]>;
  validatedAt: string;
};

export type ExperienceValidatedEvent = DomainEvent<ExperienceValidatedPayload>;

export function createExperienceValidatedEvent(
  experience: ExecutiveExperience,
): ExperienceValidatedEvent {
  return createDomainEvent({
    eventType: "ExperienceValidated",
    aggregateId: experience.id,
    companyId: experience.companyId,
    payload: {
      experience: experience.toJSON(),
      validatedAt: new Date().toISOString(),
    },
  });
}
