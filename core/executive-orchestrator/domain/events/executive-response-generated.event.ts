import { createDomainEvent, type DomainEvent } from "../../shared";

export type ExecutiveResponseGeneratedPayload = {
  requestId: string;
  response: string;
  participants: string[];
  confidence: number;
  generatedAt: string;
};

export type ExecutiveResponseGeneratedEvent = DomainEvent<ExecutiveResponseGeneratedPayload>;

export function createExecutiveResponseGeneratedEvent(input: {
  requestId: string;
  companyId: string;
  response: string;
  participants: string[];
  confidence: number;
}): ExecutiveResponseGeneratedEvent {
  return createDomainEvent({
    eventType: "ExecutiveResponseGenerated",
    aggregateId: input.requestId,
    companyId: input.companyId,
    payload: {
      requestId: input.requestId,
      response: input.response,
      participants: input.participants,
      confidence: input.confidence,
      generatedAt: new Date().toISOString(),
    },
  });
}
