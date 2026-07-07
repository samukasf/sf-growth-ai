import type { Score } from "../../shared";
import { clampScore } from "../../shared";

export type EnterpriseBrainHealthProps = {
  overallScore: Score;
  status: "critical" | "degraded" | "healthy" | "optimal";
  activeSources: number;
  totalSources: number;
  issues: string[];
  checkedAt: string;
};

export class EnterpriseBrainHealth {
  readonly overallScore: Score;
  readonly status: EnterpriseBrainHealthProps["status"];
  readonly activeSources: number;
  readonly totalSources: number;
  readonly issues: string[];
  readonly checkedAt: string;

  private constructor(props: EnterpriseBrainHealthProps) {
    this.overallScore = props.overallScore;
    this.status = props.status;
    this.activeSources = props.activeSources;
    this.totalSources = props.totalSources;
    this.issues = [...props.issues];
    this.checkedAt = props.checkedAt;
  }

  static create(props: Omit<EnterpriseBrainHealthProps, "checkedAt"> & { checkedAt?: string }) {
    return new EnterpriseBrainHealth({
      overallScore: clampScore(props.overallScore),
      status: props.status,
      activeSources: props.activeSources,
      totalSources: props.totalSources,
      issues: props.issues,
      checkedAt: props.checkedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): EnterpriseBrainHealthProps {
    return {
      overallScore: this.overallScore,
      status: this.status,
      activeSources: this.activeSources,
      totalSources: this.totalSources,
      issues: [...this.issues],
      checkedAt: this.checkedAt,
    };
  }
}
