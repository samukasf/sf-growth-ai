import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseBrainState } from "../entities";

export type BrainStateChangedPayload = {
  state: ReturnType<EnterpriseBrainState["toJSON"]>;
};
export type BrainStateChangedEvent = DomainEvent<BrainStateChangedPayload>;

export function createBrainStateChangedEvent(
  state: EnterpriseBrainState,
): BrainStateChangedEvent {
  return createDomainEvent({
    eventType: "BrainStateChanged",
    aggregateId: state.id,
    organizationId: state.organizationId,
    companyId: state.companyId,
    payload: { state: state.toJSON() },
  });
}
