import type { LeadId, OrganizationId } from "../../shared";

export type LeadStatus = "new" | "contacted" | "qualified" | "disqualified" | "converted";
export type LeadSource = "website" | "referral" | "campaign" | "event" | "manual" | "other";

export type LeadProps = {
  id: LeadId;
  organizationId: OrganizationId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  ownerId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export class Lead {
  readonly id: LeadId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly company?: string;
  readonly source: LeadSource;
  readonly status: LeadStatus;
  readonly score: number;
  readonly ownerId?: string;
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: LeadProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.company = props.company;
    this.source = props.source;
    this.status = props.status;
    this.score = props.score;
    this.ownerId = props.ownerId;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<LeadProps, "id" | "createdAt" | "updatedAt" | "status" | "score"> & {
      id?: LeadId;
      createdAt?: string;
      updatedAt?: string;
      status?: LeadStatus;
      score?: number;
    },
  ): Lead {
    if (!props.name.trim()) throw new Error("name is required");
    if (!props.email.trim()) throw new Error("email is required");

    const now = new Date().toISOString();
    return new Lead({
      id: props.id ?? `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      email: props.email.trim(),
      phone: props.phone,
      company: props.company,
      source: props.source,
      status: props.status ?? "new",
      score: props.score ?? 0,
      ownerId: props.ownerId,
      notes: props.notes.trim(),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  qualify(score: number): Lead {
    return Lead.create({
      ...this.toJSON(),
      status: "qualified",
      score,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): LeadProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      source: this.source,
      status: this.status,
      score: this.score,
      ownerId: this.ownerId,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
