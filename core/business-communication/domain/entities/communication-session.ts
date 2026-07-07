import type {
  CommunicationSessionId,
  ConversationId,
  OrganizationId,
  ParticipantId,
} from "../../shared";

export type SessionStatus = "active" | "idle" | "ended";

export type CommunicationSessionProps = {
  id: CommunicationSessionId;
  organizationId: OrganizationId;
  conversationId: ConversationId;
  agentId?: ParticipantId;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
};

export class CommunicationSession {
  readonly id: CommunicationSessionId;
  readonly organizationId: OrganizationId;
  readonly conversationId: ConversationId;
  readonly agentId?: ParticipantId;
  readonly status: SessionStatus;
  readonly startedAt: string;
  readonly endedAt?: string;

  private constructor(props: CommunicationSessionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.conversationId = props.conversationId;
    this.agentId = props.agentId;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.endedAt = props.endedAt;
  }

  static create(
    props: Omit<CommunicationSessionProps, "id" | "startedAt" | "status"> & {
      id?: CommunicationSessionId;
      startedAt?: string;
      status?: SessionStatus;
    },
  ): CommunicationSession {
    return new CommunicationSession({
      id: props.id ?? `session-${Date.now()}`,
      organizationId: props.organizationId,
      conversationId: props.conversationId,
      agentId: props.agentId,
      status: props.status ?? "active",
      startedAt: props.startedAt ?? new Date().toISOString(),
      endedAt: props.endedAt,
    });
  }

  end(): CommunicationSession {
    return new CommunicationSession({
      ...this.toJSON(),
      status: "ended",
      endedAt: new Date().toISOString(),
    });
  }

  toJSON(): CommunicationSessionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      conversationId: this.conversationId,
      agentId: this.agentId,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
    };
  }
}
