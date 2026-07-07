import {
  AutoReplyPolicy,
  CommunicationChannel,
  CommunicationRule,
  CommunicationSession,
  CommunicationTask,
  Participant,
  type CommunicationRepository,
} from "../../domain";

function serializeChannel(channel: CommunicationChannel): string {
  return JSON.stringify(channel.toJSON());
}

function deserializeChannel(raw: string): CommunicationChannel {
  return CommunicationChannel.create(JSON.parse(raw) as ReturnType<CommunicationChannel["toJSON"]>);
}

export class InMemoryCommunicationRepository implements CommunicationRepository {
  private readonly channels = new Map<string, string>();
  private readonly rules: CommunicationRule[] = [];
  private readonly policies: AutoReplyPolicy[] = [];
  private readonly sessions: CommunicationSession[] = [];
  private readonly tasks: CommunicationTask[] = [];
  private readonly participants = new Map<string, string>();

  async saveChannel(channel: CommunicationChannel): Promise<void> {
    this.channels.set(channel.id, serializeChannel(channel));
  }

  async findChannelById(id: string): Promise<CommunicationChannel | null> {
    const raw = this.channels.get(id);
    return raw ? deserializeChannel(raw) : null;
  }

  async findChannelsByOrganization(organizationId: string): Promise<CommunicationChannel[]> {
    const results: CommunicationChannel[] = [];
    for (const raw of this.channels.values()) {
      const channel = deserializeChannel(raw);
      if (channel.organizationId === organizationId) results.push(channel);
    }
    return results;
  }

  async saveRule(rule: CommunicationRule): Promise<void> {
    this.rules.push(rule);
  }

  async findRulesByOrganization(organizationId: string): Promise<CommunicationRule[]> {
    return this.rules.filter((r) => r.organizationId === organizationId);
  }

  async savePolicy(policy: AutoReplyPolicy): Promise<void> {
    this.policies.push(policy);
  }

  async findPoliciesByOrganization(organizationId: string): Promise<AutoReplyPolicy[]> {
    return this.policies.filter((p) => p.organizationId === organizationId);
  }

  async saveSession(session: CommunicationSession): Promise<void> {
    this.sessions.push(session);
  }

  async saveTask(task: CommunicationTask): Promise<void> {
    this.tasks.push(task);
  }

  async saveParticipant(participant: Participant): Promise<void> {
    this.participants.set(participant.id, JSON.stringify(participant.toJSON()));
  }

  async findParticipantById(id: string): Promise<Participant | null> {
    const raw = this.participants.get(id);
    if (!raw) return null;
    return Participant.create(JSON.parse(raw) as ReturnType<Participant["toJSON"]>);
  }
}
