import type {
  CompanyId,
  ExecutiveConsensusId,
  ExecutiveParticipantId,
  ExecutiveRequestId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type ExecutiveEngineContribution = {
  participantId: ExecutiveParticipantId;
  opinion: string;
  confidence: Score;
  priority: Score;
  recommendation: string;
  risks: string[];
  opportunities: string[];
};

export type ConsensusStatus = "pending" | "in_progress" | "completed";

export type ExecutiveConsensusProps = {
  id: ExecutiveConsensusId;
  companyId: CompanyId;
  requestId: ExecutiveRequestId;
  contributions: ExecutiveEngineContribution[];
  consolidatedOpinion: string;
  consolidatedRecommendation: string;
  averageConfidence: Score;
  averagePriority: Score;
  consolidatedRisks: string[];
  consolidatedOpportunities: string[];
  status: ConsensusStatus;
  createdAt: string;
  completedAt?: string;
};

export class ExecutiveConsensus {
  readonly id: ExecutiveConsensusId;
  readonly companyId: CompanyId;
  readonly requestId: ExecutiveRequestId;
  readonly contributions: ExecutiveEngineContribution[];
  readonly consolidatedOpinion: string;
  readonly consolidatedRecommendation: string;
  readonly averageConfidence: Score;
  readonly averagePriority: Score;
  readonly consolidatedRisks: string[];
  readonly consolidatedOpportunities: string[];
  readonly status: ConsensusStatus;
  readonly createdAt: string;
  readonly completedAt?: string;

  private constructor(props: ExecutiveConsensusProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.requestId = props.requestId;
    this.contributions = props.contributions.map((c) => ({ ...c, risks: [...c.risks], opportunities: [...c.opportunities] }));
    this.consolidatedOpinion = props.consolidatedOpinion;
    this.consolidatedRecommendation = props.consolidatedRecommendation;
    this.averageConfidence = props.averageConfidence;
    this.averagePriority = props.averagePriority;
    this.consolidatedRisks = [...props.consolidatedRisks];
    this.consolidatedOpportunities = [...props.consolidatedOpportunities];
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.completedAt = props.completedAt;
  }

  static create(
    props: Omit<ExecutiveConsensusProps, "id" | "createdAt" | "status"> & {
      id?: ExecutiveConsensusId;
      createdAt?: string;
      status?: ConsensusStatus;
    },
  ): ExecutiveConsensus {
    return new ExecutiveConsensus({
      id: props.id ?? `consensus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      requestId: props.requestId,
      contributions: props.contributions,
      consolidatedOpinion: props.consolidatedOpinion.trim(),
      consolidatedRecommendation: props.consolidatedRecommendation.trim(),
      averageConfidence: clampScore(props.averageConfidence),
      averagePriority: clampScore(props.averagePriority),
      consolidatedRisks: props.consolidatedRisks,
      consolidatedOpportunities: props.consolidatedOpportunities,
      status: props.status ?? "pending",
      createdAt: props.createdAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
    });
  }

  complete(): ExecutiveConsensus {
    return new ExecutiveConsensus({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveConsensusProps {
    return {
      id: this.id,
      companyId: this.companyId,
      requestId: this.requestId,
      contributions: this.contributions.map((c) => ({
        ...c,
        risks: [...c.risks],
        opportunities: [...c.opportunities],
      })),
      consolidatedOpinion: this.consolidatedOpinion,
      consolidatedRecommendation: this.consolidatedRecommendation,
      averageConfidence: this.averageConfidence,
      averagePriority: this.averagePriority,
      consolidatedRisks: [...this.consolidatedRisks],
      consolidatedOpportunities: [...this.consolidatedOpportunities],
      status: this.status,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
    };
  }
}
