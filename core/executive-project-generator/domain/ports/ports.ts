import type {
  CompanyId,
  ExecutiveProjectId,
  OrganizationId,
  ProjectApprovalId,
  ProjectOpportunityId,
  ProjectPriorityLevel,
  ProjectRiskLevel,
  ProjectType,
} from "../../shared";
import type {
  ExecutiveProject,
  ProjectApproval,
  ProjectBusinessCase,
  ProjectDependency,
  ProjectOpportunity,
  ProjectProposal,
  ProjectROI,
  ProjectRoadmap,
} from "../entities";

export type ExecutiveProjectResult = {
  project: ReturnType<ExecutiveProject["toJSON"]>;
  opportunity: ReturnType<ProjectOpportunity["toJSON"]> | null;
  proposal: ReturnType<ProjectProposal["toJSON"]> | null;
  businessCase: ReturnType<ProjectBusinessCase["toJSON"]> | null;
  roi: ReturnType<ProjectROI["toJSON"]> | null;
  roadmap: ReturnType<ProjectRoadmap["toJSON"]> | null;
  dependencies: ReturnType<ProjectDependency["toJSON"]>[];
  approval: ReturnType<ProjectApproval["toJSON"]> | null;
};

export interface ProjectRepository {
  saveOpportunity(opportunity: ProjectOpportunity): Promise<void>;
  findOpportunityById(id: ProjectOpportunityId): Promise<ProjectOpportunity | null>;
  saveProposal(proposal: ProjectProposal): Promise<void>;
  findProposalByOpportunity(opportunityId: ProjectOpportunityId): Promise<ProjectProposal | null>;

  saveProject(project: ExecutiveProject): Promise<void>;
  findProjectById(id: ExecutiveProjectId): Promise<ExecutiveProject | null>;
  findProjectsByCompany(companyId: CompanyId): Promise<ExecutiveProject[]>;
  findProjectsByOrganization(organizationId: OrganizationId): Promise<ExecutiveProject[]>;

  saveBusinessCase(businessCase: ProjectBusinessCase): Promise<void>;
  findBusinessCaseByProject(projectId: ExecutiveProjectId): Promise<ProjectBusinessCase | null>;

  saveROI(roi: ProjectROI): Promise<void>;
  findROIByProject(projectId: ExecutiveProjectId): Promise<ProjectROI | null>;

  saveRoadmap(roadmap: ProjectRoadmap): Promise<void>;
  findRoadmapByProject(projectId: ExecutiveProjectId): Promise<ProjectRoadmap | null>;

  saveDependency(dep: ProjectDependency): Promise<void>;
  findDependenciesByProject(projectId: ExecutiveProjectId): Promise<ProjectDependency[]>;

  saveApproval(approval: ProjectApproval): Promise<void>;
  findApprovalByProject(projectId: ExecutiveProjectId): Promise<ProjectApproval | null>;

  findResultByProject(projectId: ExecutiveProjectId): Promise<ExecutiveProjectResult | null>;
}

export type BuildBusinessCaseInput = {
  opportunity: ProjectOpportunity;
  proposal: ProjectProposal;
};
export interface BusinessCaseBuilder {
  build(input: BuildBusinessCaseInput): ProjectBusinessCase;
}

export type GenerateRoadmapInput = {
  project: ExecutiveProject;
  projectType: ProjectType;
};
export interface RoadmapGenerator {
  generate(input: GenerateRoadmapInput): ProjectRoadmap;
}

export type ROIEngineInput = {
  project: ExecutiveProject;
  opportunity?: ProjectOpportunity | null;
};
export interface ROIEngine {
  compute(input: ROIEngineInput): ProjectROI;
}

export type PriorityEngineInput = {
  project: ExecutiveProject;
  roi?: ProjectROI | null;
};
export interface PriorityEngine {
  calculate(input: PriorityEngineInput): { priority: ProjectPriorityLevel; riskLevel: ProjectRiskLevel; businessImpact: number };
}

export type ProjectPlannerInput = {
  opportunity: ProjectOpportunity;
  projectType: ProjectType;
};
export interface ProjectPlanner {
  propose(input: ProjectPlannerInput): ProjectProposal;
  materializeProject(input: { opportunity: ProjectOpportunity; proposal: ProjectProposal; priority: ProjectPriorityLevel; riskLevel: ProjectRiskLevel; businessImpact: number; estimatedInvestment: number; estimatedROI: number; estimatedTime: number; roadmap: ProjectRoadmap | null }): ExecutiveProject;
}

export type DependencyAnalysisInput = {
  project: ExecutiveProject;
  proposal?: ProjectProposal | null;
};
export interface DependencyAnalyzer {
  analyze(input: DependencyAnalysisInput): ProjectDependency[];
}

export type ApprovalCoordinationInput = {
  project: ExecutiveProject;
  requestedBy: string;
};
export interface ApprovalCoordinator {
  requestApproval(input: ApprovalCoordinationInput): ProjectApproval;
  approve(input: { approval: ProjectApproval; decidedBy: string }): ProjectApproval;
  reject(input: { approval: ProjectApproval; decidedBy: string; reason: string }): ProjectApproval;
}

export type GenerateProjectInput = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  opportunity: {
    source: ProjectOpportunity["source"];
    opportunityRefId?: string;
    title: string;
    description: string;
    category: ProjectOpportunity["category"];
    estimatedROI: number;
    confidence: number;
  };
  projectType: ProjectType;
  context?: Record<string, unknown>;
};

export type GenerateProjectResult = ExecutiveProjectResult;

export type ApproveProjectInput = { projectId: ExecutiveProjectId; approvedBy: string };
export type RejectProjectInput = { projectId: ExecutiveProjectId; rejectedBy: string; reason: string };
export type StartProjectInput = { projectId: ExecutiveProjectId; startedBy: string };

export interface ExecutiveProjectGenerator {
  generateProject(input: GenerateProjectInput): Promise<GenerateProjectResult>;
  approveProject(input: ApproveProjectInput): Promise<ExecutiveProjectResult>;
  rejectProject(input: RejectProjectInput): Promise<ExecutiveProjectResult>;
  startProject(input: StartProjectInput): Promise<ExecutiveProjectResult>;
  getProject(projectId: ExecutiveProjectId): Promise<ExecutiveProjectResult | null>;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ProjectBriefing = {
  projectId: ExecutiveProjectId;
  title: string;
  summary: string;
  investment: number;
  roi: number;
  roadmapWeeks: number;
  priority: ProjectPriorityLevel;
  riskLevel: ProjectRiskLevel;
};

export type ProjectApprovalRequest = {
  approvalId: ProjectApprovalId;
  projectId: ExecutiveProjectId;
  briefing: ProjectBriefing;
};

