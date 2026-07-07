import type { CustomerId, CustomerJourneyId, OrganizationId } from "../../shared";

export type JourneyStage =
  | "awareness"
  | "consideration"
  | "decision"
  | "onboarding"
  | "retention"
  | "expansion"
  | "advocacy";

export type JourneyMilestone = {
  id: string;
  stage: JourneyStage;
  title: string;
  completedAt?: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
};

export type CustomerJourneyProps = {
  id: CustomerJourneyId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  currentStage: JourneyStage;
  milestones: JourneyMilestone[];
  healthScore: number;
  nextBestAction?: string;
  startedAt: string;
  updatedAt: string;
};

export class CustomerJourney {
  readonly id: CustomerJourneyId;
  readonly organizationId: OrganizationId;
  readonly customerId: CustomerId;
  readonly currentStage: JourneyStage;
  readonly milestones: JourneyMilestone[];
  readonly healthScore: number;
  readonly nextBestAction?: string;
  readonly startedAt: string;
  readonly updatedAt: string;

  private constructor(props: CustomerJourneyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.currentStage = props.currentStage;
    this.milestones = props.milestones.map((m) => ({ ...m }));
    this.healthScore = props.healthScore;
    this.nextBestAction = props.nextBestAction;
    this.startedAt = props.startedAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CustomerJourneyProps, "id" | "startedAt" | "updatedAt"> & {
      id?: CustomerJourneyId;
      startedAt?: string;
      updatedAt?: string;
    },
  ): CustomerJourney {
    const now = new Date().toISOString();
    return new CustomerJourney({
      id: props.id ?? `journey-${Date.now()}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      currentStage: props.currentStage,
      milestones: props.milestones,
      healthScore: props.healthScore,
      nextBestAction: props.nextBestAction,
      startedAt: props.startedAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): CustomerJourneyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      currentStage: this.currentStage,
      milestones: this.milestones.map((m) => ({ ...m })),
      healthScore: this.healthScore,
      nextBestAction: this.nextBestAction,
      startedAt: this.startedAt,
      updatedAt: this.updatedAt,
    };
  }
}
