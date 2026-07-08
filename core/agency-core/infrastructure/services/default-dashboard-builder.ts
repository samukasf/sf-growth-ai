import { AgencyDashboard, type AgencyDashboardBuilder, type AgencyRepository } from "../../domain";
import type { AgencyId, OrganizationId } from "../../shared";

export class DefaultAgencyDashboardBuilder implements AgencyDashboardBuilder {
  constructor(private readonly repository: AgencyRepository) {}

  async build(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyDashboard> {
    const clients = await this.repository.listClients(agencyId);
    const projects = await this.repository.listProjects(agencyId);
    const goals = await this.repository.listGoals(agencyId);
    const kpis = await this.repository.listKpis(agencyId);

    return AgencyDashboard.create({
      organizationId,
      agencyId,
      sections: [
        {
          key: "clients",
          label: "Clientes",
          metrics: {
            total: clients.length,
            active: clients.filter((client) => client.status === "active").length,
          },
        },
        {
          key: "projects",
          label: "Projetos",
          metrics: {
            total: projects.length,
            active: projects.filter((project) => project.status === "active").length,
            completed: projects.filter((project) => project.status === "completed").length,
          },
        },
        {
          key: "performance",
          label: "Performance",
          metrics: {
            goals: goals.length,
            kpis: kpis.length,
            onTrack: kpis.filter((kpi) => kpi.status === "on_track").length,
          },
        },
      ],
    });
  }
}
