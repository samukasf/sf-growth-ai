import type {
  ClientContract,
  ClientHealth,
  ClientJourney,
  ClientLead,
  ClientLifecycleRepository,
  ClientOnboarding,
  ClientOpportunity,
  ClientProposal,
  ClientRelationship,
  ClientRenewal,
  ClientSuccessPlan,
  ClientTimelineEntry,
  ClientUpsell,
} from "../../domain";
import type { AgencyId, CompanyId } from "../../shared";

export class InMemoryClientLifecycleRepository implements ClientLifecycleRepository {
  private leads = new Map<string, ClientLead>();
  private opportunities = new Map<string, ClientOpportunity>();
  private proposals = new Map<string, ClientProposal>();
  private contracts = new Map<string, ClientContract>();
  private onboardings = new Map<string, ClientOnboarding>();
  private successPlans = new Map<string, ClientSuccessPlan>();
  private relationships = new Map<string, ClientRelationship>();
  private renewals = new Map<string, ClientRenewal>();
  private upsells = new Map<string, ClientUpsell>();
  private healthRecords = new Map<string, ClientHealth>();
  private journeys = new Map<string, ClientJourney>();
  private timelineEntries = new Map<string, ClientTimelineEntry[]>();

  async saveLead(lead: ClientLead): Promise<void> {
    this.leads.set(lead.id, lead);
  }

  async findLead(agencyId: AgencyId, leadId: string): Promise<ClientLead | null> {
    const lead = this.leads.get(leadId);
    if (!lead || lead.agencyId !== agencyId) return null;
    return lead;
  }

  async saveOpportunity(opportunity: ClientOpportunity): Promise<void> {
    this.opportunities.set(opportunity.id, opportunity);
  }

  async saveProposal(proposal: ClientProposal): Promise<void> {
    this.proposals.set(proposal.id, proposal);
  }

  async findProposal(agencyId: AgencyId, proposalId: string): Promise<ClientProposal | null> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.agencyId !== agencyId) return null;
    return proposal;
  }

  async saveContract(contract: ClientContract): Promise<void> {
    this.contracts.set(contract.id, contract);
  }

  async saveOnboarding(onboarding: ClientOnboarding): Promise<void> {
    this.onboardings.set(onboarding.id, onboarding);
  }

  async findOnboarding(agencyId: AgencyId, onboardingId: string): Promise<ClientOnboarding | null> {
    const onboarding = this.onboardings.get(onboardingId);
    if (!onboarding || onboarding.agencyId !== agencyId) return null;
    return onboarding;
  }

  async saveSuccessPlan(plan: ClientSuccessPlan): Promise<void> {
    this.successPlans.set(plan.id, plan);
  }

  async saveRelationship(relationship: ClientRelationship): Promise<void> {
    this.relationships.set(`${relationship.agencyId}:${relationship.companyId}`, relationship);
  }

  async findRelationship(agencyId: AgencyId, companyId: CompanyId): Promise<ClientRelationship | null> {
    return this.relationships.get(`${agencyId}:${companyId}`) ?? null;
  }

  async saveRenewal(renewal: ClientRenewal): Promise<void> {
    this.renewals.set(renewal.id, renewal);
  }

  async saveUpsell(upsell: ClientUpsell): Promise<void> {
    this.upsells.set(upsell.id, upsell);
  }

  async saveHealth(health: ClientHealth): Promise<void> {
    this.healthRecords.set(`${health.agencyId}:${health.companyId}`, health);
  }

  async findLatestHealth(agencyId: AgencyId, companyId: CompanyId): Promise<ClientHealth | null> {
    return this.healthRecords.get(`${agencyId}:${companyId}`) ?? null;
  }

  async saveJourney(journey: ClientJourney): Promise<void> {
    this.journeys.set(journey.id, journey);
  }

  async findJourney(agencyId: AgencyId, journeyId: string): Promise<ClientJourney | null> {
    const journey = this.journeys.get(journeyId);
    if (!journey || journey.agencyId !== agencyId) return null;
    return journey;
  }

  async findJourneyByCompany(agencyId: AgencyId, companyId: CompanyId): Promise<ClientJourney | null> {
    return (
      [...this.journeys.values()].find(
        (journey) => journey.agencyId === agencyId && journey.companyId === companyId,
      ) ?? null
    );
  }

  async listJourneys(agencyId: AgencyId): Promise<ClientJourney[]> {
    return [...this.journeys.values()].filter((journey) => journey.agencyId === agencyId);
  }

  async saveTimelineEntry(entry: ClientTimelineEntry): Promise<void> {
    const existing = this.timelineEntries.get(entry.journeyId) ?? [];
    this.timelineEntries.set(entry.journeyId, [...existing, entry]);
  }

  async listTimelineEntries(journeyId: string): Promise<ClientTimelineEntry[]> {
    return this.timelineEntries.get(journeyId) ?? [];
  }
}
