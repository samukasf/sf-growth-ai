import { BusinessReview, type ExecutiveReviewBuilder } from "../../domain";
import type { BusinessHealthAnalyzer, BusinessOperatingRepository } from "../../domain";
import type { AgencyId, BusinessDayId, CompanyId, OrganizationId } from "../../shared";

export class DefaultExecutiveReviewBuilder implements ExecutiveReviewBuilder {
  constructor(
    private readonly repository: BusinessOperatingRepository,
    private readonly healthAnalyzer: BusinessHealthAnalyzer,
  ) {}

  async build(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessReview> {
    const [operations, alerts, objectives, priorities, health] = await Promise.all([
      this.repository.listOperations(companyId),
      this.repository.listOpenAlerts(companyId),
      this.repository.listObjectives(companyId),
      this.repository.listPriorities(companyId, businessDayId),
      this.healthAnalyzer.analyze(organizationId, companyId),
    ]);

    const completedOps = operations.filter((o) => o.status === "completed").length;
    const avgObjectiveProgress =
      objectives.length > 0
        ? Math.round(
            objectives.reduce((sum, o) => sum + o.progressPercent(), 0) / objectives.length,
          )
        : 0;

    const insights: string[] = [];
    if (alerts.length > 0) insights.push(`${alerts.length} alertas abertos requerem atenção`);
    if (avgObjectiveProgress < 70) insights.push("Progresso de objetivos abaixo do esperado");
    if (health.overallScore >= 75) insights.push("Saúde operacional dentro do target");

    const recommendations: string[] = [];
    if (priorities.length > 0) {
      recommendations.push(`Priorizar: ${priorities[0].title}`);
    }
    if (alerts.some((a) => a.severity === "critical")) {
      recommendations.push("Resolver alertas críticos antes do fecho do dia");
    }

    return BusinessReview.create({
      organizationId,
      agencyId,
      companyId,
      businessDayId,
      title: `Revisão executiva — ${new Date().toISOString().slice(0, 10)}`,
      status: "in_progress",
      summary: {
        operationsCompleted: completedOps,
        alertsResolved: 0,
        objectivesProgress: avgObjectiveProgress,
        healthScore: health.overallScore,
        topPriorities: priorities.slice(0, 3).map((p) => p.title),
      },
      insights,
      recommendations,
    });
  }
}
