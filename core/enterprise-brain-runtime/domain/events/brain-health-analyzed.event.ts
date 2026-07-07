import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseBrainHealth } from "../entities";

export type BrainHealthAnalyzedPayload = {
  health: ReturnType<EnterpriseBrainHealth["toJSON"]>;
};
export type BrainHealthAnalyzedEvent = DomainEvent<BrainHealthAnalyzedPayload>;

export function createBrainHealthAnalyzedEvent(
  health: EnterpriseBrainHealth,
  organizationId: string,
  companyId: string,
): BrainHealthAnalyzedEvent {
  return createDomainEvent({
    eventType: "BrainHealthAnalyzed",
    aggregateId: `health-${organizationId}`,
    organizationId,
    companyId,
    payload: { health: health.toJSON() },
  });
}
