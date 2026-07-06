import type {
  CompanyId,
  DecisionId,
  KnowledgeId,
  LearningEventId,
  LearningRecordId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";
import type { LearningFeedback } from "./learning-feedback";
import { LearningOutcome } from "./learning-outcome";

export type LearningRecordProps = {
  id: LearningRecordId;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  knowledgeId?: KnowledgeId;
  eventId?: LearningEventId;
  decisionId?: DecisionId;
  outcome: LearningOutcome;
  successLevel: Score;
  confidence: Score;
  impact: Score;
  roi: number;
  feedback: string;
  lessonsLearned: string[];
  recommendations: string[];
};

export type CreateLearningRecordProps = Omit<
  LearningRecordProps,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: LearningRecordId;
  createdAt?: string;
  updatedAt?: string;
};

export class LearningRecord {
  readonly id: LearningRecordId;
  readonly companyId: CompanyId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly knowledgeId?: KnowledgeId;
  readonly eventId?: LearningEventId;
  readonly decisionId?: DecisionId;
  readonly outcome: LearningOutcome;
  readonly successLevel: Score;
  readonly confidence: Score;
  readonly impact: Score;
  readonly roi: number;
  readonly feedback: string;
  readonly lessonsLearned: string[];
  readonly recommendations: string[];

  private constructor(props: LearningRecordProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.knowledgeId = props.knowledgeId;
    this.eventId = props.eventId;
    this.decisionId = props.decisionId;
    this.outcome = props.outcome;
    this.successLevel = props.successLevel;
    this.confidence = props.confidence;
    this.impact = props.impact;
    this.roi = props.roi;
    this.feedback = props.feedback;
    this.lessonsLearned = [...props.lessonsLearned];
    this.recommendations = [...props.recommendations];
  }

  static create(props: CreateLearningRecordProps): LearningRecord {
    if (!props.companyId.trim()) {
      throw new Error("companyId is required");
    }

    const now = new Date().toISOString();

    return new LearningRecord({
      id: props.id ?? `learning-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      knowledgeId: props.knowledgeId,
      eventId: props.eventId,
      decisionId: props.decisionId,
      outcome: props.outcome,
      successLevel: clampScore(props.successLevel),
      confidence: clampScore(props.confidence),
      impact: clampScore(props.impact),
      roi: props.roi,
      feedback: props.feedback.trim(),
      lessonsLearned: props.lessonsLearned.map((lesson) => lesson.trim()).filter(Boolean),
      recommendations: props.recommendations.map((item) => item.trim()).filter(Boolean),
    });
  }

  update(input: {
    outcome?: LearningOutcome;
    successLevel?: Score;
    confidence?: Score;
    impact?: Score;
    roi?: number;
    feedback?: string;
    lessonsLearned?: string[];
    recommendations?: string[];
  }): LearningRecord {
    return LearningRecord.create({
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      knowledgeId: this.knowledgeId,
      eventId: this.eventId,
      decisionId: this.decisionId,
      outcome: input.outcome ?? this.outcome,
      successLevel: input.successLevel ?? this.successLevel,
      confidence: input.confidence ?? this.confidence,
      impact: input.impact ?? this.impact,
      roi: input.roi ?? this.roi,
      feedback: input.feedback ?? this.feedback,
      lessonsLearned: input.lessonsLearned ?? this.lessonsLearned,
      recommendations: input.recommendations ?? this.recommendations,
    });
  }

  applyFeedback(feedback: LearningFeedback): LearningRecord {
    const sentimentBoost =
      feedback.sentiment === "positive" ? 5 : feedback.sentiment === "negative" ? -5 : 0;

    return this.update({
      feedback: feedback.content,
      confidence: clampScore(this.confidence + sentimentBoost),
    });
  }

  markValidated(): LearningRecord {
    return this.update({
      confidence: clampScore(this.confidence + 8),
      successLevel: clampScore(this.successLevel + 5),
    });
  }

  toJSON(): LearningRecordProps {
    return {
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      knowledgeId: this.knowledgeId,
      eventId: this.eventId,
      decisionId: this.decisionId,
      outcome: this.outcome,
      successLevel: this.successLevel,
      confidence: this.confidence,
      impact: this.impact,
      roi: this.roi,
      feedback: this.feedback,
      lessonsLearned: [...this.lessonsLearned],
      recommendations: [...this.recommendations],
    };
  }
}
