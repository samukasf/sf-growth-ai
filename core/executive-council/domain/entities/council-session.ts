import type {
  CompanyId,
  CouncilId,
  CouncilSessionId,
  CouncilSessionStatus,
  ExecutiveRequestId,
  OrganizationId,
} from "../../shared";

export type CouncilSessionProps = {
  id: CouncilSessionId;
  councilId: CouncilId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  requestId: ExecutiveRequestId;
  query: string;
  brainSnapshotId?: string;
  status: CouncilSessionStatus;
  memberIds: string[];
  startedAt: string;
  completedAt?: string;
};

export class CouncilSession {
  readonly id: CouncilSessionId;
  readonly councilId: CouncilId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly requestId: ExecutiveRequestId;
  readonly query: string;
  readonly brainSnapshotId?: string;
  readonly status: CouncilSessionStatus;
  readonly memberIds: string[];
  readonly startedAt: string;
  readonly completedAt?: string;

  private constructor(props: CouncilSessionProps) {
    this.id = props.id;
    this.councilId = props.councilId;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.requestId = props.requestId;
    this.query = props.query;
    this.brainSnapshotId = props.brainSnapshotId;
    this.status = props.status;
    this.memberIds = [...props.memberIds];
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
  }

  static create(
    props: Omit<CouncilSessionProps, "id" | "startedAt" | "status" | "memberIds"> & {
      id?: CouncilSessionId;
      startedAt?: string;
      status?: CouncilSessionStatus;
      memberIds?: string[];
    },
  ): CouncilSession {
    return new CouncilSession({
      id: props.id ?? `csess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      councilId: props.councilId,
      organizationId: props.organizationId,
      companyId: props.companyId,
      requestId: props.requestId,
      query: props.query,
      brainSnapshotId: props.brainSnapshotId,
      status: props.status ?? "pending",
      memberIds: props.memberIds ?? [],
      startedAt: props.startedAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
    });
  }

  withMembers(memberIds: string[]): CouncilSession {
    return CouncilSession.create({
      ...this.toJSON(),
      memberIds,
      status: "active",
    });
  }

  complete(): CouncilSession {
    return CouncilSession.create({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): CouncilSessionProps {
    return {
      id: this.id,
      councilId: this.councilId,
      organizationId: this.organizationId,
      companyId: this.companyId,
      requestId: this.requestId,
      query: this.query,
      brainSnapshotId: this.brainSnapshotId,
      status: this.status,
      memberIds: [...this.memberIds],
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}
