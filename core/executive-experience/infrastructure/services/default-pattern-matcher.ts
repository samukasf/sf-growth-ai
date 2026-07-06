import {
  ExperiencePattern,
  type ExecutiveExperience,
  type PatternMatcher,
} from "../../domain";

function sharedTags(left: ExecutiveExperience, right: ExecutiveExperience): string[] {
  return left.tags.filter((tag) => right.tags.includes(tag));
}

function similarity(left: ExecutiveExperience, right: ExecutiveExperience): number {
  const tagOverlap = sharedTags(left, right).length * 20;
  const scenarioMatch = left.scenario === right.scenario ? 30 : 0;
  const contextMatch = left.context.toLowerCase().includes(right.context.toLowerCase().slice(0, 20))
    ? 15
    : 0;
  return tagOverlap + scenarioMatch + contextMatch;
}

export class DefaultPatternMatcher implements PatternMatcher {
  detectPatterns(experiences: ExecutiveExperience[]): ExperiencePattern[] {
    if (experiences.length < 2) return [];

    return [
      ...this.findSuccessPatterns(experiences),
      ...this.findFailurePatterns(experiences),
      ...this.findRecurringProblems(experiences),
      ...this.findReusableSolutions(experiences),
      ...this.findBestPractices(experiences),
    ];
  }

  findSimilarCases(
    target: ExecutiveExperience,
    candidates: ExecutiveExperience[],
  ): ExecutiveExperience[] {
    return candidates
      .map((candidate) => ({ candidate, score: similarity(target, candidate) }))
      .filter((item) => item.score >= 30)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.candidate);
  }

  findRecurringProblems(experiences: ExecutiveExperience[]): ExperiencePattern[] {
    const failures = experiences.filter((item) => item.isFailure());
    if (failures.length < 2) return [];

    return [
      ExperiencePattern.create({
        companyId: failures[0].companyId,
        type: "recurring_problem",
        title: "Recurring operational problems",
        description: `${failures.length} failure experiences detected`,
        relatedExperienceIds: failures.map((item) => item.id),
        frequency: failures.length,
        confidence: Math.min(100, failures.length * 15),
      }),
    ];
  }

  findReusableSolutions(experiences: ExecutiveExperience[]): ExperiencePattern[] {
    const successes = experiences.filter((item) => item.isSuccessful());
    if (successes.length === 0) return [];

    return [
      ExperiencePattern.create({
        companyId: successes[0].companyId,
        type: "reusable_solution",
        title: "Reusable successful solutions",
        description: successes.map((item) => item.execution).join("; "),
        relatedExperienceIds: successes.map((item) => item.id),
        frequency: successes.length,
        confidence: Math.min(100, successes.length * 12),
      }),
    ];
  }

  findSimilarProjects(
    target: ExecutiveExperience,
    candidates: ExecutiveExperience[],
  ): ExecutiveExperience[] {
    return candidates.filter(
      (candidate) =>
        candidate.id !== target.id &&
        (candidate.scenario === target.scenario ||
          sharedTags(target, candidate).length >= 2),
    );
  }

  findBestPractices(experiences: ExecutiveExperience[]): ExperiencePattern[] {
    const best = experiences.filter((item) => item.successLevel >= 80);
    if (best.length === 0) return [];

    return [
      ExperiencePattern.create({
        companyId: best[0].companyId,
        type: "best_practice",
        title: "Best practices from high-success experiences",
        description: best.map((item) => item.decision).join("; "),
        relatedExperienceIds: best.map((item) => item.id),
        frequency: best.length,
        confidence: 85,
      }),
    ];
  }

  findSuccessPatterns(experiences: ExecutiveExperience[]): ExperiencePattern[] {
    const successes = experiences.filter((item) => item.isSuccessful());
    if (successes.length < 2) return [];

    return [
      ExperiencePattern.create({
        companyId: successes[0].companyId,
        type: "success",
        title: "Success patterns",
        description: `${successes.length} successful experiences`,
        relatedExperienceIds: successes.map((item) => item.id),
        frequency: successes.length,
        confidence: Math.min(100, successes.length * 14),
      }),
    ];
  }

  findFailurePatterns(experiences: ExecutiveExperience[]): ExperiencePattern[] {
    const failures = experiences.filter((item) => item.isFailure());
    if (failures.length < 2) return [];

    return [
      ExperiencePattern.create({
        companyId: failures[0].companyId,
        type: "failure",
        title: "Failure patterns",
        description: `${failures.length} failure experiences`,
        relatedExperienceIds: failures.map((item) => item.id),
        frequency: failures.length,
        confidence: Math.min(100, failures.length * 14),
      }),
    ];
  }
}
