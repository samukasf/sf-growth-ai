import type {
  CompanyId,
  ExperienceId,
  KnowledgeReferenceId,
  LearningReferenceId,
  Score,
  WisdomReferenceId,
} from "../../shared";
import { clampScore } from "../../shared";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ExecutiveExperienceProps = {
  id: ExperienceId;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  title: string;
  context: string;
  scenario: string;
  decision: string;
  execution: string;
  result: string;
  businessImpact: Score;
  roi: number;
  successLevel: Score;
  confidence: Score;
  risk: RiskLevel;
  duration: number;
  participants: string[];
  knowledgeReferences: KnowledgeReferenceId[];
  learningReferences: LearningReferenceId[];
  wisdomReferences: WisdomReferenceId[];
  tags: string[];
};

export type CreateExecutiveExperienceProps = Omit<
  ExecutiveExperienceProps,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: ExperienceId;
  createdAt?: string;
  updatedAt?: string;
};

export class ExecutiveExperience {
  readonly id: ExperienceId;
  readonly companyId: CompanyId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly title: string;
  readonly context: string;
  readonly scenario: string;
  readonly decision: string;
  readonly execution: string;
  readonly result: string;
  readonly businessImpact: Score;
  readonly roi: number;
  readonly successLevel: Score;
  readonly confidence: Score;
  readonly risk: RiskLevel;
  readonly duration: number;
  readonly participants: string[];
  readonly knowledgeReferences: KnowledgeReferenceId[];
  readonly learningReferences: LearningReferenceId[];
  readonly wisdomReferences: WisdomReferenceId[];
  readonly tags: string[];

  private constructor(props: ExecutiveExperienceProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.title = props.title;
    this.context = props.context;
    this.scenario = props.scenario;
    this.decision = props.decision;
    this.execution = props.execution;
    this.result = props.result;
    this.businessImpact = props.businessImpact;
    this.roi = props.roi;
    this.successLevel = props.successLevel;
    this.confidence = props.confidence;
    this.risk = props.risk;
    this.duration = props.duration;
    this.participants = [...props.participants];
    this.knowledgeReferences = [...props.knowledgeReferences];
    this.learningReferences = [...props.learningReferences];
    this.wisdomReferences = [...props.wisdomReferences];
    this.tags = [...props.tags];
  }

  static create(props: CreateExecutiveExperienceProps): ExecutiveExperience {
    if (!props.companyId.trim()) throw new Error("companyId is required");
    if (!props.title.trim()) throw new Error("title is required");

    const now = new Date().toISOString();

    return new ExecutiveExperience({
      id: props.id ?? `experience-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      title: props.title.trim(),
      context: props.context.trim(),
      scenario: props.scenario.trim(),
      decision: props.decision.trim(),
      execution: props.execution.trim(),
      result: props.result.trim(),
      businessImpact: clampScore(props.businessImpact),
      roi: props.roi,
      successLevel: clampScore(props.successLevel),
      confidence: clampScore(props.confidence),
      risk: props.risk,
      duration: Math.max(0, props.duration),
      participants: props.participants.map((p) => p.trim()).filter(Boolean),
      knowledgeReferences: props.knowledgeReferences,
      learningReferences: props.learningReferences,
      wisdomReferences: props.wisdomReferences,
      tags: props.tags.map((t) => t.trim()).filter(Boolean),
    });
  }

  update(input: Partial<Omit<CreateExecutiveExperienceProps, "id" | "companyId" | "createdAt">>): ExecutiveExperience {
    return ExecutiveExperience.create({
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      title: input.title ?? this.title,
      context: input.context ?? this.context,
      scenario: input.scenario ?? this.scenario,
      decision: input.decision ?? this.decision,
      execution: input.execution ?? this.execution,
      result: input.result ?? this.result,
      businessImpact: input.businessImpact ?? this.businessImpact,
      roi: input.roi ?? this.roi,
      successLevel: input.successLevel ?? this.successLevel,
      confidence: input.confidence ?? this.confidence,
      risk: input.risk ?? this.risk,
      duration: input.duration ?? this.duration,
      participants: input.participants ?? this.participants,
      knowledgeReferences: input.knowledgeReferences ?? this.knowledgeReferences,
      learningReferences: input.learningReferences ?? this.learningReferences,
      wisdomReferences: input.wisdomReferences ?? this.wisdomReferences,
      tags: input.tags ?? this.tags,
    });
  }

  markValidated(): ExecutiveExperience {
    return this.update({
      confidence: clampScore(this.confidence + 8),
    });
  }

  isSuccessful(): boolean {
    return this.successLevel >= 70;
  }

  isFailure(): boolean {
    return this.successLevel < 40;
  }

  toJSON(): ExecutiveExperienceProps {
    return {
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      title: this.title,
      context: this.context,
      scenario: this.scenario,
      decision: this.decision,
      execution: this.execution,
      result: this.result,
      businessImpact: this.businessImpact,
      roi: this.roi,
      successLevel: this.successLevel,
      confidence: this.confidence,
      risk: this.risk,
      duration: this.duration,
      participants: [...this.participants],
      knowledgeReferences: [...this.knowledgeReferences],
      learningReferences: [...this.learningReferences],
      wisdomReferences: [...this.wisdomReferences],
      tags: [...this.tags],
    };
  }
}
