import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutivePlaybook } from "../entities";

export type PlaybookGeneratedPayload = {
  playbook: ReturnType<ExecutivePlaybook["toJSON"]>;
};

export type PlaybookGeneratedEvent = DomainEvent<PlaybookGeneratedPayload>;

export function createPlaybookGeneratedEvent(
  playbook: ExecutivePlaybook,
): PlaybookGeneratedEvent {
  return createDomainEvent({
    eventType: "PlaybookGenerated",
    aggregateId: playbook.wisdomId,
    companyId: playbook.companyId,
    payload: { playbook: playbook.toJSON() },
  });
}
