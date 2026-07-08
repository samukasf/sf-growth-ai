import type {
  ApplicationModuleId,
  ArtifactKind,
  ArchitectureBlueprintId,
  BusinessRequirementsId,
  CompanyId,
  DeploymentPlanId,
  FunctionalRequirementsId,
  GeneratedArtifactId,
  OrganizationId,
  SoftwareApprovalId,
  SoftwareApprovalStatus,
  SoftwarePriorityLevel,
  SoftwareProjectId,
  SoftwareProjectType,
  SoftwareSpecificationId,
  TechnicalRequirementsId,
} from "../../shared";
import { clampMoney } from "../../shared";

export type BusinessRequirementsProps = {
  id: BusinessRequirementsId;
  projectId: SoftwareProjectId;
  problemStatement: string;
  goals: string[];
  stakeholders: string[];
};

export class BusinessRequirements {
  readonly id: BusinessRequirementsId;
  readonly projectId: SoftwareProjectId;
  readonly problemStatement: string;
  readonly goals: string[];
  readonly stakeholders: string[];

  private constructor(props: BusinessRequirementsProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.problemStatement = props.problemStatement;
    this.goals = props.goals;
    this.stakeholders = props.stakeholders;
  }

  static create(
    props: Omit<BusinessRequirementsProps, "id"> & { id?: BusinessRequirementsId },
  ): BusinessRequirements {
    return new BusinessRequirements({
      id: props.id ?? `br-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      problemStatement: props.problemStatement,
      goals: props.goals,
      stakeholders: props.stakeholders,
    });
  }

  toJSON(): BusinessRequirementsProps {
    return {
      id: this.id,
      projectId: this.projectId,
      problemStatement: this.problemStatement,
      goals: this.goals,
      stakeholders: this.stakeholders,
    };
  }
}

export type FunctionalRequirementsProps = {
  id: FunctionalRequirementsId;
  projectId: SoftwareProjectId;
  items: string[];
  userFlows: string[];
  integrations: string[];
};

export class FunctionalRequirements {
  readonly id: FunctionalRequirementsId;
  readonly projectId: SoftwareProjectId;
  readonly items: string[];
  readonly userFlows: string[];
  readonly integrations: string[];

  private constructor(props: FunctionalRequirementsProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.items = props.items;
    this.userFlows = props.userFlows;
    this.integrations = props.integrations;
  }

  static create(
    props: Omit<FunctionalRequirementsProps, "id"> & { id?: FunctionalRequirementsId },
  ): FunctionalRequirements {
    return new FunctionalRequirements({
      id: props.id ?? `fr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      items: props.items,
      userFlows: props.userFlows,
      integrations: props.integrations,
    });
  }

  toJSON(): FunctionalRequirementsProps {
    return {
      id: this.id,
      projectId: this.projectId,
      items: this.items,
      userFlows: this.userFlows,
      integrations: this.integrations,
    };
  }
}

export type TechnicalRequirementsProps = {
  id: TechnicalRequirementsId;
  projectId: SoftwareProjectId;
  stackPreferences: string[];
  constraints: string[];
  securityRequirements: string[];
  nonFunctionalRequirements: string[];
};

export class TechnicalRequirements {
  readonly id: TechnicalRequirementsId;
  readonly projectId: SoftwareProjectId;
  readonly stackPreferences: string[];
  readonly constraints: string[];
  readonly securityRequirements: string[];
  readonly nonFunctionalRequirements: string[];

  private constructor(props: TechnicalRequirementsProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.stackPreferences = props.stackPreferences;
    this.constraints = props.constraints;
    this.securityRequirements = props.securityRequirements;
    this.nonFunctionalRequirements = props.nonFunctionalRequirements;
  }

