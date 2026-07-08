import type { AgencyId, AgencyPartnerId, OrganizationId } from "../../shared";

export type AgencyPartnerType = "media" | "creative" | "technology" | "consulting" | "vendor";

export type AgencyPartnerProps = {
  id: AgencyPartnerId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  name: string;
  type: AgencyPartnerType;
  contactEmail?: string;
  createdAt: string;
};

export class AgencyPartner {
  readonly id: AgencyPartnerId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly name: string;
  readonly type: AgencyPartnerType;
  readonly contactEmail?: string;
  readonly createdAt: string;

  private constructor(props: AgencyPartnerProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.name = props.name;
    this.type = props.type;
    this.contactEmail = props.contactEmail;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyPartnerProps, "id" | "createdAt"> & {
      id?: AgencyPartnerId;
      createdAt?: string;
    },
  ): AgencyPartner {
    return new AgencyPartner({
      id: props.id ?? `apartner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      name: props.name.trim(),
      type: props.type,
      contactEmail: props.contactEmail,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyPartnerProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      name: this.name,
      type: this.type,
      contactEmail: this.contactEmail,
      createdAt: this.createdAt,
    };
  }
}
