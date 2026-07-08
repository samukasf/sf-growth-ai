import type { BusinessOpportunityId, OpportunityExecutionPlanId } from "../../shared";

export type ExecutionPhase = {
  id: string;
  name: string;
  durationWeeks: number;
  deliverables: string[];
  owner?: string;
};

export type OpportunityExecutionPlanProps = {
  id: OpportunityExecutionPlanId;
  opportunityId: BusinessOpportunityId;
  phases: ExecutionPhase[];
  totalDurationWeeks: number;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  prerequisites: string[];
};

export class OpportunityExecutionPlan {
  readonly id: OpportunityExecutionPlanId;
  readonly opportunityId: BusinessOpportunityId;
  readonly phases: ExecutionPhase[];
  readonly totalDurationWeeks: number;
  readonly estimatedStartDate?: string;
  readonly estimatedEndDate?: string;
  readonly prerequisites: string[];

  private constructor(props: OpportunityExecutionPlanProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.phases = props.phases;
    this.totalDurationWeeks = props.totalDurationWeeks;
    this.estimatedStartDate = props.estimatedStartDate;
    this.estimatedEndDate = props.estimatedEndDate;
    this.prerequisites = props.prerequisites;
  }

  static create(
    props: Omit<OpportunityExecutionPlanProps, "id" | "totalDurationWeeks"> & {
      id?: OpportunityExecutionPlanId;
      totalDurationWeeks?: number;
    },
  ): OpportunityExecutionPlan {
    const totalDurationWeeks =
      props.totalDurationWeeks ??
      props.phases.reduce((sum, phase) => sum + phase.durationWeeks, 0);
    return new OpportunityExecutionPlan({
      id: props.id ?? `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      phases: props.phases,
      totalDurationWeeks,
      estimatedStartDate: props.estimatedStartDate,
      estimatedEndDate: props.estimatedEndDate,
      prerequisites: props.prerequisites,
    });
  }

  toJSON(): OpportunityExecutionPlanProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      phases: this.phases,
      totalDurationWeeks: this.totalDurationWeeks,
      estimatedStartDate: this.estimatedStartDate,
      estimatedEndDate: this.estimatedEndDate,
      prerequisites: this.prerequisites,
    };
  }
}
