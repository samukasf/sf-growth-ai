import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveRequestId } from "../../shared";
import type { OrchestratorBrainContext, OrchestratorBrainSnapshot } from "../types";

export type OrchestratorContextResolvedPayload = {
  requestId: ExecutiveRequestId;
  organizationId: string;
  snapshot: OrchestratorBrainSnapshot;
  brainContext: OrchestratorBrainContext;
};

export type OrchestratorContextResolvedEvent = DomainEvent<OrchestratorContextResolvedPayload>;

export function createOrchestratorContextResolvedEvent(input: {
  requestId: ExecutiveRequestId;
  organizationId: string;
  companyId: string;
  snapshot: OrchestratorBrainSnapshot;
  brainContext: OrchestratorBrainContext;
}): OrchestratorContextResolvedEvent {
  return createDomainEvent({
    eventType: "OrchestratorContextResolved",
    aggregateId: input.requestId,
    companyId: input.companyId,
    payload: {
      requestId: input.requestId,
      organizationId: input.organizationId,
      snapshot: input.snapshot,
      brainContext: input.brainContext,
    },
  });
}
