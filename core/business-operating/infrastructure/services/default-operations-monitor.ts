import { BusinessAlert, type OperationsMonitor } from "../../domain";
import type { BusinessOperatingRepository } from "../../domain";
import type { CompanyId } from "../../shared";

export class DefaultOperationsMonitor implements OperationsMonitor {
  constructor(private readonly repository: BusinessOperatingRepository) {}

  async monitor(companyId: CompanyId): Promise<BusinessAlert[]> {
    const [objectives, indicators, activities] = await Promise.all([
      this.repository.listObjectives(companyId),
      this.repository.listIndicators(companyId),
      this.repository.listActivities(companyId),
    ]);

    const alerts: BusinessAlert[] = [];

    for (const objective of objectives.filter((o) => o.progressPercent() < 50)) {
      alerts.push(
        BusinessAlert.create({
          organizationId: objective.organizationId,
          agencyId: objective.agencyId,
          companyId,
          title: `Objetivo em risco: ${objective.title}`,
          message: `Progresso em ${objective.progressPercent()}% do target`,
          severity: "warning",
          source: "objectives",
        }),
      );
    }

    for (const indicator of indicators.filter((i) => !i.isOnTrack())) {
      alerts.push(
        BusinessAlert.create({
          organizationId: indicator.organizationId,
          agencyId: indicator.agencyId,
          companyId,
          title: `Indicador abaixo do target: ${indicator.name}`,
          message: `${indicator.currentValue}${indicator.unit} vs target ${indicator.targetValue}${indicator.unit}`,
          severity: "warning",
          source: "indicators",
        }),
      );
    }

    const overdue = activities.filter(
      (a) => a.status !== "done" && a.dueAt && new Date(a.dueAt) < new Date(),
    );

    for (const activity of overdue) {
      alerts.push(
        BusinessAlert.create({
          organizationId: activity.organizationId,
          agencyId: activity.agencyId,
          companyId,
          title: `Atividade atrasada: ${activity.title}`,
          message: `Prazo excedido desde ${activity.dueAt}`,
          severity: "critical",
          source: "activities",
        }),
      );
    }

    return alerts;
  }
}
