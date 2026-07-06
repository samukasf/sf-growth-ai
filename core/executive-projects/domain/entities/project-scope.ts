import type { CompanyId, ExecutiveProjectId, ProjectScopeId } from "../../shared";

export type ProjectScopeProps = {
  id: ProjectScopeId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  inScope: string[];
  outOfScope: string[];
  assumptions: string[];
  constraints: string[];
};

export class ProjectScope {
  readonly id: ProjectScopeId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly inScope: string[];
  readonly outOfScope: string[];
  readonly assumptions: string[];
  readonly constraints: string[];

  private constructor(props: ProjectScopeProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.inScope = [...props.inScope];
    this.outOfScope = [...props.outOfScope];
    this.assumptions = [...props.assumptions];
    this.constraints = [...props.constraints];
  }

  static create(
    props: Omit<ProjectScopeProps, "id"> & { id?: ProjectScopeId },
  ): ProjectScope {
    return new ProjectScope({
      id: props.id ?? `scope-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      inScope: props.inScope,
      outOfScope: props.outOfScope,
      assumptions: props.assumptions,
      constraints: props.constraints,
    });
  }

  toJSON(): ProjectScopeProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      inScope: [...this.inScope],
      outOfScope: [...this.outOfScope],
      assumptions: [...this.assumptions],
      constraints: [...this.constraints],
    };
  }
}
