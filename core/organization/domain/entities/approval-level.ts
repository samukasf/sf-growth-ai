import type { ApprovalLevelId, OrganizationId } from "../../shared";
import type { AccessLevel } from "./role";

export type ApprovalLevelProps = {
  id: ApprovalLevelId;
  organizationId: OrganizationId;
  accessLevel: AccessLevel;
  label: string;
  maxAmount: number;
  unlimited: boolean;
  currency: string;
  order: number;
};

export class ApprovalLevel {
  readonly id: ApprovalLevelId;
  readonly organizationId: OrganizationId;
  readonly accessLevel: AccessLevel;
  readonly label: string;
  readonly maxAmount: number;
  readonly unlimited: boolean;
  readonly currency: string;
  readonly order: number;

  private constructor(props: ApprovalLevelProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.accessLevel = props.accessLevel;
    this.label = props.label;
    this.maxAmount = props.maxAmount;
    this.unlimited = props.unlimited;
    this.currency = props.currency;
    this.order = props.order;
  }

  static create(
    props: Omit<ApprovalLevelProps, "id"> & { id?: ApprovalLevelId },
  ): ApprovalLevel {
    return new ApprovalLevel({
      id: props.id ?? `approval-level-${Date.now()}`,
      organizationId: props.organizationId,
      accessLevel: props.accessLevel,
      label: props.label.trim(),
      maxAmount: props.maxAmount,
      unlimited: props.unlimited,
      currency: props.currency,
      order: props.order,
    });
  }

  toJSON(): ApprovalLevelProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      accessLevel: this.accessLevel,
      label: this.label,
      maxAmount: this.maxAmount,
      unlimited: this.unlimited,
      currency: this.currency,
      order: this.order,
    };
  }
}
