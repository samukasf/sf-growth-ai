import type { BuildContextDto } from "../dto";
import type { EnterpriseBrainRuntimeDependencies } from "../dependencies";

export class BuildContextUseCase {
  constructor(private readonly deps: EnterpriseBrainRuntimeDependencies) {}

  async execute(dto: BuildContextDto) {
    const contributions = await this.deps.dataSources.fetchAll(
      dto.organizationId,
      dto.companyId,
    );

    const context = await this.deps.contextBuilder.build(
      dto.organizationId,
      dto.companyId,
      contributions,
    );

    await this.deps.repository.saveContext(context);
    return context;
  }
}
