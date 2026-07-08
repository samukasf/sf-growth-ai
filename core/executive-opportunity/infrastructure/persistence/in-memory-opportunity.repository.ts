import {
  BusinessOpportunity,
  OpportunityEvidence,
  OpportunityExecutionPlan,
  OpportunityImpact,
  OpportunityPriority,
  OpportunityRecommendation,
  OpportunityROI,
  OpportunityRisk,
  type OpportunityRepository,
  type OpportunityResult,
} from "../../domain";
import type { BusinessOpportunityId, CompanyId, OrganizationId } from "../../shared";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

export class InMemoryOpportunityRepository implements OpportunityRepository {
  private readonly opportunities = new Map<string, string>();
  private readonly rois = new Map<string, string>();
  private readonly impacts = new Map<string, string>();
  private readonly risks = new Map<string, string>();
  private readonly priorities = new Map<string, string>();
  private readonly plans = new Map<string, string>();
  private readonly evidence = new Map<string, string[]>();
  private readonly recommendations = new Map<string, string[]>();

  async saveOpportunity(opportunity: BusinessOpportunity): Promise<void> {
    this.opportunities.set(opportunity.id, serialize(opportunity.toJSON()));
  }

  async findOpportunityById(id: BusinessOpportunityId): Promise<BusinessOpportunity | null> {
    const raw = this.opportunities.get(id);
    return raw ? BusinessOpportunity.create(JSON.parse(raw)) : null;
  }

  async findOpportunitiesByOrganization(
    organizationId: OrganizationId,
  ): Promise<BusinessOpportunity[]> {
    return [...this.opportunities.values()]
      .map((raw) => BusinessOpportunity.create(JSON.parse(raw)))
      .filter((o) => o.organizationId === organizationId);
  }

  async findOpportunitiesByCompany(companyId: CompanyId): Promise<BusinessOpportunity[]> {
    return [...this.opportunities.values()]
      .map((raw) => BusinessOpportunity.create(JSON.parse(raw)))
      .filter((o) => o.companyId === companyId);
  }

  async saveROI(roi: OpportunityROI): Promise<void> {
    this.rois.set(roi.opportunityId, serialize(roi.toJSON()));
  }

  async findROIByOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityROI | null> {
    const raw = this.rois.get(opportunityId);
    return raw ? OpportunityROI.create(JSON.parse(raw)) : null;
  }

  async saveImpact(impact: OpportunityImpact): Promise<void> {
    this.impacts.set(impact.opportunityId, serialize(impact.toJSON()));
  }

  async findImpactByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityImpact | null> {
    const raw = this.impacts.get(opportunityId);
    return raw ? OpportunityImpact.create(JSON.parse(raw)) : null;
  }

  async saveRisk(risk: OpportunityRisk): Promise<void> {
    this.risks.set(risk.opportunityId, serialize(risk.toJSON()));
  }

  async findRiskByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityRisk | null> {
    const raw = this.risks.get(opportunityId);
    return raw ? OpportunityRisk.create(JSON.parse(raw)) : null;
  }

  async savePriority(priority: OpportunityPriority): Promise<void> {
    this.priorities.set(priority.opportunityId, serialize(priority.toJSON()));
  }

  async findPriorityByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityPriority | null> {
    const raw = this.priorities.get(opportunityId);
    return raw ? OpportunityPriority.create(JSON.parse(raw)) : null;
  }

  async saveExecutionPlan(plan: OpportunityExecutionPlan): Promise<void> {
    this.plans.set(plan.opportunityId, serialize(plan.toJSON()));
  }

  async findExecutionPlanByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityExecutionPlan | null> {
    const raw = this.plans.get(opportunityId);
    return raw ? OpportunityExecutionPlan.create(JSON.parse(raw)) : null;
  }

  async saveEvidence(item: OpportunityEvidence): Promise<void> {
    const list = this.evidence.get(item.opportunityId) ?? [];
    list.push(serialize(item.toJSON()));
    this.evidence.set(item.opportunityId, list);
  }

  async findEvidenceByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityEvidence[]> {
    return (this.evidence.get(opportunityId) ?? []).map((raw) =>
      OpportunityEvidence.create(JSON.parse(raw)),
    );
  }

  async saveRecommendation(recommendation: OpportunityRecommendation): Promise<void> {
    const list = this.recommendations.get(recommendation.opportunityId) ?? [];
    list.push(serialize(recommendation.toJSON()));
    this.recommendations.set(recommendation.opportunityId, list);
  }

  async findRecommendationsByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityRecommendation[]> {
    return (this.recommendations.get(opportunityId) ?? []).map((raw) =>
      OpportunityRecommendation.create(JSON.parse(raw)),
    );
  }

  async findResultByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityResult | null> {
    const opportunity = await this.findOpportunityById(opportunityId);
    if (!opportunity) return null;

    const roi = await this.findROIByOpportunity(opportunityId);
    const impact = await this.findImpactByOpportunity(opportunityId);
    const risk = await this.findRiskByOpportunity(opportunityId);
    const priority = await this.findPriorityByOpportunity(opportunityId);
    const executionPlan = await this.findExecutionPlanByOpportunity(opportunityId);
    const evidence = await this.findEvidenceByOpportunity(opportunityId);
    const recommendations = await this.findRecommendationsByOpportunity(opportunityId);

    return {
      opportunity: opportunity.toJSON(),
      roi: roi?.toJSON() ?? null,
      impact: impact?.toJSON() ?? null,
      risk: risk?.toJSON() ?? null,
      priority: priority?.toJSON() ?? null,
      executionPlan: executionPlan?.toJSON() ?? null,
      evidence: evidence.map((e) => e.toJSON()),
      recommendations: recommendations.map((r) => r.toJSON()),
    };
  }
}
