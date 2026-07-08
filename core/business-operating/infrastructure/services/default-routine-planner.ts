import { BusinessActivity, BusinessRoutine, type RoutinePlanner } from "../../domain";
import type { BusinessOperatingRepository } from "../../domain";
import type { AgencyId, BusinessDayId, CompanyId, OrganizationId } from "../../shared";

const DEFAULT_DAILY_ROUTINES = [
  { title: "Revisão de indicadores", department: "operations" },
  { title: "Check-in com equipa", department: "operations" },
  { title: "Monitorização de alertas", department: "operations" },
];

export class DefaultRoutinePlanner implements RoutinePlanner {
  constructor(private readonly repository: BusinessOperatingRepository) {}

  async planDaily(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessRoutine[]> {
    const scheduledAt = new Date().toISOString();
    const routines: BusinessRoutine[] = [];

    for (const template of DEFAULT_DAILY_ROUTINES) {
      const activity = BusinessActivity.create({
        organizationId,
        agencyId,
        companyId,
        title: template.title,
        dueAt: scheduledAt,
      });
      await this.repository.saveActivity(activity);

      const routine = BusinessRoutine.create({
        organizationId,
        agencyId,
        companyId,
        title: template.title,
        frequency: "daily",
        status: "scheduled",
        scheduledAt,
        activityIds: [activity.id],
      });

      routines.push(routine);
    }

    void businessDayId;
    return routines;
  }
}
