import { AgencyMetrics, type AgencyMetricsEngine, type AgencyRepository } from "../../domain";
import type { AgencyId, OrganizationId } from "../../shared";

export class DefaultAgencyMetricsEngine implements AgencyMetricsEngine {
  constructor(private readonly repository: AgencyRepository) {}

  async compute(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyMetrics> {
    const clients = await this.repository.listClients(agencyId);
    const projects = await this.repository.listProjects(agencyId);
    const departments = await this.repository.listDepartments(agencyId);

    return AgencyMetrics.create({
      organizationId,
      agencyId,
      totals: {
        clients: clients.length,
        activeProjects: projects.filter((project) => project.status === "active").length,
        departments: departments.length,
        employees: await this.repository.countEmployees(agencyId),
        partners: await this.repository.countPartners(agencyId),
        pipelineValue: await this.repository.sumPipelineValue(agencyId),
      },
    });
  }
}
