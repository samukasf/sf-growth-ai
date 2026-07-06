import type { CompanyId, LearningEventId, LearningRecordId } from "../../shared";

export type LearningEventType =
  | "decision_made"
  | "action_executed"
  | "campaign_launched"
  | "goal_achieved"
  | "goal_missed"
  | "insight_generated"
  | "feedback_received"
  | "pattern_detected"
  | "recommendation_applied";

export type LearningEventProps = {
  id: LearningEventId;
  companyId: CompanyId;
  recordId?: LearningRecordId;
  type: LearningEventType;
  title: string;
  description: string;
  source: string;
  occurredAt: string;
  metadata?: Record<string, string>;
};

export class LearningEvent {
  readonly id: LearningEventId;
  readonly companyId: CompanyId;
  readonly recordId?: LearningRecordId;
  readonly type: LearningEventType;
  readonly title: string;
  readonly description: string;
  readonly source: string;
  readonly occurredAt: string;
  readonly metadata: Record<string, string>;

  private constructor(props: Required<Pick<LearningEventProps, "metadata">> & LearningEventProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.recordId = props.recordId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.source = props.source;
    this.occurredAt = props.occurredAt;
    this.metadata = props.metadata;
  }

  static create(
    props: Omit<LearningEventProps, "id" | "occurredAt" | "metadata"> & {
      id?: LearningEventId;
      occurredAt?: string;
      metadata?: Record<string, string>;
    },
  ): LearningEvent {
    if (!props.title.trim()) {
      throw new Error("Learning event title is required");
    }

    return new LearningEvent({
      id: props.id ?? `learning-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      recordId: props.recordId,
      type: props.type,
      title: props.title.trim(),
      description: props.description.trim(),
      source: props.source.trim(),
      occurredAt: props.occurredAt ?? new Date().toISOString(),
      metadata: props.metadata ?? {},
    });
  }

  toJSON(): LearningEventProps {
    return {
      id: this.id,
      companyId: this.companyId,
      recordId: this.recordId,
      type: this.type,
      title: this.title,
      description: this.description,
      source: this.source,
      occurredAt: this.occurredAt,
      metadata: { ...this.metadata },
    };
  }
}
