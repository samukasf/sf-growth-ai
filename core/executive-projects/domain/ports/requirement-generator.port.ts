import type { ExecutiveProject, ProjectRequirement } from "../entities";

export interface RequirementGenerator {
  generate(project: ExecutiveProject): ProjectRequirement[];
}
