import { LearningOutcome, LearningRecord, createLearningCreatedEvent } from "../../domain";
import type { CreateLearningRecordDto } from "../dto";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";

export class CreateLearningRecordUseCase {
  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {}

  async execute(dto: CreateLearningRecordDto) {
    const outcome = LearningOutcome.create({
      status: dto.outcomeStatus,
      description: dto.outcomeDescription,
      measuredAt: new Date().toISOString(),
    });

    let record = LearningRecord.create({
      companyId: dto.companyId,
      knowledgeId: dto.knowledgeId,
      eventId: dto.eventId,
      decisionId: dto.decisionId,
      outcome,
      successLevel: dto.successLevel ?? 50,
      confidence: dto.confidence ?? 50,
      impact: dto.impact ?? 50,
      roi: dto.roi ?? 0,
      feedback: dto.feedback ?? "",
      lessonsLearned: dto.lessonsLearned ?? [],
      recommendations: dto.recommendations ?? [],
    });

    const evaluation = this.deps.outcomeEvaluator.evaluate(record);
    const analysis = this.deps.analyzer.analyze(record);

    record = record.update({
      successLevel: evaluation.successLevel,
      impact: evaluation.impact,
      roi: evaluation.roi,
      lessonsLearned:
        record.lessonsLearned.length > 0
          ? record.lessonsLearned
          : analysis.suggestedLessons,
      recommendations:
        record.recommendations.length > 0
          ? record.recommendations
          : analysis.suggestedRecommendations,
    });

    await this.deps.repository.saveRecord(record);

    const event = createLearningCreatedEvent(record);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncLearning({
      companyId: record.companyId,
      record: record.toJSON(),
      syncReason: "created",
    });
    await this.deps.companyBrain.notifyLearningChange(record);

    const recommendations = await this.deps.executiveRecommendation.proposeFromLearning(
      record,
    );
    await this.deps.executiveRecommendation.registerRecommendations(recommendations);

    return record;
  }
}
