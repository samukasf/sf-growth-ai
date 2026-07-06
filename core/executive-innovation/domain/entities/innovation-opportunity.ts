import type { CompanyId, InnovationOpportunityId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type OpportunityType =
  | "automation"
  | "software"
  | "new_product"
  | "new_service"
  | "operational_improvement"
  | "cost_reduction"
  | "revenue_increase";

export type OpportunityArea =
  | "operations"
  | "sales"
  | "marketing"
  | "finance"
  | "customer_service"
  | "technology"
  | "hr"
  | "general";

export type OpportunityStatus =
  | "detected"
  | "evaluating"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "archived";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type InnovationOpportunityProps = {
  id: InnovationOpportunityId;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  problemDetected: string;
  opportunityType: OpportunityType;
  area: OpportunityArea;
  expectedImpact: Score;
  estimatedROI: number;
  estimatedCost: number;
  estimatedTime: number;
  riskLevel: RiskLevel;
  confidence: Score;
  requiredApproval: boolean;
  status: OpportunityStatus;
  recommendedNextStep: string;
  relatedKnowledgeIds: string[];
  relatedLearningIds: string[];
  relatedExperienceIds: string[];
  relatedWisdomIds: string[];
  tags: string[];
};

export type CreateInnovationOpportunityProps = Omit<
  InnovationOpportunityProps,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: InnovationOpportunityId;
  createdAt?: string;
  updatedAt?: string;
};

export class InnovationOpportunity {
  readonly id: InnovationOpportunityId;
  readonly companyId: CompanyId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly title: string;
  readonly description: string;
  readonly problemDetected: string;
  readonly opportunityType: OpportunityType;
  readonly area: OpportunityArea;
  readonly expectedImpact: Score;
  readonly estimatedROI: number;
  readonly estimatedCost: number;
  readonly estimatedTime: number;
  readonly riskLevel: RiskLevel;
  readonly confidence: Score;
  readonly requiredApproval: boolean;
  readonly status: OpportunityStatus;
  readonly recommendedNextStep: string;
  readonly relatedKnowledgeIds: string[];
  readonly relatedLearningIds: string[];
  readonly relatedExperienceIds: string[];
  readonly relatedWisdomIds: string[];
  readonly tags: string[];

  private constructor(props: InnovationOpportunityProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.title = props.title;
    this.description = props.description;
    this.problemDetected = props.problemDetected;
    this.opportunityType = props.opportunityType;
    this.area = props.area;
    this.expectedImpact = props.expectedImpact;
    this.estimatedROI = props.estimatedROI;
    this.estimatedCost = props.estimatedCost;
    this.estimatedTime = props.estimatedTime;
    this.riskLevel = props.riskLevel;
    this.confidence = props.confidence;
    this.requiredApproval = props.requiredApproval;
    this.status = props.status;
    this.recommendedNextStep = props.recommendedNextStep;
    this.relatedKnowledgeIds = [...props.relatedKnowledgeIds];
    this.relatedLearningIds = [...props.relatedLearningIds];
    this.relatedExperienceIds = [...props.relatedExperienceIds];
    this.relatedWisdomIds = [...props.relatedWisdomIds];
    this.tags = [...props.tags];
  }

  static create(props: CreateInnovationOpportunityProps): InnovationOpportunity {
    if (!props.companyId.trim()) throw new Error("companyId is required");
    if (!props.title.trim()) throw new Error("title is required");

    const now = new Date().toISOString();

    return new InnovationOpportunity({
      id: props.id ?? `innovation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      title: props.title.trim(),
      description: props.description.trim(),
      problemDetected: props.problemDetected.trim(),
      opportunityType: props.opportunityType,
      area: props.area,
      expectedImpact: clampScore(props.expectedImpact),
      estimatedROI: props.estimatedROI,
      estimatedCost: Math.max(0, props.estimatedCost),
      estimatedTime: Math.max(0, props.estimatedTime),
      riskLevel: props.riskLevel,
      confidence: clampScore(props.confidence),
      requiredApproval: props.requiredApproval,
      status: props.status,
      recommendedNextStep: props.recommendedNextStep.trim(),
      relatedKnowledgeIds: props.relatedKnowledgeIds,
      relatedLearningIds: props.relatedLearningIds,
      relatedExperienceIds: props.relatedExperienceIds,
      relatedWisdomIds: props.relatedWisdomIds,
      tags: props.tags.map((t) => t.trim()).filter(Boolean),
    });
  }

  update(input: Partial<Omit<CreateInnovationOpportunityProps, "id" | "companyId" | "createdAt">>): InnovationOpportunity {
    return InnovationOpportunity.create({
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      title: input.title ?? this.title,
      description: input.description ?? this.description,
      problemDetected: input.problemDetected ?? this.problemDetected,
      opportunityType: input.opportunityType ?? this.opportunityType,
      area: input.area ?? this.area,
      expectedImpact: input.expectedImpact ?? this.expectedImpact,
      estimatedROI: input.estimatedROI ?? this.estimatedROI,
      estimatedCost: input.estimatedCost ?? this.estimatedCost,
      estimatedTime: input.estimatedTime ?? this.estimatedTime,
      riskLevel: input.riskLevel ?? this.riskLevel,
      confidence: input.confidence ?? this.confidence,
      requiredApproval: input.requiredApproval ?? this.requiredApproval,
      status: input.status ?? this.status,
      recommendedNextStep: input.recommendedNextStep ?? this.recommendedNextStep,
      relatedKnowledgeIds: input.relatedKnowledgeIds ?? this.relatedKnowledgeIds,
      relatedLearningIds: input.relatedLearningIds ?? this.relatedLearningIds,
      relatedExperienceIds: input.relatedExperienceIds ?? this.relatedExperienceIds,
      relatedWisdomIds: input.relatedWisdomIds ?? this.relatedWisdomIds,
      tags: input.tags ?? this.tags,
    });
  }

  approve(): InnovationOpportunity {
    return this.update({ status: "approved" });
  }

  reject(): InnovationOpportunity {
    return this.update({ status: "rejected" });
  }

  toJSON(): InnovationOpportunityProps {
    return {
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      title: this.title,
      description: this.description,
      problemDetected: this.problemDetected,
      opportunityType: this.opportunityType,
      area: this.area,
      expectedImpact: this.expectedImpact,
      estimatedROI: this.estimatedROI,
      estimatedCost: this.estimatedCost,
      estimatedTime: this.estimatedTime,
      riskLevel: this.riskLevel,
      confidence: this.confidence,
      requiredApproval: this.requiredApproval,
      status: this.status,
      recommendedNextStep: this.recommendedNextStep,
      relatedKnowledgeIds: [...this.relatedKnowledgeIds],
      relatedLearningIds: [...this.relatedLearningIds],
      relatedExperienceIds: [...this.relatedExperienceIds],
      relatedWisdomIds: [...this.relatedWisdomIds],
      tags: [...this.tags],
    };
  }
}
