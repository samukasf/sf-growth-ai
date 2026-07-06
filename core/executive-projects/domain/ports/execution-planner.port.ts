import type { ExecutiveProject, ProjectMilestone, ProjectExecutionPlan } from "../entities";

export interface ExecutionPlanner {
  plan(project: ExecutiveProject, milestones: ProjectMilestone[]): ProjectExecutionPlan;
}
