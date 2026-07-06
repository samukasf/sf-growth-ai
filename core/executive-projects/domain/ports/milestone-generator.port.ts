import type { ExecutiveProject, ProjectMilestone } from "../entities";

export interface MilestoneGenerator {
  generate(project: ExecutiveProject): ProjectMilestone[];
}
