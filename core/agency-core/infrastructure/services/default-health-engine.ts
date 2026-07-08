import { AgencyHealth, type AgencyHealthEngine, type AgencyRepository } from "../../domain";
import type { AgencyId, OrganizationId } from "../../shared";

export class DefaultAgencyHealthEngine implements AgencyHealthEngine {
  constructor(private readonly repository: AgencyRepository) {}

  async evaluate(organizationId: OrganizationId, agencyId: AgencyId): Promise<AgencyHealth> {
    const clients = await this.repository.listClients(agencyId);
    const projects = await this.repository.listProjects(agencyId);
    const departments = await this.repository.listDepartments(agencyId);
    const goals = await this.repository.listGoals(agencyId);
    const kpis = await this.repository.listKpis(agencyId);

    const activeProjects = projects.filter((project) => project.status === "active").length;
    const onTrackKpis = kpis.filter((kpi) => kpi.status === "on_track").length;

    const scores = {
      overall: Math.min(100, clients.length * 10 + activeProjects * 5 + onTrackKpis * 8),
      clients: Math.min(100, clients.length * 15),
      projects: Math.min(100, activeProjects * 20),
      teams: Math.min(100, departments.length * 25),
      goals: Math.min(100, goals.length * 20),
    };

    const signals: string[] = [];
    if (clients.length === 0) signals.push("no_clients");
    if (activeProjects === 0) signals.push("no_active_projects");
    if (kpis.some((kpi) => kpi.status === "off_track")) signals.push("kpi_off_track");

    return AgencyHealth.create({
      organizationId,
      agencyId,
      scores,
      signals,
    });
  }
}
