import type {
  Agency,
  AgencyClient,
  AgencyContext,
  AgencyDashboard,
  AgencyDepartment,
  AgencyGoal,
  AgencyHealth,
  AgencyKPI,
  AgencyMetrics,
  AgencyProject,
} from "../entities";
import type { AgencyId, OrganizationId } from "../../shared";

export interface AgencyRepository {
  saveAgency(agency: Agency): Promise<void>;
  findAgency(organizationId: OrganizationId, agencyId: AgencyId): Promise<Agency | null>;
  saveClient(client: AgencyClient): Promise<void>;
  findClient(agencyId: AgencyId, clientId: string): Promise<AgencyClient | null>;
  listClients(agencyId: AgencyId): Promise<AgencyClient[]>;
  removeClient(agencyId: AgencyId, clientId: string): Promise<void>;
  saveDepartment(department: AgencyDepartment): Promise<void>;
  listDepartments(agencyId: AgencyId): Promise<AgencyDepartment[]>;
  saveProject(project: AgencyProject): Promise<void>;
  listProjects(agencyId: AgencyId): Promise<AgencyProject[]>;
  saveGoal(goal: AgencyGoal): Promise<void>;
  listGoals(agencyId: AgencyId): Promise<AgencyGoal[]>;
  saveKpi(kpi: AgencyKPI): Promise<void>;
  listKpis(agencyId: AgencyId): Promise<AgencyKPI[]>;
  countEmployees(agencyId: AgencyId): Promise<number>;
  countPartners(agencyId: AgencyId): Promise<number>;
  sumPipelineValue(agencyId: AgencyId): Promise<number>;
}

export interface AgencyContextBuilder {
  build(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyContext>;
}

export interface AgencyHealthEngine {
  evaluate(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyHealth>;
}

export interface AgencyDashboardBuilder {
  build(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyDashboard>;
}

export interface AgencyMetricsEngine {
  compute(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyMetrics>;
}

export interface AgencyCoordinator {
  coordinateClientOnboarding(client: AgencyClient): Promise<void>;
  coordinateProjectLifecycle(project: AgencyProject): Promise<void>;
}

export interface AgencyRuntime {
  createAgency(input: {
    organizationId: OrganizationId;
    name: string;
    slug: string;
  }): Promise<Agency>;
  addClient(input: {
    organizationId: OrganizationId;
    agencyId: AgencyId;
    companyId: string;
    name: string;
    industry?: string;
  }): Promise<AgencyClient>;
  removeClient(agencyId: AgencyId, clientId: string): Promise<void>;
  createDepartment(input: {
    organizationId: OrganizationId;
    agencyId: AgencyId;
    name: string;
    code: string;
  }): Promise<AgencyDepartment>;
  startProject(projectId: string, agencyId: AgencyId): Promise<AgencyProject>;
  completeProject(projectId: string, agencyId: AgencyId): Promise<AgencyProject>;
  createGoal(input: {
    organizationId: OrganizationId;
    agencyId: AgencyId;
    title: string;
    targetValue: number;
    dueDate: string;
  }): Promise<AgencyGoal>;
  updateKpi(kpiId: string, agencyId: AgencyId, currentValue: number): Promise<AgencyKPI>;
  buildContext(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyContext>;
  analyzeHealth(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyHealth>;
  buildDashboard(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyDashboard>;
  computeMetrics(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyMetrics>;
}
