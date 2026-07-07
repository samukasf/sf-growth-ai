import type {
  CouncilMemberId,
  CouncilMemberStatus,
  CouncilSessionId,
  CouncilSpecialistRole,
} from "../../shared";

export type CouncilMemberProps = {
  id: CouncilMemberId;
  sessionId: CouncilSessionId;
  role: CouncilSpecialistRole;
  name: string;
  status: CouncilMemberStatus;
  invitedAt: string;
  respondedAt?: string;
};

export class CouncilMember {
  readonly id: CouncilMemberId;
  readonly sessionId: CouncilSessionId;
  readonly role: CouncilSpecialistRole;
  readonly name: string;
  readonly status: CouncilMemberStatus;
  readonly invitedAt: string;
  readonly respondedAt?: string;

  private constructor(props: CouncilMemberProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.role = props.role;
    this.name = props.name;
    this.status = props.status;
    this.invitedAt = props.invitedAt;
    this.respondedAt = props.respondedAt;
  }

  static create(
    props: Omit<CouncilMemberProps, "id" | "invitedAt" | "status"> & {
      id?: CouncilMemberId;
      invitedAt?: string;
      status?: CouncilMemberStatus;
    },
  ): CouncilMember {
    return new CouncilMember({
      id: props.id ?? `cmem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      role: props.role,
      name: props.name,
      status: props.status ?? "invited",
      invitedAt: props.invitedAt ?? new Date().toISOString(),
      respondedAt: props.respondedAt,
    });
  }

  markResponded(): CouncilMember {
    return CouncilMember.create({
      ...this.toJSON(),
      status: "responded",
      respondedAt: new Date().toISOString(),
    });
  }

  toJSON(): CouncilMemberProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      role: this.role,
      name: this.name,
      status: this.status,
      invitedAt: this.invitedAt,
      respondedAt: this.respondedAt,
    };
  }
}
