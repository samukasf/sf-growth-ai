import type { CompanyId, RecommendationPatternId, Score, WisdomId } from "../../shared";
import { clampScore } from "../../shared";

export type RecommendationPriority = "low" | "medium" | "high" | "critical";

export type ExecutiveRecommendationPatternProps = {
  id: RecommendationPatternId;
  companyId: CompanyId;
  wisdomId: WisdomId;
  title: string;
  description: string;
  priority: RecommendationPriority;
  confidence: Score;
  validated: boolean;
  createdAt: string;
};

export class ExecutiveRecommendationPattern {
  readonly id: RecommendationPatternId;
  readonly companyId: CompanyId;
  readonly wisdomId: WisdomId;
  readonly title: string;
  readonly description: string;
  readonly priority: RecommendationPriority;
  readonly confidence: Score;
  readonly validated: boolean;
  readonly createdAt: string;

  private constructor(props: ExecutiveRecommendationPatternProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this.confidence = props.confidence;
    this.validated = props.validated;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ExecutiveRecommendationPatternProps, "id" | "createdAt" | "validated"> & {
      id?: RecommendationPatternId;
      createdAt?: string;
      validated?: boolean;
    },
  ): ExecutiveRecommendationPattern {
    return new ExecutiveRecommendationPattern({
      id: props.id ?? `rec-pattern-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      title: props.title.trim(),
      description: props.description.trim(),
      priority: props.priority,
      confidence: clampScore(props.confidence),
      validated: props.validated ?? false,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  markValidated(): ExecutiveRecommendationPattern {
    return new ExecutiveRecommendationPattern({
      ...this.toJSON(),
      validated: true,
      confidence: clampScore(this.confidence + 10),
    });
  }

  toJSON(): ExecutiveRecommendationPatternProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      title: this.title,
      description: this.description,
      priority: this.priority,
      confidence: this.confidence,
      validated: this.validated,
      createdAt: this.createdAt,
    };
  }
}
