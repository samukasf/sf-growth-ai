import type {
  DecisionAuthorityId,
  OrganizationId,
  OrganizationMemberId,
} from "../../shared";
import type { AccessLevel } from "./role";

export type DecisionAuthorityProps = {
  id: DecisionAuthorityId;
  organizationId: OrganizationId;
  memberId: OrganizationMemberId;
  accessLevel: AccessLevel;
  approvalLimit: number;
  unlimited: boolean;
  currency: string;
  scopes: string[];
};

export class DecisionAuthority {
  readonly id: DecisionAuthorityId;
  readonly organizationId: OrganizationId;
  readonly memberId: OrganizationMemberId;
  readonly accessLevel: AccessLevel;
  readonly approvalLimit: number;
  readonly unlimited: boolean;
  readonly currency: string;
  readonly scopes: string[];

  private constructor(props: DecisionAuthorityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.memberId = props.memberId;
    this.accessLevel = props.accessLevel;
    this.approvalLimit = props.approvalLimit;
    this.unlimited = props.unlimited;
    this.currency = props.currency;
    this.scopes = [...props.scopes];
  }

  static create(
    props: Omit<DecisionAuthorityProps, "id"> & { id?: DecisionAuthorityId },
  ): DecisionAuthority {
    return new DecisionAuthority({
      id: props.id ?? `authority-${Date.now()}`,
      organizationId: props.organizationId,
      memberId: props.memberId,
      accessLevel: props.accessLevel,
      approvalLimit: props.approvalLimit,
      unlimited: props.unlimited,
      currency: props.currency,
      scopes: props.scopes,
    });
  }

  canApprove(amount: number): boolean {
    if (this.unlimited) return true;
    return amount <= this.approvalLimit;
  }

  toJSON(): DecisionAuthorityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      memberId: this.memberId,
      accessLevel: this.accessLevel,
      approvalLimit: this.approvalLimit,
      unlimited: this.unlimited,
      currency: this.currency,
      scopes: [...this.scopes],
    };
  }
}
