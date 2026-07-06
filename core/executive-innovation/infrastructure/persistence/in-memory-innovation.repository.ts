import {
  AutomationOpportunity,
  BusinessImprovement,
  InnovationApprovalRequest,
  InnovationHypothesis,
  InnovationImpact,
  InnovationOpportunity,
  InnovationProject,
  InnovationROI,
  SoftwareOpportunity,
  type InnovationQuery,
  type InnovationRepository,
} from "../../domain";

function serializeOpportunity(opportunity: InnovationOpportunity): string {
  return JSON.stringify(opportunity.toJSON());
}

function deserializeOpportunity(raw: string): InnovationOpportunity {
  const parsed = JSON.parse(raw) as ReturnType<InnovationOpportunity["toJSON"]>;
  return InnovationOpportunity.create(parsed);
}

export class InMemoryInnovationRepository implements InnovationRepository {
  private readonly opportunities = new Map<string, string>();
  private readonly projects: InnovationProject[] = [];
  private readonly automations: AutomationOpportunity[] = [];
  private readonly software: SoftwareOpportunity[] = [];
  private readonly improvements: BusinessImprovement[] = [];
  private readonly hypotheses: InnovationHypothesis[] = [];
  private readonly impacts: InnovationImpact[] = [];
  private readonly rois: InnovationROI[] = [];
  private readonly approvals: InnovationApprovalRequest[] = [];

  async saveOpportunity(opportunity: InnovationOpportunity): Promise<void> {
    this.opportunities.set(opportunity.id, serializeOpportunity(opportunity));
  }

  async findOpportunityById(id: string): Promise<InnovationOpportunity | null> {
    const raw = this.opportunities.get(id);
    return raw ? deserializeOpportunity(raw) : null;
  }

  async findOpportunitiesByCompany(companyId: string): Promise<InnovationOpportunity[]> {
    const results: InnovationOpportunity[] = [];

    for (const raw of this.opportunities.values()) {
      const opportunity = deserializeOpportunity(raw);
      if (opportunity.companyId === companyId) results.push(opportunity);
    }

    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async queryOpportunities(filters: InnovationQuery): Promise<InnovationOpportunity[]> {
    let results = await this.findOpportunitiesByCompany(filters.companyId);

    if (filters.opportunityType) {
      results = results.filter((item) => item.opportunityType === filters.opportunityType);
    }
    if (filters.area) {
      results = results.filter((item) => item.area === filters.area);
    }
    if (filters.status) {
      results = results.filter((item) => item.status === filters.status);
    }
    if (filters.minConfidence !== undefined) {
      results = results.filter((item) => item.confidence >= filters.minConfidence!);
    }
    if (filters.minExpectedImpact !== undefined) {
      results = results.filter((item) => item.expectedImpact >= filters.minExpectedImpact!);
    }
    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async deleteOpportunity(id: string): Promise<void> {
    this.opportunities.delete(id);
  }

  async saveProject(project: InnovationProject): Promise<void> {
    this.projects.push(project);
  }

  async findProjectsByCompany(companyId: string): Promise<InnovationProject[]> {
    return this.projects.filter((project) => project.companyId === companyId);
  }

  async saveAutomationOpportunity(automation: AutomationOpportunity): Promise<void> {
    this.automations.push(automation);
  }

  async saveSoftwareOpportunity(software: SoftwareOpportunity): Promise<void> {
    this.software.push(software);
  }

  async saveBusinessImprovement(improvement: BusinessImprovement): Promise<void> {
    this.improvements.push(improvement);
  }

  async saveHypothesis(hypothesis: InnovationHypothesis): Promise<void> {
    this.hypotheses.push(hypothesis);
  }

  async saveImpact(impact: InnovationImpact): Promise<void> {
    this.impacts.push(impact);
  }

  async saveROI(roi: InnovationROI): Promise<void> {
    this.rois.push(roi);
  }

  async saveApprovalRequest(request: InnovationApprovalRequest): Promise<void> {
    this.approvals.push(request);
  }

  async findApprovalRequests(companyId: string): Promise<InnovationApprovalRequest[]> {
    return this.approvals.filter((request) => request.companyId === companyId);
  }
}