  static create(
    props: Omit<TechnicalRequirementsProps, "id"> & { id?: TechnicalRequirementsId },
  ): TechnicalRequirements {
    return new TechnicalRequirements({
      id: props.id ?? `tr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      stackPreferences: props.stackPreferences,
      constraints: props.constraints,
      securityRequirements: props.securityRequirements,
      nonFunctionalRequirements: props.nonFunctionalRequirements,
    });
  }

  toJSON(): TechnicalRequirementsProps {
    return {
      id: this.id,
      projectId: this.projectId,
      stackPreferences: this.stackPreferences,
      constraints: this.constraints,
      securityRequirements: this.securityRequirements,
      nonFunctionalRequirements: this.nonFunctionalRequirements,
    };
  }
}

export type SoftwareSpecificationProps = {
  id: SoftwareSpecificationId;
  projectId: SoftwareProjectId;
  summary: string;
  businessRequirements: ReturnType<BusinessRequirements["toJSON"]>;
  functionalRequirements: ReturnType<FunctionalRequirements["toJSON"]>;
  technicalRequirements: ReturnType<TechnicalRequirements["toJSON"]>;
};

export class SoftwareSpecification {
  readonly id: SoftwareSpecificationId;
  readonly projectId: SoftwareProjectId;
  readonly summary: string;
  readonly businessRequirements: BusinessRequirements;
  readonly functionalRequirements: FunctionalRequirements;
  readonly technicalRequirements: TechnicalRequirements;

  private constructor(props: SoftwareSpecificationProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.summary = props.summary;
    this.businessRequirements = BusinessRequirements.create(props.businessRequirements);
    this.functionalRequirements = FunctionalRequirements.create(props.functionalRequirements);
    this.technicalRequirements = TechnicalRequirements.create(props.technicalRequirements);
  }

  static create(
    props: Omit<SoftwareSpecificationProps, "id"> & { id?: SoftwareSpecificationId },
  ): SoftwareSpecification {
    return new SoftwareSpecification({
      id: props.id ?? `spec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      summary: props.summary,
      businessRequirements: props.businessRequirements,
      functionalRequirements: props.functionalRequirements,
      technicalRequirements: props.technicalRequirements,
    });
  }

  toJSON(): SoftwareSpecificationProps {
    return {
      id: this.id,
      projectId: this.projectId,
      summary: this.summary,
      businessRequirements: this.businessRequirements.toJSON(),
      functionalRequirements: this.functionalRequirements.toJSON(),
      technicalRequirements: this.technicalRequirements.toJSON(),
    };
  }
}

export type ApplicationModuleProps = {
  id: ApplicationModuleId;
  blueprintId: ArchitectureBlueprintId;
  name: string;
  responsibility: string;
  dependencies: string[];
  interfaces: string[];
};

export class ApplicationModule {
  readonly id: ApplicationModuleId;
  readonly blueprintId: ArchitectureBlueprintId;
  readonly name: string;
  readonly responsibility: string;
  readonly dependencies: string[];
  readonly interfaces: string[];

  private constructor(props: ApplicationModuleProps) {
    this.id = props.id;
    this.blueprintId = props.blueprintId;
    this.name = props.name;
    this.responsibility = props.responsibility;
    this.dependencies = props.dependencies;
    this.interfaces = props.interfaces;
  }

  static create(
    props: Omit<ApplicationModuleProps, "id"> & { id?: ApplicationModuleId },
  ): ApplicationModule {
    return new ApplicationModule({
      id: props.id ?? `mod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      blueprintId: props.blueprintId,
      name: props.name,
      responsibility: props.responsibility,
      dependencies: props.dependencies,
      interfaces: props.interfaces,
    });
  }

  toJSON(): ApplicationModuleProps {
    return {
      id: this.id,
      blueprintId: this.blueprintId,
      name: this.name,
      responsibility: this.responsibility,
      dependencies: this.dependencies,
      interfaces: this.interfaces,
    };
  }
}

export type ArchitectureBlueprintProps = {
  id: ArchitectureBlueprintId;
  projectId: SoftwareProjectId;
  style: string;
  layers: string[];
  dataStrategy: string;
  modules: ReturnType<ApplicationModule["toJSON"]>[];
};

export class ArchitectureBlueprint {
  readonly id: ArchitectureBlueprintId;
  readonly projectId: SoftwareProjectId;
  readonly style: string;
  readonly layers: string[];
  readonly dataStrategy: string;
  readonly modules: ApplicationModule[];

  private constructor(props: ArchitectureBlueprintProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.style = props.style;
    this.layers = props.layers;
    this.dataStrategy = props.dataStrategy;
    this.modules = props.modules.map((module) => ApplicationModule.create(module));
  }

  static create(
    props: Omit<ArchitectureBlueprintProps, "id"> & { id?: ArchitectureBlueprintId },
  ): ArchitectureBlueprint {
    return new ArchitectureBlueprint({
      id: props.id ?? `arch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      style: props.style,
      layers: props.layers,
      dataStrategy: props.dataStrategy,
      modules: props.modules,
    });
  }

