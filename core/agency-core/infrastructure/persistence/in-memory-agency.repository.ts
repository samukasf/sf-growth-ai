import type {
  Agency,
  AgencyClient,
  AgencyDepartment,
  AgencyGoal,
  AgencyKPI,
  AgencyProject,
  AgencyRepository,
} from "../../domain";
import type { AgencyId, OrganizationId } from "../../shared";

export class InMemoryAgencyRepository implements AgencyRepository {
  private agencies = new Map<string, Agency>();
  private clients = new Map<string, AgencyClient>();
  private departments = new Map<string, AgencyDepartment>();
  private projects = new Map<string, AgencyProject>();
  private goals = new Map<string, AgencyGoal>();
  private kpis = new Map<string, AgencyKPI>();

  async saveAgency(agency: Agency): Promise<void> {
    this.agencies.set(agency.id, agency);
  }

  async findAgency(organizationId: OrganizationId, agencyId: AgencyId): Promise<Agency | null> {
    const agency = this.agencies.get(agencyId);
    if (!agency || agency.organizationId !== organizationId) return null;
    return agency;
  }

  async saveClient(client: AgencyClient): Promise<void> {
    this.clients.set(client.id, client);
  }

  async findClient(agencyId: AgencyId, clientId: string): Promise<AgencyClient | null> {
    const client = this.clients.get(clientId);
    if (!client || client.agencyId !== agencyId) return null;
    return client;
  }

  async listClients(agencyId: AgencyId): Promise<AgencyClient[]> {
    return [...this.clients.values()].filter((client) => client.agencyId === agencyId);
  }

  async removeClient(agencyId: AgencyId, clientId: string): Promise<void> {
    const client = await this.findClient(agencyId, clientId);
    if (client) this.clients.delete(clientId);
  }

  async saveDepartment(department: AgencyDepartment): Promise<void> {
    this.departments.set(department.id, department);
  }

  async listDepartments(agencyId: AgencyId): Promise<AgencyDepartment[]> {
    return [...this.departments.values()].filter((department) => department.agencyId === agencyId);
  }

  async saveProject(project: AgencyProject): Promise<void> {
    this.projects.set(project.id, project);
  }

  async listProjects(agencyId: AgencyId): Promise<AgencyProject[]> {
    return [...this.projects.values()].filter((project) => project.agencyId === agencyId);
  }

  async saveGoal(goal: AgencyGoal): Promise<void> {
    this.goals.set(goal.id, goal);
  }

  async listGoals(agencyId: AgencyId): Promise<AgencyGoal[]> {
    return [...this.goals.values()].filter((goal) => goal.agencyId === agencyId);
  }

  async saveKpi(kpi: AgencyKPI): Promise<void> {
    this.kpis.set(kpi.id, kpi);
  }

  async listKpis(agencyId: AgencyId): Promise<AgencyKPI[]> {
    return [...this.kpis.values()].filter((kpi) => kpi.agencyId === agencyId);
  }

  async countEmployees(_agencyId: AgencyId): Promise<number> {
    return 0;
  }

  async countPartners(_agencyId: AgencyId): Promise<number> {
    return 0;
  }

  async sumPipelineValue(_agencyId: AgencyId): Promise<number> {
    return 0;
  }
}
