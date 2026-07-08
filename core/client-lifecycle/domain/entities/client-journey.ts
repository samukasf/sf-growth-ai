import type {
  AgencyId,
  ClientJourneyId,
  ClientJourneyPhase,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientExecutiveStackProps = {
  companyBrainId: string;
  executiveMemoryId: string;
  executiveTimelineId: string;
  executiveDashboardId: string;
  executiveMissionsId: string;
  executiveCouncilId: string;
};

export type ClientJourneyProps = {
  id: ClientJourneyId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  clientName: string;
  phase: ClientJourneyPhase;
  leadId?: string;
  opportunityId?: string;
  proposalId?: string;
  contractId?: string;
  onboardingId?: string;
  successPlanId?: string;
  relationshipId?: string;
  executiveStack: ClientExecutiveStackProps;
  healthScore: number;
  growthScore: number;
  companyBrainActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export class ClientJourney {
  readonly id: ClientJourneyId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly clientName: string;
  readonly phase: ClientJourneyPhase;
  readonly leadId?: string;
  readonly opportunityId?: string;
  readonly proposalId?: string;
  readonly contractId?: string;
  readonly onboardingId?: string;
  readonly successPlanId?: string;
  readonly relationshipId?: string;
  readonly executiveStack: ClientExecutiveStackProps;
  readonly healthScore: number;
  readonly growthScore: number;
  readonly companyBrainActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientJourneyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.clientName = props.clientName;
    this.phase = props.phase;
    this.leadId = props.leadId;
    this.opportunityId = props.opportunityId;
    this.proposalId = props.proposalId;
    this.contractId = props.contractId;
    this.onboardingId = props.onboardingId;
    this.successPlanId = props.successPlanId;
    this.relationshipId = props.relationshipId;
    this.executiveStack = { ...props.executiveStack };
    this.healthScore = props.healthScore;
    this.growthScore = props.growthScore;
    this.companyBrainActive = props.companyBrainActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createExecutiveStack(companyId: CompanyId): ClientExecutiveStackProps {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      companyBrainId: `cbrain-${companyId}-${suffix}`,
      executiveMemoryId: `emem-${companyId}-${suffix}`,
      executiveTimelineId: `etimeline-${companyId}-${suffix}`,
      executiveDashboardId: `edash-${companyId}-${suffix}`,
      executiveMissionsId: `emissions-${companyId}-${suffix}`,
      executiveCouncilId: `ecouncil-${companyId}-${suffix}`,
    };
  }

  static create(
    props: Omit<
      ClientJourneyProps,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "phase"
      | "executiveStack"
      | "healthScore"
      | "growthScore"
      | "companyBrainActive"
    > & {
      id?: ClientJourneyId;
      phase?: ClientJourneyPhase;
      executiveStack?: ClientExecutiveStackProps;
      healthScore?: number;
      growthScore?: number;
      companyBrainActive?: boolean;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientJourney {
    if (!props.clientName.trim()) throw new Error("clientName is required");
    const now = new Date().toISOString();
    return new ClientJourney({
      id: props.id ?? `cjourney-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      clientName: props.clientName.trim(),
      phase: props.phase ?? "lead",
      leadId: props.leadId,
      opportunityId: props.opportunityId,
      proposalId: props.proposalId,
      contractId: props.contractId,
      onboardingId: props.onboardingId,
      successPlanId: props.successPlanId,
      relationshipId: props.relationshipId,
      executiveStack: props.executiveStack ?? ClientJourney.createExecutiveStack(props.companyId),
      healthScore: props.healthScore ?? 0,
      growthScore: props.growthScore ?? 0,
      companyBrainActive: props.companyBrainActive ?? false,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  advanceTo(phase: ClientJourneyPhase, refs?: Partial<ClientJourneyProps>): ClientJourney {
    return ClientJourney.create({
      ...this.toJSON(),
      ...refs,
      phase,
      updatedAt: new Date().toISOString(),
    });
  }

  withScores(healthScore: number, growthScore: number): ClientJourney {
    return ClientJourney.create({
      ...this.toJSON(),
      healthScore,
      growthScore,
      updatedAt: new Date().toISOString(),
    });
  }

  withCompanyBrainActive(active: boolean): ClientJourney {
    return ClientJourney.create({
      ...this.toJSON(),
      companyBrainActive: active,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientJourneyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      clientName: this.clientName,
      phase: this.phase,
      leadId: this.leadId,
      opportunityId: this.opportunityId,
      proposalId: this.proposalId,
      contractId: this.contractId,
      onboardingId: this.onboardingId,
      successPlanId: this.successPlanId,
      relationshipId: this.relationshipId,
      executiveStack: { ...this.executiveStack },
      healthScore: this.healthScore,
      growthScore: this.growthScore,
      companyBrainActive: this.companyBrainActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
