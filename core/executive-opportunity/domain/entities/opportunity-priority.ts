import type {
  BusinessOpportunityId,
  OpportunityPriorityId,
  OpportunityPriorityLevel,
} from "../../shared";

export type OpportunityPriorityProps = {
  id: OpportunityPriorityId;
  opportunityId: BusinessOpportunityId;
  level: OpportunityPriorityLevel;
  score: number;
  rationale: string;
  urgency: number;
  strategicAlignment: number;
};

export class OpportunityPriority {
  readonly id: OpportunityPriorityId;
  readonly opportunityId: BusinessOpportunityId;
  readonly level: OpportunityPriorityLevel;
  readonly score: number;
  readonly rationale: string;
  readonly urgency: number;
  readonly strategicAlignment: number;

  private constructor(props: OpportunityPriorityProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.level = props.level;
    this.score = props.score;
    this.rationale = props.rationale;
    this.urgency = props.urgency;
    this.strategicAlignment = props.strategicAlignment;
  }

  static create(
    props: Omit<OpportunityPriorityProps, "id"> & { id?: OpportunityPriorityId },
  ): OpportunityPriority {
    return new OpportunityPriority({
      id: props.id ?? `priority-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      level: props.level,
      score: Math.max(0, Math.min(100, props.score)),
      rationale: props.rationale,
      urgency: Math.max(0, Math.min(100, props.urgency)),
      strategicAlignment: Math.max(0, Math.min(100, props.strategicAlignment)),
    });
  }

  toJSON(): OpportunityPriorityProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      level: this.level,
      score: this.score,
      rationale: this.rationale,
      urgency: this.urgency,
      strategicAlignment: this.strategicAlignment,
    };
  }
}
