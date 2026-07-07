import type { OrganizationId, PartnerId } from "../../shared";

export type PartnerType = "reseller" | "referral" | "strategic" | "technology" | "channel";
export type PartnerStatus = "active" | "inactive" | "pending";

export type PartnerProps = {
  id: PartnerId;
  organizationId: OrganizationId;
  name: string;
  email: string;
  type: PartnerType;
  status: PartnerStatus;
  revenueShare: number;
  createdAt: string;
  updatedAt: string;
};

export class Partner {
  readonly id: PartnerId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly email: string;
  readonly type: PartnerType;
  readonly status: PartnerStatus;
  readonly revenueShare: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: PartnerProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.type = props.type;
    this.status = props.status;
    this.revenueShare = props.revenueShare;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<PartnerProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: PartnerId;
      createdAt?: string;
      updatedAt?: string;
      status?: PartnerStatus;
    },
  ): Partner {
    const now = new Date().toISOString();
    return new Partner({
      id: props.id ?? `partner-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      email: props.email.trim(),
      type: props.type,
      status: props.status ?? "pending",
      revenueShare: props.revenueShare,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): PartnerProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      email: this.email,
      type: this.type,
      status: this.status,
      revenueShare: this.revenueShare,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
