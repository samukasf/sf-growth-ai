import type { CouncilConsensusId, CouncilDecisionId, CouncilSessionId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type CouncilDecisionProps = {
  id: CouncilDecisionId;
  sessionId: CouncilSessionId;
  consensusId: CouncilConsensusId;
  decision: string;
  rationale: string;
  confidence: Score;
  approvedByCeo: boolean;
  decidedAt: string;
};

export class CouncilDecision {
  readonly id: CouncilDecisionId;
  readonly sessionId: CouncilSessionId;
  readonly consensusId: CouncilConsensusId;
  readonly decision: string;
  readonly rationale: string;
  readonly confidence: Score;
  readonly approvedByCeo: boolean;
  readonly decidedAt: string;

  private constructor(props: CouncilDecisionProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.consensusId = props.consensusId;
    this.decision = props.decision;
    this.rationale = props.rationale;
    this.confidence = props.confidence;
    this.approvedByCeo = props.approvedByCeo;
    this.decidedAt = props.decidedAt;
  }

  static create(
    props: Omit<CouncilDecisionProps, "id" | "decidedAt"> & {
      id?: CouncilDecisionId;
      decidedAt?: string;
    },
  ): CouncilDecision {
    return new CouncilDecision({
      id: props.id ?? `cdec-${Date.now()}`,
      sessionId: props.sessionId,
      consensusId: props.consensusId,
      decision: props.decision.trim(),
      rationale: props.rationale.trim(),
      confidence: clampScore(props.confidence),
      approvedByCeo: props.approvedByCeo,
      decidedAt: props.decidedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CouncilDecisionProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      consensusId: this.consensusId,
      decision: this.decision,
      rationale: this.rationale,
      confidence: this.confidence,
      approvedByCeo: this.approvedByCeo,
      decidedAt: this.decidedAt,
    };
  }
}
