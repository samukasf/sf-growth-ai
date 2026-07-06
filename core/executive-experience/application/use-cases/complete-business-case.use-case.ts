import { createCaseCompletedEvent } from "../../domain";
import type { CompleteBusinessCaseDto } from "../dto";
import type { ExecutiveExperienceEngineDependencies } from "../dependencies";

export class CompleteBusinessCaseUseCase {
  constructor(private readonly deps: ExecutiveExperienceEngineDependencies) {}

  async execute(dto: CompleteBusinessCaseDto) {
    const businessCase = await this.deps.caseRepository.findBusinessCaseById(dto.caseId);
    if (!businessCase) {
      throw new Error(`Business case not found: ${dto.caseId}`);
    }

    const completed = businessCase.complete();
    await this.deps.caseRepository.saveBusinessCase(completed);
    await this.deps.eventDispatcher.publish(createCaseCompletedEvent(completed));

    return completed;
  }
}
