import {
  BusinessScenario,
  type ExecutiveExperience,
  type ScenarioMatch,
  type ScenarioMatcher,
} from "../../domain";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function similarityScore(left: ExecutiveExperience, right: ExecutiveExperience): number {
  const leftTokens = new Set(
    tokenize([left.scenario, left.context, left.title, ...left.tags].join(" ")),
  );
  const rightTokens = tokenize(
    [right.scenario, right.context, right.title, ...right.tags].join(" "),
  );

  if (leftTokens.size === 0 || rightTokens.length === 0) return 0;

  const matches = rightTokens.filter((token) => leftTokens.has(token)).length;
  return Math.round((matches / rightTokens.length) * 100);
}

export class DefaultScenarioMatcher implements ScenarioMatcher {
  match(target: ExecutiveExperience, candidates: ExecutiveExperience[]): ScenarioMatch[] {
    return candidates
      .filter((candidate) => candidate.id !== target.id)
      .map((candidate) => {
        const score = similarityScore(target, candidate);
        return {
          scenario: BusinessScenario.create({
            companyId: candidate.companyId,
            experienceId: candidate.id,
            title: candidate.scenario || candidate.title,
            description: candidate.context,
            domain: candidate.tags[0] ?? "general",
            complexity: candidate.businessImpact,
          }),
          experience: candidate,
          score,
          reason: `Scenario similarity score: ${score}`,
        };
      })
      .filter((match) => match.score >= 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
}
