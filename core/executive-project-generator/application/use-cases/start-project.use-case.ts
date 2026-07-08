import { createProjectStartedEvent, type ExecutiveProjectResult, type StartProjectInput } from "../../domain";
import { ProjectNotFoundError } from "../../shared";
import type { ExecutiveProjectGeneratorDependencies } from "../dependencies";

export class StartProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectGeneratorDependencies) {}

  async execute(input: StartProjectInput): Promise<ExecutiveProjectResult> {
    const project = await this.deps.repository.findProjectById(input.projectId);
    if (!project) throw new ProjectNotFoundError(input.projectId);

    const updated = project.withStatus("started");
    await this.deps.repository.saveProject(updated);
    await this.deps.eventDispatcher.publish(createProjectStartedEvent(updated, input.startedBy));

    const result = await this.deps.repository.findResultByProject(updated.id);
    return result!;
  }
}

