import type { OrganizationId } from "../../shared";

export type OrganizationStatus = "active" | "suspended" | "archived";

export type OrganizationProps = {
  id: OrganizationId;
  name: string;
  legalName: string;
  taxId: string;
  country: string;
  timezone: string;
  currency: string;
  industry: string;
  companySize: string;
  businessModel: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  status: OrganizationStatus;
};

export class Organization {
  readonly id: OrganizationId;
  readonly name: string;
  readonly legalName: string;
  readonly taxId: string;
  readonly country: string;
  readonly timezone: string;
  readonly currency: string;
  readonly industry: string;
  readonly companySize: string;
  readonly businessModel: string;
  readonly language: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status: OrganizationStatus;

  private constructor(props: OrganizationProps) {
    this.id = props.id;
    this.name = props.name;
    this.legalName = props.legalName;
    this.taxId = props.taxId;
    this.country = props.country;
    this.timezone = props.timezone;
    this.currency = props.currency;
    this.industry = props.industry;
    this.companySize = props.companySize;
    this.businessModel = props.businessModel;
    this.language = props.language;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.status = props.status;
  }

  static create(
    props: Omit<OrganizationProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: OrganizationId;
      createdAt?: string;
      updatedAt?: string;
      status?: OrganizationStatus;
    },
  ): Organization {
    if (!props.name.trim()) throw new Error("name is required");

    const now = new Date().toISOString();
    return new Organization({
      id: props.id ?? `org-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: props.name.trim(),
      legalName: props.legalName.trim(),
      taxId: props.taxId.trim(),
      country: props.country.trim(),
      timezone: props.timezone.trim(),
      currency: props.currency.trim(),
      industry: props.industry.trim(),
      companySize: props.companySize.trim(),
      businessModel: props.businessModel.trim(),
      language: props.language.trim(),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      status: props.status ?? "active",
    });
  }

  toJSON(): OrganizationProps {
    return {
      id: this.id,
      name: this.name,
      legalName: this.legalName,
      taxId: this.taxId,
      country: this.country,
      timezone: this.timezone,
      currency: this.currency,
      industry: this.industry,
      companySize: this.companySize,
      businessModel: this.businessModel,
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
    };
  }
}
