import type {
  AgencyId,
  ClientOnboardingId,
  ClientSuccessPlanId,
  ClientSuccessPlanStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientSuccessPlanProps = {
  id: ClientSuccessPlanId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  onboardingId: ClientOnboardingId;
  title: string;
  objectives: string[];
  status: ClientSuccessPlanStatus;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
};

export class ClientSuccessPlan {
  readonly id: ClientSuccessPlanId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly onboardingId: ClientOnboardingId;
  readonly title: string;
  readonly objectives: string[];
  readonly status: ClientSuccessPlanStatus;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientSuccessPlanProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.onboardingId = props.onboardingId;
    this.title = props.title;
    this.objectives = [...props.objectives];
    this.status = props.status;
    this.startsAt = props.startsAt;
    this.endsAt = props.endsAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ClientSuccessPlanProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: ClientSuccessPlanId;
      status?: ClientSuccessPlanStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientSuccessPlan {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new ClientSuccessPlan({
      id: props.id ?? `csplan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      onboardingId: props.onboardingId,
      title: props.title.trim(),
      objectives: props.objectives,
      status: props.status ?? "draft",
      startsAt: props.startsAt,
      endsAt: props.endsAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientSuccessPlanStatus): ClientSuccessPlan {
    return ClientSuccessPlan.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientSuccessPlanProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      onboardingId: this.onboardingId,
      title: this.title,
      objectives: [...this.objectives],
      status: this.status,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