  toJSON(): ArchitectureBlueprintProps {
    return {
      id: this.id,
      projectId: this.projectId,
      style: this.style,
      layers: this.layers,
      dataStrategy: this.dataStrategy,
      modules: this.modules.map((module) => module.toJSON()),
    };
  }
}

export type GeneratedArtifactProps = {
  id: GeneratedArtifactId;
  projectId: SoftwareProjectId;
  kind: ArtifactKind;
  name: string;
  description: string;
  contentsSummary: string;
};

export class GeneratedArtifact {
  readonly id: GeneratedArtifactId;
  readonly projectId: SoftwareProjectId;
  readonly kind: ArtifactKind;
  readonly name: string;
  readonly description: string;
  readonly contentsSummary: string;

  private constructor(props: GeneratedArtifactProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.kind = props.kind;
    this.name = props.name;
    this.description = props.description;
    this.contentsSummary = props.contentsSummary;
  }

  static create(
    props: Omit<GeneratedArtifactProps, "id"> & { id?: GeneratedArtifactId },
  ): GeneratedArtifact {
    return new GeneratedArtifact({
      id: props.id ?? `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      kind: props.kind,
      name: props.name,
      description: props.description,
      contentsSummary: props.contentsSummary,
    });
  }

  toJSON(): GeneratedArtifactProps {
    return {
      id: this.id,
      projectId: this.projectId,
      kind: this.kind,
      name: this.name,
      description: this.description,
      contentsSummary: this.contentsSummary,
    };
  }
}

export type DeploymentPlanProps = {
  id: DeploymentPlanId;
  projectId: SoftwareProjectId;
  environments: string[];
  rolloutStrategy: string;
  prerequisites: string[];
  validationChecklist: string[];
};

export class DeploymentPlan {
  readonly id: DeploymentPlanId;
  readonly projectId: SoftwareProjectId;
  readonly environments: string[];
  readonly rolloutStrategy: string;
  readonly prerequisites: string[];
  readonly validationChecklist: string[];

  private constructor(props: DeploymentPlanProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.environments = props.environments;
    this.rolloutStrategy = props.rolloutStrategy;
    this.prerequisites = props.prerequisites;
    this.validationChecklist = props.validationChecklist;
  }

  static create(
    props: Omit<DeploymentPlanProps, "id"> & { id?: DeploymentPlanId },
  ): DeploymentPlan {
    return new DeploymentPlan({
      id: props.id ?? `dep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      environments: props.environments,
      rolloutStrategy: props.rolloutStrategy,
      prerequisites: props.prerequisites,
      validationChecklist: props.validationChecklist,
    });
  }

  toJSON(): DeploymentPlanProps {
    return {
      id: this.id,
      projectId: this.projectId,
      environments: this.environments,
      rolloutStrategy: this.rolloutStrategy,
      prerequisites: this.prerequisites,
      validationChecklist: this.validationChecklist,
    };
  }
}

export type SoftwareApprovalProps = {
  id: SoftwareApprovalId;
  projectId: SoftwareProjectId;
  status: SoftwareApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
};

export class SoftwareApproval {
  readonly id: SoftwareApprovalId;
  readonly projectId: SoftwareProjectId;
  readonly status: SoftwareApprovalStatus;
  readonly requestedAt: string;
  readonly decidedAt?: string;
  readonly decidedBy?: string;
  readonly reason?: string;

  private constructor(props: SoftwareApprovalProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.status = props.status;
    this.requestedAt = props.requestedAt;
    this.decidedAt = props.decidedAt;
    this.decidedBy = props.decidedBy;
    this.reason = props.reason;
  }

