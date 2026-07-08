import {
  ExecutiveProject,
  ProjectApproval,
  ProjectBusinessCase,
  ProjectDependency,
  ProjectOpportunity,
  ProjectProposal,
  ProjectROI,
  ProjectRoadmap,
  type ExecutiveProjectResult,
  type ProjectRepository,
} from "../../domain";
import type { CompanyId, ExecutiveProjectId, OrganizationId, ProjectOpportunityId } from "../../shared";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly opportunities = new Map<string, string>();
  private readonly proposalsByOpportunity = new Map<string, string>();
  private readonly projects = new Map<string, string>();
  private readonly businessCases = new Map<string, string>();
  private readonly rois = new Map<string, string>();
  private readonly roadmaps = new Map<string, string>();
  private readonly dependencies = new Map<string, string[]>();
  private readonly approvals = new Map<string, string>();

  async saveOpportunity(opportunity: ProjectOpportunity): Promise<void> {
    this.opportunities.set(opportunity.id, serialize(opportunity.toJSON()));
  }

  async findOpportunityById(id: ProjectOpportunityId): Promise<ProjectOpportunity | null> {
    const raw = this.opportunities.get(id);
    return raw ? ProjectOpportunity.create(JSON.parse(raw)) : null;
  }

  async saveProposal(proposal: ProjectProposal): Promise<void> {
    this.proposalsByOpportunity.set(proposal.opportunityId, serialize(proposal.toJSON()));
  }

  async findProposalByOpportunity(opportunityId: ProjectOpportunityId): Promise<ProjectProposal | null> {
    const raw = this.proposalsByOpportunity.get(opportunityId);
    return raw ? ProjectProposal.create(JSON.parse(raw)) : null;
  }

  async saveProject(project: ExecutiveProject): Promise<void> {
    this.projects.set(project.id, serialize(project.toJSON()));
  }

  async findProjectById(id: ExecutiveProjectId): Promise<ExecutiveProject | null> {
    const raw = this.projects.get(id);
    return raw ? ExecutiveProject.create(JSON.parse(raw)) : null;
  }

  async findProjectsByCompany(companyId: CompanyId): Promise<ExecutiveProject[]> {
    return [...this.projects.values()]
      .map((raw) => ExecutiveProject.create(JSON.parse(raw)))
      .filter((p) => p.companyId === companyId);
  }

  async findProjectsByOrganization(organizationId: OrganizationId): Promise<ExecutiveProject[]> {
    return [...this.projects.values()]
      .map((raw) => ExecutiveProject.create(JSON.parse(raw)))
      .filter((p) => p.organizationId === organizationId);
  }

  async saveBusinessCase(businessCase: ProjectBusinessCase): Promise<void> {
    this.businessCases.set(businessCase.proposalId, serialize(businessCase.toJSON()));
  }

  async findBusinessCaseByProject(projectId: ExecutiveProjectId): Promise<ProjectBusinessCase | null> {
    const project = await this.findProjectById(projectId);
    const proposalId = project?.proposalId;
    if (!proposalId) return null;
    const raw = this.businessCases.get(proposalId);
    return raw ? ProjectBusinessCase.create(JSON.parse(raw)) : null;
  }

  async saveROI(roi: ProjectROI): Promise<void> {
    this.rois.set(roi.projectId, serialize(roi.toJSON()));
  }

  async findROIByProject(projectId: ExecutiveProjectId): Promise<ProjectROI | null> {
    const raw = this.rois.get(projectId);
    return raw ? ProjectROI.create(JSON.parse(raw)) : null;
  }

  async saveRoadmap(roadmap: ProjectRoadmap): Promise<void> {
    this.roadmaps.set(roadmap.projectId, serialize(roadmap.toJSON()));
  }

  async findRoadmapByProject(projectId: ExecutiveProjectId): Promise<ProjectRoadmap | null> {
    const raw = this.roadmaps.get(projectId);
    return raw ? ProjectRoadmap.create(JSON.parse(raw)) : null;
  }

  async saveDependency(dep: ProjectDependency): Promise<void> {
    const list = this.dependencies.get(dep.projectId) ?? [];
    list.push(serialize(dep.toJSON()));
    this.dependencies.set(dep.projectId, list);
  }

  async findDependenciesByProject(projectId: ExecutiveProjectId): Promise<ProjectDependency[]> {
    return (this.dependencies.get(projectId) ?? []).map((raw) => ProjectDependency.create(JSON.parse(raw)));
  }

  async saveApproval(approval: ProjectApproval): Promise<void> {
    this.approvals.set(approval.projectId, serialize(approval.toJSON()));
  }

  async findApprovalByProject(projectId: ExecutiveProjectId): Promise<ProjectApproval | null> {
    const raw = this.approvals.get(projectId);
    return raw ? ProjectApproval.create(JSON.parse(raw)) : null;
  }

  async findResultByProject(projectId: ExecutiveProjectId): Promise<ExecutiveProjectResult | null> {
    const project = await this.findProjectById(projectId);
    if (!project) return null;

    const opportunity = project.sourceOpportunityId
      ? await this.findOpportunityById(project.sourceOpportunityId)
      : null;
    const proposal = opportunity ? await this.findProposalByOpportunity(opportunity.id) : null;
    const businessCase = await this.findBusinessCaseByProject(projectId);
    const roi = await this.findROIByProject(projectId);
    const roadmap = await this.findRoadmapByProject(projectId);
    const dependencies = await this.findDependenciesByProject(projectId);
    const approval = await this.findApprovalByProject(projectId);

    return {
      project: project.toJSON(),
      opportunity: opportunity?.toJSON() ?? null,
      proposal: proposal?.toJSON() ?? null,
      businessCase: businessCase?.toJSON() ?? null,
      roi: roi?.toJSON() ?? null,
      roadmap: roadmap?.toJSON() ?? null,
      dependencies: dependencies.map((d) => d.toJSON()),
      approval: approval?.toJSON() ?? null,
    };
  }
}

