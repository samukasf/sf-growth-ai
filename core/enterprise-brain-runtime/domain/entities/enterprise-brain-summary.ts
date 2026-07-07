import type { Score } from "../../shared";
import { clampScore } from "../../shared";

export type EnterpriseBrainSummaryProps = {
  domain: string;
  headline: string;
  highlights: string[];
  recordCount: number;
  healthScore: Score;
  lastUpdatedAt: string;
};

export class EnterpriseBrainSummary {
  readonly domain: string;
  readonly headline: string;
  readonly highlights: string[];
  readonly recordCount: number;
  readonly healthScore: Score;
  readonly lastUpdatedAt: string;

  private constructor(props: EnterpriseBrainSummaryProps) {
    this.domain = props.domain;
    this.headline = props.headline;
    this.highlights = [...props.highlights];
    this.recordCount = props.recordCount;
    this.healthScore = props.healthScore;
    this.lastUpdatedAt = props.lastUpdatedAt;
  }

  static create(props: EnterpriseBrainSummaryProps): EnterpriseBrainSummary {
    return new EnterpriseBrainSummary({
      domain: props.domain,
      headline: props.headline,
      highlights: props.highlights,
      recordCount: props.recordCount,
      healthScore: clampScore(props.healthScore),
      lastUpdatedAt: props.lastUpdatedAt,
    });
  }

  toJSON(): EnterpriseBrainSummaryProps {
    return {
      domain: this.domain,
      headline: this.headline,
      highlights: [...this.highlights],
      recordCount: this.recordCount,
      healthScore: this.healthScore,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }
}
