import type {
  AgencyId,
  ClientUpsellId,
  ClientUpsellStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientUpsellProps = {
  id: ClientUpsellId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  title: string;
  service: string;
  estimatedValue: number;
  currency: string;
  status: ClientUpsellStatus;
  confidence: number;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
};

export class ClientUpsell {
  readonly id: ClientUpsellId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly service: string;
  readonly estimatedValue: number;
  readonly currency: string;
  readonly status: ClientUpsellStatus;
  readonly confidence: number;
  readonly detectedAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientUpsellProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.service = props.service;
    this.estimatedValue = props.estimatedValue;
    this.currency = props.currency;
    this.status = props.status;
    this.confidence = props.confidence;
    this.detectedAt = props.detectedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      ClientUpsellProps,
      "id" | "createdAt" | "updatedAt" | "status" | "currency" | "confidence" | "detectedAt"
    > & {
      id?: ClientUpsellId;
      status?: ClientUpsellStatus;
      currency?: string;
      confidence?: number;
      detectedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientUpsell {
    if (!props.title.trim()) throw new Error("title is required");
    if (!props.service.trim()) throw new Error("service is required");
    const now = new Date().toISOString();
    return new ClientUpsell({
      id: props.id ?? `cup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      title: props.title.trim(),
      service: props.service.trim(),
      estimatedValue: props.estimatedValue,
      currency: props.currency ?? "EUR",
      status: props.status ?? "detected",
      confidence: props.confidence ?? 70,
      detectedAt: props.detectedAt ?? now,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientUpsellStatus): ClientUpsell {
    return ClientUpsell.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientUpsellProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      title: this.title,
      service: this.service,
      estimatedValue: this.estimatedValue,
      currency: this.currency,
      status: this.status,
      confidence: this.confidence,
      detectedAt: this.detectedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
