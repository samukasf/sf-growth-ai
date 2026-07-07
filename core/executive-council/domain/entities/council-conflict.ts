import type {
  CouncilConflictId,
  CouncilConflictStatus,
  CouncilSessionId,
  CouncilSpecialistRole,
} from "../../shared";

export type CouncilConflictProps = {
  id: CouncilConflictId;
  sessionId: CouncilSessionId;
  topic: string;
  roles: CouncilSpecialistRole[];
  description: string;
  status: CouncilConflictStatus;
  detectedAt: string;
  resolvedAt?: string;
};

export class CouncilConflict {
  readonly id: CouncilConflictId;
  readonly sessionId: CouncilSessionId;
  readonly topic: string;
  readonly roles: CouncilSpecialistRole[];
  readonly description: string;
  readonly status: CouncilConflictStatus;
  readonly detectedAt: string;
  readonly resolvedAt?: string;

  private constructor(props: CouncilConflictProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.topic = props.topic;
    this.roles = [...props.roles];
    this.description = props.description;
    this.status = props.status;
    this.detectedAt = props.detectedAt;
    this.resolvedAt = props.resolvedAt;
  }

  static create(
    props: Omit<CouncilConflictProps, "id" | "detectedAt" | "status"> & {
      id?: CouncilConflictId;
      detectedAt?: string;
      status?: CouncilConflictStatus;
    },
  ): CouncilConflict {
    return new CouncilConflict({
      id: props.id ?? `cconf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      topic: props.topic,
      roles: props.roles,
      description: props.description,
      status: props.status ?? "open",
      detectedAt: props.detectedAt ?? new Date().toISOString(),
      resolvedAt: props.resolvedAt,
    });
  }

  resolve(): CouncilConflict {
    return CouncilConflict.create({
      ...this.toJSON(),
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    });
  }

  toJSON(): CouncilConflictProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      topic: this.topic,
      roles: [...this.roles],
      description: this.description,
      status: this.status,
      detectedAt: this.detectedAt,
      resolvedAt: this.resolvedAt,
    };
  }
}