  static create(
    props: Omit<SoftwareApprovalProps, "id" | "requestedAt" | "status"> & {
      id?: SoftwareApprovalId;
      requestedAt?: string;
      status?: SoftwareApprovalStatus;
    },
  ): SoftwareApproval {
    return new SoftwareApproval({
      id: props.id ?? `sapr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      status: props.status ?? "pending",
      requestedAt: props.requestedAt ?? new Date().toISOString(),
      decidedAt: props.decidedAt,
      decidedBy: props.decidedBy,
      reason: props.reason,
    });
  }

  approve(decidedBy: string): SoftwareApproval {
    return SoftwareApproval.create({
      ...this.toJSON(),
      status: "approved",
      decidedBy,
      decidedAt: new Date().toISOString(),
      reason: undefined,
    });
  }

  reject(decidedBy: string, reason: string): SoftwareApproval {
    return SoftwareApproval.create({
      ...this.toJSON(),
      status: "rejected",
      decidedBy,
      decidedAt: new Date().toISOString(),
      reason,
    });
  }

  toJSON(): SoftwareApprovalProps {
    return {
      id: this.id,
      projectId: this.projectId,
      status: this.status,
      requestedAt: this.requestedAt,
      decidedAt: this.decidedAt,
      decidedBy: this.decidedBy,
      reason: this.reason,
    };
  }
}

export type SoftwareProjectProps = {
  id: SoftwareProjectId;
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
  architecture: string;
  estimatedCost: number;
  estimatedTime: number;
  estimatedROI: number;
  priority: SoftwarePriorityLevel;
  approvalStatus: SoftwareApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

export class SoftwareProject {
  readonly id: SoftwareProjectId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly projectType: SoftwareProjectType;
  readonly sourceProjectId?: string;
  readonly title: string;
  readonly description: string;
  readonly businessProblem: string;
  readonly businessGoals: string[];
  readonly functionalRequirements: string[];
  readonly technicalRequirements: string[];
  readonly architecture: string;
  readonly estimatedCost: number;
  readonly estimatedTime: number;
  readonly estimatedROI: number;
  readonly priority: SoftwarePriorityLevel;
  readonly approvalStatus: SoftwareApprovalStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: SoftwareProjectProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.projectType = props.projectType;
    this.sourceProjectId = props.sourceProjectId;
    this.title = props.title;
    this.description = props.description;
    this.businessProblem = props.businessProblem;
    this.businessGoals = props.businessGoals;
    this.functionalRequirements = props.functionalRequirements;
    this.technicalRequirements = props.technicalRequirements;
    this.architecture = props.architecture;
    this.estimatedCost = props.estimatedCost;
    this.estimatedTime = props.estimatedTime;
    this.estimatedROI = props.estimatedROI;
    this.priority = props.priority;
    this.approvalStatus = props.approvalStatus;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<SoftwareProjectProps, "id" | "createdAt" | "updatedAt" | "approvalStatus"> & {
      id?: SoftwareProjectId;
      createdAt?: string;
      updatedAt?: string;
      approvalStatus?: SoftwareApprovalStatus;
    },
  ): SoftwareProject {
    const now = new Date().toISOString();
    return new SoftwareProject({
      id: props.id ?? `swp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      projectType: props.projectType,
      sourceProjectId: props.sourceProjectId,
      title: props.title,
      description: props.description,
      businessProblem: props.businessProblem,
      businessGoals: props.businessGoals,
      functionalRequirements: props.functionalRequirements,
      technicalRequirements: props.technicalRequirements,
      architecture: props.architecture,
      estimatedCost: clampMoney(props.estimatedCost),
      estimatedTime: Math.max(0, Math.round(props.estimatedTime)),
      estimatedROI: clampMoney(props.estimatedROI),
      priority: props.priority,
      approvalStatus: props.approvalStatus ?? "pending",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withApprovalStatus(approvalStatus: SoftwareApprovalStatus): SoftwareProject {
    return SoftwareProject.create({
      ...this.toJSON(),
      approvalStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  withArchitecture(architecture: string): SoftwareProject {
    return SoftwareProject.create({
      ...this.toJSON(),
      architecture,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): SoftwareProjectProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      projectType: this.projectType,
      sourceProjectId: this.sourceProjectId,
      title: this.title,
      description: this.description,
      businessProblem: this.businessProblem,
      businessGoals: this.businessGoals,
      functionalRequirements: this.functionalRequirements,
      technicalRequirements: this.technicalRequirements,
      architecture: this.architecture,
      estimatedCost: this.estimatedCost,
      estimatedTime: this.estimatedTime,
      estimatedROI: this.estimatedROI,
      priority: this.priority,
      approvalStatus: this.approvalStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

