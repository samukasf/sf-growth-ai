import type { OrganizationId } from "../../shared";
import type {
  AutoReplyPolicy,
  CommunicationChannel,
  CommunicationRule,
  CommunicationSession,
  CommunicationTask,
  Participant,
} from "../entities";

export interface CommunicationRepository {
  saveChannel(channel: CommunicationChannel): Promise<void>;
  findChannelById(id: string): Promise<CommunicationChannel | null>;
  findChannelsByOrganization(organizationId: OrganizationId): Promise<CommunicationChannel[]>;
  saveRule(rule: CommunicationRule): Promise<void>;
  findRulesByOrganization(organizationId: OrganizationId): Promise<CommunicationRule[]>;
  savePolicy(policy: AutoReplyPolicy): Promise<void>;
  findPoliciesByOrganization(organizationId: OrganizationId): Promise<AutoReplyPolicy[]>;
  saveSession(session: CommunicationSession): Promise<void>;
  saveTask(task: CommunicationTask): Promise<void>;
  saveParticipant(participant: Participant): Promise<void>;
  findParticipantById(id: string): Promise<Participant | null>;
}
