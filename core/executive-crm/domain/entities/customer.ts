import type { CustomerId, LeadId, OrganizationId } from "../../shared";

export type CustomerStatus = "active" | "at_risk" | "lost" | "recovered" | "churned";
export type CustomerSegment = "enterprise" | "mid_market" | "smb" | "individual";

export type CustomerProps = {
  id: CustomerId;
  organizationId: OrganizationId;
  leadId?: LeadId;
  name: string;
  email: string;
  phone?: string;
  company: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  healthScore: number;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
};

export class Customer {
  readonly id: CustomerId;
  readonly organizationId: OrganizationId;
  readonly leadId?: LeadId;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly company: string;
  readonly segment: CustomerSegment;
  readonly status: CustomerStatus;
  readonly healthScore: number;
  readonly ownerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: CustomerProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.leadId = props.leadId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.company = props.company;
    this.segment = props.segment;
    this.status = props.status;
    this.healthScore = props.healthScore;
    this.ownerId = props.ownerId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CustomerProps, "id" | "createdAt" | "updatedAt" | "status" | "healthScore"> & {
      id?: CustomerId;
      createdAt?: string;
      updatedAt?: string;
      status?: CustomerStatus;
      healthScore?: number;
    },
  ): Customer {
    const now = new Date().toISOString();
    return new Customer({
      id: props.id ?? `customer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      leadId: props.leadId,
      name: props.name.trim(),
      email: props.email.trim(),
      phone: props.phone,
      company: props.company.trim(),
      segment: props.segment,
      status: props.status ?? "active",
      healthScore: props.healthScore ?? 70,
      ownerId: props.ownerId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  markLost(): Customer {
    return Customer.create({
      ...this.toJSON(),
      status: "lost",
      updatedAt: new Date().toISOString(),
    });
  }

  recover(): Customer {
    return Customer.create({
      ...this.toJSON(),
      status: "recovered",
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): CustomerProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      leadId: this.leadId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      segment: this.segment,
      status: this.status,
      healthScore: this.healthScore,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
