import { BusinessPriority, type PriorityEngine } from "../../domain";
import type { BusinessOperatingRepository } from "../../domain";
import type { AgencyId, BusinessDayId, CompanyId, OrganizationId } from "../../shared";

export class DefaultPriorityEngine implements PriorityEngine {
  constructor(private readonly repository: BusinessOperatingRepository) {}

  async calculate(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessPriority[]> {
    const [operations, alerts, objectives] = await Promise.all([
      this.repository.listOperations(companyId),
      this.repository.listOpenAlerts(companyId),
      this.repository.listObjectives(companyId),
    ]);

    const candidates: BusinessPriority[] = [];

    for (const op of operations.filter((o) => o.status === "planned" || o.status === "active")) {
      candidates.push(
        BusinessPriority.create({
          organizationId,
          agencyId,
          companyId,
          title: op.title,
          level: op.status === "active" ? "high" : "medium",
          score: op.status === "active" ? 80 : 60,
          department: op.department,
          sourceType: "operation",
          sourceId: op.id,
          rank: 0,
        }),
      );
    }

    for (const alert of alerts) {
      candidates.push(
        BusinessPriority.create({
          organizationId,
          agencyId,
          companyId,
          title: alert.title,
          level: alert.severity === "critical" ? "critical" : "high",
          score: alert.severity === "critical" ? 95 : 75,
          department: "operations",
          sourceType: "alert",
          sourceId: alert.id,
          rank: 0,
        }),
      );
    }

    for (const obj of objectives.filter((o) => o.progressPercent() < 70)) {
      candidates.push(
        BusinessPriority.create({
          organizationId,
          agencyId,
          companyId,
          title: obj.title,
          level: "medium",
          score: 100 - obj.progressPercent(),
          department: obj.department,
          sourceType: "objective",
          sourceId: obj.id,
          rank: 0,
        }),
      );
    }

    void businessDayId;

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((p, index) =>
        BusinessPriority.create({ ...p.toJSON(), rank: index + 1 }),
      );
  }
}
