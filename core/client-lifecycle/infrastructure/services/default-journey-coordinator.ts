import type {
  ClientJourney,
  ClientLead,
  ClientOnboarding,
  ClientProposal,
  JourneyCoordinator,
} from "../../domain";
import type { ClientLifecycleDependencies } from "../../application";

export class DefaultJourneyCoordinator implements JourneyCoordinator {
  constructor(private readonly deps: ClientLifecycleDependencies) {}

  async coordinateLeadCreated(journey: ClientJourney, lead: ClientLead): Promise<void> {
    if (this.deps.businessAutomation.isAvailable()) {
      await this.deps.businessAutomation.triggerLifecycleAutomation(
        journey.organizationId,
        journey.agencyId,
        journey.companyId,
        "LeadCreated",
      );
    }

    if (this.deps.executiveMemory.isAvailable()) {
      await this.deps.executiveMemory.recordEvent(
        journey.organizationId,
        journey.companyId,
        "LeadCreated",
        { leadId: lead.id, source: lead.source },
      );
    }
  }

  async coordinateProposalAccepted(journey: ClientJourney, proposal: ClientProposal): Promise<void> {
    if (this.deps.businessCommunication.isAvailable()) {
      await this.deps.businessCommunication.notifyClientEvent(
        journey.organizationId,
        journey.agencyId,
        journey.companyId,
        "ProposalAccepted",
      );
    }

    if (this.deps.executiveTimeline.isAvailable()) {
      await this.deps.executiveTimeline.appendEntry(
        journey.organizationId,
        journey.companyId,
        "Proposta aceite",
        `Proposta ${proposal.title} aceite`,
      );
    }
  }

  async coordinateOnboardingCompleted(
    journey: ClientJourney,
    onboarding: ClientOnboarding,
  ): Promise<void> {
    const stack = journey.executiveStack;

    if (this.deps.executiveMemory.isAvailable()) {
      await this.deps.executiveMemory.provisionMemory(
        journey.organizationId,
        journey.companyId,
        stack,
      );
    }

    if (this.deps.executiveTimeline.isAvailable()) {
      await this.deps.executiveTimeline.provisionTimeline(
        journey.organizationId,
        journey.companyId,
        stack,
      );
    }

    if (this.deps.executiveDashboard.isAvailable()) {
      await this.deps.executiveDashboard.provisionDashboard(
        journey.organizationId,
        journey.companyId,
        stack,
      );
    }

    if (this.deps.executiveMissions.isAvailable()) {
      await this.deps.executiveMissions.provisionMissions(
        journey.organizationId,
        journey.companyId,
        stack,
      );
    }

    if (this.deps.businessAutomation.isAvailable()) {
      await this.deps.businessAutomation.triggerLifecycleAutomation(
        journey.organizationId,
        journey.agencyId,
        journey.companyId,
        "ClientOnboarded",
      );
    }

    void onboarding;
  }

  async coordinateCompanyBrainActivation(journey: ClientJourney): Promise<void> {
    const stack = journey.executiveStack;

    if (this.deps.companyBrain.isAvailable()) {
      await this.deps.companyBrain.activate(
        journey.organizationId,
        journey.agencyId,
        journey.companyId,
        stack,
      );
    }

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.provisionCouncil(
        journey.organizationId,
        journey.companyId,
        stack,
      );
    }

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.assignToClient(
        journey.organizationId,
        journey.companyId,
        stack,
      );
    }
  }
}
