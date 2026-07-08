import type {
  CompanyId,
  ExecutiveProjectId,
  OrganizationId,
  ProjectApprovalId,
  ProjectBusinessCaseId,
  ProjectCategoryKey,
  ProjectDependencyId,
  ProjectMilestoneId,
  ProjectOpportunityId,
  ProjectPriorityLevel,
  ProjectProposalId,
  ProjectROIId,
  ProjectRiskLevel,
  ProjectRoadmapId,
  ProjectStatus,
  ProjectTaskId,
  ProjectType,
} from "../../shared";
import { clampMoney, clampScore } from "../../shared";

export type ProjectOpportunityProps = {
  id: ProjectOpportunityId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  source: "executive-opportunity-engine" | "executive-mission-system" | "manual";
  opportunityRefId?: string;
  title: string;
  description: string;
  category: ProjectCategoryKey;
  estimatedROI: number;
  confidence: number;
  detectedAt: string;
};

export class ProjectOpportunity {
  readonly id: ProjectOpportunityId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly source: ProjectOpportunityProps["source"];
  readonly opportunityRefId?: string;
  readonly title: string;
  readonly description: string;
  readonly category: ProjectCategoryKey;
  readonly estimatedROI: number;
  readonly confidence: number;
  readonly detectedAt: string;

  private constructor(props: ProjectOpportunityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.source = props.source;
    this.opportunityRefId = props.opportunityRefId;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.estimatedROI = props.estimatedROI;
    this.confidence = props.confidence;
    this.detectedAt = props.detectedAt;
  }

  static create(
    props: Omit<ProjectOpportunityProps, "id" | "detectedAt"> & { id?: ProjectOpportunityId; detectedAt?: string },
  ): ProjectOpportunity {
    if (!props.title.trim()) throw new Error("opportunity.title is required");
    return new ProjectOpportunity({
      id: props.id ?? `pop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      source: props.source,
      opportunityRefId: props.opportunityRefId,
      title: props.title,
      description: props.description,
      category: props.category,
      estimatedROI: clampMoney(props.estimatedROI),
      confidence: clampScore(props.confidence),
      detectedAt: props.detectedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ProjectOpportunityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      source: this.source,
      opportunityRefId: this.opportunityRefId,
      title: this.title,
      description: this.description,
      category: this.category,
      estimatedROI: this.estimatedROI,
      confidence: this.confidence,
      detectedAt: this.detectedAt,
    };
  }
}

export type ProjectProposalProps = {
  id: ProjectProposalId;
  opportunityId: ProjectOpportunityId;
  projectType: ProjectType;
  title: string;
  description: string;
  problem: string;
  solution: string;
  expectedBenefits: string[];
  departments: string[];
  requiredResources: string[];
};

export class ProjectProposal {
  readonly id: ProjectProposalId;
  readonly opportunityId: ProjectOpportunityId;
  readonly projectType: ProjectType;
  readonly title: string;
  readonly description: string;
  readonly problem: string;
  readonly solution: string;
  readonly expectedBenefits: string[];
  readonly departments: string[];
  readonly requiredResources: string[];

  private constructor(props: ProjectProposalProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.projectType = props.projectType;
    this.title = props.title;
    this.description = props.description;
    this.problem = props.problem;
    this.solution = props.solution;
    this.expectedBenefits = props.expectedBenefits;
    this.departments = props.departments;
    this.requiredResources = props.requiredResources;
  }

  static create(props: Omit<ProjectProposalProps, "id"> & { id?: ProjectProposalId }): ProjectProposal {
    if (!props.title.trim()) throw new Error("proposal.title is required");
    return new ProjectProposal({
      id: props.id ?? `pprop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      projectType: props.projectType,
      title: props.title,
      description: props.description,
      problem: props.problem,
      solution: props.solution,
      expectedBenefits: props.expectedBenefits,
      departments: props.departments,
      requiredResources: props.requiredResources,
    });
  }

  toJSON(): ProjectProposalProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      projectType: this.projectType,
      title: this.title,
      description: this.description,
      problem: this.problem,
      solution: this.solution,
      expectedBenefits: this.expectedBenefits,
      departments: this.departments,
      requiredResources: this.requiredResources,
    };
  }
}

export type ProjectBusinessCaseProps = {
  id: ProjectBusinessCaseId;
  proposalId: ProjectProposalId;
  rationale: string;
  assumptions: string[];
  risks: string[];
  successMetrics: string[];
};

