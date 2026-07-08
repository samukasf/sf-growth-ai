import type { AgencyClient, AgencyCoordinator, AgencyProject } from "../../domain";
import type { AgencyCoreDependencies } from "../../application";

export class DefaultAgencyCoordinator implements AgencyCoordinator {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async coordinateClientOnboarding(client: AgencyClient): Promise<void> {
    const stack = client.executiveStack;

    if (this.deps.companyBrain.isAvailable()) {
      await this.deps.companyBrain.provisionForClient(
        client.organizationId,
        client.agencyId,
        client.companyId,
      );
    }

    if (this.deps.executiveMemory.isAvailable()) {
      await this.deps.executiveMemory.provisionMemory(
        client.organizationId,
        client.companyId,
        stack,
      );
    }

    if (this.deps.executiveContext.isAvailable()) {
      await this.deps.executiveContext.provisionContext(
        client.organizationId,
        client.companyId,
        stack,
      );
    }

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.provisionCouncil(
        client.organizationId,
        client.companyId,
        stack,
      );
    }

    if (this.deps.executiveTimeline.isAvailable()) {
      await this.deps.executiveTimeline.provisionTimeline(
        client.organizationId,
        client.companyId,
        stack,
      );
    }

    if (this.deps.executiveDashboard.isAvailable()) {
      await this.deps.executiveDashboard.provisionDashboard(
        client.organizationId,
        client.companyId,
        stack,
      );
    }

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.assignToClient(
        client.organizationId,
        client.companyId,
        stack,
      );
    }

    if (this.deps.businessCommunication.isAvailable()) {
      await this.deps.businessCommunication.prepareClientChannels(
        client.organizationId,
        client.agencyId,
        client.companyId,
      );
    }

    if (this.deps.businessAutomation.isAvailable()) {
      await this.deps.businessAutomation.prepareClientAutomations(
        client.organizationId,
        client.agencyId,
        client.companyId,
      );
    }

    if (this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.prepareClientWorkspace(
        client.organizationId,
        client.agencyId,
        client.companyId,
      );
    }
  }

  async coordinateProjectLifecycle(project: AgencyProject): Promise<void> {
    if (project.status === "active" && this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.prepareClientWorkspace(
        project.organizationId,
        project.agencyId,
        project.clientId,
      );
    }
  }
}
