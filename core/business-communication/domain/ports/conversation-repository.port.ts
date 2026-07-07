import type { OrganizationId } from "../../shared";
import type { CommunicationSummary, Conversation } from "../entities";

export interface ConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: string): Promise<Conversation | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Conversation[]>;
  saveSummary(summary: CommunicationSummary): Promise<void>;
}
