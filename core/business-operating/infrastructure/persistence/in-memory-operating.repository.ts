import type {
  BusinessActivity,
  BusinessAlert,
  BusinessDayState,
  BusinessExecution,
  BusinessIndicator,
  BusinessObjective,
  BusinessOperatingRepository,
  BusinessOperation,
  BusinessPriority,
  BusinessProcess,
  BusinessReview,
  BusinessRoutine,
} from "../../domain";
import type { BusinessDayId, CompanyId } from "../../shared";

export class InMemoryBusinessOperatingRepository implements BusinessOperatingRepository {
  private businessDays = new Map<string, BusinessDayState>();
  private operations = new Map<string, BusinessOperation>();
  private routines = new Map<string, BusinessRoutine>();
  private processes = new Map<string, BusinessProcess>();
  private activities = new Map<string, BusinessActivity>();
  private objectives = new Map<string, BusinessObjective>();
  private executions = new Map<string, BusinessExecution>();
  private alerts = new Map<string, BusinessAlert>();
  private indicators = new Map<string, BusinessIndicator>();
  private priorities = new Map<string, BusinessPriority>();
  private reviews = new Map<string, BusinessReview>();

  async saveBusinessDay(day: BusinessDayState): Promise<void> {
    this.businessDays.set(day.id, day);
  }

  async findBusinessDay(
    companyId: CompanyId,
    businessDayId: BusinessDayId,
  ): Promise<BusinessDayState | null> {
    const day = this.businessDays.get(businessDayId);
    if (!day || day.companyId !== companyId) return null;
    return day;
  }

  async findActiveBusinessDay(companyId: CompanyId, date: string): Promise<BusinessDayState | null> {
    return (
      [...this.businessDays.values()].find(
        (day) => day.companyId === companyId && day.date === date && day.status === "active",
      ) ?? null
    );
  }

  async saveOperation(operation: BusinessOperation): Promise<void> {
    this.operations.set(operation.id, operation);
  }

  async listOperations(companyId: CompanyId): Promise<BusinessOperation[]> {
    return [...this.operations.values()].filter((op) => op.companyId === companyId);
  }

  async saveRoutine(routine: BusinessRoutine): Promise<void> {
    this.routines.set(routine.id, routine);
  }

  async listRoutines(companyId: CompanyId): Promise<BusinessRoutine[]> {
    return [...this.routines.values()].filter((r) => r.companyId === companyId);
  }

  async saveProcess(process: BusinessProcess): Promise<void> {
    this.processes.set(process.id, process);
  }

  async saveActivity(activity: BusinessActivity): Promise<void> {
    this.activities.set(activity.id, activity);
  }

  async listActivities(companyId: CompanyId): Promise<BusinessActivity[]> {
    return [...this.activities.values()].filter((a) => a.companyId === companyId);
  }

  async saveObjective(objective: BusinessObjective): Promise<void> {
    this.objectives.set(objective.id, objective);
  }

  async listObjectives(companyId: CompanyId): Promise<BusinessObjective[]> {
    return [...this.objectives.values()].filter((o) => o.companyId === companyId);
  }

  async saveExecution(execution: BusinessExecution): Promise<void> {
    this.executions.set(execution.id, execution);
  }

  async saveAlert(alert: BusinessAlert): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async listOpenAlerts(companyId: CompanyId): Promise<BusinessAlert[]> {
    return [...this.alerts.values()].filter(
      (a) => a.companyId === companyId && a.status === "open",
    );
  }

  async saveIndicator(indicator: BusinessIndicator): Promise<void> {
    this.indicators.set(indicator.id, indicator);
  }

  async listIndicators(companyId: CompanyId): Promise<BusinessIndicator[]> {
    return [...this.indicators.values()].filter((i) => i.companyId === companyId);
  }

  async savePriority(priority: BusinessPriority): Promise<void> {
    this.priorities.set(priority.id, priority);
  }

  async listPriorities(companyId: CompanyId, businessDayId?: BusinessDayId): Promise<BusinessPriority[]> {
    return [...this.priorities.values()].filter((p) => p.companyId === companyId);
  }

  async saveReview(review: BusinessReview): Promise<void> {
    this.reviews.set(review.businessDayId, review);
  }

  async findReview(businessDayId: BusinessDayId): Promise<BusinessReview | null> {
    return this.reviews.get(businessDayId) ?? null;
  }
}