export class ProjectBusinessCase {
  readonly id: ProjectBusinessCaseId;
  readonly proposalId: ProjectProposalId;
  readonly rationale: string;
  readonly assumptions: string[];
  readonly risks: string[];
  readonly successMetrics: string[];

  private constructor(props: ProjectBusinessCaseProps) {
    this.id = props.id;
    this.proposalId = props.proposalId;
    this.rationale = props.rationale;
    this.assumptions = props.assumptions;
    this.risks = props.risks;
    this.successMetrics = props.successMetrics;
  }

  static create(
    props: Omit<ProjectBusinessCaseProps, "id"> & { id?: ProjectBusinessCaseId },
  ): ProjectBusinessCase {
    return new ProjectBusinessCase({
      id: props.id ?? `pbc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      proposalId: props.proposalId,
      rationale: props.rationale,
      assumptions: props.assumptions,
      risks: props.risks,
      successMetrics: props.successMetrics,
    });
  }

  toJSON(): ProjectBusinessCaseProps {
    return {
      id: this.id,
      proposalId: this.proposalId,
      rationale: this.rationale,
      assumptions: this.assumptions,
      risks: this.risks,
      successMetrics: this.successMetrics,
    };
  }
}

export type ProjectROIProps = {
  id: ProjectROIId;
  projectId: ExecutiveProjectId;
  estimatedInvestment: number;
  estimatedROI: number;
  paybackMonths: number;
  confidence: number;
};

export class ProjectROI {
  readonly id: ProjectROIId;
  readonly projectId: ExecutiveProjectId;
  readonly estimatedInvestment: number;
  readonly estimatedROI: number;
  readonly paybackMonths: number;
  readonly confidence: number;

  private constructor(props: ProjectROIProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.estimatedInvestment = props.estimatedInvestment;
    this.estimatedROI = props.estimatedROI;
    this.paybackMonths = props.paybackMonths;
    this.confidence = props.confidence;
  }

  static create(props: Omit<ProjectROIProps, "id"> & { id?: ProjectROIId }): ProjectROI {
    return new ProjectROI({
      id: props.id ?? `proi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      estimatedInvestment: clampMoney(props.estimatedInvestment),
      estimatedROI: clampMoney(props.estimatedROI),
      paybackMonths: Math.max(0, Math.round(props.paybackMonths)),
      confidence: clampScore(props.confidence),
    });
  }

  toJSON(): ProjectROIProps {
    return {
      id: this.id,
      projectId: this.projectId,
      estimatedInvestment: this.estimatedInvestment,
      estimatedROI: this.estimatedROI,
      paybackMonths: this.paybackMonths,
      confidence: this.confidence,
    };
  }
}

export type ProjectTaskProps = {
  id: ProjectTaskId;
  title: string;
  description: string;
  owner?: string;
  estimatedDays: number;
  status: "todo" | "doing" | "done";
};

export class ProjectTask {
  readonly id: ProjectTaskId;
  readonly title: string;
  readonly description: string;
  readonly owner?: string;
  readonly estimatedDays: number;
  readonly status: ProjectTaskProps["status"];

  private constructor(props: ProjectTaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.owner = props.owner;
    this.estimatedDays = props.estimatedDays;
    this.status = props.status;
  }

  static create(
    props: Omit<ProjectTaskProps, "id" | "status"> & { id?: ProjectTaskId; status?: ProjectTaskProps["status"] },
  ): ProjectTask {
    if (!props.title.trim()) throw new Error("task.title is required");
    return new ProjectTask({
      id: props.id ?? `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: props.title,
      description: props.description,
      owner: props.owner,
      estimatedDays: Math.max(0, Math.round(props.estimatedDays)),
      status: props.status ?? "todo",
    });
  }

  toJSON(): ProjectTaskProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      owner: this.owner,
      estimatedDays: this.estimatedDays,
      status: this.status,
    };
  }
}

export type ProjectMilestoneProps = {
  id: ProjectMilestoneId;
  title: string;
  description: string;
  dueWeek: number;
  tasks: ReturnType<ProjectTask["toJSON"]>[];
};

export class ProjectMilestone {
  readonly id: ProjectMilestoneId;
  readonly title: string;
  readonly description: string;
  readonly dueWeek: number;
  readonly tasks: ProjectTask[];

  private constructor(props: ProjectMilestoneProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.dueWeek = props.dueWeek;
    this.tasks = props.tasks.map((t) => ProjectTask.create(t));
  }

  static create(props: Omit<ProjectMilestoneProps, "id"> & { id?: ProjectMilestoneId }): ProjectMilestone {
    return new ProjectMilestone({
      id: props.id ?? `ms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: props.title,
      description: props.description,
      dueWeek: Math.max(0, Math.round(props.dueWeek)),
      tasks: props.tasks,
    });
  }

