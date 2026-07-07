import type { OrganizationId, PurchaseRequestId } from "../../shared";

export type PurchaseRequestStatus = "pending" | "approved" | "rejected" | "ordered";

export type PurchaseRequestProps = {
  id: PurchaseRequestId;
  organizationId: OrganizationId;
  requesterId: string;
  title: string;
  description: string;
  estimatedBudget: number;
  currency: string;
  status: PurchaseRequestStatus;
  requiresApproval: boolean;
  createdAt: string;
};

export class PurchaseRequest {
  readonly id: PurchaseRequestId;
  readonly organizationId: OrganizationId;
  readonly requesterId: string;
  readonly title: string;
  readonly description: string;
  readonly estimatedBudget: number;
  readonly currency: string;
  readonly status: PurchaseRequestStatus;
  readonly requiresApproval: boolean;
  readonly createdAt: string;

  private constructor(props: PurchaseRequestProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.requesterId = props.requesterId;
    this.title = props.title;
    this.description = props.description;
    this.estimatedBudget = props.estimatedBudget;
    this.currency = props.currency;
    this.status = props.status;
    this.requiresApproval = props.requiresApproval;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<PurchaseRequestProps, "id" | "createdAt" | "status"> & {
      id?: PurchaseRequestId;
      createdAt?: string;
      status?: PurchaseRequestStatus;
    },
  ): PurchaseRequest {
    return new PurchaseRequest({
      id: props.id ?? `pr-${Date.now()}`,
      organizationId: props.organizationId,
      requesterId: props.requesterId,
      title: props.title.trim(),
      description: props.description.trim(),
      estimatedBudget: props.estimatedBudget,
      currency: props.currency,
      status: props.status ?? "pending",
      requiresApproval: props.requiresApproval,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  approve(): PurchaseRequest {
    return PurchaseRequest.create({ ...this.toJSON(), status: "approved" });
  }

  toJSON(): PurchaseRequestProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      requesterId: this.requesterId,
      title: this.title,
      description: this.description,
      estimatedBudget: this.estimatedBudget,
      currency: this.currency,
      status: this.status,
      requiresApproval: this.requiresApproval,
      createdAt: this.createdAt,
    };
  }
}
