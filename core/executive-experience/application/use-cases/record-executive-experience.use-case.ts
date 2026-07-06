import {
  BusinessCase,
  ExecutiveExperience,
  createExperienceRecordedEvent,
  createFailureRegisteredEvent,
  createSuccessRegisteredEvent,
} from "../../domain";
import type { RecordExecutiveExperienceDto } from "../dto";
import type { ExecutiveExperienceEngineDependencies } from "../dependencies";

export class RecordExecutiveExperienceUseCase {
  constructor(private readonly deps: ExecutiveExperienceEngineDependencies) {}

  async execute(dto: RecordExecutiveExperienceDto) {
    let experience = ExecutiveExperience.create({
      companyId: dto.companyId,
      title: dto.title,
      context: dto.context,
      scenario: dto.scenario,
      decision: dto.decision,
      execution: dto.execution,
      result: dto.result,
      businessImpact: dto.businessImpact ?? 50,
      roi: dto.roi ?? 0,
      successLevel: dto.successLevel ?? 50,
      confidence: dto.confidence ?? 50,
      risk: dto.risk ?? "medium",
      duration: dto.duration ?? 0,
      participants: dto.participants ?? [],
      knowledgeReferences: dto.knowledgeReferences ?? [],
      learningReferences: dto.learningReferences ?? [],
      wisdomReferences: dto.wisdomReferences ?? [],
      tags: dto.tags ?? [],
    });

    const analysis = this.deps.analyzer.analyze(experience);
    experience = experience.update({
      confidence: Math.round((experience.confidence + analysis.decisionReadiness) / 2),
      tags: [...experience.tags, ...analysis.reusableInsights.slice(0, 2)],
    });

    await this.deps.experienceRepository.saveExperience(experience);

    const businessCase = BusinessCase.create({
      companyId: experience.companyId,
      experienceId: experience.id,
      title: experience.title,
      description: experience.decision,
      expectedImpact: experience.businessImpact,
    });
    await this.deps.caseRepository.saveBusinessCase(businessCase);

    await this.deps.eventDispatcher.publish(createExperienceRecordedEvent(experience));

    await this.deps.executiveMemory.syncExperience({
      companyId: experience.companyId,
      experience: experience.toJSON(),
      syncReason: "recorded",
    });
    await this.deps.companyBrain.notifyExperienceChange(experience);
    await this.deps.executiveKnowledge.linkExperienceToKnowledge(experience);
    await this.deps.executiveLearning.feedFromExperience(experience);
    await this.deps.executiveWisdom.enrichFromExperience(experience);

    if (experience.isSuccessful()) {
      const successCase = this.deps.successEvaluator.toSuccessCase(experience);
      await this.deps.caseRepository.saveSuccessCase(successCase);
      await this.deps.eventDispatcher.publish(createSuccessRegisteredEvent(successCase));
      await this.deps.executiveMemory.syncExperience({
        companyId: experience.companyId,
        experience: experience.toJSON(),
        syncReason: "success",
      });
    }

    if (experience.isFailure()) {
      const failureCase = this.deps.failureAnalyzer.toFailureCase(experience, false);
      await this.deps.caseRepository.saveFailureCase(failureCase);
      await this.deps.eventDispatcher.publish(createFailureRegisteredEvent(failureCase));
      await this.deps.executiveMemory.syncExperience({
        companyId: experience.companyId,
        experience: experience.toJSON(),
        syncReason: "failure",
      });
    }

    return { experience, businessCase };
  }
}
