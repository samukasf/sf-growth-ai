import { ExecutiveExperienceNotFoundError } from "../../shared";
import { createExperienceValidatedEvent } from "../../domain";
import type { ValidateExperienceDto } from "../dto";
import type { ExecutiveExperienceEngineDependencies } from "../dependencies";

export class ValidateExperienceUseCase {
  constructor(private readonly deps: ExecutiveExperienceEngineDependencies) {}

  async execute(dto: ValidateExperienceDto) {
    const experience = await this.deps.experienceRepository.findExperienceById(
      dto.experienceId,
    );
    if (!experience) {
      throw new ExecutiveExperienceNotFoundError(dto.experienceId);
    }

    if (!this.deps.scoreCalculator.meetsValidationThreshold(experience)) {
      throw new Error("Experience does not meet validation threshold");
    }

    const validated = experience.markValidated();
    await this.deps.experienceRepository.saveExperience(validated);

    const event = createExperienceValidatedEvent(validated);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncExperience({
      companyId: validated.companyId,
      experience: validated.toJSON(),
      syncReason: "validated",
    });
    await this.deps.companyBrain.notifyExperienceChange(validated);

    await this.deps.executiveCeo.notifyExperienceInsight({
      companyId: validated.companyId,
      headline: "Experience validated",
      highlights: [validated.result, validated.decision].filter(Boolean),
      experienceId: validated.id,
    });

    return validated;
  }
}
