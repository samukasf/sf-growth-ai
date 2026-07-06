import type {
  CompanyId,
  ExecutiveProjectId,
  ProjectRequirementId,
  Score,
} from "../../shared";

export type RequirementPriority = "must_have" | "should_have" | "nice_to_have";

export type ProjectRequirementProps = {
  id: ProjectRequirementId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  title: string;
  description: string;
  priority: RequirementPriority;
  complexity: Score;
  acceptanceCriteria: string[];
};

export class ProjectRequirement {
  readonly id: ProjectRequirementId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly title: string;
  readonly description: string;
  readonly priority: RequirementPriority;
  readonly complexity: Score;
  readonly acceptanceCriteria: string[];

  private constructor(props: ProjectRequirementProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this.complexity = props.complexity;
    this.acceptanceCriteria = [...props.acceptanceCriteria];
  }

  static create(
    props: Omit<ProjectRequirementProps, "id"> & { id?: ProjectRequirementId },
  ): ProjectRequirement {
    return new ProjectRequirement({
      id: props.id ?? `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      title: props.title.trim(),
      description: props.description.trim(),
      priority: props.priority,
      complexity: props.complexity,
      acceptanceCriteria: props.acceptanceCriteria,
    });
  }

  toJSON(): ProjectRequirementProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      priority: this.priority,
      complexity: this.complexity,
      acceptanceCriteria: [...this.acceptanceCriteria],
    };
  }
}
