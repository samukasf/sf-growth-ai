import type {
  CouncilRecommendationId,
  CouncilSessionId,
  CouncilSpecialistRole,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type CouncilRecommendationProps = {
  id: CouncilRecommendationId;
  sessionId: CouncilSessionId;
  title: string;
  description: string;
  sourceRoles: CouncilSpecialistRole[];
  priority: Score;
  confidence: Score;
  actionItems: string[];
  createdAt: string;
};

export class CouncilRecommendation {
  readonly id: CouncilRecommendationId;
  readonly sessionId: CouncilSessionId;
  readonly title: string;
  readonly description: string;
  readonly sourceRoles: CouncilSpecialistRole[];
  readonly priority: Score;
  readonly confidence: Score;
  readonly actionItems: string[];
  readonly createdAt: string;

  private constructor(props: CouncilRecommendationProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.title = props.title;
    this.description = props.description;
    this.sourceRoles = [...props.sourceRoles];
    this.priority = props.priority;
    this.confidence = props.confidence;
    this.actionItems = [...props.actionItems];
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<CouncilRecommendationProps, "id" | "createdAt"> & {
      id?: CouncilRecommendationId;
      createdAt?: string;
    },
  ): CouncilRecommendation {
    return new CouncilRecommendation({
      id: props.id ?? `crec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      title: props.title.trim(),
      description: props.description.trim(),
      sourceRoles: props.sourceRoles,
      priority: clampScore(props.priority),
      confidence: clampScore(props.confidence),
      actionItems: props.actionItems,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CouncilRecommendationProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      title: this.title,
      description: this.description,
      sourceRoles: [...this.sourceRoles],
      priority: this.priority,
      confidence: this.confidence,
      actionItems: [...this.actionItems],
      createdAt: this.createdAt,
    };
  }
}
