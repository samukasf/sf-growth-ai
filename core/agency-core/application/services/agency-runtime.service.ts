import type { AgencyRuntime } from "../../domain";
import type { AgencyCoreDependencies } from "../dependencies";
import {
  AddClientUseCase,
  AnalyzeHealthUseCase,
  BuildContextUseCase,
  BuildDashboardUseCase,
  CompleteProjectUseCase,
  ComputeMetricsUseCase,
  CreateAgencyUseCase,
  CreateDepartmentUseCase,
  CreateGoalUseCase,
  RemoveClientUseCase,
  StartProjectUseCase,
  UpdateKpiUseCase,
} from "../use-cases";

export class AgencyRuntimeService implements AgencyRuntime {
  private readonly createAgencyUseCase: CreateAgencyUseCase;
  private readonly addClientUseCase: AddClientUseCase;
  private readonly removeClientUseCase: RemoveClientUseCase;
  private readonly createDepartmentUseCase: CreateDepartmentUseCase;
  private readonly startProjectUseCase: StartProjectUseCase;
  private readonly completeProjectUseCase: CompleteProjectUseCase;
  private readonly createGoalUseCase: CreateGoalUseCase;
  private readonly updateKpiUseCase: UpdateKpiUseCase;
  private readonly buildContextUseCase: BuildContextUseCase;
  private readonly analyzeHealthUseCase: AnalyzeHealthUseCase;
  private readonly buildDashboardUseCase: BuildDashboardUseCase;
  private readonly computeMetricsUseCase: ComputeMetricsUseCase;

  constructor(private readonly deps: AgencyCoreDependencies) {
    this.createAgencyUseCase = new CreateAgencyUseCase(deps);
    this.addClientUseCase = new AddClientUseCase(deps);
    this.removeClientUseCase = new RemoveClientUseCase(deps);
    this.createDepartmentUseCase = new CreateDepartmentUseCase(deps);
    this.startProjectUseCase = new StartProjectUseCase(deps);
    this.completeProjectUseCase = new CompleteProjectUseCase(deps);
    this.createGoalUseCase = new CreateGoalUseCase(deps);
    this.updateKpiUseCase = new UpdateKpiUseCase(deps);
    this.buildContextUseCase = new BuildContextUseCase(deps);
    this.analyzeHealthUseCase = new AnalyzeHealthUseCase(deps);
    this.buildDashboardUseCase = new BuildDashboardUseCase(deps);
    this.computeMetricsUseCase = new ComputeMetricsUseCase(deps);
  }

  async createAgency(input: Parameters<AgencyRuntime["createAgency"]>[0]) {
    const result = await this.createAgencyUseCase.execute(input);
    return result.agency;
  }

  async addClient(input: Parameters<AgencyRuntime["addClient"]>[0]) {
    const result = await this.addClientUseCase.execute(input);
    return result.client;
  }

  async removeClient(agencyId: string, clientId: string) {
    await this.removeClientUseCase.execute(agencyId, clientId);
  }

  async createDepartment(input: Parameters<AgencyRuntime["createDepartment"]>[0]) {
    const result = await this.createDepartmentUseCase.execute(input);
    return result.department;
  }

  async startProject(projectId: string, agencyId: string) {
    const result = await this.startProjectUseCase.execute(agencyId, projectId);
    return result.project;
  }

  async completeProject(projectId: string, agencyId: string) {
    const result = await this.completeProjectUseCase.execute(agencyId, projectId);
    return result.project;
  }

  async createGoal(input: Parameters<AgencyRuntime["createGoal"]>[0]) {
    const result = await this.createGoalUseCase.execute(input);
    return result.goal;
  }

  async updateKpi(kpiId: string, agencyId: string, currentValue: number) {
    const result = await this.updateKpiUseCase.execute({ agencyId, kpiId, currentValue });
    return result.kpi;
  }

  async buildContext(organizationId: string, agencyId: string) {
    const result = await this.buildContextUseCase.execute({ organizationId, agencyId });
    return result.context;
  }

  async analyzeHealth(organizationId: string, agencyId: string) {
    const result = await this.analyzeHealthUseCase.execute({ organizationId, agencyId });
    return result.health;
  }

  async buildDashboard(organizationId: string, agencyId: string) {
    const result = await this.buildDashboardUseCase.execute({ organizationId, agencyId });
    return result.dashboard;
  }

  async computeMetrics(organizationId: string, agencyId: string) {
    const result = await this.computeMetricsUseCase.execute({ organizationId, agencyId });
    return result.metrics;
  }
}
