import type {
  CouncilMemberId,
  CouncilOpinionId,
  CouncilSessionId,
  CouncilSpecialistRole,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type CouncilOpinionProps = {
  id: CouncilOpinionId;
  sessionId: CouncilSessionId;
  memberId: CouncilMemberId;
  role: CouncilSpecialistRole;
  summary: string;
  recommendation: string;
  priority: Score;
  confidence: Score;
  risks: string[];
  opportunities: string[];
  submittedAt: string;
};

export class CouncilOpinion {
  readonly id: CouncilOpinionId;
  readonly sessionId: CouncilSessionId;
  readonly memberId: CouncilMemberId;
  readonly role: CouncilSpecialistRole;
  readonly summary: string;
  readonly recommendation: string;
  readonly priority: Score;
  readonly confidence: Score;
  readonly risks: string[];
  readonly opportunities: string[];
  readonly submittedAt: string;

  private constructor(props: CouncilOpinionProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.memberId = props.memberId;
    this.role = props.role;
    this.summary = props.summary;
    this.recommendation = props.recommendation;
    this.priority = props.priority;
    this.confidence = props.confidence;
    this.risks = [...props.risks];
    this.opportunities = [...props.opportunities];
    this.submittedAt = props.submittedAt;
  }

  static create(
    props: Omit<CouncilOpinionProps, "id" | "submittedAt"> & {
      id?: CouncilOpinionId;
      submittedAt?: string;
    },
  ): CouncilOpinion {
    return new CouncilOpinion({
      id: props.id ?? `copin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      memberId: props.memberId,
      role: props.role,
      summary: props.summary.trim(),
      recommendation: props.recommendation.trim(),
      priority: clampScore(props.priority),
      confidence: clampScore(props.confidence),
      risks: props.risks,
      opportunities: props.opportunities,
      submittedAt: props.submittedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CouncilOpinionProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      memberId: this.memberId,
      role: this.role,
      summary: this.summary,
      recommendation: this.recommendation,
      priority: this.priority,
      confidence: this.confidence,
      risks: [...this.risks],
      opportunities: [...this.opportunities],
      submittedAt: this.submittedAt,
    };
  }
}
