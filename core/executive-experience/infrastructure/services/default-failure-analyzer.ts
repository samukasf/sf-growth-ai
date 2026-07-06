import {
  FailureCase,
  type ExecutiveExperience,
  type FailureAnalysis,
  type FailureAnalyzer,
} from "../../domain";

export class DefaultFailureAnalyzer implements FailureAnalyzer {
  analyze(experience: ExecutiveExperience): FailureAnalysis {
    const isFailure = experience.isFailure();

    return {
      experienceId: experience.id,
      isFailure,
      rootCause: isFailure ? experience.result || "Undocumented failure" : "",
      recurring: false,
      severity: isFailure ? 100 - experience.successLevel : 0,
      prevention: isFailure ? `Avoid: ${experience.decision}` : "",
    };
  }

  toFailureCase(experience: ExecutiveExperience, recurring: boolean): FailureCase {
    const analysis = this.analyze(experience);

    return FailureCase.create({
      companyId: experience.companyId,
      experienceId: experience.id,
      title: experience.title,
      description: experience.result,
      rootCause: analysis.rootCause,
      recurring,
      severity: analysis.severity,
    });
  }
}
