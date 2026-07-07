import type {
  AssessmentId,
  AssessmentStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type AssessmentProps = {
  id: AssessmentId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  companyName: string;
  status: AssessmentStatus;
  initiatedBy: string;
  discoverySessionId?: string;
  startedAt: string;
  completedAt?: string;
  enterpriseMaturityScore: number;
  businessHealthScore: number;
  automationScore: number;
  digitalMaturityScore: number;
  aiReadinessScore: number;
  operationalEfficiencyScore: number;
  customerExperienceScore: number;
};

export class Assessment {
  readonly id: AssessmentId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly companyName: string;
  readonly status: AssessmentStatus;
  readonly initiatedBy: string;
  readonly discoverySessionId?: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly enterpriseMaturityScore: number;
  readonly businessHealthScore: number;
  readonly automationScore: number;
  readonly digitalMaturityScore: number;
  readonly aiReadinessScore: number;
  readonly operationalEfficiencyScore: number;
  readonly customerExperienceScore: number;

  private constructor(props: AssessmentProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.companyName = props.companyName;
    this.status = props.status;
    this.initiatedBy = props.initiatedBy;
    this.discoverySessionId = props.discoverySessionId;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.enterpriseMaturityScore = props.enterpriseMaturityScore;
    this.businessHealthScore = props.businessHealthScore;
    this.automationScore = props.automationScore;
    this.digitalMaturityScore = props.digitalMaturityScore;
    this.aiReadinessScore = props.aiReadinessScore;
    this.operationalEfficiencyScore = props.operationalEfficiencyScore;
    this.customerExperienceScore = props.customerExperienceScore;
  }

  static create(
    props: Omit<
      AssessmentProps,
      | "id"
      | "startedAt"
      | "status"
      | "enterpriseMaturityScore"
      | "businessHealthScore"
      | "automationScore"
      | "digitalMaturityScore"
      | "aiReadinessScore"
      | "operationalEfficiencyScore"
      | "customerExperienceScore"
    > & {
      id?: AssessmentId;
      startedAt?: string;
      status?: AssessmentStatus;
      enterpriseMaturityScore?: number;
      businessHealthScore?: number;
      automationScore?: number;
      digitalMaturityScore?: number;
      aiReadinessScore?: number;
      operationalEfficiencyScore?: number;
      customerExperienceScore?: number;
    },
  ): Assessment {
    if (!props.companyName.trim()) throw new Error("companyName is required");
    return new Assessment({
      id: props.id ?? `asmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      companyName: props.companyName,
      status: props.status ?? "pending",
      initiatedBy: props.initiatedBy,
      discoverySessionId: props.discoverySessionId,
      startedAt: props.startedAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
      enterpriseMaturityScore: props.enterpriseMaturityScore ?? 0,
      businessHealthScore: props.businessHealthScore ?? 0,
      automationScore: props.automationScore ?? 0,
      digitalMaturityScore: props.digitalMaturityScore ?? 0,
      aiReadinessScore: props.aiReadinessScore ?? 0,
      operationalEfficiencyScore: props.operationalEfficiencyScore ?? 0,
      customerExperienceScore: props.customerExperienceScore ?? 0,
    });
  }

  withStatus(status: AssessmentStatus): Assessment {
    return Assessment.create({
      ...this.toJSON(),
      status,
      completedAt: status === "completed" ? new Date().toISOString() : this.completedAt,
    });
  }

  withScores(scores: {
    enterpriseMaturityScore: number;
    businessHealthScore: number;
    automationScore: number;
    digitalMaturityScore: number;
    aiReadinessScore: number;
    operationalEfficiencyScore: number;
    customerExperienceScore: number;
  }): Assessment {
    return Assessment.create({ ...this.toJSON(), ...scores });
  }

  toJSON(): AssessmentProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      companyName: this.companyName,
      status: this.status,
      initiatedBy: this.initiatedBy,
      discoverySessionId: this.discoverySessionId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      enterpriseMaturityScore: this.enterpriseMaturityScore,
      businessHealthScore: this.businessHealthScore,
      automationScore: this.automationScore,
      digitalMaturityScore: this.digitalMaturityScore,
      aiReadinessScore: this.aiReadinessScore,
      operationalEfficiencyScore: this.operationalEfficiencyScore,
      customerExperienceScore: this.customerExperienceScore,
    };
  }
}