  toJSON(): ProjectMilestoneProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueWeek: this.dueWeek,
      tasks: this.tasks.map((t) => t.toJSON()),
    };
  }
}

export type ProjectRoadmapProps = {
  id: ProjectRoadmapId;
  projectId: ExecutiveProjectId;
  milestones: ReturnType<ProjectMilestone["toJSON"]>[];
  totalWeeks: number;
};

export class ProjectRoadmap {
  readonly id: ProjectRoadmapId;
  readonly projectId: ExecutiveProjectId;
  readonly milestones: ProjectMilestone[];
  readonly totalWeeks: number;

  private constructor(props: ProjectRoadmapProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.milestones = props.milestones.map((m) => ProjectMilestone.create(m));
    this.totalWeeks = props.totalWeeks;
  }

  static create(
    props: Omit<ProjectRoadmapProps, "id" | "totalWeeks"> & { id?: ProjectRoadmapId; totalWeeks?: number },
  ): ProjectRoadmap {
    const computed = props.totalWeeks ?? Math.max(0, Math.max(...props.milestones.map((m) => m.dueWeek), 0));
    return new ProjectRoadmap({
      id: props.id ?? `rm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      milestones: props.milestones,
      totalWeeks: computed,
    });
  }

  toJSON(): ProjectRoadmapProps {
    return {
      id: this.id,
      projectId: this.projectId,
      milestones: this.milestones.map((m) => m.toJSON()),
      totalWeeks: this.totalWeeks,
    };
  }
}

export type ProjectDependencyProps = {
  id: ProjectDependencyId;
  projectId: ExecutiveProjectId;
  name: string;
  description: string;
  type: "system" | "team" | "vendor" | "data" | "legal";
  riskLevel: ProjectRiskLevel;
};

export class ProjectDependency {
  readonly id: ProjectDependencyId;
  readonly projectId: ExecutiveProjectId;
  readonly name: string;
  readonly description: string;
  readonly type: ProjectDependencyProps["type"];
  readonly riskLevel: ProjectRiskLevel;

  private constructor(props: ProjectDependencyProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.name = props.name;
    this.description = props.description;
    this.type = props.type;
    this.riskLevel = props.riskLevel;
  }

  static create(
    props: Omit<ProjectDependencyProps, "id"> & { id?: ProjectDependencyId },
  ): ProjectDependency {
    return new ProjectDependency({
      id: props.id ?? `dep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      name: props.name,
      description: props.description,
      type: props.type,
      riskLevel: props.riskLevel,
    });
  }

  toJSON(): ProjectDependencyProps {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      description: this.description,
      type: this.type,
      riskLevel: this.riskLevel,
    };
  }
}

export type ProjectApprovalProps = {
  id: ProjectApprovalId;
  projectId: ExecutiveProjectId;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
};

export class ProjectApproval {
  readonly id: ProjectApprovalId;
  readonly projectId: ExecutiveProjectId;
  readonly status: ProjectApprovalProps["status"];
  readonly requestedAt: string;
  readonly decidedAt?: string;
  readonly decidedBy?: string;
  readonly reason?: string;

  private constructor(props: ProjectApprovalProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.status = props.status;
    this.requestedAt = props.requestedAt;
    this.decidedAt = props.decidedAt;
    this.decidedBy = props.decidedBy;
    this.reason = props.reason;
  }

