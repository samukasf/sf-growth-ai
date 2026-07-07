import type { OrganizationId } from "../../shared";
import type {
  Contact,
  Contract,
  CustomerJourney,
  Interaction,
  Meeting,
  Partner,
  Proposal,
  RelationshipProfile,
} from "../entities";

export interface CRMRepository {
  saveContact(contact: Contact): Promise<void>;
  findContactsByEntity(entityId: string): Promise<Contact[]>;
  saveInteraction(interaction: Interaction): Promise<void>;
  findInteractionsByEntity(entityId: string): Promise<Interaction[]>;
  saveMeeting(meeting: Meeting): Promise<void>;
  findMeetingsByCustomer(customerId: string): Promise<Meeting[]>;
  saveProposal(proposal: Proposal): Promise<void>;
  findProposalById(id: string): Promise<Proposal | null>;
  saveContract(contract: Contract): Promise<void>;
  findContractById(id: string): Promise<Contract | null>;
  savePartner(partner: Partner): Promise<void>;
  findPartnersByOrganization(organizationId: OrganizationId): Promise<Partner[]>;
  saveRelationshipProfile(profile: RelationshipProfile): Promise<void>;
  findRelationshipProfile(entityId: string): Promise<RelationshipProfile | null>;
  saveCustomerJourney(journey: CustomerJourney): Promise<void>;
  findCustomerJourney(customerId: string): Promise<CustomerJourney | null>;
}
