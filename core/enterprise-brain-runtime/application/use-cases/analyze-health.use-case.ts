import { createBrainHealthAnalyzedEvent } from "../../domain";
import type { AnalyzeHealthDto } from "../dto";
import type { EnterpriseBrainRuntimeDependencies } from "../dependencies";

export class AnalyzeHealthUseCase {
  constructor(private readonly deps: EnterpriseBrainRuntimeDependencies) {}

  async execute(dto: AnalyzeHealthDto) {
    const contributions = await this.deps.dataSources.fetchAll(
      dto.organizationId,
      dto.companyId,
    );

    const health = this.deps.healthAnalyzer.analyze(contributions);
    await this.deps.eventDispatcher.publish(
      createBrainHealthAnalyzedEvent(health, dto.organizationId, dto.companyId),
    );

    return health;
  }
}
