import type { CompanyId, LearningFeedbackId, LearningRecordId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type LearningFeedbackSentiment = "positive" | "neutral" | "negative";

export type LearningFeedbackProps = {
  id: LearningFeedbackId;
  recordId: LearningRecordId;
  companyId: CompanyId;
  sentiment: LearningFeedbackSentiment;
  content: string;
  source: string;
  score: Score;
  createdAt: string;
};

export class LearningFeedback {
  readonly id: LearningFeedbackId;
  readonly recordId: LearningRecordId;
  readonly companyId: CompanyId;
  readonly sentiment: LearningFeedbackSentiment;
  readonly content: string;
  readonly source: string;
  readonly score: Score;
  readonly createdAt: string;

  private constructor(props: LearningFeedbackProps) {
    this.id = props.id;
    this.recordId = props.recordId;
    this.companyId = props.companyId;
    this.sentiment = props.sentiment;
    this.content = props.content;
    this.source = props.source;
    this.score = props.score;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<LearningFeedbackProps, "id" | "createdAt"> & {
      id?: LearningFeedbackId;
      createdAt?: string;
    },
  ): LearningFeedback {
    if (!props.content.trim()) {
      throw new Error("Learning feedback content is required");
    }

    return new LearningFeedback({
      id: props.id ?? `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      recordId: props.recordId,
      companyId: props.companyId,
      sentiment: props.sentiment,
      content: props.content.trim(),
      source: props.source.trim(),
      score: clampScore(props.score),
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): LearningFeedbackProps {
    return {
      id: this.id,
      recordId: this.recordId,
      companyId: this.companyId,
      sentiment: this.sentiment,
      content: this.content,
      source: this.source,
      score: this.score,
      createdAt: this.createdAt,
    };
  }
}
