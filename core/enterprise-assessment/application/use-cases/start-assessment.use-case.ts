import {
  Assessment,
  AssessmentCategory,
  AssessmentQuestion,
  createAssessmentStartedEvent,
} from "../../domain";
import { ASSESSMENT_DIMENSIONS, DEFAULT_ASSESSMENT_QUESTIONS } from "../../shared";
import type { StartAssessmentInput } from "../../domain";
import type { EnterpriseAssessmentDependencies } from "../dependencies";

export class StartAssessmentUseCase {
  constructor(private readonly deps: EnterpriseAssessmentDependencies) {}

  async execute(input: StartAssessmentInput) {
    const assessment = Assessment.create({
      organizationId: input.organizationId,
      companyId: input.companyId,
      companyName: input.companyName,
      initiatedBy: input.initiatedBy,
      discoverySessionId: input.discoverySessionId,
      status: "in_progress",
    });

    await this.deps.repository.saveAssessment(assessment);
    await this.deps.eventDispatcher.publish(createAssessmentStartedEvent(assessment));

    for (const dim of ASSESSMENT_DIMENSIONS) {
      const questions = DEFAULT_ASSESSMENT_QUESTIONS.filter((q) => q.dimensionKey === dim.key);
      const category = AssessmentCategory.create({
        assessmentId: assessment.id,
        dimensionKey: dim.key,
        label: dim.label,
        description: `Avaliação de maturidade: ${dim.label}`,
        weight: dim.weight,
        questionCount: questions.length,
      });
      await this.deps.repository.saveCategory(category);

      for (const [index, q] of questions.entries()) {
        const question = AssessmentQuestion.create({
          assessmentId: assessment.id,
          categoryId: category.id,
          dimensionKey: q.dimensionKey,
          text: q.text,
          weight: q.weight,
          required: q.required,
          order: index + 1,
        });
        await this.deps.repository.saveQuestion(question);
      }
    }

    return { assessment };
  }
}
