import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseBrainSignal } from "../entities";

export type BrainSignalProcessedPayload = {
  signal: ReturnType<EnterpriseBrainSignal["toJSON"]>;
};
export type BrainSignalProcessedEvent = DomainEvent<BrainSignalProcessedPayload>;

export function createBrainSignalProcessedEvent(
  signal: EnterpriseBrainSignal,
  organizationId: string,
  companyId: string,
): BrainSignalProcessedEvent {
  return createDomainEvent({
    eventType: "BrainSignalProcessed",
    aggregateId: signal.id,
    organizationId,
    companyId,
    payload: { signal: signal.toJSON() },
  });
}
