import type { BestPracticeId, CompanyId, Score, WisdomId } from "../../shared";
import { clampScore } from "../../shared";

export type ExecutiveBestPracticeProps = {
  id: BestPracticeId;
  companyId: CompanyId;
  wisdomId: WisdomId;
  title: string;
  description: string;
  domain: string;
  confidence: Score;
  createdAt: string;
};

export class ExecutiveBestPractice {
  readonly id: BestPracticeId;
  readonly companyId: CompanyId;
  readonly wisdomId: WisdomId;
  readonly title: string;
  readonly description: string;
  readonly domain: string;
  readonly confidence: Score;
  readonly createdAt: string;

  private constructor(props: ExecutiveBestPracticeProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.title = props.title;
    this.description = props.description;
    this.domain = props.domain;
    this.confidence = props.confidence;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ExecutiveBestPracticeProps, "id" | "createdAt"> & {
      id?: BestPracticeId;
      createdAt?: string;
    },
  ): ExecutiveBestPractice {
    return new ExecutiveBestPractice({
      id: props.id ?? `practice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      title: props.title.trim(),
      description: props.description.trim(),
      domain: props.domain.trim(),
      confidence: clampScore(props.confidence),
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveBestPracticeProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      title: this.title,
      description: this.description,
      domain: this.domain,
      confidence: this.confidence,
      createdAt: this.createdAt,
    };
  }
}
