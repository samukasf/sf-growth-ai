import { createProjectCompletedEvent } from "../../domain";
import type { AgencyCoreDependencies } from "../dependencies";

export class CompleteProjectUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(agencyId: string, projectId: string) {
    const projects = await this.deps.repository.listProjects(agencyId);
    const current = projects.find((project) => project.id === projectId);
    if (!current) throw new Error(`Project not found: ${projectId}`);

    const project = current.complete();
    await this.deps.repository.saveProject(project);
    await this.deps.eventDispatcher.publish(createProjectCompletedEvent(project));
    await this.deps.coordinator.coordinateProjectLifecycle(project);

    return { project };
  }
}
