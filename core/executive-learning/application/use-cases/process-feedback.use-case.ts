import { LearningRecordNotFoundError } from "../../shared";
import { LearningFeedback, createFeedbackReceivedEvent } from "../../domain";
import type { ProcessFeedbackDto } from "../dto";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";

export class ProcessFeedbackUseCase {
  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {}

  async execute(dto: ProcessFeedbackDto) {
    const record = await this.deps.repository.findRecordById(dto.recordId);
    if (!record) {
      throw new LearningRecordNotFoundError(dto.recordId);
    }

    const feedback = LearningFeedback.create({
      recordId: dto.recordId,
      companyId: dto.companyId,
      sentiment: dto.sentiment,
      content: dto.content,
      source: dto.source,
      score: dto.score ?? 50,
    });

    const result = this.deps.feedbackProcessor.process(record, feedback);
    const updated = record.applyFeedback(feedback).update({
      lessonsLearned: [...record.lessonsLearned, ...result.appliedLessons],
    });

    await this.deps.repository.saveFeedback(feedback);
    await this.deps.repository.saveRecord(updated);

    const event = createFeedbackReceivedEvent(feedback);
    await this.deps.eventDispatcher.publish(event);

    return { feedback, record: updated, result };
  }
}
