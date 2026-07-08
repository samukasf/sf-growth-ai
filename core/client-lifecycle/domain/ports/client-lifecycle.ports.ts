import type {
  ClientContract,
  ClientExecutiveStackProps,
  ClientHealth,
  ClientJourney,
  ClientLead,
  ClientOnboarding,
  ClientOpportunity,
  ClientProposal,
  ClientRelationship,
  ClientRenewal,
  ClientSuccessPlan,
  ClientUpsell,
} from "../entities";
import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export type ClientTimelineEntry = {
  id: string;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  journeyId: ClientJourney["id"];
  eventType: string;
  title: string;
  description: string;
  occurredAt: string;
};

export interface ClientLifecycleRepository {
  saveLead(lead: ClientLead): Promise<void>;
  findLead(agencyId: AgencyId, leadId: string): Promise<ClientLead | null>;
  saveOpportunity(opportunity: ClientOpportunity): Promise<void>;
  saveProposal(proposal: ClientProposal): Promise<void>;
  findProposal(agencyId: AgencyId, proposalId: string): Promise<ClientProposal | null>;
  saveContract(contract: ClientContract): Promise<void>;
  saveOnboarding(onboarding: ClientOnboarding): Promise<void>;
  findOnboarding(agencyId: AgencyId, onboardingId: string): Promise<ClientOnboarding | null>;
  saveSuccessPlan(plan: ClientSuccessPlan): Promise<void>;
  saveRelationship(relationship: ClientRelationship): Promise<void>;
  findRelationship(agencyId: AgencyId, companyId: CompanyId): Promise<ClientRelationship | null>;
  saveRenewal(renewal: ClientRenewal): Promise<void>;
  saveUpsell(upsell: ClientUpsell): Promise<void>;
  saveHealth(health: ClientHealth): Promise<void>;
  findLatestHealth(agencyId: AgencyId, companyId: CompanyId): Promise<ClientHealth | null>;
  saveJourney(journey: ClientJourney): Promise<void>;
  findJourney(agencyId: AgencyId, journeyId: string): Promise<ClientJourney | null>;
  findJourneyByCompany(agencyId: AgencyId, companyId: CompanyId): Promise<ClientJourney | null>;
  listJourneys(agencyId: AgencyId): Promise<ClientJourney[]>;
  saveTimelineEntry(entry: ClientTimelineEntry): Promise<void>;
  listTimelineEntries(journeyId: string): Promise<ClientTimelineEntry[]>;
}

export interface JourneyCoordinator {
  coordinateLeadCreated(journey: ClientJourney, lead: ClientLead): Promise<void>;
  coordinateProposalAccepted(journey: ClientJourney, proposal: ClientProposal): Promise<void>;
  coordinateOnboardingCompleted(journey: ClientJourney, onboarding: ClientOnboarding): Promise<void>;
  coordinateCompanyBrainActivation(journey: ClientJourney): Promise<void>;
}

export interface HealthEngine {
  evaluate(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): Promise<ClientHealth>;
}

export interface RenewalEngine {
  suggest(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
    contractId: string,
  ): Promise<ClientRenewal | null>;
}

export interface RelationshipManager {
  assess(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): Promise<ClientRelationship>;
  recover(relationship: ClientRelationship): Promise<ClientRelationship>;
}

export interface UpsellEngine {
  detect(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): Promise<ClientUpsell | null>;
}

export interface ClientTimelineBuilder {
  build(journeyId: string): Promise<ClientTimelineEntry[]>;
  append(entry: Omit<ClientTimelineEntry, "id">): Promise<ClientTimelineEntry>;
}

export interface ClientLifecycleRuntime {
  createLead(input: {
    organizationId: OrganizationId;
    agencyId: AgencyId;
    companyId?: CompanyId;
    name: string;
    email?: string;
    phone?: string;
    source: string;
  }): Promise<{ lead: ClientLead; journey: ClientJourney }>;
  acceptProposal(agencyId: AgencyId, proposalId: string): Promise<ClientProposal>;
  completeOnboarding(agencyId: AgencyId, onboardingId: string): Promise<ClientOnboarding>;
  activateCompanyBrain(agencyId: AgencyId, journeyId: string): Promise<ClientJourney>;
  evaluateHealth(organizationId: OrganizationId, agencyId: AgencyId, companyId: CompanyId): Promise<ClientHealth>;
  suggestRenewal(organizationId: OrganizationId, agencyId: AgencyId, companyId: CompanyId, contractId: string): Promise<ClientRenewal | null>;
  detectUpsell(organizationId: OrganizationId, agencyId: AgencyId, companyId: CompanyId): Promise<ClientUpsell | null>;
  recoverClient(agencyId: AgencyId, companyId: CompanyId): Promise<ClientRelationship>;
  getJourney(agencyId: AgencyId, journeyId: string): Promise<ClientJourney | null>;
  buildTimeline(journeyId: string): Promise<ClientTimelineEntry[]>;
}
