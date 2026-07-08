import type {
  CompanyId,
  OrganizationId,
  SoftwareProjectId,
  SoftwareProjectType,
} from "../../shared";
import type {
  ArchitectureBlueprint,
  BusinessRequirements,
  DeploymentPlan,
  FunctionalRequirements,
  GeneratedArtifact,
  SoftwareApproval,
  SoftwareProject,
  SoftwareSpecification,
  TechnicalRequirements,
} from "../entities";

export type SoftwareFactoryResult = {
  project: ReturnType<SoftwareProject["toJSON"]>;
  specification: ReturnType<SoftwareSpecification["toJSON"]> | null;
  businessRequirements: ReturnType<BusinessRequirements["toJSON"]> | null;
  functionalRequirements: ReturnType<FunctionalRequirements["toJSON"]> | null;
  technicalRequirements: ReturnType<TechnicalRequirements["toJSON"]> | null;
  architecture: ReturnType<ArchitectureBlueprint["toJSON"]> | null;
  artifacts: ReturnType<GeneratedArtifact["toJSON"]>[];
  deploymentPlan: ReturnType<DeploymentPlan["toJSON"]> | null;
  approval: ReturnType<SoftwareApproval["toJSON"]> | null;
};

export interface SoftwareFactoryRepository {
  saveProject(project: SoftwareProject): Promise<void>;
  findProjectById(id: SoftwareProjectId): Promise<SoftwareProject | null>;
  findProjectsByCompany(companyId: CompanyId): Promise<SoftwareProject[]>;

  saveSpecification(specification: SoftwareSpecification): Promise<void>;
  findSpecificationByProject(projectId: SoftwareProjectId): Promise<SoftwareSpecification | null>;

  saveBusinessRequirements(requirements: BusinessRequirements): Promise<void>;
  findBusinessRequirementsByProject(projectId: SoftwareProjectId): Promise<BusinessRequirements | null>;

  saveFunctionalRequirements(requirements: FunctionalRequirements): Promise<void>;
  findFunctionalRequirementsByProject(projectId: SoftwareProjectId): Promise<FunctionalRequirements | null>;

  saveTechnicalRequirements(requirements: TechnicalRequirements): Promise<void>;
  findTechnicalRequirementsByProject(projectId: SoftwareProjectId): Promise<TechnicalRequirements | null>;

  saveArchitecture(blueprint: ArchitectureBlueprint): Promise<void>;
  findArchitectureByProject(projectId: SoftwareProjectId): Promise<ArchitectureBlueprint | null>;

  saveArtifact(artifact: GeneratedArtifact): Promise<void>;
  findArtifactsByProject(projectId: SoftwareProjectId): Promise<GeneratedArtifact[]>;

  saveDeploymentPlan(plan: DeploymentPlan): Promise<void>;
  findDeploymentPlanByProject(projectId: SoftwareProjectId): Promise<DeploymentPlan | null>;

  saveApproval(approval: SoftwareApproval): Promise<void>;
  findApprovalByProject(projectId: SoftwareProjectId): Promise<SoftwareApproval | null>;

  findResultByProject(projectId: SoftwareProjectId): Promise<SoftwareFactoryResult | null>;
}

export type AnalyzeRequirementsInput = {
  project: SoftwareProject;
  context?: Record<string, unknown>;
};
export type AnalyzeRequirementsOutput = {
  businessRequirements: BusinessRequirements;
  functionalRequirements: FunctionalRequirements;
  technicalRequirements: TechnicalRequirements;
};
export interface RequirementsAnalyzer {
  analyze(input: AnalyzeRequirementsInput): AnalyzeRequirementsOutput;
}

export type BuildSpecificationInput = {
  project: SoftwareProject;
  businessRequirements: BusinessRequirements;
  functionalRequirements: FunctionalRequirements;
  technicalRequirements: TechnicalRequirements;
};
export interface SpecificationBuilder {
  build(input: BuildSpecificationInput): SoftwareSpecification;
}

export type GenerateArchitectureInput = {
  project: SoftwareProject;
  specification: SoftwareSpecification;
};
export interface ArchitectureGenerator {
  generate(input: GenerateArchitectureInput): ArchitectureBlueprint;
}

export type PlanModulesInput = {
  project: SoftwareProject;
  specification: SoftwareSpecification;
  architecture: ArchitectureBlueprint;
};
export interface ModulePlanner {
  plan(input: PlanModulesInput): ArchitectureBlueprint;
}

export type GenerateArtifactsInput = {
  project: SoftwareProject;
  specification: SoftwareSpecification;
  architecture: ArchitectureBlueprint;
};
export interface ArtifactGenerator {
  generate(input: GenerateArtifactsInput): GeneratedArtifact[];
}

export type PlanDeploymentInput = {
  project: SoftwareProject;
  architecture: ArchitectureBlueprint;
  artifacts: GeneratedArtifact[];
};
export interface DeploymentPlanner {
  plan(input: PlanDeploymentInput): DeploymentPlan;
}

export interface ApprovalManager {
  request(project: SoftwareProject): SoftwareApproval;
  approve(approval: SoftwareApproval, decidedBy: string): SoftwareApproval;
}

export type RequestSoftwareInput = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  projectType: SoftwareProjectType;
  sourceProjectId?: string;
  title: string;
  description: string;
  businessProblem: string;
  businessGoals: string[];
  functionalRequirements: string[];
  technicalRequirements: string[];
  architecture?: string;
  estimatedCost: number;
  estimatedTime: number;
  estimatedROI: number;
  priority: SoftwareProject["priority"];
  context?: Record<string, unknown>;
};

export type ApproveSoftwareProjectInput = {
  projectId: SoftwareProjectId;
  approvedBy: string;
};

export interface SoftwareFactoryRuntime {
  requestSoftwareProject(input: RequestSoftwareInput): Promise<SoftwareFactoryResult>;
  approveSoftwareProject(input: ApproveSoftwareProjectInput): Promise<SoftwareFactoryResult>;
  getProject(projectId: SoftwareProjectId): Promise<SoftwareFactoryResult | null>;
}

