import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessScenario } from "../entities";

export type ScenarioMatchedPayload = {
  scenario: ReturnType<BusinessScenario["toJSON"]>;
  matchScore: number;
};

export type ScenarioMatchedEvent = DomainEvent<ScenarioMatchedPayload>;

export function createScenarioMatchedEvent(
  scenario: BusinessScenario,
  matchScore: number,
): ScenarioMatchedEvent {
  return createDomainEvent({
    eventType: "ScenarioMatched",
    aggregateId: scenario.experienceId ?? scenario.id,
    companyId: scenario.companyId,
    payload: { scenario: scenario.toJSON(), matchScore },
  });
}
