import type { DiscoveryScoreId, DiscoverySessionId } from "../../shared";
import { clampScore } from "../../shared";

export type DiscoveryScoreDimension = {
  key: string;
  label: string;
  score: number;
  weight: number;
};

export type DiscoveryScoreProps = {
  id: DiscoveryScoreId;
  sessionId: DiscoverySessionId;
  overallScore: number;
  dimensions: DiscoveryScoreDimension[];
  profileCompleteness: number;
  dataQuality: number;
  readinessScore: number;
  calculatedAt: string;
};

export class DiscoveryScore {
  readonly id: DiscoveryScoreId;
  readonly sessionId: DiscoverySessionId;
  readonly overallScore: number;
  readonly dimensions: DiscoveryScoreDimension[];
  readonly profileCompleteness: number;
  readonly dataQuality: number;
  readonly readinessScore: number;
  readonly calculatedAt: string;

  private constructor(props: DiscoveryScoreProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.overallScore = props.overallScore;
    this.dimensions = props.dimensions.map((d) => ({ ...d }));
    this.profileCompleteness = props.profileCompleteness;
    this.dataQuality = props.dataQuality;
    this.readinessScore = props.readinessScore;
    this.calculatedAt = props.calculatedAt;
  }

  static create(
    props: Omit<DiscoveryScoreProps, "id" | "calculatedAt" | "overallScore"> & {
      id?: DiscoveryScoreId;
      calculatedAt?: string;
      overallScore?: number;
    },
  ): DiscoveryScore {
    const overallScore =
      props.overallScore ??
      clampScore(
        props.dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) /
          Math.max(props.dimensions.reduce((sum, d) => sum + d.weight, 0), 1),
      );
    return new DiscoveryScore({
      id: props.id ?? `dscr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      overallScore,
      dimensions: props.dimensions,
      profileCompleteness: clampScore(props.profileCompleteness),
      dataQuality: clampScore(props.dataQuality),
      readinessScore: clampScore(props.readinessScore),
      calculatedAt: props.calculatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DiscoveryScoreProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      overallScore: this.overallScore,
      dimensions: this.dimensions.map((d) => ({ ...d })),
      profileCompleteness: this.profileCompleteness,
      dataQuality: this.dataQuality,
      readinessScore: this.readinessScore,
      calculatedAt: this.calculatedAt,
    };
  }
}
