import { KnowledgeRecordNotFoundError } from "../../shared";
import { createKnowledgeValidatedEvent } from "../../domain";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";

export class ValidateKnowledgeUseCase {
  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {}

  async execute(recordId: string) {
    const existing = await this.deps.repository.findById(recordId);
    if (!existing) {
      throw new KnowledgeRecordNotFoundError(recordId);
    }

    if (!this.deps.qualityEvaluator.meetsMinimumQuality(existing)) {
      throw new Error("Knowledge record does not meet minimum quality threshold");
    }

    const validated = existing.markValidated();

    await this.deps.repository.save(validated);
    await this.deps.indexer.index(validated);

    const event = createKnowledgeValidatedEvent(validated);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncKnowledge({
      companyId: validated.companyId,
      record: validated.toJSON(),
      syncReason: "validated",
    });
    await this.deps.companyBrain.notifyKnowledgeChange(validated);
    await this.deps.executiveLearning.onKnowledgeDomainEvent(event);

    const wisdomCandidate = await this.deps.executiveWisdom.evaluateForWisdom(validated);
    if (wisdomCandidate) {
      await this.deps.executiveWisdom.registerWisdomCandidate(wisdomCandidate);
    }

    return validated;
  }
}
