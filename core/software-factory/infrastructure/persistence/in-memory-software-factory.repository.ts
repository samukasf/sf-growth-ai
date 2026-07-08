import {
  ArchitectureBlueprint,
  BusinessRequirements,
  DeploymentPlan,
  FunctionalRequirements,
  GeneratedArtifact,
  SoftwareApproval,
  SoftwareProject,
  SoftwareSpecification,
  TechnicalRequirements,
  type SoftwareFactoryRepository,
  type SoftwareFactoryResult,
} from "../../domain";
import type { CompanyId, SoftwareProjectId } from "../../shared";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

export class InMemorySoftwareFactoryRepository implements SoftwareFactoryRepository {
  private readonly projects = new Map<string, string>();
  private readonly specifications = new Map<string, string>();
  private readonly businessRequirements = new Map<string, string>();
  private readonly functionalRequirements = new Map<string, string>();
  private readonly technicalRequirements = new Map<string, string>();
  private readonly architectures = new Map<string, string>();
  private readonly artifacts = new Map<string, string[]>();
  private readonly deploymentPlans = new Map<string, string>();
  private readonly approvals = new Map<string, string>();

  async saveProject(project: SoftwareProject): Promise<void> {
    this.projects.set(project.id, serialize(project.toJSON()));
  }

  async findProjectById(id: SoftwareProjectId): Promise<SoftwareProject | null> {
    const raw = this.projects.get(id);
    return raw ? SoftwareProject.create(JSON.parse(raw)) : null;
  }

  async findProjectsByCompany(companyId: CompanyId): Promise<SoftwareProject[]> {
    return [...this.projects.values()]
      .map((raw) => SoftwareProject.create(JSON.parse(raw)))
      .filter((project) => project.companyId === companyId);
  }

  async saveSpecification(specification: SoftwareSpecification): Promise<void> {
    this.specifications.set(specification.projectId, serialize(specification.toJSON()));
  }

  async findSpecificationByProject(projectId: SoftwareProjectId): Promise<SoftwareSpecification | null> {
    const raw = this.specifications.get(projectId);
    return raw ? SoftwareSpecification.create(JSON.parse(raw)) : null;
  }

  async saveBusinessRequirements(requirements: BusinessRequirements): Promise<void> {
    this.businessRequirements.set(requirements.projectId, serialize(requirements.toJSON()));
  }

  async findBusinessRequirementsByProject(projectId: SoftwareProjectId): Promise<BusinessRequirements | null> {
    const raw = this.businessRequirements.get(projectId);
    return raw ? BusinessRequirements.create(JSON.parse(raw)) : null;
  }

  async saveFunctionalRequirements(requirements: FunctionalRequirements): Promise<void> {
    this.functionalRequirements.set(requirements.projectId, serialize(requirements.toJSON()));
  }

  async findFunctionalRequirementsByProject(
    projectId: SoftwareProjectId,
  ): Promise<FunctionalRequirements | null> {
    const raw = this.functionalRequirements.get(projectId);
    return raw ? FunctionalRequirements.create(JSON.parse(raw)) : null;
  }

  async saveTechnicalRequirements(requirements: TechnicalRequirements): Promise<void> {
    this.technicalRequirements.set(requirements.projectId, serialize(requirements.toJSON()));
  }

  async findTechnicalRequirementsByProject(
    projectId: SoftwareProjectId,
  ): Promise<TechnicalRequirements | null> {
    const raw = this.technicalRequirements.get(projectId);
    return raw ? TechnicalRequirements.create(JSON.parse(raw)) : null;
  }

  async saveArchitecture(blueprint: ArchitectureBlueprint): Promise<void> {
    this.architectures.set(blueprint.projectId, serialize(blueprint.toJSON()));
  }

  async findArchitectureByProject(projectId: SoftwareProjectId): Promise<ArchitectureBlueprint | null> {
    const raw = this.architectures.get(projectId);
    return raw ? ArchitectureBlueprint.create(JSON.parse(raw)) : null;
  }

  async saveArtifact(artifact: GeneratedArtifact): Promise<void> {
    const list = this.artifacts.get(artifact.projectId) ?? [];
    list.push(serialize(artifact.toJSON()));
    this.artifacts.set(artifact.projectId, list);
  }

  async findArtifactsByProject(projectId: SoftwareProjectId): Promise<GeneratedArtifact[]> {
    return (this.artifacts.get(projectId) ?? []).map((raw) => GeneratedArtifact.create(JSON.parse(raw)));
  }

  async saveDeploymentPlan(plan: DeploymentPlan): Promise<void> {
    this.deploymentPlans.set(plan.projectId, serialize(plan.toJSON()));
  }

  async findDeploymentPlanByProject(projectId: SoftwareProjectId): Promise<DeploymentPlan | null> {
    const raw = this.deploymentPlans.get(projectId);
    return raw ? DeploymentPlan.create(JSON.parse(raw)) : null;
  }

  async saveApproval(approval: SoftwareApproval): Promise<void> {
    this.approvals.set(approval.projectId, serialize(approval.toJSON()));
  }

  async findApprovalByProject(projectId: SoftwareProjectId): Promise<SoftwareApproval | null> {
    const raw = this.approvals.get(projectId);
    return raw ? SoftwareApproval.create(JSON.parse(raw)) : null;
  }

  async findResultByProject(projectId: SoftwareProjectId): Promise<SoftwareFactoryResult | null> {
    const project = await this.findProjectById(projectId);
    if (!project) return null;

    const specification = await this.findSpecificationByProject(projectId);
    const businessRequirements = await this.findBusinessRequirementsByProject(projectId);
    const functionalRequirements = await this.findFunctionalRequirementsByProject(projectId);
    const technicalRequirements = await this.findTechnicalRequirementsByProject(projectId);
    const architecture = await this.findArchitectureByProject(projectId);
    const artifacts = await this.findArtifactsByProject(projectId);
    const deploymentPlan = await this.findDeploymentPlanByProject(projectId);
    const approval = await this.findApprovalByProject(projectId);

    return {
      project: project.toJSON(),
      specification: specification?.toJSON() ?? null,
      businessRequirements: businessRequirements?.toJSON() ?? null,
      functionalRequirements: functionalRequirements?.toJSON() ?? null,
      technicalRequirements: technicalRequirements?.toJSON() ?? null,
      architecture: architecture?.toJSON() ?? null,
      artifacts: artifacts.map((artifact) => artifact.toJSON()),
      deploymentPlan: deploymentPlan?.toJSON() ?? null,
      approval: approval?.toJSON() ?? null,
    };
  }
}

