import type {
  CompanyId,
  ExecutiveProjectId,
  ProjectExecutionPlanId,
} from "../../shared";

export type ExecutionPhase = {
  name: string;
  durationDays: number;
  activities: string[];
  milestoneIds: string[];
};

export type ProjectExecutionPlanProps = {
  id: ProjectExecutionPlanId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  phases: ExecutionPhase[];
  totalDurationDays: number;
  teamRoles: string[];
  summary: string;
};

export class ProjectExecutionPlan {
  readonly id: ProjectExecutionPlanId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly phases: ExecutionPhase[];
  readonly totalDurationDays: number;
  readonly teamRoles: string[];
  readonly summary: string;

  private constructor(props: ProjectExecutionPlanProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.phases = props.phases.map((phase) => ({
      ...phase,
      activities: [...phase.activities],
      milestoneIds: [...phase.milestoneIds],
    }));
    this.totalDurationDays = props.totalDurationDays;
    this.teamRoles = [...props.teamRoles];
    this.summary = props.summary;
  }

  static create(
    props: Omit<ProjectExecutionPlanProps, "id" | "totalDurationDays"> & {
      id?: ProjectExecutionPlanId;
    },
  ): ProjectExecutionPlan {
    const totalDurationDays = props.phases.reduce(
      (sum, phase) => sum + phase.durationDays,
      0,
    );

    return new ProjectExecutionPlan({
      id: props.id ?? `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      phases: props.phases,
      totalDurationDays,
      teamRoles: props.teamRoles,
      summary: props.summary.trim(),
    });
  }

  toJSON(): ProjectExecutionPlanProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      phases: this.phases.map((phase) => ({
        ...phase,
        activities: [...phase.activities],
        milestoneIds: [...phase.milestoneIds],
      })),
      totalDurationDays: this.totalDurationDays,
      teamRoles: [...this.teamRoles],
      summary: this.summary,
    };
  }
}
