import type { DomainEvent } from "../../../shared";

export type ExecutiveLearningEventPayload = {
  companyId: string;
  eventType: string;
  title: string;
  description: string;
  knowledgeRecordId?: string;
  metadata?: Record<string, string>;
};

export interface ExecutiveLearningPort {
  publishLearningEvent(payload: ExecutiveLearningEventPayload): Promise<void>;
  onKnowledgeDomainEvent(event: DomainEvent): Promise<void>;
}
