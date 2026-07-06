import type {
  CompanyId,
  ExecutiveProjectId,
  ProjectArchitectureId,
} from "../../shared";

export type ArchitectureLayer = "presentation" | "application" | "domain" | "infrastructure";

export type ProjectArchitectureProps = {
  id: ProjectArchitectureId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  pattern: string;
  layers: ArchitectureLayer[];
  technologies: string[];
  integrations: string[];
  description: string;
};

export class ProjectArchitecture {
  readonly id: ProjectArchitectureId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly pattern: string;
  readonly layers: ArchitectureLayer[];
  readonly technologies: string[];
  readonly integrations: string[];
  readonly description: string;

  private constructor(props: ProjectArchitectureProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.pattern = props.pattern;
    this.layers = [...props.layers];
    this.technologies = [...props.technologies];
    this.integrations = [...props.integrations];
    this.description = props.description;
  }

  static create(
    props: Omit<ProjectArchitectureProps, "id"> & { id?: ProjectArchitectureId },
  ): ProjectArchitecture {
    return new ProjectArchitecture({
      id: props.id ?? `arch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      pattern: props.pattern.trim(),
      layers: props.layers,
      technologies: props.technologies,
      integrations: props.integrations,
      description: props.description.trim(),
    });
  }

  toJSON(): ProjectArchitectureProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      pattern: this.pattern,
      layers: [...this.layers],
      technologies: [...this.technologies],
      integrations: [...this.integrations],
      description: this.description,
    };
  }
}
