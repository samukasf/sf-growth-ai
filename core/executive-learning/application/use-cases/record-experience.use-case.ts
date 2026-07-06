import { LearningRecordNotFoundError } from "../../shared";
import { LearningExperience, createExperienceRecordedEvent } from "../../domain";
import type { RecordExperienceDto } from "../dto";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";

export class RecordExperienceUseCase {
  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {}

  async execute(dto: RecordExperienceDto) {
    const record = await this.deps.repository.findRecordById(dto.recordId);
    if (!record) {
      throw new LearningRecordNotFoundError(dto.recordId);
    }

    const experience = LearningExperience.create({
      companyId: dto.companyId,
      recordId: dto.recordId,
      title: dto.title,
      context: dto.context,
      actionTaken: dto.actionTaken,
      resultSummary: dto.resultSummary,
      successLevel: dto.successLevel ?? record.successLevel,
    });

    await this.deps.repository.saveExperience(experience);

    const event = createExperienceRecordedEvent(experience);
    await this.deps.eventDispatcher.publish(event);

    const updated = record.update({
      successLevel: experience.successLevel,
      lessonsLearned: [...record.lessonsLearned, experience.resultSummary].filter(Boolean),
    });

    await this.deps.repository.saveRecord(updated);

    return { experience, record: updated };
  }
}
