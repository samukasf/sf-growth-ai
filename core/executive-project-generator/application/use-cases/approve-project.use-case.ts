import { createProjectApprovedEvent, type ApproveProjectInput, type ExecutiveProjectResult } from "../../domain";
import { ProjectNotFoundError } from "../../shared";
import type { ExecutiveProjectGeneratorDependencies } from "../dependencies";

export class ApproveProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectGeneratorDependencies) {}

  async execute(input: ApproveProjectInput): Promise<ExecutiveProjectResult> {
    const project = await this.deps.repository.findProjectById(input.projectId);
    if (!project) throw new ProjectNotFoundError(input.projectId);

    const updated = project.withStatus("approved");
    await this.deps.repository.saveProject(updated);
    await this.deps.eventDispatcher.publish(createProjectApprovedEvent(updated, input.approvedBy));

    const approval = await this.deps.repository.findApprovalByProject(updated.id);
    if (approval) {
      const next = this.deps.approvalCoordinator.approve({ approval, decidedBy: input.approvedBy });
      await this.deps.repository.saveApproval(next);
    }

    const result = await this.deps.repository.findResultByProject(updated.id);
    return result!;
  }
}

