import type { AgencyScopeDto } from "../dto";
import type { AgencyCoreDependencies } from "../dependencies";

export class BuildContextUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: AgencyScopeDto) {
    const context = await this.deps.contextBuilder.build(dto.organizationId, dto.agencyId);
    return { context };
  }
}

export class AnalyzeHealthUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: AgencyScopeDto) {
    const health = await this.deps.healthEngine.evaluate(dto.organizationId, dto.agencyId);
    return { health };
  }
}

export class BuildDashboardUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: AgencyScopeDto) {
    const dashboard = await this.deps.dashboardBuilder.build(
      dto.organizationId,
      dto.agencyId,
    );
    return { dashboard };
  }
}

export class ComputeMetricsUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: AgencyScopeDto) {
    const metrics = await this.deps.metricsEngine.compute(dto.organizationId, dto.agencyId);
    return { metrics };
  }
}
