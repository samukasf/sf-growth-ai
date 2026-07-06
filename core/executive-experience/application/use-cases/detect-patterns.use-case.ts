import type { DetectPatternsDto } from "../dto";
import type { ExperiencePattern } from "../../domain";
import type { ExecutiveExperienceEngineDependencies } from "../dependencies";

export class DetectPatternsUseCase {
  constructor(private readonly deps: ExecutiveExperienceEngineDependencies) {}

  async execute(dto: DetectPatternsDto) {
    const experiences = await this.deps.experienceRepository.findExperiencesByCompany(
      dto.companyId,
    );

    const patterns = [
      ...this.deps.patternMatcher.detectPatterns(experiences),
      ...this.deps.patternMatcher.findRecurringProblems(experiences),
      ...this.deps.patternMatcher.findReusableSolutions(experiences),
      ...this.deps.patternMatcher.findBestPractices(experiences),
      ...this.deps.patternMatcher.findSuccessPatterns(experiences),
      ...this.deps.patternMatcher.findFailurePatterns(experiences),
    ];

    const unique = dedupePatterns(patterns);

    for (const pattern of unique) {
      await this.deps.experienceRepository.savePattern(pattern);
    }

    return {
      patterns: unique,
      similarCases: experiences.length > 1
        ? this.deps.patternMatcher.findSimilarCases(experiences[0], experiences.slice(1))
        : [],
      similarProjects:
        experiences.length > 1
          ? this.deps.patternMatcher.findSimilarProjects(experiences[0], experiences.slice(1))
          : [],
    };
  }
}

function dedupePatterns(patterns: ExperiencePattern[]): ExperiencePattern[] {
  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const key = `${pattern.type}:${pattern.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
