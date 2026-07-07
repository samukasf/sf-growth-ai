import type {
  CompanyId,
  DiscoverySessionId,
  DiscoverySessionStatus,
  DiscoverySourceType,
  OrganizationId,
} from "../../shared";

export type DiscoverySessionProps = {
  id: DiscoverySessionId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  companyName: string;
  status: DiscoverySessionStatus;
  sourceTypes: DiscoverySourceType[];
  initiatedBy: string;
  startedAt: string;
  completedAt?: string;
  findingsCount: number;
  gapsCount: number;
  opportunitiesCount: number;
  profileCompleteness: number;
};

export class DiscoverySession {
  readonly id: DiscoverySessionId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly companyName: string;
  readonly status: DiscoverySessionStatus;
  readonly sourceTypes: DiscoverySourceType[];
  readonly initiatedBy: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly findingsCount: number;
  readonly gapsCount: number;
  readonly opportunitiesCount: number;
  readonly profileCompleteness: number;

  private constructor(props: DiscoverySessionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.companyName = props.companyName;
    this.status = props.status;
    this.sourceTypes = [...props.sourceTypes];
    this.initiatedBy = props.initiatedBy;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.findingsCount = props.findingsCount;
    this.gapsCount = props.gapsCount;
    this.opportunitiesCount = props.opportunitiesCount;
    this.profileCompleteness = props.profileCompleteness;
  }

  static create(
    props: Omit<
      DiscoverySessionProps,
      "id" | "startedAt" | "status" | "findingsCount" | "gapsCount" | "opportunitiesCount" | "profileCompleteness"
    > & {
      id?: DiscoverySessionId;
      startedAt?: string;
      status?: DiscoverySessionStatus;
      findingsCount?: number;
      gapsCount?: number;
      opportunitiesCount?: number;
      profileCompleteness?: number;
    },
  ): DiscoverySession {
    if (!props.companyName.trim()) throw new Error("companyName is required");
    return new DiscoverySession({
      id: props.id ?? `dsess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      companyName: props.companyName,
      status: props.status ?? "pending",
      sourceTypes: props.sourceTypes,
      initiatedBy: props.initiatedBy,
      startedAt: props.startedAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
      findingsCount: props.findingsCount ?? 0,
      gapsCount: props.gapsCount ?? 0,
      opportunitiesCount: props.opportunitiesCount ?? 0,
      profileCompleteness: props.profileCompleteness ?? 0,
    });
  }

  withStatus(status: DiscoverySessionStatus): DiscoverySession {
    return DiscoverySession.create({
      ...this.toJSON(),
      status,
      completedAt: status === "completed" ? new Date().toISOString() : this.completedAt,
    });
  }

  withCounts(input: {
    findingsCount?: number;
    gapsCount?: number;
    opportunitiesCount?: number;
    profileCompleteness?: number;
  }): DiscoverySession {
    return DiscoverySession.create({
      ...this.toJSON(),
      findingsCount: input.findingsCount ?? this.findingsCount,
      gapsCount: input.gapsCount ?? this.gapsCount,
      opportunitiesCount: input.opportunitiesCount ?? this.opportunitiesCount,
      profileCompleteness: input.profileCompleteness ?? this.profileCompleteness,
    });
  }

  toJSON(): DiscoverySessionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      companyName: this.companyName,
      status: this.status,
      sourceTypes: [...this.sourceTypes],
      initiatedBy: this.initiatedBy,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      findingsCount: this.findingsCount,
      gapsCount: this.gapsCount,
      opportunitiesCount: this.opportunitiesCount,
      profileCompleteness: this.profileCompleteness,
    };
  }
}
