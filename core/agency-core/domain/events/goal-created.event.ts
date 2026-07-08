import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyGoal } from "../entities";

export type GoalCreatedPayload = {
  goal: ReturnType<AgencyGoal["toJSON"]>;
};

export type GoalCreatedEvent = DomainEvent<GoalCreatedPayload>;

export function createGoalCreatedEvent(goal: AgencyGoal): GoalCreatedEvent {
  return createDomainEvent({
    eventType: "GoalCreated",
    aggregateId: goal.id,
    organizationId: goal.organizationId,
    agencyId: goal.agencyId,
    payload: { goal: goal.toJSON() },
  });
}
