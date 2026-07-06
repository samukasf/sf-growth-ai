import type { ExecutiveProject, ProjectArchitecture } from "../entities";

export interface ArchitectureGenerator {
  generate(project: ExecutiveProject): ProjectArchitecture;
}
