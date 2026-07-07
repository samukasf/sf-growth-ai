import type { CustomerId, OpportunityId, OrganizationId, PipelineStageId } from "../../shared";

export type OpportunityStatus = "open" | "won" | "lost" | "on_hold";

export type OpportunityProps = {
  id: OpportunityId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  title: string;
  description: string;
  value: number;
  currency: string;
  stageId: PipelineStageId;
  status: OpportunityStatus;
  probability: number;
  expectedCloseDate?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
};

export class Opportunity {
  readonly id: OpportunityId;
  readonly organizationId: OrganizationId;
  readonly customerId: CustomerId;
  readonly title: string;
  readonly description: string;
  readonly value: number;
  readonly currency: string;
  readonly stageId: PipelineStageId;
  readonly status: OpportunityStatus;
  readonly probability: number;
  readonly expectedCloseDate?: string;
  readonly ownerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: OpportunityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.title = props.title;
    this.description = props.description;
    this.value = props.value;
    this.currency = props.currency;
    this.stageId = props.stageId;
    this.status = props.status;
    this.probability = props.probability;
    this.expectedCloseDate = props.expectedCloseDate;
    this.ownerId = props.ownerId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<OpportunityProps, "id" | "createdAt" | "updatedAt" | "status" | "probability"> & {
      id?: OpportunityId;
      createdAt?: string;
      updatedAt?: string;
      status?: OpportunityStatus;
      probability?: number;
    },
  ): Opportunity {
    const now = new Date().toISOString();
    return new Opportunity({
      id: props.id ?? `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      title: props.title.trim(),
      description: props.description.trim(),
      value: props.value,
      currency: props.currency,
      stageId: props.stageId,
      status: props.status ?? "open",
      probability: props.probability ?? 20,
      expectedCloseDate: props.expectedCloseDate,
      ownerId: props.ownerId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): OpportunityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      title: this.title,
      description: this.description,
      value: this.value,
      currency: this.currency,
      stageId: this.stageId,
      status: this.status,
      probability: this.probability,
      expectedCloseDate: this.expectedCloseDate,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
