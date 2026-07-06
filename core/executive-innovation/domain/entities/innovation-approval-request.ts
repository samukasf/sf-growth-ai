import type {
  CompanyId,
  InnovationApprovalRequestId,
  InnovationOpportunityId,
} from "../../shared";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type InnovationApprovalRequestProps = {
  id: InnovationApprovalRequestId;
  companyId: CompanyId;
  opportunityId: InnovationOpportunityId;
  title: string;
  justification: string;
  estimatedCost: number;
  estimatedROI: number;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
};

export class InnovationApprovalRequest {
  readonly id: InnovationApprovalRequestId;
  readonly companyId: CompanyId;
  readonly opportunityId: InnovationOpportunityId;
  readonly title: string;
  readonly justification: string;
  readonly estimatedCost: number;
  readonly estimatedROI: number;
  readonly status: ApprovalStatus;
  readonly requestedAt: string;
  readonly resolvedAt?: string;

  private constructor(props: InnovationApprovalRequestProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.title = props.title;
    this.justification = props.justification;
    this.estimatedCost = props.estimatedCost;
    this.estimatedROI = props.estimatedROI;
    this.status = props.status;
    this.requestedAt = props.requestedAt;
    this.resolvedAt = props.resolvedAt;
  }

  static create(
    props: Omit<InnovationApprovalRequestProps, "id" | "requestedAt" | "status"> & {
      id?: InnovationApprovalRequestId;
      requestedAt?: string;
      status?: ApprovalStatus;
    },
  ): InnovationApprovalRequest {
    return new InnovationApprovalRequest({
      id: props.id ?? `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      title: props.title.trim(),
      justification: props.justification.trim(),
      estimatedCost: props.estimatedCost,
      estimatedROI: props.estimatedROI,
      status: props.status ?? "pending",
      requestedAt: props.requestedAt ?? new Date().toISOString(),
      resolvedAt: props.resolvedAt,
    });
  }

  approve(): InnovationApprovalRequest {
    return new InnovationApprovalRequest({
      ...this.toJSON(),
      status: "approved",
      resolvedAt: new Date().toISOString(),
    });
  }

  reject(): InnovationApprovalRequest {
    return new InnovationApprovalRequest({
      ...this.toJSON(),
      status: "rejected",
      resolvedAt: new Date().toISOString(),
    });
  }

  toJSON(): InnovationApprovalRequestProps {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      title: this.title,
      justification: this.justification,
      estimatedCost: this.estimatedCost,
      estimatedROI: this.estimatedROI,
      status: this.status,
      requestedAt: this.requestedAt,
      resolvedAt: this.resolvedAt,
    };
  }
}