  static create(
    props: Omit<ProjectApprovalProps, "id" | "requestedAt" | "status"> & {
      id?: ProjectApprovalId;
      requestedAt?: string;
      status?: ProjectApprovalProps["status"];
    },
  ): ProjectApproval {
    return new ProjectApproval({
      id: props.id ?? `apr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: props.projectId,
      status: props.status ?? "pending",
      requestedAt: props.requestedAt ?? new Date().toISOString(),
      decidedAt: props.decidedAt,
      decidedBy: props.decidedBy,
      reason: props.reason,
    });
  }

  approve(decidedBy: string): ProjectApproval {
    return ProjectApproval.create({
      ...this.toJSON(),
      status: "approved",
      decidedAt: new Date().toISOString(),
      decidedBy,
      reason: undefined,
    });
  }

  reject(decidedBy: string, reason: string): ProjectApproval {
    return ProjectApproval.create({
      ...this.toJSON(),
      status: "rejected",
      decidedAt: new Date().toISOString(),
      decidedBy,
      reason,
    });
  }

  toJSON(): ProjectApprovalProps {
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

export type ExecutiveProjectProps = {
  id: ExecutiveProjectId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  sourceOpportunityId?: ProjectOpportunityId;
  proposalId?: ProjectProposalId;
  title: string;
  description: string;
  problem: string;
  solution: string;
  expectedBenefits: string[];
  estimatedInvestment: number;
  estimatedROI: number;
  estimatedTime: number;
  priority: ProjectPriorityLevel;
  riskLevel: ProjectRiskLevel;
  businessImpact: number;
  departments: string[];
  requiredResources: string[];
  implementationRoadmap: ReturnType<ProjectRoadmap["toJSON"]> | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export class ExecutiveProject {
  readonly id: ExecutiveProjectId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly sourceOpportunityId?: ProjectOpportunityId;
  readonly proposalId?: ProjectProposalId;
  readonly title: string;
  readonly description: string;
  readonly problem: string;
  readonly solution: string;
  readonly expectedBenefits: string[];
  readonly estimatedInvestment: number;
  readonly estimatedROI: number;
  readonly estimatedTime: number;
  readonly priority: ProjectPriorityLevel;
  readonly riskLevel: ProjectRiskLevel;
  readonly businessImpact: number;
  readonly departments: string[];
  readonly requiredResources: string[];
  readonly implementationRoadmap: ProjectRoadmap | null;
  readonly status: ProjectStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ExecutiveProjectProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.sourceOpportunityId = props.sourceOpportunityId;
    this.proposalId = props.proposalId;
    this.title = props.title;
    this.description = props.description;
    this.problem = props.problem;
    this.solution = props.solution;
    this.expectedBenefits = props.expectedBenefits;
    this.estimatedInvestment = props.estimatedInvestment;
    this.estimatedROI = props.estimatedROI;
    this.estimatedTime = props.estimatedTime;
    this.priority = props.priority;
    this.riskLevel = props.riskLevel;
    this.businessImpact = props.businessImpact;
    this.departments = props.departments;
    this.requiredResources = props.requiredResources;
    this.implementationRoadmap = props.implementationRoadmap
      ? ProjectRoadmap.create(props.implementationRoadmap)
      : null;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ExecutiveProjectProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: ExecutiveProjectId;
      createdAt?: string;
      updatedAt?: string;
      status?: ProjectStatus;
    },
  ): ExecutiveProject {
    if (!props.title.trim()) throw new Error("project.title is required");
    const now = new Date().toISOString();
    return new ExecutiveProject({
      id: props.id ?? `prj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      sourceOpportunityId: props.sourceOpportunityId,
      proposalId: props.proposalId,
      title: props.title,
      description: props.description,
      problem: props.problem,
      solution: props.solution,
      expectedBenefits: props.expectedBenefits,
      estimatedInvestment: clampMoney(props.estimatedInvestment),
      estimatedROI: clampMoney(props.estimatedROI),
      estimatedTime: Math.max(0, Math.round(props.estimatedTime)),
      priority: props.priority,
      riskLevel: props.riskLevel,
      businessImpact: clampScore(props.businessImpact),
      departments: props.departments,
      requiredResources: props.requiredResources,
      implementationRoadmap: props.implementationRoadmap,
      status: props.status ?? "generated",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ProjectStatus): ExecutiveProject {
    return ExecutiveProject.create({ ...this.toJSON(), status, updatedAt: new Date().toISOString() });
  }

  withRoadmap(roadmap: ProjectRoadmap): ExecutiveProject {
    return ExecutiveProject.create({
      ...this.toJSON(),
      implementationRoadmap: roadmap.toJSON(),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveProjectProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      sourceOpportunityId: this.sourceOpportunityId,
      proposalId: this.proposalId,
      title: this.title,
      description: this.description,
      problem: this.problem,
      solution: this.solution,
      expectedBenefits: this.expectedBenefits,
      estimatedInvestment: this.estimatedInvestment,
      estimatedROI: this.estimatedROI,
      estimatedTime: this.estimatedTime,
      priority: this.priority,
      riskLevel: this.riskLevel,
      businessImpact: this.businessImpact,
      departments: this.departments,
      requiredResources: this.requiredResources,
      implementationRoadmap: this.implementationRoadmap ? this.implementationRoadmap.toJSON() : null,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

