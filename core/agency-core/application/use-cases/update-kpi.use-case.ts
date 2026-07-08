import { createKPIUpdatedEvent } from "../../domain";
import type { UpdateKpiDto } from "../dto";
import type { AgencyCoreDependencies } from "../dependencies";

export class UpdateKpiUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: UpdateKpiDto) {
    const kpis = await this.deps.repository.listKpis(dto.agencyId);
    const current = kpis.find((kpi) => kpi.id === dto.kpiId);
    if (!current) throw new Error(`KPI not found: ${dto.kpiId}`);

    const kpi = current.updateValue(dto.currentValue);
    await this.deps.repository.saveKpi(kpi);
    await this.deps.eventDispatcher.publish(createKPIUpdatedEvent(kpi));

    return { kpi };
  }
}
