import type {
  AgencyId,
  BusinessAlertId,
  BusinessAlertSeverity,
  BusinessAlertStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessAlertProps = {
  id: BusinessAlertId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  title: string;
  message: string;
  severity: BusinessAlertSeverity;
  status: BusinessAlertStatus;
  source: string;
  triggeredAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessAlert {
  readonly id: BusinessAlertId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly message: string;
  readonly severity: BusinessAlertSeverity;
  readonly status: BusinessAlertStatus;
  readonly source: string;
  readonly triggeredAt: string;
  readonly resolvedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessAlertProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.message = props.message;
    this.severity = props.severity;
    this.status = props.status;
    this.source = props.source;
    this.triggeredAt = props.triggeredAt;
    this.resolvedAt = props.resolvedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessAlertProps, "id" | "createdAt" | "updatedAt" | "status" | "triggeredAt"> & {
      id?: BusinessAlertId;
      status?: BusinessAlertStatus;
      triggeredAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessAlert {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessAlert({
      id: props.id ?? `balert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      title: props.title.trim(),
      message: props.message,
      severity: props.severity,
      status: props.status ?? "open",
      source: props.source,
      triggeredAt: props.triggeredAt ?? now,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  resolve(): BusinessAlert {
    return BusinessAlert.create({
      ...this.toJSON(),
      status: "resolved",
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessAlertProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      title: this.title,
      message: this.message,
      severity: this.severity,
      status: this.status,
      source: this.source,
      triggeredAt: this.triggeredAt,
      resolvedAt: this.resolvedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
