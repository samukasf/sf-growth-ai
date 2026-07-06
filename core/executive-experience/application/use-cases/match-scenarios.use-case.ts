import { ExecutiveExperienceNotFoundError } from "../../shared";
import { createScenarioMatchedEvent } from "../../domain";
import type { MatchScenariosDto } from "../dto";
import type { ExecutiveExperienceEngineDependencies } from "../dependencies";

export class MatchScenariosUseCase {
  constructor(private readonly deps: ExecutiveExperienceEngineDependencies) {}

  async execute(dto: MatchScenariosDto) {
    const target = await this.deps.experienceRepository.findExperienceById(dto.experienceId);
    if (!target) {
      throw new ExecutiveExperienceNotFoundError(dto.experienceId);
    }

    const candidates = await this.deps.experienceRepository.findExperiencesByCompany(
      dto.companyId,
    );
    const matches = this.deps.scenarioMatcher.match(target, candidates);

    for (const match of matches) {
      await this.deps.experienceRepository.saveScenario(match.scenario);
      await this.deps.eventDispatcher.publish(
        createScenarioMatchedEvent(match.scenario, match.score),
      );
    }

    return matches;
  }
}
