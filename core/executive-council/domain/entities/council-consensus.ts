import type { CouncilConsensusId, CouncilSessionId, Score } from "../../shared";
import { clampScore } from "../../shared";
import type { CouncilOpinionProps } from "./council-opinion";

export type CouncilConsensusProps = {
  id: CouncilConsensusId;
  sessionId: CouncilSessionId;
  consolidatedSummary: string;
  consolidatedRecommendation: string;
  averagePriority: Score;
  averageConfidence: Score;
  consolidatedRisks: string[];
  consolidatedOpportunities: string[];
  opinionCount: number;
  reachedAt: string;
};

export class CouncilConsensus {
  readonly id: CouncilConsensusId;
  readonly sessionId: CouncilSessionId;
  readonly consolidatedSummary: string;
  readonly consolidatedRecommendation: string;
  readonly averagePriority: Score;
  readonly averageConfidence: Score;
  readonly consolidatedRisks: string[];
  readonly consolidatedOpportunities: string[];
  readonly opinionCount: number;
  readonly reachedAt: string;

  private constructor(props: CouncilConsensusProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.consolidatedSummary = props.consolidatedSummary;
    this.consolidatedRecommendation = props.consolidatedRecommendation;
    this.averagePriority = props.averagePriority;
    this.averageConfidence = props.averageConfidence;
    this.consolidatedRisks = [...props.consolidatedRisks];
    this.consolidatedOpportunities = [...props.consolidatedOpportunities];
    this.opinionCount = props.opinionCount;
    this.reachedAt = props.reachedAt;
  }

  static create(
    props: Omit<CouncilConsensusProps, "id" | "reachedAt"> & {
      id?: CouncilConsensusId;
      reachedAt?: string;
    },
  ): CouncilConsensus {
    return new CouncilConsensus({
      id: props.id ?? `ccons-${Date.now()}`,
      sessionId: props.sessionId,
      consolidatedSummary: props.consolidatedSummary,
      consolidatedRecommendation: props.consolidatedRecommendation,
      averagePriority: clampScore(props.averagePriority),
      averageConfidence: clampScore(props.averageConfidence),
      consolidatedRisks: props.consolidatedRisks,
      consolidatedOpportunities: props.consolidatedOpportunities,
      opinionCount: props.opinionCount,
      reachedAt: props.reachedAt ?? new Date().toISOString(),
    });
  }

  static fromOpinions(
    sessionId: CouncilSessionId,
    opinions: CouncilOpinionProps[],
  ): CouncilConsensus {
    const count = opinions.length;
    const avg = (values: number[]) =>
      count > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / count) : 0;

    return CouncilConsensus.create({
      sessionId,
      consolidatedSummary: opinions.map((o) => `[${o.role}] ${o.summary}`).join(" | "),
      consolidatedRecommendation: opinions.map((o) => o.recommendation).join(" "),
      averagePriority: avg(opinions.map((o) => o.priority)),
      averageConfidence: avg(opinions.map((o) => o.confidence)),
      consolidatedRisks: [...new Set(opinions.flatMap((o) => o.risks))],
      consolidatedOpportunities: [...new Set(opinions.flatMap((o) => o.opportunities))],
      opinionCount: count,
    });
  }

  toJSON(): CouncilConsensusProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      consolidatedSummary: this.consolidatedSummary,
      consolidatedRecommendation: this.consolidatedRecommendation,
      averagePriority: this.averagePriority,
      averageConfidence: this.averageConfidence,
      consolidatedRisks: [...this.consolidatedRisks],
      consolidatedOpportunities: [...this.consolidatedOpportunities],
      opinionCount: this.opinionCount,
      reachedAt: this.reachedAt,
    };
  }
}
