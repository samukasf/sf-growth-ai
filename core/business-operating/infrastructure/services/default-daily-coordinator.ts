import type { BusinessDayState, DailyCoordinator } from "../../domain";
import type { BusinessOperatingRepository } from "../../domain";
import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export class DefaultDailyCoordinator implements DailyCoordinator {
  constructor(private readonly repository: BusinessOperatingRepository) {}

  async startDay(
    organizationId: OrganizationId,
    companyId: CompanyId,
    agencyId?: AgencyId,
  ): Promise<BusinessDayState> {
    const date = new Date().toISOString().slice(0, 10);
    const existing = await this.repository.findActiveBusinessDay(companyId, date);
    if (existing) return existing;

    const day: BusinessDayState = {
      id: `bday-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId,
      agencyId,
      companyId,
      date,
      status: "active",
      startedAt: new Date().toISOString(),
    };

    await this.repository.saveBusinessDay(day);
    return day;
  }

  async finishDay(businessDayId: string, companyId: CompanyId): Promise<BusinessDayState> {
    const day = await this.repository.findBusinessDay(companyId, businessDayId);
    if (!day) throw new Error(`Business day not found: ${businessDayId}`);

    const finished: BusinessDayState = {
      ...day,
      status: "finished",
      finishedAt: new Date().toISOString(),
    };

    await this.repository.saveBusinessDay(finished);
    return finished;
  }
}
