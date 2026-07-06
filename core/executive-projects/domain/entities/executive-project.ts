import type {
  CompanyId,
  ExecutiveProjectId,
  ProjectMilestoneId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type ProjectType =
  | "website"
  | "mobile_app"
  | "web_system"
  | "crm"
  | "scheduling"
  | "delivery"
  | "loyalty"
  | "automation"
  | "dashboard"
  | "integration"
  | "internal_process";

export type ProjectStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ProjectRiskLevel = "low" | "medium" | "high" | "critical";

export type ProjectMilestoneSnapshot = {
  id: ProjectMilestoneId;
  title: string;
  description: string;
  dueInDays: number;
  order: number;
};

export type ExecutiveProjectProps = {
  id: ExecutiveProjectId;
  companyId: CompanyId;
  createdAt: string;
  updatedAt: string;
  projectType: ProjectType;
  title: string;
  description: string;
  businessProblem: string;
  proposedSolution: string;
  expectedImpact: Score;
  estimatedROI: number;
  estimatedCost: number;
  estimatedDuration: number;
  priority: Score;
  complexity: Score;
  risk: ProjectRiskLevel;
  approvalRequired: boolean;
  status: ProjectStatus;
  milestones: ProjectMilestoneSnapshot[];
  deliverables: string[];
  dependencies: string[];
  relatedInnovation: string[];
  relatedKnowledge: string[];
  relatedLearning: string[];
  relatedWisdom: string[];
};

export type CreateExecutiveProjectProps = Omit<
  ExecutiveProjectProps,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: ExecutiveProjectId;
  createdAt?: string;
  updatedAt?: string;
};

export class ExecutiveProject {
  readonly id: ExecutiveProjectId;
  readonly companyId: CompanyId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly projectType: ProjectType;
  readonly title: string;
  readonly description: string;
  readonly businessProblem: string;
  readonly proposedSolution: string;
  readonly expectedImpact: Score;
  readonly estimatedROI: number;
  readonly estimatedCost: number;
  readonly estimatedDuration: number;
  readonly priority: Score;
  readonly complexity: Score;
  readonly risk: ProjectRiskLevel;
  readonly approvalRequired: boolean;
  readonly status: ProjectStatus;
  readonly milestones: ProjectMilestoneSnapshot[];
  readonly deliverables: string[];
  readonly dependencies: string[];
  readonly relatedInnovation: string[];
  readonly relatedKnowledge: string[];
  readonly relatedLearning: string[];
  readonly relatedWisdom: string[];

  private constructor(props: ExecutiveProjectProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.projectType = props.projectType;
    this.title = props.title;
    this.description = props.description;
    this.businessProblem = props.businessProblem;
    this.proposedSolution = props.proposedSolution;
    this.expectedImpact = props.expectedImpact;
    this.estimatedROI = props.estimatedROI;
    this.estimatedCost = props.estimatedCost;
    this.estimatedDuration = props.estimatedDuration;
    this.priority = props.priority;
    this.complexity = props.complexity;
    this.risk = props.risk;
    this.approvalRequired = props.approvalRequired;
    this.status = props.status;
    this.milestones = [...props.milestones];
    this.deliverables = [...props.deliverables];
    this.dependencies = [...props.dependencies];
    this.relatedInnovation = [...props.relatedInnovation];
    this.relatedKnowledge = [...props.relatedKnowledge];
    this.relatedLearning = [...props.relatedLearning];
    this.relatedWisdom = [...props.relatedWisdom];
  }

  static create(props: CreateExecutiveProjectProps): ExecutiveProject {
    if (!props.companyId.trim()) throw new Error("companyId is required");
    if (!props.title.trim()) throw new Error("title is required");

    const now = new Date().toISOString();

    return new ExecutiveProject({
      id: props.id ?? `exec-project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      projectType: props.projectType,
      title: props.title.trim(),
      description: props.description.trim(),
      businessProblem: props.businessProblem.trim(),
      proposedSolution: props.proposedSolution.trim(),
      expectedImpact: clampScore(props.expectedImpact),
      estimatedROI: props.estimatedROI,
      estimatedCost: Math.max(0, props.estimatedCost),
      estimatedDuration: Math.max(1, props.estimatedDuration),
      priority: clampScore(props.priority),
      complexity: clampScore(props.complexity),
      risk: props.risk,
      approvalRequired: props.approvalRequired,
      status: props.status,
      milestones: props.milestones,
      deliverables: props.deliverables,
      dependencies: props.dependencies,
      relatedInnovation: props.relatedInnovation,
      relatedKnowledge: props.relatedKnowledge,
      relatedLearning: props.relatedLearning,
      relatedWisdom: props.relatedWisdom,
    });
  }

  update(
    input: Partial<Omit<CreateExecutiveProjectProps, "id" | "companyId" | "createdAt">>,
  ): ExecutiveProject {
    return ExecutiveProject.create({
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      projectType: input.projectType ?? this.projectType,
      title: input.title ?? this.title,
      description: input.description ?? this.description,
      businessProblem: input.businessProblem ?? this.businessProblem,
      proposedSolution: input.proposedSolution ?? this.proposedSolution,
      expectedImpact: input.expectedImpact ?? this.expectedImpact,
      estimatedROI: input.estimatedROI ?? this.estimatedROI,
      estimatedCost: input.estimatedCost ?? this.estimatedCost,
      estimatedDuration: input.estimatedDuration ?? this.estimatedDuration,
      priority: input.priority ?? this.priority,
      complexity: input.complexity ?? this.complexity,
      risk: input.risk ?? this.risk,
      approvalRequired: input.approvalRequired ?? this.approvalRequired,
      status: input.status ?? this.status,
      milestones: input.milestones ?? this.milestones,
      deliverables: input.deliverables ?? this.deliverables,
      dependencies: input.dependencies ?? this.dependencies,
      relatedInnovation: input.relatedInnovation ?? this.relatedInnovation,
      relatedKnowledge: input.relatedKnowledge ?? this.relatedKnowledge,
      relatedLearning: input.relatedLearning ?? this.relatedLearning,
      relatedWisdom: input.relatedWisdom ?? this.relatedWisdom,
    });
  }

  approve(): ExecutiveProject {
    return this.update({ status: "approved" });
  }

  reject(): ExecutiveProject {
    return this.update({ status: "rejected" });
  }

  start(): ExecutiveProject {
    return this.update({ status: "in_progress" });
  }

  complete(): ExecutiveProject {
    return this.update({ status: "completed" });
  }

  toJSON(): ExecutiveProjectProps {
    return {
      id: this.id,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      projectType: this.projectType,
      title: this.title,
      description: this.description,
      businessProblem: this.businessProblem,
      proposedSolution: this.proposedSolution,
      expectedImpact: this.expectedImpact,
      estimatedROI: this.estimatedROI,
      estimatedCost: this.estimatedCost,
      estimatedDuration: this.estimatedDuration,
      priority: this.priority,
      complexity: this.complexity,
      risk: this.risk,
      approvalRequired: this.approvalRequired,
      status: this.status,
      milestones: [...this.milestones],
      deliverables: [...this.deliverables],
      dependencies: [...this.dependencies],
      relatedInnovation: [...this.relatedInnovation],
      relatedKnowledge: [...this.relatedKnowledge],
      relatedLearning: [...this.relatedLearning],
      relatedWisdom: [...this.relatedWisdom],
    };
  }
}
