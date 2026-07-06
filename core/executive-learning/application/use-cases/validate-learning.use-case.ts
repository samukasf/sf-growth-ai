import { LearningRecordNotFoundError } from "../../shared";
import { createLearningValidatedEvent } from "../../domain";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";

export class ValidateLearningUseCase {
  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {}

  async execute(recordId: string) {
    const existing = await this.deps.repository.findRecordById(recordId);
    if (!existing) {
      throw new LearningRecordNotFoundError(recordId);
    }

    if (!this.deps.scoreCalculator.meetsValidationThreshold(existing)) {
      throw new Error("Learning record does not meet validation threshold");
    }

    const validated = existing.markValidated();
    await this.deps.repository.saveRecord(validated);

    const event = createLearningValidatedEvent(validated);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncLearning({
      companyId: validated.companyId,
      record: validated.toJSON(),
      syncReason: "validated",
    });
    await this.deps.companyBrain.notifyLearningChange(validated);

    const wisdomCandidate = await this.deps.executiveWisdom.evaluateForWisdom(validated);
    if (wisdomCandidate) {
      await this.deps.executiveWisdom.registerWisdomCandidate(wisdomCandidate);
    }

    const highlights = await this.deps.executiveCeo.summarizeLearningImpact([validated]);
    await this.deps.executiveCeo.notifyLearningInsight({
      companyId: validated.companyId,
      headline: "Learning validated",
      learningHighlights: highlights,
      recordId: validated.id,
    });

    return validated;
  }
}
