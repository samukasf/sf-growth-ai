import type {
  BusinessActivity,
  BusinessAlert,
  BusinessExecution,
  BusinessIndicator,
  BusinessObjective,
  BusinessOperation,
  BusinessPriority,
  BusinessProcess,
  BusinessReview,
  BusinessRoutine,
} from "../entities";
import type { AgencyId, BusinessDayId, CompanyId, OrganizationId } from "../../shared";

export type BusinessDayState = {
  id: BusinessDayId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  date: string;
  status: "active" | "finished";
  startedAt: string;
  finishedAt?: string;
};

export type BusinessHealthReport = {
  overallScore: number;
  operationsScore: number;
  objectivesScore: number;
  alertsScore: number;
  indicatorsScore: number;
  signals: string[];
  evaluatedAt: string;
};

export interface BusinessOperatingRepository {
  saveBusinessDay(day: BusinessDayState): Promise<void>;
  findBusinessDay(companyId: CompanyId, businessDayId: BusinessDayId): Promise<BusinessDayState | null>;
  findActiveBusinessDay(companyId: CompanyId, date: string): Promise<BusinessDayState | null>;
  saveOperation(operation: BusinessOperation): Promise<void>;
  listOperations(companyId: CompanyId, date?: string): Promise<BusinessOperation[]>;
  saveRoutine(routine: BusinessRoutine): Promise<void>;
  listRoutines(companyId: CompanyId): Promise<BusinessRoutine[]>;
  saveProcess(process: BusinessProcess): Promise<void>;
  saveActivity(activity: BusinessActivity): Promise<void>;
  listActivities(companyId: CompanyId): Promise<BusinessActivity[]>;
  saveObjective(objective: BusinessObjective): Promise<void>;
  listObjectives(companyId: CompanyId): Promise<BusinessObjective[]>;
  saveExecution(execution: BusinessExecution): Promise<void>;
  saveAlert(alert: BusinessAlert): Promise<void>;
  listOpenAlerts(companyId: CompanyId): Promise<BusinessAlert[]>;
  saveIndicator(indicator: BusinessIndicator): Promise<void>;
  listIndicators(companyId: CompanyId): Promise<BusinessIndicator[]>;
  savePriority(priority: BusinessPriority): Promise<void>;
  listPriorities(companyId: CompanyId, businessDayId?: BusinessDayId): Promise<BusinessPriority[]>;
  saveReview(review: BusinessReview): Promise<void>;
  findReview(businessDayId: BusinessDayId): Promise<BusinessReview | null>;
}

export interface DailyCoordinator {
  startDay(
    organizationId: OrganizationId,
    companyId: CompanyId,
    agencyId?: AgencyId,
  ): Promise<BusinessDayState>;
  finishDay(businessDayId: BusinessDayId, companyId: CompanyId): Promise<BusinessDayState>;
}

export interface PriorityEngine {
  calculate(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessPriority[]>;
}

export interface RoutinePlanner {
  planDaily(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessRoutine[]>;
}

export interface OperationsMonitor {
  monitor(companyId: CompanyId): Promise<BusinessAlert[]>;
}

export interface ExecutiveReviewBuilder {
  build(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessReview>;
}

export interface BusinessHealthAnalyzer {
  analyze(organizationId: OrganizationId, companyId: CompanyId): Promise<BusinessHealthReport>;
}

export interface BusinessOperatingRuntime {
  startBusinessDay(input: {
    organizationId: OrganizationId;
    companyId: CompanyId;
    agencyId?: AgencyId;
  }): Promise<BusinessDayState>;
  planRoutines(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessRoutine[]>;
  calculatePriorities(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessPriority[]>;
  monitorOperations(companyId: CompanyId): Promise<BusinessAlert[]>;
  analyzeHealth(organizationId: OrganizationId, companyId: CompanyId): Promise<BusinessHealthReport>;
  buildReview(
    organizationId: OrganizationId,
    companyId: CompanyId,
    businessDayId: BusinessDayId,
    agencyId?: AgencyId,
  ): Promise<BusinessReview>;
  finishBusinessDay(companyId: CompanyId, businessDayId: BusinessDayId): Promise<BusinessDayState>;
}
