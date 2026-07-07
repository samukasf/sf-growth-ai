import type { BrainStateId, BrainStatePhase, CompanyId, OrganizationId } from "../../shared";

export type EnterpriseBrainStateProps = {
  id: BrainStateId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  phase: BrainStatePhase;
  lastSnapshotId?: string;
  syncedSources: string[];
  updatedAt: string;
};

export class EnterpriseBrainState {
  readonly id: BrainStateId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly phase: BrainStatePhase;
  readonly lastSnapshotId?: string;
  readonly syncedSources: string[];
  readonly updatedAt: string;

  private constructor(props: EnterpriseBrainStateProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.phase = props.phase;
    this.lastSnapshotId = props.lastSnapshotId;
    this.syncedSources = [...props.syncedSources];
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<EnterpriseBrainStateProps, "id" | "updatedAt"> & {
      id?: BrainStateId;
      updatedAt?: string;
    },
  ): EnterpriseBrainState {
    return new EnterpriseBrainState({
      id: props.id ?? `bstate-${Date.now()}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      phase: props.phase,
      lastSnapshotId: props.lastSnapshotId,
      syncedSources: props.syncedSources,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  transition(phase: BrainStatePhase, lastSnapshotId?: string): EnterpriseBrainState {
    return EnterpriseBrainState.create({
      ...this.toJSON(),
      phase,
      lastSnapshotId: lastSnapshotId ?? this.lastSnapshotId,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): EnterpriseBrainStateProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      phase: this.phase,
      lastSnapshotId: this.lastSnapshotId,
      syncedSources: [...this.syncedSources],
      updatedAt: this.updatedAt,
    };
  }
}
