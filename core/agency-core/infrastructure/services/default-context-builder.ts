import { AgencyContext, type AgencyContextBuilder, type AgencyRepository } from "../../domain";
import type { AgencyId, OrganizationId } from "../../shared";

export class DefaultAgencyContextBuilder implements AgencyContextBuilder {
  constructor(private readonly repository: AgencyRepository) {}

  async build(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyContext> {
    const agency = await this.repository.findAgency(organizationId, agencyId);
    const clients = await this.repository.listClients(agencyId);
    const departments = await this.repository.listDepartments(agencyId);
    const projects = await this.repository.listProjects(agencyId);

    const clientContexts = Object.fromEntries(
      clients.map((client) => [
        client.id,
        {
          name: client.name,
          companyId: client.companyId,
          companyBrainId: client.executiveStack.companyBrainId,
          executiveCouncilId: client.executiveStack.executiveCouncilId,
        },
      ]),
    );

    return AgencyContext.create({
      organizationId,
      agencyId,
      operationalContext: {
        agencyName: agency?.name ?? "Unknown Agency",
        clientCount: String(clients.length),
        departmentCount: String(departments.length),
        activeProjects: String(projects.filter((project) => project.status === "active").length),
      },
      clientContexts,
    });
  }
}
