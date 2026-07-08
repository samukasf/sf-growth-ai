import type { BusinessOperatingRuntime } from "../../domain";
import type { BusinessOperatingDependencies } from "../dependencies";
import {
  AnalyzeHealthUseCase,
  BuildReviewUseCase,
  CalculatePrioritiesUseCase,
  FinishBusinessDayUseCase,
  MonitorOperationsUseCase,
  PlanRoutinesUseCase,
  StartBusinessDayUseCase,
} from "../use-cases";

export class BusinessOperatingRuntimeService implements BusinessOperatingRuntime {
  private readonly startBusinessDayUseCase: StartBusinessDayUseCase;
  private readonly planRoutinesUseCase: PlanRoutinesUseCase;
  private readonly calculatePrioritiesUseCase: CalculatePrioritiesUseCase;
  private readonly monitorOperationsUseCase: MonitorOperationsUseCase;
  private readonly analyzeHealthUseCase: AnalyzeHealthUseCase;
  private readonly buildReviewUseCase: BuildReviewUseCase;
  private readonly finishBusinessDayUseCase: FinishBusinessDayUseCase;

  constructor(private readonly deps: BusinessOperatingDependencies) {
    this.startBusinessDayUseCase = new StartBusinessDayUseCase(deps);
    this.planRoutinesUseCase = new PlanRoutinesUseCase(deps);
    this.calculatePrioritiesUseCase = new CalculatePrioritiesUseCase(deps);
    this.monitorOperationsUseCase = new MonitorOperationsUseCase(deps);
    this.analyzeHealthUseCase = new AnalyzeHealthUseCase(deps);
    this.buildReviewUseCase = new BuildReviewUseCase(deps);
    this.finishBusinessDayUseCase = new FinishBusinessDayUseCase(deps);
  }

  async startBusinessDay(input: Parameters<BusinessOperatingRuntime["startBusinessDay"]>[0]) {
    const result = await this.startBusinessDayUseCase.execute(input);
    return result.day;
  }

  async planRoutines(
    organizationId: string,
    companyId: string,
    businessDayId: string,
    agencyId?: string,
  ) {
    const result = await this.planRoutinesUseCase.execute({
      organizationId,
      companyId,
      businessDayId,
      agencyId,
    });
    return result.routines;
  }

  async calculatePriorities(
    organizationId: string,
    companyId: string,
    businessDayId: string,
    agencyId?: string,
  ) {
    const result = await this.calculatePrioritiesUseCase.execute({
      organizationId,
      companyId,
      businessDayId,
      agencyId,
    });
    return result.priorities;
  }

  async monitorOperations(companyId: string) {
    const result = await this.monitorOperationsUseCase.execute(companyId);
    return result.alerts;
  }

  async analyzeHealth(organizationId: string, companyId: string) {
    const result = await this.analyzeHealthUseCase.execute({ organizationId, companyId });
    return result.report;
  }

  async buildReview(
    organizationId: string,
    companyId: string,
    businessDayId: string,
    agencyId?: string,
  ) {
    const result = await this.buildReviewUseCase.execute({
      organizationId,
      companyId,
      businessDayId,
      agencyId,
    });
    return result.review;
  }

  async finishBusinessDay(companyId: string, businessDayId: string) {
    const result = await this.finishBusinessDayUseCase.execute(companyId, businessDayId);
    return result.day;
  }
}
