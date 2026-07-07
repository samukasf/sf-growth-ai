import type { OperatingSessionId, OrganizationId } from "../../shared";

export type SessionStatus = "active" | "idle" | "terminated";

export type OperatingSessionProps = {
  id: OperatingSessionId;
  organizationId: OrganizationId;
  userId: string;
  contextId: string;
  activePlatformIds: string[];
  status: SessionStatus;
  startedAt: string;
  lastActivityAt: string;
};

export class OperatingSession {
  readonly id: OperatingSessionId;
  readonly organizationId: OrganizationId;
  readonly userId: string;
  readonly contextId: string;
  readonly activePlatformIds: string[];
  readonly status: SessionStatus;
  readonly startedAt: string;
  readonly lastActivityAt: string;

  private constructor(props: OperatingSessionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.userId = props.userId;
    this.contextId = props.contextId;
    this.activePlatformIds = [...props.activePlatformIds];
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.lastActivityAt = props.lastActivityAt;
  }

  static create(
    props: Omit<OperatingSessionProps, "id" | "startedAt" | "lastActivityAt" | "status"> & {
      id?: OperatingSessionId;
      startedAt?: string;
      lastActivityAt?: string;
      status?: SessionStatus;
    },
  ): OperatingSession {
    const now = new Date().toISOString();
    return new OperatingSession({
      id: props.id ?? `session-${Date.now()}`,
      organizationId: props.organizationId,
      userId: props.userId,
      contextId: props.contextId,
      activePlatformIds: props.activePlatformIds,
      status: props.status ?? "active",
      startedAt: props.startedAt ?? now,
      lastActivityAt: props.lastActivityAt ?? now,
    });
  }

  toJSON(): OperatingSessionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      userId: this.userId,
      contextId: this.contextId,
      activePlatformIds: [...this.activePlatformIds],
      status: this.status,
      startedAt: this.startedAt,
      lastActivityAt: this.lastActivityAt,
    };
  }
}
