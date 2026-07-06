import type { CompanyId, DecisionHistoryId, Score, WisdomId } from "../../shared";
import { clampScore } from "../../shared";

export type DecisionOutcome = "success" | "partial" | "failure" | "pending";

export type ExecutiveDecisionHistoryProps = {
  id: DecisionHistoryId;
  companyId: CompanyId;
  wisdomId: WisdomId;
  decisionTitle: string;
  decisionContext: string;
  outcome: DecisionOutcome;
  successRate: Score;
  roi: number;
  decidedAt: string;
};

export class ExecutiveDecisionHistory {
  readonly id: DecisionHistoryId;
  readonly companyId: CompanyId;
  readonly wisdomId: WisdomId;
  readonly decisionTitle: string;
  readonly decisionContext: string;
  readonly outcome: DecisionOutcome;
  readonly successRate: Score;
  readonly roi: number;
  readonly decidedAt: string;

  private constructor(props: ExecutiveDecisionHistoryProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.decisionTitle = props.decisionTitle;
    this.decisionContext = props.decisionContext;
    this.outcome = props.outcome;
    this.successRate = props.successRate;
    this.roi = props.roi;
    this.decidedAt = props.decidedAt;
  }

  static create(
    props: Omit<ExecutiveDecisionHistoryProps, "id" | "decidedAt"> & {
      id?: DecisionHistoryId;
      decidedAt?: string;
    },
  ): ExecutiveDecisionHistory {
    return new ExecutiveDecisionHistory({
      id: props.id ?? `decision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      decisionTitle: props.decisionTitle.trim(),
      decisionContext: props.decisionContext.trim(),
      outcome: props.outcome,
      successRate: clampScore(props.successRate),
      roi: props.roi,
      decidedAt: props.decidedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveDecisionHistoryProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      decisionTitle: this.decisionTitle,
      decisionContext: this.decisionContext,
      outcome: this.outcome,
      successRate: this.successRate,
      roi: this.roi,
      decidedAt: this.decidedAt,
    };
  }
}
