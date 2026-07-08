import type {
  AgencyId,
  ClientContractId,
  ClientOnboardingId,
  ClientOnboardingStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientOnboardingChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
};

export type ClientOnboardingProps = {
  id: ClientOnboardingId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  contractId: ClientContractId;
  status: ClientOnboardingStatus;
  checklist: ClientOnboardingChecklistItem[];
  progressPercent: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_CHECKLIST: ClientOnboardingChecklistItem[] = [
  { id: "tenant", label: "Tenant provisionado", completed: false },
  { id: "access", label: "Acessos recebidos", completed: false },
  { id: "brand", label: "Brand assets recebidos", completed: false },
  { id: "brain", label: "Company Brain configurado", completed: false },
  { id: "kickoff", label: "Kickoff realizado", completed: false },
];

export class ClientOnboarding {
  readonly id: ClientOnboardingId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly contractId: ClientContractId;
  readonly status: ClientOnboardingStatus;
  readonly checklist: ClientOnboardingChecklistItem[];
  readonly progressPercent: number;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientOnboardingProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.contractId = props.contractId;
    this.status = props.status;
    this.checklist = props.checklist.map((item) => ({ ...item }));
    this.progressPercent = props.progressPercent;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      ClientOnboardingProps,
      "id" | "createdAt" | "updatedAt" | "status" | "checklist" | "progressPercent" | "startedAt"
    > & {
      id?: ClientOnboardingId;
      status?: ClientOnboardingStatus;
      checklist?: ClientOnboardingChecklistItem[];
      progressPercent?: number;
      startedAt?: string;
      completedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientOnboarding {
    const now = new Date().toISOString();
    const checklist = props.checklist ?? DEFAULT_CHECKLIST.map((item) => ({ ...item }));
    const completed = checklist.filter((item) => item.completed).length;
    const progressPercent =
      props.progressPercent ?? Math.round((completed / checklist.length) * 100);
    return new ClientOnboarding({
      id: props.id ?? `cob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      contractId: props.contractId,
      status: props.status ?? "pending",
      checklist,
      progressPercent,
      startedAt: props.startedAt ?? now,
      completedAt: props.completedAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  completeItem(itemId: string): ClientOnboarding {
    const now = new Date().toISOString();
    const checklist = this.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: true, completedAt: now } : item,
    );
    const completed = checklist.filter((item) => item.completed).length;
    const progressPercent = Math.round((completed / checklist.length) * 100);
    const allDone = progressPercent === 100;
    return ClientOnboarding.create({
      ...this.toJSON(),
      checklist,
      progressPercent,
      status: allDone ? "completed" : "in_progress",
      completedAt: allDone ? now : this.completedAt,
      updatedAt: now,
    });
  }

  toJSON(): ClientOnboardingProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      contractId: this.contractId,
      status: this.status,
      checklist: this.checklist.map((item) => ({ ...item })),
      progressPercent: this.progressPercent,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
