import type {
  CompanyId,
  KnowledgeId,
  LearningId,
  Score,
  WisdomId,
} from "../../shared";
import { clampScore } from "../../shared";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ExecutiveWisdomProps = {
  id: WisdomId;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  knowledgeIds: KnowledgeId[];
  learningIds: LearningId[];
  confidence: Score;
  importance: Score;
  businessImpact: Score;
  risk: RiskLevel;
  recommendation: string;
  reasoning: string;
  expectedOutcome: string;
  successRate: Score;
  roi: number;
  tags: string[];
};

export type CreateExecutiveWisdomProps = Omit<
  ExecutiveWisdomProps,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: WisdomId;
  createdAt?: string;
  updatedAt?: string;
};

export class ExecutiveWisdom {
  readonly id: WisdomId;
  readonly companyId: CompanyId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly knowledgeIds: KnowledgeId[];
  readonly learningIds: LearningId[];
  readonly confidence: Score;
  readonly importance: Score;
  readonly businessImpact: Score;
  readonly risk: RiskLevel;
  readonly recommendation: string;
  readonly reasoning: string;
  readonly expectedOutcome: string;
  readonly successRate: Score;
  readonly roi: number;
  readonly tags: string[];

  private constructor(props: ExecutiveWisdomProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.knowledgeIds = [...props.knowledgeIds];
    this.learningIds = [...props.learningIds];
    this.confidence = props.confidence;
    this.importance = props.importance;
    this.businessImpact = props.businessImpact;
    this.risk = props.risk;
    this.recommendation = props.recommendation;
    this.reasoning = props.reasoning;
    this.expectedOutcome = props.expectedOutcome;
    this.successRate = props.successRate;
    this.roi = props.roi;
    this.tags = [...props.tags];
  }

  static create(props: CreateExecutiveWisdomProps): ExecutiveWisdom {
    if (!props.companyId.trim()) {
      throw new Error("companyId is required");
    }
    if (!props.recommendation.trim()) {
      throw new Error("recommendation is required");
    }

    const now = new Date().toISOString();

    return new ExecutiveWisdom({
      id: props.id ?? `wisdom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      knowledgeIds: props.knowledgeIds,
      learningIds: props.learningIds,
      confidence: clampScore(props.confidence),
      importance: clampScore(props.importance),
      businessImpact: clampScore(props.businessImpact),
      risk: props.risk,
      recommendation: props.recommendation.trim(),
      reasoning: props.reasoning.trim(),
      expectedOutcome: props.expectedOutcome.trim(),
      successRate: clampScore(props.successRate),
      roi: props.roi,
      tags: props.tags.map((tag) => tag.trim()).filter(Boolean),
    });
  }

  update(input: {
    confidence?: Score;
    importance?: Score;
    businessImpact?: Score;
    risk?: RiskLevel;
    recommendation?: string;
    reasoning?: string;
    expectedOutcome?: string;
    successRate?: Score;
    roi?: number;
    tags?: string[];
    knowledgeIds?: KnowledgeId[];
    learningIds?: LearningId[];
  }): ExecutiveWisdom {
    return ExecutiveWisdom.create({
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      knowledgeIds: input.knowledgeIds ?? this.knowledgeIds,
      learningIds: input.learningIds ?? this.learningIds,
      confidence: input.confidence ?? this.confidence,
      importance: input.importance ?? this.importance,
      businessImpact: input.businessImpact ?? this.businessImpact,
      risk: input.risk ?? this.risk,
      recommendation: input.recommendation ?? this.recommendation,
      reasoning: input.reasoning ?? this.reasoning,
      expectedOutcome: input.expectedOutcome ?? this.expectedOutcome,
      successRate: input.successRate ?? this.successRate,
      roi: input.roi ?? this.roi,
      tags: input.tags ?? this.tags,
    });
  }

  toJSON(): ExecutiveWisdomProps {
    return {
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      knowledgeIds: [...this.knowledgeIds],
      learningIds: [...this.learningIds],
      confidence: this.confidence,
      importance: this.importance,
      businessImpact: this.businessImpact,
      risk: this.risk,
      recommendation: this.recommendation,
      reasoning: this.reasoning,
      expectedOutcome: this.expectedOutcome,
      successRate: this.successRate,
      roi: this.roi,
      tags: [...this.tags],
    };
  }
}
