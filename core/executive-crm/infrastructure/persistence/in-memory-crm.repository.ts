import {
  Contact,
  Contract,
  CustomerJourney,
  Interaction,
  Meeting,
  Partner,
  Proposal,
  RelationshipProfile,
  type CRMRepository,
} from "../../domain";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

export class InMemoryCrmRepository implements CRMRepository {
  private readonly contacts: Contact[] = [];
  private readonly interactions: Interaction[] = [];
  private readonly meetings: Meeting[] = [];
  private readonly proposals = new Map<string, string>();
  private readonly contracts = new Map<string, string>();
  private readonly partners: Partner[] = [];
  private readonly profiles = new Map<string, string>();
  private readonly journeys = new Map<string, string>();

  async saveContact(contact: Contact): Promise<void> {
    this.contacts.push(contact);
  }

  async findContactsByEntity(entityId: string): Promise<Contact[]> {
    return this.contacts.filter((c) => c.entityId === entityId);
  }

  async saveInteraction(interaction: Interaction): Promise<void> {
    this.interactions.push(interaction);
  }

  async findInteractionsByEntity(entityId: string): Promise<Interaction[]> {
    return this.interactions.filter((i) => i.entityId === entityId);
  }

  async saveMeeting(meeting: Meeting): Promise<void> {
    this.meetings.push(meeting);
  }

  async findMeetingsByCustomer(customerId: string): Promise<Meeting[]> {
    return this.meetings.filter((m) => m.customerId === customerId);
  }

  async saveProposal(proposal: Proposal): Promise<void> {
    this.proposals.set(proposal.id, serialize(proposal.toJSON()));
  }

  async findProposalById(id: string): Promise<Proposal | null> {
    const raw = this.proposals.get(id);
    return raw
      ? Proposal.create(JSON.parse(raw) as ReturnType<Proposal["toJSON"]>)
      : null;
  }

  async saveContract(contract: Contract): Promise<void> {
    this.contracts.set(contract.id, serialize(contract.toJSON()));
  }

  async findContractById(id: string): Promise<Contract | null> {
    const raw = this.contracts.get(id);
    return raw
      ? Contract.create(JSON.parse(raw) as ReturnType<Contract["toJSON"]>)
      : null;
  }

  async savePartner(partner: Partner): Promise<void> {
    this.partners.push(partner);
  }

  async findPartnersByOrganization(organizationId: string): Promise<Partner[]> {
    return this.partners.filter((p) => p.organizationId === organizationId);
  }

  async saveRelationshipProfile(profile: RelationshipProfile): Promise<void> {
    this.profiles.set(profile.entityId, serialize(profile.toJSON()));
  }

  async findRelationshipProfile(entityId: string): Promise<RelationshipProfile | null> {
    const raw = this.profiles.get(entityId);
    return raw
      ? RelationshipProfile.create(
          JSON.parse(raw) as ReturnType<RelationshipProfile["toJSON"]>,
        )
      : null;
  }

  async saveCustomerJourney(journey: CustomerJourney): Promise<void> {
    this.journeys.set(journey.customerId, serialize(journey.toJSON()));
  }

  async findCustomerJourney(customerId: string): Promise<CustomerJourney | null> {
    const raw = this.journeys.get(customerId);
    return raw
      ? CustomerJourney.create(JSON.parse(raw) as ReturnType<CustomerJourney["toJSON"]>)
      : null;
  }
}
