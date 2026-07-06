import type {
  ExecutiveLearningEventPayload,
  ExecutiveLearningPort,
} from "../../application";
import type { DomainEvent } from "../../shared";

export class NoopExecutiveLearningAdapter implements ExecutiveLearningPort {
  async publishLearningEvent(payload: ExecutiveLearningEventPayload): Promise<void> {
    void payload;
  }

  async onKnowledgeDomainEvent(event: DomainEvent): Promise<void> {
    void event;
  }
}
