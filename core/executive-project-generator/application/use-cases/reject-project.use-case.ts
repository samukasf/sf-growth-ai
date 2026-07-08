import { createProjectRejectedEvent, type ExecutiveProjectResult, type RejectProjectInput } from "../../domain";
import { ProjectNotFoundError } from "../../shared";
import type { ExecutiveProjectGeneratorDependencies } from "../dependencies";

export class RejectProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectGeneratorDependencies) {}

  async execute(input: RejectProjectInput): Promise<ExecutiveProjectResult> {
    const project = await this.deps.repository.findProjectById(input.projectId);
    if (!project) throw new ProjectNotFoundError(input.projectId);

    const updated = project.withStatus("rejected");
    await this.deps.repository.saveProject(updated);
    await this.deps.eventDispatcher.publish(
      createProjectRejectedEvent(updated, input.rejectedBy, input.reason),
    );

    const approval = await this.deps.repository.findApprovalByProject(updated.id);
    if (approval) {
      const next = this.deps.approvalCoordinator.reject({
        approval,
        decidedBy: input.rejectedBy,
        reason: input.reason,
      });
      await this.deps.repository.saveApproval(next);
    }

    const result = await this.deps.repository.findResultByProject(updated.id);
    return result!;
  }
}

