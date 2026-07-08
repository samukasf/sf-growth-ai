import type { BusinessHealthAnalyzer, BusinessHealthReport, BusinessOperatingRepository } from "../../domain";
import type { CompanyId, OrganizationId } from "../../shared";

export class DefaultBusinessHealthAnalyzer implements BusinessHealthAnalyzer {
  constructor(private readonly repository: BusinessOperatingRepository) {}

  async analyze(
    organizationId: OrganizationId,
    companyId: CompanyId,
  ): Promise<BusinessHealthReport> {
    const [operations, objectives, alerts, indicators] = await Promise.all([
      this.repository.listOperations(companyId),
      this.repository.listObjectives(companyId),
      this.repository.listOpenAlerts(companyId),
      this.repository.listIndicators(companyId),
    ]);

    const activeOps = operations.filter((o) => o.status === "active" || o.status === "completed");
    const operationsScore =
      operations.length > 0
        ? Math.round((activeOps.length / operations.length) * 100)
        : 70;

    const objectivesScore =
      objectives.length > 0
        ? Math.round(
            objectives.reduce((sum, o) => sum + o.progressPercent(), 0) / objectives.length,
          )
        : 70;

    const alertsScore = Math.max(0, 100 - alerts.length * 15);
    const indicatorsScore =
      indicators.length > 0
        ? Math.round(
            (indicators.filter((i) => i.isOnTrack()).length / indicators.length) * 100,
          )
        : 70;

    const overallScore = Math.round(
      (operationsScore + objectivesScore + alertsScore + indicatorsScore) / 4,
    );

    const signals: string[] = [];
    if (alerts.some((a) => a.severity === "critical")) signals.push("Alertas críticos ativos");
    if (objectivesScore < 60) signals.push("Objetivos abaixo do target");
    if (overallScore >= 75) signals.push("Operação saudável");

    return {
      overallScore,
      operationsScore,
      objectivesScore,
      alertsScore,
      indicatorsScore,
      signals,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
