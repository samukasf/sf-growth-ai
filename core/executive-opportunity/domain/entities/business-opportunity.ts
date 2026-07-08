import type {
  BusinessOpportunityId,
  CompanyId,
  OpportunityCategoryKey,
  OpportunityPriorityLevel,
  OpportunityRiskLevel,
  OpportunityStatus,
  OpportunityType,
  OrganizationId,
  RecommendedAction,
} from "../../shared";

export type BusinessOpportunityProps = {
  id: BusinessOpportunityId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  title: string;
  description: string;
  opportunityType: OpportunityType;
  category: OpportunityCategoryKey;
  estimatedROI: number;
  estimatedCost: number;
  estimatedTime: number;
  priority: OpportunityPriorityLevel;
  confidence: number;
  businessImpact: number;
  riskLevel: OpportunityRiskLevel;
  requiredDepartments: string[];
  dependencies: string[];
  recommendedActions: RecommendedAction[];
  status: OpportunityStatus;
  detectedAt: string;
  updatedAt: string;
};

export class BusinessOpportunity {
  readonly id: BusinessOpportunityId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly description: string;
  readonly opportunityType: OpportunityType;
  readonly category: OpportunityCategoryKey;
  readonly estimatedROI: number;
  readonly estimatedCost: number;
  readonly estimatedTime: number;
  readonly priority: OpportunityPriorityLevel;
  readonly confidence: number;
  readonly businessImpact: number;
  readonly riskLevel: OpportunityRiskLevel;
  readonly requiredDepartments: string[];
  readonly dependencies: string[];
  readonly recommendedActions: RecommendedAction[];
  readonly status: OpportunityStatus;
  readonly detectedAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessOpportunityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.description = props.description;
    this.opportunityType = props.opportunityType;
    this.category = props.category;
    this.estimatedROI = props.estimatedROI;
    this.estimatedCost = props.estimatedCost;
    this.estimatedTime = props.estimatedTime;
    this.priority = props.priority;
    this.confidence = props.confidence;
    this.businessImpact = props.businessImpact;
    this.riskLevel = props.riskLevel;
    this.requiredDepartments = props.requiredDepartments;
    this.dependencies = props.dependencies;
    this.recommendedActions = props.recommendedActions;
    this.status = props.status;
    this.detectedAt = props.detectedAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      BusinessOpportunityProps,
      "id" | "status" | "detectedAt" | "updatedAt"
    > & {
      id?: BusinessOpportunityId;
      status?: OpportunityStatus;
      detectedAt?: string;
      updatedAt?: string;
    },
  ): BusinessOpportunity {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessOpportunity({
      id: props.id ?? `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      title: props.title,
      description: props.description,
      opportunityType: props.opportunityType,
      category: props.category,
      estimatedROI: props.estimatedROI,
      estimatedCost: props.estimatedCost,
      estimatedTime: props.estimatedTime,
      priority: props.priority,
      confidence: Math.max(0, Math.min(100, props.confidence)),
      businessImpact: Math.max(0, Math.min(100, props.businessImpact)),
      riskLevel: props.riskLevel,
      requiredDepartments: props.requiredDepartments,
      dependencies: props.dependencies,
      recommendedActions: props.recommendedActions,
      status: props.status ?? "detected",
      detectedAt: props.detectedAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: OpportunityStatus): BusinessOpportunity {
    return BusinessOpportunity.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  withAnalysis(analysis: {
    estimatedROI?: number;
    estimatedCost?: number;
    estimatedTime?: number;
    priority?: OpportunityPriorityLevel;
    confidence?: number;
    businessImpact?: number;
    riskLevel?: OpportunityRiskLevel;
    recommendedActions?: RecommendedAction[];
  }): BusinessOpportunity {
    return BusinessOpportunity.create({
      ...this.toJSON(),
      ...analysis,
      status: "updated",
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessOpportunityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      title: this.title,
      description: this.description,
      opportunityType: this.opportunityType,
      category: this.category,
      estimatedROI: this.estimatedROI,
      estimatedCost: this.estimatedCost,
      estimatedTime: this.estimatedTime,
      priority: this.priority,
      confidence: this.confidence,
      businessImpact: this.businessImpact,
      riskLevel: this.riskLevel,
      requiredDepartments: this.requiredDepartments,
      dependencies: this.dependencies,
      recommendedActions: this.recommendedActions,
      status: this.status,
      detectedAt: this.detectedAt,
      updatedAt: this.updatedAt,
    };
  }
}
