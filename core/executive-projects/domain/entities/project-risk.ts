import type { CompanyId, ExecutiveProjectId, ProjectRiskId } from "../../shared";
import type { ProjectRiskLevel } from "./executive-project";

export type ProjectRiskProps = {
  id: ProjectRiskId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  title: string;
  description: string;
  level: ProjectRiskLevel;
  mitigation: string;
  probability: number;
};

export class ProjectRisk {
  readonly id: ProjectRiskId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly title: string;
  readonly description: string;
  readonly level: ProjectRiskLevel;
  readonly mitigation: string;
  readonly probability: number;

  private constructor(props: ProjectRiskProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.level = props.level;
    this.mitigation = props.mitigation;
    this.probability = props.probability;
  }

  static create(
    props: Omit<ProjectRiskProps, "id"> & { id?: ProjectRiskId },
  ): ProjectRisk {
    return new ProjectRisk({
      id: props.id ?? `risk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      title: props.title.trim(),
      description: props.description.trim(),
      level: props.level,
      mitigation: props.mitigation.trim(),
      probability: Math.max(0, Math.min(100, props.probability)),
    });
  }

  toJSON(): ProjectRiskProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      level: this.level,
      mitigation: this.mitigation,
      probability: this.probability,
    };
  }
}
